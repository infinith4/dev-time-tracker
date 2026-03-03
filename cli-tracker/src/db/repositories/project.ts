import { getDb } from "../connection.js";

export interface ProjectRow {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export function findProjectByName(name: string): ProjectRow | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM projects WHERE name = ?").get(name) as ProjectRow | undefined;
}

export function findOrCreateProject(name: string): ProjectRow {
  const existing = findProjectByName(name);
  if (existing) return existing;

  const db = getDb();
  db.prepare("INSERT INTO projects (name) VALUES (?)").run(name);
  return findProjectByName(name)!;
}

export function getAllProjects(): ProjectRow[] {
  const db = getDb();
  return db.prepare("SELECT * FROM projects ORDER BY name ASC").all() as ProjectRow[];
}

export function deleteProject(name: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM projects WHERE name = ?").run(name);
  return result.changes > 0;
}

export function renameProject(oldName: string, newName: string): boolean {
  const db = getDb();
  const result = db
    .prepare("UPDATE projects SET name = ? WHERE name = ?")
    .run(newName, oldName);
  return result.changes > 0;
}
