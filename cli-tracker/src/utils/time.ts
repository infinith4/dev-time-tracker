import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

let currentTimezone: string | undefined;

export function setTimezone(tz: string): void {
  currentTimezone = tz;
}

export function getTimezone(): string | undefined {
  return currentTimezone || process.env["TRC_TIMEZONE"];
}

function toDayjs(isoString?: string): dayjs.Dayjs {
  const d = isoString ? dayjs(isoString) : dayjs();
  const tz = getTimezone();
  return tz ? d.tz(tz) : d;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}h ${String(m).padStart(2, "0")}m`;
  }
  if (m > 0) {
    return `${m}m ${String(s).padStart(2, "0")}s`;
  }
  return `${s}s`;
}

export function formatTime(isoString: string): string {
  return toDayjs(isoString).format("HH:mm");
}

export function formatDate(isoString: string): string {
  return toDayjs(isoString).format("YYYY-MM-DD");
}

export function now(): string {
  return dayjs().toISOString();
}

export function elapsedSeconds(startTime: string): number {
  return Math.floor(dayjs().diff(dayjs(startTime)) / 1000);
}

export function startOfDay(date?: string): string {
  const d = date ? toDayjs(date) : toDayjs();
  return d.startOf("day").toISOString();
}

export function endOfDay(date?: string): string {
  const d = date ? toDayjs(date) : toDayjs();
  return d.endOf("day").toISOString();
}

export function startOfWeek(): string {
  return toDayjs().startOf("week").toISOString();
}

export function startOfMonth(): string {
  return toDayjs().startOf("month").toISOString();
}
