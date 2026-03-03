import { formatDuration, formatTime, elapsedSeconds } from "../utils/time.js";
import { success, info, dim, bold, accent } from "./colors.js";
import type { EntryRow } from "../db/repositories/entry.js";

export function formatStatus(entry: EntryRow): string {
  const elapsed = elapsedSeconds(entry.start_time);
  const lines = [
    "",
    `${success("⏱")}  ${bold("Running:")} ${entry.description || "(no description)"}`,
  ];
  if (entry.project_name) {
    lines.push(`   ${info("Project:")} ${entry.project_name}`);
  }
  lines.push(`   ${dim("Started:")} ${formatTime(entry.start_time)}`);
  lines.push(`   ${accent("Elapsed:")} ${formatDuration(elapsed)}`);
  lines.push("");
  return lines.join("\n");
}

export function formatStopped(entry: EntryRow): string {
  const lines = [
    "",
    `${success("✓")}  Stopped: ${entry.description || "(no description)"}`,
    `   ${dim("Duration:")} ${formatDuration(entry.duration_sec ?? 0)}`,
    "",
  ];
  return lines.join("\n");
}

export function formatStarted(entry: EntryRow): string {
  const lines = [
    "",
    `${success("▶")}  Started: ${entry.description || "(no description)"}`,
  ];
  if (entry.project_name) {
    lines.push(`   ${info("Project:")} ${entry.project_name}`);
  }
  lines.push("");
  return lines.join("\n");
}
