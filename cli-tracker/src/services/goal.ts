import { getAllGoals, setGoal, clearGoals, type GoalRow } from "../db/repositories/goal.js";
import { getEntriesByDateRange } from "../db/repositories/entry.js";
import { getRunningEntry } from "../db/repositories/entry.js";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  formatDuration,
  elapsedSeconds,
} from "../utils/time.js";

export interface GoalProgress {
  period: string;
  targetSec: number;
  actualSec: number;
  percentage: number;
}

function parseGoalDuration(input: string): number | null {
  const match = input.match(/^(\d+)h$/);
  if (match) return parseInt(match[1]) * 3600;
  const matchHm = input.match(/^(\d+)h(\d+)m$/);
  if (matchHm) return parseInt(matchHm[1]) * 3600 + parseInt(matchHm[2]) * 60;
  const matchM = input.match(/^(\d+)m$/);
  if (matchM) return parseInt(matchM[1]) * 60;
  return null;
}

export function setGoalForPeriod(period: string, durationStr: string): number | null {
  const seconds = parseGoalDuration(durationStr);
  if (seconds === null || seconds <= 0) return null;
  setGoal(period, seconds);
  return seconds;
}

export function clearAllGoals(): number {
  return clearGoals();
}

function getTotalSecondsForRange(start: string, end: string): number {
  const entries = getEntriesByDateRange(start, end);
  let total = 0;
  for (const entry of entries) {
    if (entry.duration_sec) {
      total += entry.duration_sec;
    } else if (!entry.end_time) {
      total += elapsedSeconds(entry.start_time);
    }
  }
  return total;
}

export function getGoalProgress(): GoalProgress[] {
  const goals = getAllGoals();
  const result: GoalProgress[] = [];

  for (const goal of goals) {
    let start: string;
    let end: string;

    switch (goal.period) {
      case "daily":
        start = startOfDay();
        end = endOfDay();
        break;
      case "weekly":
        start = startOfWeek();
        end = endOfDay();
        break;
      case "monthly":
        start = startOfMonth();
        end = endOfDay();
        break;
      default:
        continue;
    }

    const actualSec = getTotalSecondsForRange(start, end);
    result.push({
      period: goal.period,
      targetSec: goal.target_sec,
      actualSec,
      percentage: Math.min(100, Math.round((actualSec / goal.target_sec) * 100)),
    });
  }

  return result;
}

export function formatGoalBar(progress: GoalProgress): string {
  const barWidth = 20;
  const filled = Math.round((progress.percentage / 100) * barWidth);
  const empty = barWidth - filled;
  const bar = "\u2588".repeat(filled) + "\u2591".repeat(empty);
  const actual = formatDuration(progress.actualSec);
  const target = formatDuration(progress.targetSec);
  const label = progress.period.charAt(0).toUpperCase() + progress.period.slice(1);
  return `  ${label.padEnd(9)} ${bar}  ${actual} / ${target} (${progress.percentage}%)`;
}
