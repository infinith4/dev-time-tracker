import yaml from "js-yaml";
import { getAllEntries, getTagsForEntry } from "../db/repositories/entry.js";
import { formatDuration } from "../utils/time.js";
import type { EntryRow } from "../db/repositories/entry.js";

interface ExportEntry {
  id: number;
  description: string;
  project: string;
  tags: string[];
  start_time: string;
  end_time: string;
  duration: string;
  duration_sec: number;
}

function toExportEntries(entries: EntryRow[]): ExportEntry[] {
  return entries
    .filter((e) => e.end_time)
    .map((e) => ({
      id: e.id,
      description: e.description,
      project: e.project_name || "",
      tags: getTagsForEntry(e.id),
      start_time: e.start_time,
      end_time: e.end_time!,
      duration: formatDuration(e.duration_sec ?? 0),
      duration_sec: e.duration_sec ?? 0,
    }));
}

export function exportCsv(): string {
  const entries = toExportEntries(getAllEntries());
  const header = "id,description,project,tags,start_time,end_time,duration,duration_sec";
  const rows = entries.map((e) => {
    const desc = `"${e.description.replace(/"/g, '""')}"`;
    const tags = `"${e.tags.join(",")}"`;
    return `${e.id},${desc},${e.project},${tags},${e.start_time},${e.end_time},${e.duration},${e.duration_sec}`;
  });
  return [header, ...rows].join("\n") + "\n";
}

export function exportYaml(): string {
  const entries = toExportEntries(getAllEntries());
  return yaml.dump({ entries }, { sortKeys: false, lineWidth: -1 });
}
