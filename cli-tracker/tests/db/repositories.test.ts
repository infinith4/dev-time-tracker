import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

describe("Entry Repository", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "cli-tracker-repo-test-"));
    process.env["CLI_TRACKER_DB_PATH"] = join(tmpDir, "test.db");
  });

  afterEach(async () => {
    const { closeDb } = await import("../../src/db/connection.js");
    closeDb();
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should create and retrieve an entry", async () => {
    const { closeDb } = await import("../../src/db/connection.js");
    closeDb();
    const { createEntry, getEntryById } = await import(
      "../../src/db/repositories/entry.js"
    );

    const id = createEntry("Test entry", new Date().toISOString());
    const entry = getEntryById(id);
    expect(entry).toBeDefined();
    expect(entry!.description).toBe("Test entry");
    expect(entry!.end_time).toBeNull();
  });

  it("should stop an entry", async () => {
    const { closeDb } = await import("../../src/db/connection.js");
    closeDb();
    const { createEntry, stopEntry, getEntryById } = await import(
      "../../src/db/repositories/entry.js"
    );

    const id = createEntry("Stop test", new Date().toISOString());
    const endTime = new Date().toISOString();
    stopEntry(id, endTime, 120);
    const entry = getEntryById(id);
    expect(entry!.end_time).toBe(endTime);
    expect(entry!.duration_sec).toBe(120);
  });

  it("should delete an entry", async () => {
    const { closeDb } = await import("../../src/db/connection.js");
    closeDb();
    const { createEntry, deleteEntry, getEntryById } = await import(
      "../../src/db/repositories/entry.js"
    );

    const id = createEntry("Delete test", new Date().toISOString());
    const deleted = deleteEntry(id);
    expect(deleted).toBe(true);
    expect(getEntryById(id)).toBeUndefined();
  });

  it("should set and get tags for entry", async () => {
    const { closeDb } = await import("../../src/db/connection.js");
    closeDb();
    const { createEntry, setTagsForEntry, getTagsForEntry } = await import(
      "../../src/db/repositories/entry.js"
    );

    const id = createEntry("Tag test", new Date().toISOString());
    setTagsForEntry(id, ["bug", "frontend"]);
    const tags = getTagsForEntry(id);
    expect(tags).toContain("bug");
    expect(tags).toContain("frontend");
    expect(tags.length).toBe(2);
  });
});

describe("Project Repository", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "cli-tracker-proj-test-"));
    process.env["CLI_TRACKER_DB_PATH"] = join(tmpDir, "test.db");
  });

  afterEach(async () => {
    const { closeDb } = await import("../../src/db/connection.js");
    closeDb();
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should create and find a project", async () => {
    const { closeDb } = await import("../../src/db/connection.js");
    closeDb();
    const { findOrCreateProject, findProjectByName } = await import(
      "../../src/db/repositories/project.js"
    );

    findOrCreateProject("testproject");
    const project = findProjectByName("testproject");
    expect(project).toBeDefined();
    expect(project!.name).toBe("testproject");
  });

  it("should not duplicate projects", async () => {
    const { closeDb } = await import("../../src/db/connection.js");
    closeDb();
    const { findOrCreateProject, getAllProjects } = await import(
      "../../src/db/repositories/project.js"
    );

    findOrCreateProject("dup-test");
    findOrCreateProject("dup-test");
    const all = getAllProjects();
    const matching = all.filter((p) => p.name === "dup-test");
    expect(matching.length).toBe(1);
  });

  it("should rename a project", async () => {
    const { closeDb } = await import("../../src/db/connection.js");
    closeDb();
    const { findOrCreateProject, renameProject, findProjectByName } = await import(
      "../../src/db/repositories/project.js"
    );

    findOrCreateProject("old-name");
    renameProject("old-name", "new-name");
    expect(findProjectByName("old-name")).toBeUndefined();
    expect(findProjectByName("new-name")).toBeDefined();
  });
});
