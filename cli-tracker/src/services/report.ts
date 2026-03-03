import dayjs from "dayjs";
import {
  getEntriesByDateRange,
  getEntriesByDateRangeAndProject,
} from "../db/repositories/entry.js";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  elapsedSeconds,
  formatDuration,
} from "../utils/time.js";
import type { EntryRow } from "../db/repositories/entry.js";

export type Period = "day" | "week" | "month";

export interface ReportData {
  period: Period;
  startDate: string;
  endDate: string;
  totalSeconds: number;
  entries: EntryRow[];
  byProject: { name: string; totalSeconds: number; percentage: number }[];
  byDay: { label: string; seconds: number }[];
}

export function generateReport(period: Period, projectName?: string): ReportData {
  let start: string;
  const end = endOfDay();

  switch (period) {
    case "day":
      start = startOfDay();
      break;
    case "week":
      start = startOfWeek();
      break;
    case "month":
      start = startOfMonth();
      break;
  }

  const entries = projectName
    ? getEntriesByDateRangeAndProject(start, end, projectName)
    : getEntriesByDateRange(start, end);

  let totalSeconds = 0;
  const projectMap = new Map<string, number>();
  const dayMap = new Map<string, number>();

  for (const entry of entries) {
    const duration = entry.end_time
      ? (entry.duration_sec ?? 0)
      : elapsedSeconds(entry.start_time);
    totalSeconds += duration;

    const pName = entry.project_name || "(no project)";
    projectMap.set(pName, (projectMap.get(pName) ?? 0) + duration);

    const dayLabel = dayjs(entry.start_time).format("ddd");
    dayMap.set(dayLabel, (dayMap.get(dayLabel) ?? 0) + duration);
  }

  const byProject = [...projectMap.entries()]
    .map(([name, secs]) => ({
      name,
      totalSeconds: secs,
      percentage: totalSeconds > 0 ? Math.round((secs / totalSeconds) * 100) : 0,
    }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds);

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const byDay = dayLabels.map((label) => ({
    label,
    seconds: dayMap.get(label) ?? 0,
  }));

  return {
    period,
    startDate: dayjs(start).format("YYYY-MM-DD"),
    endDate: dayjs(end).format("YYYY-MM-DD"),
    totalSeconds,
    entries,
    byProject,
    byDay,
  };
}

export function formatReportHeader(data: ReportData): string {
  const periodLabel = { day: "Daily", week: "Weekly", month: "Monthly" }[data.period];
  return `${periodLabel} Report (${data.startDate} ~ ${data.endDate})\nTotal: ${formatDuration(data.totalSeconds)}`;
}
