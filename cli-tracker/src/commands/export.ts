import type { Command } from "commander";
import { exportCsv, exportYaml } from "../services/export.js";
import { error as errorColor } from "../ui/colors.js";

export function registerExport(program: Command): void {
  program
    .command("export")
    .description("Export time entries")
    .option("--format <format>", "Export format: csv, yaml", "csv")
    .action((opts: { format: string }) => {
      switch (opts.format) {
        case "csv":
          console.log(exportCsv());
          break;
        case "yaml":
          console.log(exportYaml());
          break;
        default:
          console.log(errorColor(`\nUnknown format: ${opts.format}. Use csv or yaml.\n`));
          process.exit(1);
      }
    });
}
