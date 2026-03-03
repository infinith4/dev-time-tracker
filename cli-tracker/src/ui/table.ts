import Table from "cli-table3";
import { formatDuration, formatTime, elapsedSeconds } from "../utils/time.js";
import { dim, accent, info } from "./colors.js";
import type { EntryRow } from "../db/repositories/entry.js";

export function renderEntryTable(entries: EntryRow[], title: string): string {
  const table = new Table({
    head: ["ID", "Project", "Description", "Start", "End", "Duration"],
    style: { head: ["cyan"] },
  });

  let totalSeconds = 0;

  for (const entry of entries) {
    const isRunning = !entry.end_time;
    const duration = isRunning
      ? elapsedSeconds(entry.start_time)
      : (entry.duration_sec ?? 0);
    totalSeconds += duration;

    table.push([
      entry.id,
      entry.project_name || dim("-"),
      entry.description || dim("(none)"),
      formatTime(entry.start_time),
      isRunning ? accent("running") : formatTime(entry.end_time!),
      isRunning ? accent(formatDuration(duration)) : formatDuration(duration),
    ]);
  }

  table.push([
    { colSpan: 4, content: "" },
    { content: info("Total") },
    { content: info(formatDuration(totalSeconds)) },
  ]);

  return `\n${title}\n${table.toString()}\n`;
}

export function renderProjectTable(
  projects: { name: string; totalSeconds: number; percentage: number }[],
  barWidth: number = 20,
): string {
  const lines: string[] = [];
  for (const p of projects) {
    const filled = Math.round((p.percentage / 100) * barWidth);
    const empty = barWidth - filled;
    const bar = "█".repeat(filled) + "░".repeat(empty);
    lines.push(
      `  ${p.name.padEnd(10)} ${bar}  ${formatDuration(p.totalSeconds)} (${p.percentage}%)`,
    );
  }
  return lines.join("\n");
}

export function renderDayBars(
  days: { label: string; seconds: number }[],
  barWidth: number = 8,
): string {
  const maxSec = Math.max(...days.map((d) => d.seconds), 1);
  const lines: string[] = [];
  for (const d of days) {
    const filled = Math.round((d.seconds / maxSec) * barWidth);
    const empty = barWidth - filled;
    const bar = "█".repeat(filled) + "░".repeat(empty);
    lines.push(`  ${d.label}  ${bar}  ${formatDuration(d.seconds)}`);
  }
  return lines.join("\n");
}
