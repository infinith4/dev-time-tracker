import type { Command } from "commander";
import { deleteEntry, getEntryById } from "../db/repositories/entry.js";
import { success, error as errorColor } from "../ui/colors.js";

export function registerDelete(program: Command): void {
  program
    .command("delete <id>")
    .description("Delete a time entry")
    .action((idStr: string) => {
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

      deleteEntry(id);
      console.log(success(`\nDeleted entry #${id}: ${entry.description || "(no description)"}\n`));
    });
}
