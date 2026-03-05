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

const program = new Command();

program
  .name("trc")
  .description("CLI time tracking tool")
  .version("1.0.0")
  .option("--timezone <tz>", "Timezone for display (e.g. Asia/Tokyo)")
  .hook("preAction", () => {
    const tz = program.opts().timezone as string | undefined;
    if (tz) {
      setTimezone(tz);
    }
  });

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
