import type { Command } from "commander";
import { startTimer } from "../services/timer.js";
import { formatStarted, formatStopped } from "../ui/formatter.js";
import { warn } from "../ui/colors.js";

export function registerStart(program: Command): void {
  program
    .command("start [description]")
    .description("Start a new timer")
    .option("-p, --project <name>", "Project name")
    .option("-t, --tags <tags>", "Comma-separated tags")
    .action((description: string | undefined, opts: { project?: string; tags?: string }) => {
      const desc = description || "";
      const tags = opts.tags ? opts.tags.split(",").map((t) => t.trim()) : undefined;
      const result = startTimer(desc, opts.project, tags);

      if (result.stoppedEntry) {
        console.log(warn("Stopped previous timer:"));
        console.log(formatStopped(result.stoppedEntry));
      }

      console.log(formatStarted(result.entry));
    });
}
