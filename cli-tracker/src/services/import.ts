import yaml from "js-yaml";
import { createEntry, stopEntry, setTagsForEntry } from "../db/repositories/entry.js";
import { findOrCreateProject } from "../db/repositories/project.js";
import { diffSeconds } from "../utils/time.js";

interface ImportEntry {
  description: string;
  project: string;
  tags: string[] | string;
  start_time: string;
  end_time: string;
}

function insertEntry(entry: ImportEntry): void {
  let projectId: number | undefined;
  if (entry.project) {
    const project = findOrCreateProject(entry.project);
    projectId = project.id;
  }

  const desc = entry.description || "";
  const entryId = createEntry(desc, entry.start_time, projectId);
  const duration = diffSeconds(entry.start_time, entry.end_time);
  stopEntry(entryId, entry.end_time, duration);

  const tags =
    typeof entry.tags === "string"
      ? entry.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : entry.tags.filter((t) => t.length > 0);

  if (tags.length > 0) {
    setTagsForEntry(entryId, tags);
  }
}

function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

export function importCsv(content: string): number {
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return 0;

  // Skip header row
  let count = 0;
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvRow(lines[i]);
    // CSV columns: id, description, project, tags, start_time, end_time, duration, duration_sec
    if (fields.length < 6) continue;

    const entry: ImportEntry = {
      description: fields[1],
      project: fields[2],
      tags: fields[3],
      start_time: fields[4],
      end_time: fields[5],
    };

    insertEntry(entry);
    count++;
  }
  return count;
}

export function importYaml(content: string): number {
  const data = yaml.load(content) as { entries?: ImportEntry[] };
  if (!data?.entries || !Array.isArray(data.entries)) return 0;

  let count = 0;
  for (const entry of data.entries) {
    if (!entry.start_time || !entry.end_time) continue;
    insertEntry(entry);
    count++;
  }
  return count;
}
