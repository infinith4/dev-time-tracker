import { getDb } from "../db/connection.js";
import {
  createEntry,
  stopEntry,
  updateEntry,
  deleteEntry,
  getOverlappingEntries,
  getTagsForEntry,
  setTagsForEntry,
  type EntryRow,
} from "../db/repositories/entry.js";
import { diffSeconds, now } from "../utils/time.js";

export interface SplitResult {
  newEntryId: number;
  modified: { id: number; description: string }[];
  created: { id: number; description: string }[];
  deleted: { id: number; description: string }[];
}

export function addEntryWithSplit(
  description: string,
  startIso: string,
  endIso: string,
  durationSec: number,
  projectId?: number,
  tags?: string[],
): SplitResult {
  const db = getDb();

  const result: SplitResult = {
    newEntryId: 0,
    modified: [],
    created: [],
    deleted: [],
  };

  const run = db.transaction(() => {
    const overlaps = getOverlappingEntries(startIso, endIso);

    for (const entry of overlaps) {
      const existStart = entry.start_time;
      const existEnd = entry.end_time; // null if running
      const effectiveEnd = existEnd || now();

      const startsBefore = existStart < startIso;
      const endsAfter = effectiveEnd > endIso;

      if (startsBefore && endsAfter) {
        // Case A: full containment — split into head + tail
        const headDur = diffSeconds(existStart, startIso);
        updateEntry(entry.id, { end_time: startIso, duration_sec: headDur });
        result.modified.push({ id: entry.id, description: entry.description });

        // Create tail entry (running if original was running and tail extends beyond now)
        const tailId = createEntry(entry.description, endIso, entry.project_id ?? undefined);
        if (existEnd) {
          // Original was completed
          const tailDur = diffSeconds(endIso, existEnd);
          stopEntry(tailId, existEnd, tailDur);
        }
        // If original was running (existEnd === null), tail stays running (no stopEntry)

        // Copy tags
        const entryTags = getTagsForEntry(entry.id);
        if (entryTags.length > 0) {
          setTagsForEntry(tailId, entryTags);
        }
        result.created.push({ id: tailId, description: entry.description });
      } else if (startsBefore && !endsAfter) {
        // Case B: overlap at end — trim existing end
        const headDur = diffSeconds(existStart, startIso);
        updateEntry(entry.id, { end_time: startIso, duration_sec: headDur });
        result.modified.push({ id: entry.id, description: entry.description });
      } else if (!startsBefore && endsAfter) {
        // Case C: overlap at start — shift existing start
        const tailDur = existEnd ? diffSeconds(endIso, existEnd) : undefined;
        const fields: Parameters<typeof updateEntry>[1] = { start_time: endIso };
        if (tailDur !== undefined) {
          fields.duration_sec = tailDur;
        }
        updateEntry(entry.id, fields);
        result.modified.push({ id: entry.id, description: entry.description });
      } else {
        // Case D: full eclipse — delete existing
        deleteEntry(entry.id);
        result.deleted.push({ id: entry.id, description: entry.description });
      }
    }

    // Create the new entry
    const newId = createEntry(description, startIso, projectId);
    stopEntry(newId, endIso, durationSec);
    if (tags && tags.length > 0) {
      setTagsForEntry(newId, tags);
    }
    result.newEntryId = newId;
  });

  run();
  return result;
}
