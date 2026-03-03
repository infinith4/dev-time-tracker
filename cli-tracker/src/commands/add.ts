import type { Command } from "commander";
import { createEntry, stopEntry, setTagsForEntry } from "../db/repositories/entry.js";
import { findOrCreateProject } from "../db/repositories/project.js";
import { parseDateTime, diffSeconds } from "../utils/time.js";
import { success, error as errorColor } from "../ui/colors.js";

export function registerAdd(program: Command): void {
  program
    .command("add [description]")
    .description("Add a completed time entry")
    .requiredOption("--start <datetime>", "Start time (YYYY-MM-DD HH:mm)")
    .requiredOption("--end <datetime>", "End time (YYYY-MM-DD HH:mm)")
    .option("-p, --project <name>", "Project name")
    .option("-t, --tags <tags>", "Comma-separated tags")
    .action(
      (
        description: string | undefined,
        opts: { start: string; end: string; project?: string; tags?: string },
      ) => {
        const startDayjs = parseDateTime(opts.start);
        const endDayjs = parseDateTime(opts.end);

        if (!startDayjs.isValid()) {
          console.log(errorColor(`\nInvalid start time: ${opts.start}\n`));
          return;
        }
        if (!endDayjs.isValid()) {
          console.log(errorColor(`\nInvalid end time: ${opts.end}\n`));
          return;
        }
        if (endDayjs.isBefore(startDayjs) || endDayjs.isSame(startDayjs)) {
          console.log(errorColor("\nEnd time must be after start time.\n"));
          return;
        }

        const startIso = startDayjs.toISOString();
        const endIso = endDayjs.toISOString();
        const duration = diffSeconds(startIso, endIso);

        let projectId: number | undefined;
        if (opts.project) {
          const project = findOrCreateProject(opts.project);
          projectId = project.id;
        }

        const desc = description || "";
        const entryId = createEntry(desc, startIso, projectId);
        stopEntry(entryId, endIso, duration);

        const tags = opts.tags ? opts.tags.split(",").map((t) => t.trim()) : undefined;
        if (tags && tags.length > 0) {
          setTagsForEntry(entryId, tags);
        }

        console.log(success(`\nAdded entry #${entryId}: ${desc || "(no description)"}`));
        console.log(`  ${opts.start} ~ ${opts.end} (${Math.floor(duration / 60)}min)\n`);
      },
    );
}
