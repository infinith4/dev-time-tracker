import type { Command } from "commander";
import { startTui } from "../services/tui.js";

export function registerUi(program: Command): void {
  program
    .command("ui")
    .description("Interactive TUI dashboard with real-time updates")
    .action(() => {
      startTui();
    });
}
