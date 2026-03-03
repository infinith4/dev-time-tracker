import type { Command } from "commander";
import { getEntryById, updateEntry } from "../db/repositories/entry.js";
import { findOrCreateProject } from "../db/repositories/project.js";
import { parseDateTime, diffSeconds } from "../utils/time.js";
import { success, error as errorColor } from "../ui/colors.js";

export function registerEdit(program: Command): void {
  program
    .command("edit <id>")
    .description("Edit a time entry")
    .option("--desc <description>", "New description")
    .option("-p, --project <name>", "New project")
    .option("--start <datetime>", "New start time (YYYY-MM-DD HH:mm)")
    .option("--end <datetime>", "New end time (YYYY-MM-DD HH:mm)")
    .action(
      (
        idStr: string,
        opts: { desc?: string; project?: string; start?: string; end?: string },
      ) => {
        const id = parseInt(idStr, 10);
        if (isNaN(id)) {
          console.log(errorColor("\nInvalid ID.\n"));
          return;
        }

        const entry = getEntryById(id);
        if (!entry) {
          console.log(errorColor(`\nEntry #${id} not found.\n`));
          return;
        }

        const fields: {
          description?: string;
          project_id?: number | null;
          start_time?: string;
          end_time?: string;
          duration_sec?: number;
        } = {};

        if (opts.desc !== undefined) {
          fields.description = opts.desc;
        }
        if (opts.project !== undefined) {
          const project = findOrCreateProject(opts.project);
          fields.project_id = project.id;
        }

        if (opts.start !== undefined) {
          const startDayjs = parseDateTime(opts.start);
          if (!startDayjs.isValid()) {
            console.log(errorColor(`\nInvalid start time: ${opts.start}\n`));
            return;
          }
          fields.start_time = startDayjs.toISOString();
        }

        if (opts.end !== undefined) {
          const endDayjs = parseDateTime(opts.end);
          if (!endDayjs.isValid()) {
            console.log(errorColor(`\nInvalid end time: ${opts.end}\n`));
            return;
          }
          fields.end_time = endDayjs.toISOString();
        }

        // Recalculate duration if start or end changed
        const finalStart = fields.start_time || entry.start_time;
        const finalEnd = fields.end_time || entry.end_time;
        if ((opts.start !== undefined || opts.end !== undefined) && finalEnd) {
          fields.duration_sec = diffSeconds(finalStart, finalEnd);
        }

        updateEntry(id, fields);
        console.log(success(`\nUpdated entry #${id}.\n`));
      },
    );
}
