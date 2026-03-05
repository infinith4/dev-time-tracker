import { getDb } from "../connection.js";

export interface GoalRow {
  id: number;
  period: string;
  target_sec: number;
  created_at: string;
}

export function setGoal(period: string, targetSec: number): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO goals (period, target_sec) VALUES (?, ?)
     ON CONFLICT(period) DO UPDATE SET target_sec = excluded.target_sec`,
  ).run(period, targetSec);
}

export function getGoal(period: string): GoalRow | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM goals WHERE period = ?").get(period) as GoalRow | undefined;
}

export function getAllGoals(): GoalRow[] {
  const db = getDb();
  return db.prepare("SELECT * FROM goals ORDER BY id ASC").all() as GoalRow[];
}

export function clearGoals(): number {
  const db = getDb();
  const result = db.prepare("DELETE FROM goals").run();
  return result.changes;
}
