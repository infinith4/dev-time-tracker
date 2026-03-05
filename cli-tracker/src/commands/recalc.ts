import type { Command } from "commander";
import { getDb } from "../db/connection.js";
import { success } from "../ui/colors.js";

export function registerRecalc(program: Command): void {
  program
    .command("recalc")
    .description("Recalculate duration for all completed entries")
    .action(() => {
      const db = getDb();
      const result = db
        .prepare(
          `UPDATE entries
           SET duration_sec = CAST((julianday(end_time) - julianday(start_time)) * 86400 AS INTEGER),
               updated_at = datetime('now')
           WHERE end_time IS NOT NULL`,
        )
        .run();

      console.log(success(`\nRecalculated duration for ${result.changes} entries.\n`));
    });
}
