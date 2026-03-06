import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Command } from "commander";
import { registerStart } from "./commands/start.js";
import { registerStop } from "./commands/stop.js";
import { registerStatus } from "./commands/status.js";
import { registerList } from "./commands/list.js";
import { registerReport } from "./commands/report.js";
import { registerContinue } from "./commands/continue.js";
import { registerDelete } from "./commands/delete.js";
import { registerEdit } from "./commands/edit.js";
import { registerProject } from "./commands/project.js";
import { registerExport } from "./commands/export.js";
import { registerImport } from "./commands/import.js";
import { registerAdd } from "./commands/add.js";
import { registerRecalc } from "./commands/recalc.js";
import { registerGoal } from "./commands/goal.js";
import { registerPomodoro } from "./commands/pomodoro.js";
import { registerUi } from "./commands/ui.js";
import { closeDb } from "./db/connection.js";
import { setTimezone } from "./utils/time.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8"));

const program = new Command();

program
  .name("trc")
  .description("CLI time tracking tool")
  .version(pkg.version)
  .option("--timezone <tz>", "Timezone for display (e.g. Asia/Tokyo)")
  .hook("preAction", () => {
    const tz = program.opts().timezone as string | undefined;
    if (tz) {
      setTimezone(tz);
    }
  })
  .addHelpText(
    "after",
    `
Examples:
  $ trc start "coding@my-project" -t feature    Start timer with project & tag
  $ trc stop                                     Stop running timer
  $ trc add "meeting@team" --start "09:00" --hm 1h30m
                                                 Add a past entry with duration
  $ trc list -d 2026-03-01 -p my-project         List entries by date & project
  $ trc report --period month                    Monthly report
  $ trc goal set --daily 8h --weekly 40h         Set time goals
  $ trc goal                                     Show goal progress
  $ trc pomo "deep work@research" --work 50      Pomodoro with custom duration
  $ trc ui                                       Open interactive dashboard

Tips:
  Use "description@project" shorthand in start/add/pomo commands.
  Run "trc <command> --help" for detailed options of each command.`,
  );

registerStart(program);
registerStop(program);
registerStatus(program);
registerList(program);
registerReport(program);
registerContinue(program);
registerDelete(program);
registerEdit(program);
registerProject(program);
registerExport(program);
registerImport(program);
registerAdd(program);
registerRecalc(program);
registerGoal(program);
registerPomodoro(program);
registerUi(program);

program.hook("postAction", () => {
  closeDb();
});

program.parse();
