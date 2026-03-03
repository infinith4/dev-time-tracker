import type { Command } from "commander";
import { getStatus } from "../services/timer.js";
import { formatStatus } from "../ui/formatter.js";
import { dim } from "../ui/colors.js";
import { getDb } from "../db/connection.js";

export function registerStatus(program: Command): void {
  program
    .command("status")
    .description("Show current timer status")
    .action(() => {
      const entry = getStatus();
      if (!entry) {
        console.log(dim("\nNo timer is currently running.\n"));
        return;
      }

      // Resolve project name
      if (entry.project_id) {
        const db = getDb();
        const project = db
          .prepare("SELECT name FROM projects WHERE id = ?")
          .get(entry.project_id) as { name: string } | undefined;
        if (project) {
          (entry as typeof entry & { project_name: string }).project_name = project.name;
        }
      }

      console.log(formatStatus(entry));
    });
}
