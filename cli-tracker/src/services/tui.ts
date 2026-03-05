import { getRunningEntry, getEntriesByDateRange, type EntryRow } from "../db/repositories/entry.js";
import { findProjectByName } from "../db/repositories/project.js";
import { getGoalProgress, formatGoalBar } from "./goal.js";
import {
  formatDuration,
  formatTime,
  formatDate,
  elapsedSeconds,
  startOfDay,
  endOfDay,
} from "../utils/time.js";
import { stopTimer, continueTimer, getStatus } from "./timer.js";

const BOX = {
  tl: "\u2554", tr: "\u2557", bl: "\u255a", br: "\u255d",
  h: "\u2550", v: "\u2551", ml: "\u2560", mr: "\u2563",
};

const WIDTH = 44;

function hLine(left: string, right: string): string {
  return left + BOX.h.repeat(WIDTH) + right;
}

function padLine(content: string, rawLen?: number): string {
  const len = rawLen !== undefined ? rawLen : stripAnsi(content).length;
  const pad = WIDTH - len;
  return `${BOX.v}  ${content}${" ".repeat(Math.max(0, pad - 2))}${BOX.v}`;
}

function emptyLine(): string {
  return padLine("", 0);
}

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

function renderBar(ratio: number, width: number = 12): string {
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  return "\u2588".repeat(filled) + "\u2591".repeat(empty);
}

function buildScreen(): string {
  const lines: string[] = [];
  const today = formatDate(new Date().toISOString());

  // Header
  lines.push(hLine(BOX.tl, BOX.tr));
  const title = `trc \u2014 Time Tracker`;
  const headerContent = `\x1b[1m${title}\x1b[0m`;
  const headerRaw = title.length + today.length + 4;
  const headerPad = WIDTH - headerRaw - 2;
  lines.push(`${BOX.v}  ${headerContent}${" ".repeat(Math.max(1, headerPad))}${today}  ${BOX.v}`);
  lines.push(hLine(BOX.ml, BOX.mr));

  // Current timer
  const running = getRunningEntry();
  lines.push(emptyLine());
  if (running) {
    const elapsed = elapsedSeconds(running.start_time);
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    const timeStr = `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;

    const descText = `\x1b[32m\u25b6\x1b[0m Running: ${running.description}`;
    lines.push(padLine(descText, 4 + ("Running: " + running.description).length));

    if (running.project_name) {
      lines.push(padLine(`  Project: ${running.project_name}`));
    }
    lines.push(padLine(`  Elapsed: \x1b[33m${timeStr}\x1b[0m`, ("  Elapsed: " + timeStr).length));
  } else {
    lines.push(padLine("\x1b[90mNo timer running\x1b[0m", "No timer running".length));
  }
  lines.push(emptyLine());
  lines.push(hLine(BOX.ml, BOX.mr));

  // Today's summary
  const dayStart = startOfDay();
  const dayEnd = endOfDay();
  const todayEntries = getEntriesByDateRange(dayStart, dayEnd);

  // Aggregate by project
  const projectTotals = new Map<string, number>();
  let dayTotal = 0;
  for (const entry of todayEntries) {
    const sec = entry.duration_sec ?? (entry.end_time ? 0 : elapsedSeconds(entry.start_time));
    dayTotal += sec;
    const pName = entry.project_name || "(no project)";
    projectTotals.set(pName, (projectTotals.get(pName) || 0) + sec);
  }

  lines.push(emptyLine());
  lines.push(padLine(`Today: \x1b[1m${formatDuration(dayTotal)}\x1b[0m`, ("Today: " + formatDuration(dayTotal)).length));
  lines.push(emptyLine());

  const sorted = [...projectTotals.entries()].sort((a, b) => b[1] - a[1]);
  for (const [name, sec] of sorted.slice(0, 5)) {
    const ratio = dayTotal > 0 ? sec / dayTotal : 0;
    const bar = renderBar(ratio);
    const dur = formatDuration(sec);
    const line = `${name.padEnd(12).slice(0, 12)} ${bar} ${dur}`;
    lines.push(padLine(line));
  }
  lines.push(emptyLine());
  lines.push(hLine(BOX.ml, BOX.mr));

  // Goals
  const goals = getGoalProgress();
  if (goals.length > 0) {
    for (const g of goals) {
      lines.push(padLine(formatGoalBar(g).trim()));
    }
    lines.push(hLine(BOX.ml, BOX.mr));
  }

  // Recent entries
  lines.push(padLine("\x1b[1mRecent Entries\x1b[0m", "Recent Entries".length));
  const recent = todayEntries.slice(-5);
  if (recent.length === 0) {
    lines.push(padLine("\x1b[90m  (none)\x1b[0m", "  (none)".length));
  }
  for (const entry of recent) {
    const id = `#${entry.id}`;
    const desc = (entry.description || "(no desc)").slice(0, 14).padEnd(14);
    const start = formatTime(entry.start_time);
    const end = entry.end_time ? formatTime(entry.end_time) : "     ";
    const dur = entry.duration_sec
      ? formatDuration(entry.duration_sec)
      : entry.end_time
        ? ""
        : formatDuration(elapsedSeconds(entry.start_time));
    const line = `${id.padEnd(4)} ${desc} ${start}-${end}`;
    lines.push(padLine(line));
  }
  lines.push(hLine(BOX.ml, BOX.mr));

  // Footer
  const footer = "[q]Quit [s]Start/Stop [r]Refresh";
  lines.push(padLine(footer));
  lines.push(hLine(BOX.bl, BOX.br));

  return lines.join("\n");
}

export function startTui(intervalSec: number = 1): void {
  const hideCursor = "\x1b[?25l";
  const showCursor = "\x1b[?25h";
  const clearScreen = "\x1b[2J\x1b[H";

  process.stdout.write(hideCursor);

  const render = () => {
    process.stdout.write(clearScreen);
    process.stdout.write(buildScreen());
  };

  render();
  const interval = setInterval(render, intervalSec * 1000);

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  const cleanup = () => {
    clearInterval(interval);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
    process.stdout.write(showCursor + "\n");
  };

  process.stdin.on("data", (key: string) => {
    if (key === "q" || key === "\u0003") {
      // q or Ctrl+C
      cleanup();
      process.exit(0);
    }
    if (key === "s") {
      const status = getStatus();
      if (status) {
        stopTimer();
      } else {
        continueTimer();
      }
      render();
    }
    if (key === "r") {
      render();
    }
  });
}
