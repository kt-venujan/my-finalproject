const SLOT_DURATION_MINUTES = Number(process.env.BOOKING_SLOT_DURATION_MINUTES || 30);
const JOIN_WINDOW_MINUTES_BEFORE = Number(process.env.BOOKING_JOIN_WINDOW_MINUTES_BEFORE || 10);
const COUNTDOWN_WINDOW_START_MINUTES_BEFORE = Number(
  process.env.BOOKING_COUNTDOWN_WINDOW_START_MINUTES_BEFORE || 20
);

const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

const parseDateParts = (dateValue) => {
  const raw = String(dateValue || "").trim();
  if (!raw) return null;

  let match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    };
  }

  match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    return {
      year: Number(match[3]),
      month: Number(match[2]),
      day: Number(match[1]),
    };
  }

  return null;
};

const parseTimeParts = (timeValue) => {
  const raw = String(timeValue || "").trim();
  if (!raw) return null;

  const match = raw.match(/^(\d{1,2}):(\d{2})(?:\s*([aApP][mM]))?$/);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const suffix = (match[3] || "").toLowerCase();

  if (Number.isNaN(hour) || Number.isNaN(minute) || minute < 0 || minute > 59) {
    return null;
  }

  if (suffix) {
    if (hour < 1 || hour > 12) return null;
    if (suffix === "pm" && hour !== 12) hour += 12;
    if (suffix === "am" && hour === 12) hour = 0;
  } else if (hour < 0 || hour > 23) {
    return null;
  }

  return { hour, minute };
};

export const parseBookingDateTime = (dateValue, timeValue) => {
  const dateParts = parseDateParts(dateValue);
  const timeParts = parseTimeParts(timeValue);

  if (!dateParts || !timeParts) return null;

  const value = new Date(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    timeParts.hour,
    timeParts.minute,
    0,
    0
  );

  return isValidDate(value) ? value : null;
};

export const getBookingWindowState = (booking, nowDate = new Date()) => {
  const now = isValidDate(nowDate) ? nowDate : new Date();
  const startAt = parseBookingDateTime(booking?.date, booking?.time);

  if (!startAt) {
    return {
      valid: false,
      state: "invalid",
      canJoin: false,
      hasEnded: false,
      isCountdown: false,
      minutesUntilStart: null,
      minutesUntilEnd: null,
      startAt: null,
      endAt: null,
    };
  }

  const endAt = new Date(startAt.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);
  const minutesUntilStart = Math.ceil((startAt.getTime() - now.getTime()) / 60000);
  const minutesUntilEnd = Math.ceil((endAt.getTime() - now.getTime()) / 60000);
  const hasEnded = minutesUntilEnd <= 0;

  let state = "upcoming";
  if (hasEnded) {
    state = "ended";
  } else if (minutesUntilStart <= JOIN_WINDOW_MINUTES_BEFORE) {
    state = "joinable";
  } else if (minutesUntilStart <= COUNTDOWN_WINDOW_START_MINUTES_BEFORE) {
    state = "countdown";
  }

  return {
    valid: true,
    state,
    canJoin: state === "joinable" && !hasEnded,
    hasEnded,
    isCountdown: state === "countdown",
    minutesUntilStart,
    minutesUntilEnd,
    startAt,
    endAt,
  };
};

export const buildBookingTimingResponse = (booking, nowDate = new Date()) => {
  const state = getBookingWindowState(booking, nowDate);

  if (!state.valid) {
    return {
      state: "invalid",
      canJoin: false,
      hasEnded: false,
      minutesUntilStart: null,
      minutesUntilEnd: null,
      startAt: null,
      endAt: null,
    };
  }

  return {
    state: state.state,
    canJoin: state.canJoin,
    hasEnded: state.hasEnded,
    minutesUntilStart: state.minutesUntilStart,
    minutesUntilEnd: state.minutesUntilEnd,
    startAt: state.startAt.toISOString(),
    endAt: state.endAt.toISOString(),
  };
};

export const bookingScheduleConfig = {
  slotDurationMinutes: SLOT_DURATION_MINUTES,
  joinWindowMinutesBefore: JOIN_WINDOW_MINUTES_BEFORE,
  countdownWindowStartMinutesBefore: COUNTDOWN_WINDOW_START_MINUTES_BEFORE,
};
