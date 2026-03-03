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
import { closeDb } from "./db/connection.js";

const program = new Command();

program
  .name("trc")
  .description("Toggl-like CLI time tracking tool")
  .version("1.0.0");

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

program.hook("postAction", () => {
  closeDb();
});

program.parse();
