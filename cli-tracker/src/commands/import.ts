import { readFileSync } from "node:fs";
import { extname } from "node:path";
import type { Command } from "commander";
import { importCsv, importYaml } from "../services/import.js";
import { success, error as errorColor } from "../ui/colors.js";

export function registerImport(program: Command): void {
  program
    .command("import <file>")
    .description("Import time entries from a CSV or YAML file")
    .option("--format <format>", "Import format: csv, yaml (auto-detected from extension)")
    .action((file: string, opts: { format?: string }) => {
      let content: string;
      try {
        content = readFileSync(file, "utf-8");
      } catch {
        console.log(errorColor(`\nCannot read file: ${file}\n`));
        process.exit(1);
      }

      const format = opts.format || detectFormat(file);
      if (!format) {
        console.log(errorColor("\nCannot detect format. Use --format csv or --format yaml.\n"));
        process.exit(1);
      }

      let count: number;
      switch (format) {
        case "csv":
          count = importCsv(content);
          break;
        case "yaml":
          count = importYaml(content);
          break;
        default:
          console.log(errorColor(`\nUnknown format: ${format}. Use csv or yaml.\n`));
          process.exit(1);
      }

      console.log(success(`\nImported ${count} entries from ${file}\n`));
    });
}

function detectFormat(filePath: string): string | null {
  const ext = extname(filePath).toLowerCase();
  switch (ext) {
    case ".csv":
      return "csv";
    case ".yaml":
    case ".yml":
      return "yaml";
    default:
      return null;
  }
}
