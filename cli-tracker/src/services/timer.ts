import {
  getRunningEntry,
  createEntry,
  stopEntry,
  getLastEntry,
  getEntryById,
  setTagsForEntry,
} from "../db/repositories/entry.js";
import { findOrCreateProject } from "../db/repositories/project.js";
import { now, elapsedSeconds } from "../utils/time.js";
import type { EntryRow } from "../db/repositories/entry.js";

export interface StartResult {
  entry: EntryRow;
  stoppedEntry?: EntryRow;
}

export function startTimer(
  description: string,
  projectName?: string,
  tags?: string[],
): StartResult {
  let stoppedEntry: EntryRow | undefined;

  const running = getRunningEntry();
  if (running) {
    const endTime = now();
    const duration = elapsedSeconds(running.start_time);
    stopEntry(running.id, endTime, duration);
    stoppedEntry = { ...running, end_time: endTime, duration_sec: duration };
  }

  let projectId: number | undefined;
  let projectNameResolved: string | undefined;
  if (projectName) {
    const project = findOrCreateProject(projectName);
    projectId = project.id;
    projectNameResolved = project.name;
  }

  const startTime = now();
  const entryId = createEntry(description, startTime, projectId);

  const entry: EntryRow = {
    id: entryId,
    description,
    project_id: projectId ?? null,
    project_name: projectNameResolved,
    start_time: startTime,
    end_time: null,
    duration_sec: null,
    created_at: startTime,
    updated_at: startTime,
  };

  if (tags && tags.length > 0) {
    setTagsForEntry(entryId, tags);
  }

  return { entry, stoppedEntry };
}

export function stopTimer(): EntryRow | null {
  const running = getRunningEntry();
  if (!running) return null;

  const endTime = now();
  const duration = elapsedSeconds(running.start_time);
  stopEntry(running.id, endTime, duration);

  return { ...running, end_time: endTime, duration_sec: duration };
}

export function getStatus(): EntryRow | null {
  return getRunningEntry() ?? null;
}

export function continueTimer(): StartResult | null {
  const last = getLastEntry();
  if (!last) return null;

  let projectName: string | undefined;
  if (last.project_id) {
    const entry = getEntryById(last.id);
    if (entry) {
      // Re-fetch with project name
      projectName = (entry as EntryRow & { project_name?: string }).project_name;
    }
  }

  return startTimer(last.description, projectName);
}
