import type { Command } from "commander";
import { continueTimer } from "../services/timer.js";
import { formatStarted } from "../ui/formatter.js";
import { warn } from "../ui/colors.js";

export function registerContinue(program: Command): void {
  program
    .command("continue")
    .description("Continue the last stopped timer")
    .action(() => {
      const result = continueTimer();
      if (!result) {
        console.log(warn("\nNo previous entry to continue.\n"));
        return;
      }
      console.log(formatStarted(result.entry));
    });
}
