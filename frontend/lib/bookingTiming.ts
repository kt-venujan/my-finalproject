export type BookingSessionWindow = {
  state: "invalid" | "upcoming" | "countdown" | "joinable" | "ended";
  canJoin: boolean;
  hasEnded: boolean;
  minutesUntilStart: number | null;
  minutesUntilEnd: number | null;
  startAt: string | null;
  endAt: string | null;
};

const SLOT_DURATION_MINUTES = 30;
const JOIN_WINDOW_MINUTES_BEFORE = 10;
const COUNTDOWN_START_MINUTES_BEFORE = 20;

const formatDuration = (totalMinutes: number) => {
  const safeMinutes = Math.max(0, Math.ceil(Number(totalMinutes || 0)));
  const days = Math.floor(safeMinutes / 1440);
  const hours = Math.floor((safeMinutes % 1440) / 60);
  const minutes = safeMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(" ");
};

const parseDateParts = (dateValue?: string) => {
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

const parseTimeParts = (timeValue?: string) => {
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

export const parseBookingDateTime = (dateValue?: string, timeValue?: string): Date | null => {
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

  return Number.isNaN(value.getTime()) ? null : value;
};

const toIsoOrNull = (value: Date | null) => {
  if (!value) return null;
  return Number.isNaN(value.getTime()) ? null : value.toISOString();
};

export const getBookingTimeMeta = (
  dateValue?: string,
  timeValue?: string,
  nowDate: Date = new Date(),
  fallbackWindow?: Partial<BookingSessionWindow>
) => {
  const startAt = parseBookingDateTime(dateValue, timeValue);

  if (!startAt) {
    return {
      state: "invalid" as const,
      canJoin: false,
      hasEnded: false,
      minutesUntilStart: null,
      minutesUntilEnd: null,
      startAt: null,
      endAt: null,
      isThirtyMinuteReminder: false,
      isTenMinuteReminder: false,
    };
  }

  const endAt = new Date(startAt.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);
  const minutesUntilStart = Math.ceil((startAt.getTime() - nowDate.getTime()) / 60000);
  const minutesUntilEnd = Math.ceil((endAt.getTime() - nowDate.getTime()) / 60000);
  const hasEnded = minutesUntilEnd <= 0;

  let state: BookingSessionWindow["state"] = "upcoming";
  if (hasEnded) {
    state = "ended";
  } else if (minutesUntilStart <= JOIN_WINDOW_MINUTES_BEFORE) {
    state = "joinable";
  } else if (minutesUntilStart <= COUNTDOWN_START_MINUTES_BEFORE) {
    state = "countdown";
  }

  const calculatedWindow: BookingSessionWindow = {
    state,
    canJoin: state === "joinable" && !hasEnded,
    hasEnded,
    minutesUntilStart,
    minutesUntilEnd,
    startAt: toIsoOrNull(startAt),
    endAt: toIsoOrNull(endAt),
  };

  const mergedHasEnded =
    typeof fallbackWindow?.hasEnded === "boolean"
      ? fallbackWindow.hasEnded || calculatedWindow.hasEnded
      : calculatedWindow.hasEnded;

  const mergedCanJoin =
    !mergedHasEnded &&
    (typeof fallbackWindow?.canJoin === "boolean"
      ? fallbackWindow.canJoin && calculatedWindow.canJoin
      : calculatedWindow.canJoin);

  const mergedState: BookingSessionWindow["state"] = mergedHasEnded
    ? "ended"
    : mergedCanJoin
      ? "joinable"
      : calculatedWindow.state;

  const merged: BookingSessionWindow = {
    state: mergedState,
    canJoin: mergedCanJoin,
    hasEnded: mergedHasEnded,
    minutesUntilStart: calculatedWindow.minutesUntilStart,
    minutesUntilEnd: calculatedWindow.minutesUntilEnd,
    startAt: fallbackWindow?.startAt || calculatedWindow.startAt,
    endAt: fallbackWindow?.endAt || calculatedWindow.endAt,
  };

  return {
    ...merged,
    isThirtyMinuteReminder:
      typeof merged.minutesUntilStart === "number" && merged.minutesUntilStart <= 30 && merged.minutesUntilStart > 20,
    isTenMinuteReminder:
      typeof merged.minutesUntilStart === "number" && merged.minutesUntilStart <= 10 && merged.minutesUntilStart > 0,
  };
};

export const getBookingTimingMessage = (
  meta: ReturnType<typeof getBookingTimeMeta>,
  role: "user" | "dietician"
) => {
  if (meta.state === "invalid") {
    return "Booking date/time is invalid. Please contact support.";
  }

  if (meta.hasEnded) {
    return "Consultation slot finished. Contact support if this was missed.";
  }

  if (meta.state === "joinable") {
    const remaining = typeof meta.minutesUntilEnd === "number" ? Math.max(0, meta.minutesUntilEnd) : null;
    if (remaining === null) return "Consultation session is available now.";
    return `Session is live now. Ends in about ${formatDuration(remaining)}.`;
  }

  if (meta.state === "countdown") {
    const value = typeof meta.minutesUntilStart === "number" ? meta.minutesUntilStart : 0;
    return `Countdown active: session opens in ${formatDuration(value)} (20-10 min window).`;
  }

  const value = typeof meta.minutesUntilStart === "number" ? meta.minutesUntilStart : 0;
  if (role === "dietician") {
    return `Booking access opens 10 minutes before start. Available in ${formatDuration(value)}.`;
  }
  return `Your consultation will open 10 minutes before start. Available in ${formatDuration(value)}.`;
};
