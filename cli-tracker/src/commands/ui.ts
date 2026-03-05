import type { Command } from "commander";
import { startTui } from "../services/tui.js";

export function registerUi(program: Command): void {
  program
    .command("ui")
    .description("Interactive TUI dashboard with real-time updates")
    .option("--interval <seconds>", "Refresh interval in seconds", "10")
    .addHelpText(
      "after",
      `
Keyboard shortcuts:
  q   Quit
  s   Start/Stop timer (toggles between stop and continue)
  r   Force refresh

Set default via environment variable:
  export TRC_UI_INTERVAL=5     (add to ~/.bashrc for persistence)

Examples:
  $ trc ui                  Default (10s refresh)
  $ trc ui --interval 5     Refresh every 5 seconds
  $ trc ui --interval 0.5   Refresh every 500ms`,
    )
    .action((opts: { interval: string }) => {
      const envInterval = process.env["TRC_UI_INTERVAL"];
      const raw = opts.interval !== "10" ? opts.interval : envInterval || opts.interval;
      const sec = parseFloat(raw);
      startTui(sec > 0 ? sec : 1);
    });
}
