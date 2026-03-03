import dayjs from "dayjs";

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
  return dayjs(isoString).format("HH:mm");
}

export function formatDate(isoString: string): string {
  return dayjs(isoString).format("YYYY-MM-DD");
}

export function now(): string {
  return dayjs().toISOString();
}

export function elapsedSeconds(startTime: string): number {
  return Math.floor(dayjs().diff(dayjs(startTime)) / 1000);
}

export function startOfDay(date?: string): string {
  const d = date ? dayjs(date) : dayjs();
  return d.startOf("day").toISOString();
}

export function endOfDay(date?: string): string {
  const d = date ? dayjs(date) : dayjs();
  return d.endOf("day").toISOString();
}

export function startOfWeek(): string {
  return dayjs().startOf("week").toISOString();
}

export function startOfMonth(): string {
  return dayjs().startOf("month").toISOString();
}
