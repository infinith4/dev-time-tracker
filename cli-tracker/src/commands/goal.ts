import type { Command } from "commander";
import { setGoalForPeriod, clearAllGoals, getGoalProgress, formatGoalBar } from "../services/goal.js";
import { success, error as errorColor, info, dim } from "../ui/colors.js";

export function registerGoal(program: Command): void {
  const goal = program.command("goal").description("Manage time goals");

  goal
    .command("set")
    .description("Set a time goal (e.g., trc goal set --daily 8h)")
    .option("--daily <duration>", "Daily goal (e.g., 8h, 7h30m)")
    .option("--weekly <duration>", "Weekly goal (e.g., 40h)")
    .option("--monthly <duration>", "Monthly goal (e.g., 160h)")
    .addHelpText(
      "after",
      `
Duration format: 8h, 7h30m, 45m. Multiple goals can be set at once.

Examples:
  $ trc goal set --daily 8h
  $ trc goal set --weekly 40h --monthly 160h
  $ trc goal set --daily 7h30m`,
    )
    .action((opts: { daily?: string; weekly?: string; monthly?: string }) => {
      let count = 0;

      if (opts.daily) {
        const sec = setGoalForPeriod("daily", opts.daily);
        if (sec === null) {
          console.log(errorColor(`\nInvalid duration: ${opts.daily}. Use format like 8h, 7h30m, or 30m.\n`));
          return;
        }
        count++;
        console.log(success(`  Daily goal set to ${opts.daily}`));
      }

      if (opts.weekly) {
        const sec = setGoalForPeriod("weekly", opts.weekly);
        if (sec === null) {
          console.log(errorColor(`\nInvalid duration: ${opts.weekly}. Use format like 40h, 37h30m.\n`));
          return;
        }
        count++;
        console.log(success(`  Weekly goal set to ${opts.weekly}`));
      }

      if (opts.monthly) {
        const sec = setGoalForPeriod("monthly", opts.monthly);
        if (sec === null) {
          console.log(errorColor(`\nInvalid duration: ${opts.monthly}. Use format like 160h.\n`));
          return;
        }
        count++;
        console.log(success(`  Monthly goal set to ${opts.monthly}`));
      }

      if (count === 0) {
        console.log(errorColor("\nSpecify at least one: --daily, --weekly, or --monthly.\n"));
      } else {
        console.log("");
      }
    });

  goal
    .command("clear")
    .description("Remove all goals")
    .action(() => {
      const count = clearAllGoals();
      console.log(success(`\nCleared ${count} goal(s).\n`));
    });

  goal
    .command("show", { isDefault: true })
    .description("Show goal progress")
    .action(() => {
      const progress = getGoalProgress();
      if (progress.length === 0) {
        console.log(dim("\nNo goals set. Use `trc goal set --daily 8h` to set a goal.\n"));
        return;
      }

      console.log(info("\nGoal Progress\n"));
      for (const p of progress) {
        console.log(formatGoalBar(p));
      }
      console.log("");
    });
}
