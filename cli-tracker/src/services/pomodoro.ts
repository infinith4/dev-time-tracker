import { startTimer, stopTimer } from "./timer.js";

interface PomodoroOptions {
  description: string;
  projectName?: string;
  tags?: string[];
  workMin: number;
  breakMin: number;
  rounds: number;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function renderBar(elapsed: number, total: number, width: number = 20): string {
  const filled = Math.round((elapsed / total) * width);
  const empty = width - filled;
  return "\u2588".repeat(filled) + "\u2591".repeat(empty);
}

function clearLine(): void {
  process.stdout.write("\x1b[2K\x1b[1G");
}

function moveCursorUp(lines: number): void {
  if (lines > 0) {
    process.stdout.write(`\x1b[${lines}A`);
  }
}

function countdown(
  label: string,
  totalSeconds: number,
  signal: AbortSignal,
): Promise<boolean> {
  return new Promise((resolve) => {
    let remaining = totalSeconds;

    const render = () => {
      const elapsed = totalSeconds - remaining;
      const bar = renderBar(elapsed, totalSeconds);
      moveCursorUp(1);
      clearLine();
      process.stdout.write(`   ${bar} ${formatCountdown(remaining)} remaining\n`);
    };

    // Initial render
    process.stdout.write(`${label}\n`);
    process.stdout.write("\n");
    render();

    const interval = setInterval(() => {
      if (signal.aborted) {
        clearInterval(interval);
        resolve(false);
        return;
      }

      remaining--;
      render();

      if (remaining <= 0) {
        clearInterval(interval);
        resolve(true);
      }
    }, 1000);

    signal.addEventListener("abort", () => {
      clearInterval(interval);
      resolve(false);
    }, { once: true });
  });
}

export async function runPomodoro(options: PomodoroOptions): Promise<void> {
  const { description, projectName, tags, workMin, breakMin, rounds } = options;
  const controller = new AbortController();

  const cleanup = () => {
    controller.abort();
  };

  process.on("SIGINT", cleanup);

  console.log(`\nPomodoro: ${rounds} rounds (${workMin}m work / ${breakMin}m break)\n`);

  for (let round = 1; round <= rounds; round++) {
    if (controller.signal.aborted) break;

    // Work phase
    startTimer(description, projectName, tags);
    const workLabel = `\x1b[31m\u25cf\x1b[0m  Pomodoro ${round}/${rounds} \u2014 Working: ${description}${projectName ? `@${projectName}` : ""}`;
    const workCompleted = await countdown(workLabel, workMin * 60, controller.signal);

    // Stop the work entry
    const stopped = stopTimer();
    if (stopped) {
      console.log(`   Done: ${stopped.duration_sec ? Math.floor(stopped.duration_sec / 60) : 0}min recorded\n`);
    }

    if (!workCompleted) {
      console.log("\nPomodoro interrupted. Current entry saved.\n");
      break;
    }

    // Break phase (skip after last round)
    if (round < rounds) {
      const breakLabel = `\x1b[36m\u25cb\x1b[0m  Break ${round}/${rounds}`;
      const breakCompleted = await countdown(breakLabel, breakMin * 60, controller.signal);
      if (!breakCompleted) {
        console.log("\nPomodoro interrupted during break.\n");
        break;
      }
      console.log("");
    }
  }

  if (!controller.signal.aborted) {
    console.log("\x1b[32mAll rounds completed!\x1b[0m\n");
  }

  process.removeListener("SIGINT", cleanup);
}
