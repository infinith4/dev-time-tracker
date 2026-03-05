import type { Command } from "commander";
import dayjs from "dayjs";
import {
  getEntriesByDateRange,
  getEntriesByDateRangeAndProject,
} from "../db/repositories/entry.js";
import { startOfDay, endOfDay } from "../utils/time.js";
import { renderEntryTable } from "../ui/table.js";
import { dim } from "../ui/colors.js";

export function registerList(program: Command): void {
  program
    .command("list")
    .description("List time entries")
    .option("-d, --date <YYYY-MM-DD>", "Date to show (default: today)")
    .option("-p, --project <name>", "Filter by project")
    .addHelpText(
      "after",
      `
Examples:
  $ trc list                          Today's entries
  $ trc list -d 2026-03-01            Entries for a specific date
  $ trc list -p my-project            Filter by project
  $ trc list -d 2026-03-01 -p backend Combine date and project`,
    )
    .action((opts: { date?: string; project?: string }) => {
      const dateStr = opts.date || dayjs().format("YYYY-MM-DD");
      const start = startOfDay(dateStr);
      const end = endOfDay(dateStr);

      const entries = opts.project
        ? getEntriesByDateRangeAndProject(start, end, opts.project)
        : getEntriesByDateRange(start, end);

      if (entries.length === 0) {
        console.log(dim(`\nNo entries for ${dateStr}.\n`));
        return;
      }

      console.log(renderEntryTable(entries, `Today's Entries (${dateStr})`));
    });
}
