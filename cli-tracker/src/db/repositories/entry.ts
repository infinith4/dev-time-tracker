import { getDb } from "../connection.js";

export interface EntryRow {
  id: number;
  description: string;
  project_id: number | null;
  start_time: string;
  end_time: string | null;
  duration_sec: number | null;
  created_at: string;
  updated_at: string;
  project_name?: string;
}

export interface EntryWithTags extends EntryRow {
  tags: string[];
}

export function getRunningEntry(): EntryRow | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM entries WHERE end_time IS NULL ORDER BY id DESC LIMIT 1")
    .get() as EntryRow | undefined;
}

export function createEntry(description: string, startTime: string, projectId?: number): number {
  const db = getDb();
  const result = db
    .prepare("INSERT INTO entries (description, project_id, start_time) VALUES (?, ?, ?)")
    .run(description, projectId ?? null, startTime);
  return Number(result.lastInsertRowid);
}

export function stopEntry(id: number, endTime: string, durationSec: number): void {
  const db = getDb();
  db.prepare(
    "UPDATE entries SET end_time = ?, duration_sec = ?, updated_at = datetime('now') WHERE id = ?",
  ).run(endTime, durationSec, id);
}

export function getEntryById(id: number): EntryRow | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM entries WHERE id = ?").get(id) as EntryRow | undefined;
}

export function getLastEntry(): EntryRow | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM entries WHERE end_time IS NOT NULL ORDER BY id DESC LIMIT 1")
    .get() as EntryRow | undefined;
}

export function deleteEntry(id: number): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM entries WHERE id = ?").run(id);
  return result.changes > 0;
}

export function updateEntry(
  id: number,
  fields: {
    description?: string;
    project_id?: number | null;
    start_time?: string;
    end_time?: string;
    duration_sec?: number;
  },
): boolean {
  const db = getDb();
  const sets: string[] = [];
  const values: unknown[] = [];

  if (fields.description !== undefined) {
    sets.push("description = ?");
    values.push(fields.description);
  }
  if (fields.project_id !== undefined) {
    sets.push("project_id = ?");
    values.push(fields.project_id);
  }
  if (fields.start_time !== undefined) {
    sets.push("start_time = ?");
    values.push(fields.start_time);
  }
  if (fields.end_time !== undefined) {
    sets.push("end_time = ?");
    values.push(fields.end_time);
  }
  if (fields.duration_sec !== undefined) {
    sets.push("duration_sec = ?");
    values.push(fields.duration_sec);
  }

  if (sets.length === 0) return false;

  sets.push("updated_at = datetime('now')");
  values.push(id);

  const result = db
    .prepare(`UPDATE entries SET ${sets.join(", ")} WHERE id = ?`)
    .run(...values);
  return result.changes > 0;
}

export function getEntriesByDateRange(start: string, end: string): EntryRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT e.*, p.name as project_name
       FROM entries e
       LEFT JOIN projects p ON e.project_id = p.id
       WHERE e.start_time >= ? AND e.start_time <= ?
       ORDER BY e.start_time ASC`,
    )
    .all(start, end) as EntryRow[];
}

export function getEntriesByDateRangeAndProject(
  start: string,
  end: string,
  projectName: string,
): EntryRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT e.*, p.name as project_name
       FROM entries e
       LEFT JOIN projects p ON e.project_id = p.id
       WHERE e.start_time >= ? AND e.start_time <= ?
         AND p.name = ?
       ORDER BY e.start_time ASC`,
    )
    .all(start, end, projectName) as EntryRow[];
}

export function getAllEntries(): EntryRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT e.*, p.name as project_name
       FROM entries e
       LEFT JOIN projects p ON e.project_id = p.id
       ORDER BY e.start_time ASC`,
    )
    .all() as EntryRow[];
}

export function getTagsForEntry(entryId: number): string[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT t.name FROM tags t
       JOIN entry_tags et ON t.id = et.tag_id
       WHERE et.entry_id = ?`,
    )
    .all(entryId) as { name: string }[];
  return rows.map((r) => r.name);
}

export function setTagsForEntry(entryId: number, tagNames: string[]): void {
  const db = getDb();
  db.prepare("DELETE FROM entry_tags WHERE entry_id = ?").run(entryId);

  for (const name of tagNames) {
    db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (?)").run(name);
    const tag = db.prepare("SELECT id FROM tags WHERE name = ?").get(name) as { id: number };
    db.prepare("INSERT INTO entry_tags (entry_id, tag_id) VALUES (?, ?)").run(entryId, tag.id);
  }
}
