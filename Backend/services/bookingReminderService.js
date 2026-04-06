import Booking from "../models/Booking.js";
import sendEmail from "../utils/sendEmail.js";
import { getBookingWindowState } from "../utils/bookingSchedule.js";

const REMINDER_MINUTES_BEFORE = Number(process.env.BOOKING_REMINDER_MINUTES_BEFORE || 30);
const TICK_INTERVAL_MS = Number(process.env.BOOKING_REMINDER_INTERVAL_MS || 60_000);

let timerHandle = null;
let isTickRunning = false;

const shouldSendReminderNow = (windowState) => {
  if (!windowState?.valid || windowState.hasEnded) return false;
  if (typeof windowState.minutesUntilStart !== "number") return false;
  return windowState.minutesUntilStart <= REMINDER_MINUTES_BEFORE && windowState.minutesUntilStart > 0;
};

const sendUserReminderEmail = async (booking, windowState) => {
  const userEmail = booking?.user?.email;
  if (!userEmail) return false;

  const minutes = Math.max(1, Number(windowState.minutesUntilStart || REMINDER_MINUTES_BEFORE));
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin: 0 0 12px; color: #8b0c2e;">Consultation Reminder</h2>
      <p>Hello ${booking?.user?.username || "Customer"},</p>
      <p>Your consultation with ${booking?.dietician?.username || "your dietician"} starts in about ${minutes} minutes.</p>
      <ul style="padding-left: 18px;">
        <li><strong>Date:</strong> ${booking?.date || "-"}</li>
        <li><strong>Time:</strong> ${booking?.time || "-"}</li>
        <li><strong>Mode:</strong> ${booking?.mode || "-"}</li>
        <li><strong>Booking ID:</strong> ${booking?._id || "-"}</li>
      </ul>
      <p>Your call or chat will be available from 10 minutes before the session start until the slot ends.</p>
    </div>
  `;

  await sendEmail({
    to: userEmail,
    subject: "Consultation starts soon",
    html,
  });

  return true;
};

const sendDieticianReminderEmail = async (booking, windowState) => {
  const dieticianEmail = booking?.dietician?.email;
  if (!dieticianEmail) return false;

  const minutes = Math.max(1, Number(windowState.minutesUntilStart || REMINDER_MINUTES_BEFORE));
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin: 0 0 12px; color: #8b0c2e;">Consultation Reminder</h2>
      <p>Hello ${booking?.dietician?.username || "Dietician"},</p>
      <p>Your paid and approved consultation with ${booking?.user?.username || "your client"} starts in about ${minutes} minutes.</p>
      <ul style="padding-left: 18px;">
        <li><strong>Date:</strong> ${booking?.date || "-"}</li>
        <li><strong>Time:</strong> ${booking?.time || "-"}</li>
        <li><strong>Mode:</strong> ${booking?.mode || "-"}</li>
        <li><strong>Booking ID:</strong> ${booking?._id || "-"}</li>
      </ul>
      <p>The session opens 10 minutes before start time and closes automatically when the slot ends.</p>
    </div>
  `;

  await sendEmail({
    to: dieticianEmail,
    subject: "Upcoming consultation reminder",
    html,
  });

  return true;
};

const processBooking = async (booking, nowDate) => {
  const windowState = getBookingWindowState(booking, nowDate);
  if (!windowState.valid) return;

  let hasChanges = false;

  if (windowState.hasEnded && booking.status !== "completed" && booking.status !== "cancelled") {
    booking.status = "completed";
    booking.sessionCompletedAt = booking.sessionCompletedAt || nowDate;
    hasChanges = true;
  }

  if (shouldSendReminderNow(windowState)) {
    if (!booking.reminder30MinSentToUser) {
      try {
        const sent = await sendUserReminderEmail(booking, windowState);
        if (sent) {
          booking.reminder30MinSentToUser = true;
          hasChanges = true;
        }
      } catch (error) {
        console.error("User reminder email failed:", error?.message || error);
      }
    }

    if (!booking.reminder30MinSentToDietician) {
      try {
        const sent = await sendDieticianReminderEmail(booking, windowState);
        if (sent) {
          booking.reminder30MinSentToDietician = true;
          hasChanges = true;
        }
      } catch (error) {
        console.error("Dietician reminder email failed:", error?.message || error);
      }
    }

    const bothReminderFlagsSet = booking.reminder30MinSentToUser && booking.reminder30MinSentToDietician;
    if (bothReminderFlagsSet && !booking.reminder30MinSentAt) {
      booking.reminder30MinSentAt = nowDate;
      hasChanges = true;
    }
  }

  if (hasChanges) {
    await booking.save();
  }
};

const runReminderTick = async () => {
  if (isTickRunning) return;
  isTickRunning = true;

  try {
    const nowDate = new Date();

    const bookings = await Booking.find({
      paymentStatus: "paid",
      dieticianApproved: true,
      status: { $in: ["pending", "confirmed", "completed"] },
    })
      .populate("user", "username email")
      .populate("dietician", "username email")
      .sort({ date: 1, time: 1 })
      .limit(500);

    for (const booking of bookings) {
      await processBooking(booking, nowDate);
    }
  } catch (error) {
    console.error("Booking reminder service tick failed:", error?.message || error);
  } finally {
    isTickRunning = false;
  }
};

export const startBookingReminderService = () => {
  if (timerHandle) return;

  runReminderTick();
  timerHandle = setInterval(runReminderTick, TICK_INTERVAL_MS);

  console.log(
    `Booking reminder service started (interval ${TICK_INTERVAL_MS}ms, reminder ${REMINDER_MINUTES_BEFORE} minutes before)`
  );
};

export const stopBookingReminderService = () => {
  if (!timerHandle) return;
  clearInterval(timerHandle);
  timerHandle = null;
};
