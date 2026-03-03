import type { Command } from "commander";
import { getEntryById, updateEntry } from "../db/repositories/entry.js";
import { findOrCreateProject } from "../db/repositories/project.js";
import { success, error as errorColor } from "../ui/colors.js";

export function registerEdit(program: Command): void {
  program
    .command("edit <id>")
    .description("Edit a time entry")
    .option("--desc <description>", "New description")
    .option("-p, --project <name>", "New project")
    .action((idStr: string, opts: { desc?: string; project?: string }) => {
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

      const fields: { description?: string; project_id?: number | null } = {};
      if (opts.desc !== undefined) {
        fields.description = opts.desc;
      }
      if (opts.project !== undefined) {
        const project = findOrCreateProject(opts.project);
        fields.project_id = project.id;
      }

      updateEntry(id, fields);
      console.log(success(`\nUpdated entry #${id}.\n`));
    });
}
