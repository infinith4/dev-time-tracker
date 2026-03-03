import type { Command } from "commander";
import { stopTimer } from "../services/timer.js";
import { formatStopped } from "../ui/formatter.js";
import { warn } from "../ui/colors.js";

export function registerStop(program: Command): void {
  program
    .command("stop")
    .description("Stop the running timer")
    .action(() => {
      const entry = stopTimer();
      if (!entry) {
        console.log(warn("\nNo timer is currently running.\n"));
        return;
      }
      console.log(formatStopped(entry));
    });
}
