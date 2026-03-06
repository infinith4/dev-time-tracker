import type { Command } from "commander";
import { createEntry, stopEntry, setTagsForEntry } from "../db/repositories/entry.js";
import { findOrCreateProject } from "../db/repositories/project.js";
import { parseDateTime, diffSeconds, formatDuration } from "../utils/time.js";
import { success, error as errorColor, dim } from "../ui/colors.js";
import { parseDescriptionProject } from "../utils/parse.js";
import { addEntryWithSplit } from "../services/entry-split.js";

function parseHm(hm: string): number | null {
  const match = hm.match(/^(\d+)h(\d+)m$|^(\d+)h$|^(\d+)m$/);
  if (!match) return null;
  if (match[1] !== undefined && match[2] !== undefined) {
    return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60;
  }
  if (match[3] !== undefined) {
    return parseInt(match[3]) * 3600;
  }
  if (match[4] !== undefined) {
    return parseInt(match[4]) * 60;
  }
  return null;
}

export function registerAdd(program: Command): void {
  program
    .command("add [description]")
    .description("Add a completed time entry (use description@project shorthand)")
    .requiredOption("--start <datetime>", "Start time (YYYY-MM-DD HH:mm)")
    .option("--end <datetime>", "End time (YYYY-MM-DD HH:mm)")
    .option("--hm <duration>", "Duration from start (e.g., 1h30m, 2h, 45m)")
    .option("-p, --project <name>", "Project name")
    .option("-t, --tags <tags>", "Comma-separated tags")
    .option("--no-split", "Add without splitting overlapping entries")
    .addHelpText(
      "after",
      `
Either --end or --hm is required (cannot use both).

Examples:
  $ trc add "meeting" --start "2026-03-03 09:00" --end "2026-03-03 10:30"
  $ trc add "review@backend" --start "2026-03-03 14:00" --hm 1h30m
  $ trc add "standup@team" --start "09:00" --hm 15m -t daily`,
    )
    .action(
      (
        description: string | undefined,
        opts: { start: string; end?: string; hm?: string; project?: string; tags?: string; split: boolean },
      ) => {
        const parsed = parseDescriptionProject(description || "");
        const projectName = opts.project || parsed.project;
        if (!opts.end && !opts.hm) {
          console.log(errorColor("\nEither --end or --hm is required.\n"));
          return;
        }
        if (opts.end && opts.hm) {
          console.log(errorColor("\nCannot use both --end and --hm. Choose one.\n"));
          return;
        }

        const startDayjs = parseDateTime(opts.start);
        if (!startDayjs.isValid()) {
          console.log(errorColor(`\nInvalid start time: ${opts.start}\n`));
          return;
        }

        let endIso: string;
        let duration: number;

        if (opts.hm) {
          const seconds = parseHm(opts.hm);
          if (seconds === null || seconds <= 0) {
            console.log(errorColor(`\nInvalid duration: ${opts.hm}. Use format like 1h30m, 2h, or 45m.\n`));
            return;
          }
          duration = seconds;
          const endDayjs = startDayjs.add(seconds, "second");
          endIso = endDayjs.toISOString();
        } else {
          const endDayjs = parseDateTime(opts.end!);
          if (!endDayjs.isValid()) {
            console.log(errorColor(`\nInvalid end time: ${opts.end}\n`));
            return;
          }
          if (endDayjs.isBefore(startDayjs) || endDayjs.isSame(startDayjs)) {
            console.log(errorColor("\nEnd time must be after start time.\n"));
            return;
          }
          endIso = endDayjs.toISOString();
          duration = diffSeconds(startDayjs.toISOString(), endIso);
        }

        const startIso = startDayjs.toISOString();

        let projectId: number | undefined;
        if (projectName) {
          const project = findOrCreateProject(projectName);
          projectId = project.id;
        }

        const desc = parsed.description;
        const tags = opts.tags ? opts.tags.split(",").map((t) => t.trim()) : undefined;

        if (opts.split) {
          const result = addEntryWithSplit(desc, startIso, endIso, duration, projectId, tags);

          console.log(success(`\nAdded entry #${result.newEntryId}: ${desc || "(no description)"}`));
          console.log(`  ${opts.start} ~ ${formatDuration(duration)}`);

          for (const m of result.modified) {
            console.log(dim(`  Split #${m.id} ("${m.description}")`));
          }
          for (const c of result.created) {
            console.log(dim(`  Created tail #${c.id} ("${c.description}")`));
          }
          for (const d of result.deleted) {
            console.log(dim(`  Removed #${d.id} ("${d.description}")`));
          }
        } else {
          const entryId = createEntry(desc, startIso, projectId);
          stopEntry(entryId, endIso, duration);
          if (tags && tags.length > 0) {
            setTagsForEntry(entryId, tags);
          }
          console.log(success(`\nAdded entry #${entryId}: ${desc || "(no description)"}`));
          console.log(`  ${opts.start} ~ ${formatDuration(duration)}`);
        }
        console.log();
      },
    );
}
