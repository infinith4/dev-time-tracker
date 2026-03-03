import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

function getDataDir(): string {
  const xdgData = process.env["XDG_DATA_HOME"];
  const base = xdgData || join(homedir(), ".cli-tracker");
  if (!existsSync(base)) {
    mkdirSync(base, { recursive: true });
  }
  return base;
}

export function getDbPath(): string {
  if (process.env["CLI_TRACKER_DB_PATH"]) {
    return process.env["CLI_TRACKER_DB_PATH"];
  }
  return join(getDataDir(), "data.db");
}
