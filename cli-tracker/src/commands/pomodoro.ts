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
