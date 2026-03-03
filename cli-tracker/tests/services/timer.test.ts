import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { startTimer, stopTimer, getStatus, continueTimer } from "../../src/services/timer.js";
import { closeDb } from "../../src/db/connection.js";

describe("Timer Service", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "cli-tracker-test-"));
    process.env["CLI_TRACKER_DB_PATH"] = join(tmpDir, "test.db");
    closeDb(); // Force new connection with new DB path
  });

  afterEach(() => {
    closeDb();
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should start a timer", () => {
    const result = startTimer("Test task");
    expect(result.entry.description).toBe("Test task");
    expect(result.entry.end_time).toBeNull();
    expect(result.stoppedEntry).toBeUndefined();
  });

  it("should stop a running timer", () => {
    startTimer("Test task");
    const stopped = stopTimer();
    expect(stopped).not.toBeNull();
    expect(stopped!.description).toBe("Test task");
    expect(stopped!.end_time).not.toBeNull();
    expect(stopped!.duration_sec).toBeGreaterThanOrEqual(0);
  });

  it("should return null when stopping with no running timer", () => {
    const result = stopTimer();
    expect(result).toBeNull();
  });

  it("should show status of running timer", () => {
    startTimer("Status test");
    const status = getStatus();
    expect(status).not.toBeNull();
    expect(status!.description).toBe("Status test");
  });

  it("should auto-stop previous timer when starting new one", () => {
    startTimer("First task");
    const result = startTimer("Second task");
    expect(result.stoppedEntry).toBeDefined();
    expect(result.stoppedEntry!.description).toBe("First task");
    expect(result.entry.description).toBe("Second task");
  });

  it("should start timer with project", () => {
    const result = startTimer("Task with project", "myproject");
    expect(result.entry.project_name).toBe("myproject");
    expect(result.entry.project_id).not.toBeNull();
  });
});
