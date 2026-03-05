import type { Command } from "commander";
import { generateReport, formatReportHeader } from "../services/report.js";
import { renderProjectTable, renderDayBars } from "../ui/table.js";
import { bold, dim } from "../ui/colors.js";
import type { Period } from "../services/report.js";

export function registerReport(program: Command): void {
  program
    .command("report")
    .description("Show time report")
    .option("--period <period>", "Period: day, week, month", "week")
    .option("-p, --project <name>", "Filter by project")
    .addHelpText(
      "after",
      `
Examples:
  $ trc report                         Weekly report (default)
  $ trc report --period day            Today's report
  $ trc report --period month          Monthly report
  $ trc report -p my-project           Report for a specific project`,
    )
    .action((opts: { period: string; project?: string }) => {
      const period = opts.period as Period;
      if (!["day", "week", "month"].includes(period)) {
        console.error('Invalid period. Use: day, week, month');
        process.exit(1);
      }

      const data = generateReport(period, opts.project);

      if (data.entries.length === 0) {
        console.log(dim("\nNo entries for this period.\n"));
        return;
      }

      console.log(`\n${bold(formatReportHeader(data))}`);

      if (data.byProject.length > 0) {
        console.log(`\n${bold("By Project:")}`);
        console.log(renderProjectTable(data.byProject));
      }

      if (period !== "day") {
        console.log(`\n${bold("By Day:")}`);
        console.log(renderDayBars(data.byDay));
      }

      console.log("");
    });
}
