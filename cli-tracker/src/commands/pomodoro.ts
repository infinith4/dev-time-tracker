import type { Command } from "commander";
import { runPomodoro } from "../services/pomodoro.js";
import { parseDescriptionProject } from "../utils/parse.js";

export function registerPomodoro(program: Command): void {
  program
    .command("pomodoro [description]")
    .alias("pomo")
    .description("Start a pomodoro session (25m work + 5m break)")
    .option("-p, --project <name>", "Project name")
    .option("-t, --tags <tags>", "Comma-separated tags")
    .option("--work <minutes>", "Work duration in minutes", "25")
    .option("--break <minutes>", "Break duration in minutes", "5")
    .option("--rounds <count>", "Number of rounds", "4")
    .addHelpText(
      "after",
      `
Work phases are recorded as time entries. Breaks are not recorded.
Press Ctrl+C to stop early (current entry is saved).

Examples:
  $ trc pomo "coding@my-project"
  $ trc pomo "deep work" --work 50 --break 10 --rounds 2
  $ trc pomo "sprint@backend" -t focus --rounds 3`,
    )
    .action(
      async (
        description: string | undefined,
        opts: {
          project?: string;
          tags?: string;
          work: string;
          break: string;
          rounds: string;
        },
      ) => {
        const parsed = parseDescriptionProject(description || "work");
        const desc = parsed.description;
        const projectName = opts.project || parsed.project;
        const tags = opts.tags ? opts.tags.split(",").map((t) => t.trim()) : undefined;

        await runPomodoro({
          description: desc,
          projectName,
          tags,
          workMin: parseInt(opts.work, 10) || 25,
          breakMin: parseInt(opts.break, 10) || 5,
          rounds: parseInt(opts.rounds, 10) || 4,
        });
      },
    );
}
