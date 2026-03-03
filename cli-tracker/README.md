# @infinith4/cli-tracker

A Toggl-like CLI time tracking tool. Track your work hours, manage projects, and generate reports — all from the terminal.

## Installation

```bash
npm install -g @infinith4/cli-tracker
```

Or use with npx:

```bash
npx @infinith4/cli-tracker <command>
```

## Quick Start

```bash
# Start tracking time
trc start "Working on feature X" -p my-project

# Check what's running
trc status

# Stop the timer
trc stop

# View today's entries
trc list
```

## Commands

### Timer

| Command | Description |
|---------|-------------|
| `trc start [description]` | Start a new timer |
| `trc stop` | Stop the running timer |
| `trc status` | Show the current running timer |
| `trc continue` | Restart the last stopped timer |

**Start options:**

```bash
trc start "Task description" -p <project> -t <tag1,tag2>
```

- `-p, --project <name>` — Assign a project (auto-created if it doesn't exist)
- `-t, --tags <tags>` — Comma-separated tags

> If a timer is already running, `start` will automatically stop it before starting a new one.

### Time Entries

#### List entries

```bash
# Today's entries (default)
trc list

# Entries for a specific date
trc list -d 2026-03-01

# Filter by project
trc list -p my-project
```

#### Add a completed entry

```bash
trc add "Meeting" --start "2026-03-03 09:00" --end "2026-03-03 10:30" -p my-project
```

- `--start <datetime>` — Start time (required, format: `YYYY-MM-DD HH:mm`)
- `--end <datetime>` — End time (required, format: `YYYY-MM-DD HH:mm`)
- `-p, --project <name>` — Project name
- `-t, --tags <tags>` — Comma-separated tags

#### Edit an entry

```bash
trc edit <id> --desc "Updated description" --start "2026-03-03 09:00" --end "2026-03-03 11:00" -p other-project
```

All options are optional — only the fields you provide will be updated. Duration is automatically recalculated when start or end time changes.

#### Delete an entry

```bash
trc delete <id>
```

### Projects

```bash
# List all projects
trc project list

# Add a new project
trc project add my-project

# Rename a project
trc project rename old-name new-name

# Remove a project
trc project remove my-project
```

### Reports

```bash
# Weekly report (default)
trc report

# Daily or monthly report
trc report --period day
trc report --period month

# Filter by project
trc report -p my-project
```

Reports include:
- Total tracked time for the period
- Breakdown by project (with percentages)
- Breakdown by day (with bar charts)

### Export

```bash
# Export as CSV (default)
trc export

# Export as YAML
trc export --format yaml

# Save to file
trc export > timesheet.csv
trc export --format yaml > timesheet.yaml
```

Exported fields: id, description, project, tags, start time, end time, and duration.

### Import

```bash
# Import from CSV
trc import timesheet.csv

# Import from YAML
trc import timesheet.yaml

# Explicitly specify format
trc import data.txt --format csv
```

The format is auto-detected from the file extension (`.csv`, `.yaml`, `.yml`). Use `--format` to override.

Import accepts the same format produced by `trc export`, enabling round-trip backup and restore:

```bash
# Backup
trc export > backup.csv

# Restore
trc import backup.csv
```

## Global Options

| Option | Description |
|--------|-------------|
| `--timezone <tz>` | Display times in a specific timezone (e.g., `Asia/Tokyo`) |
| `-V, --version` | Show version number |
| `-h, --help` | Show help |

You can also set the timezone via environment variable:

```bash
export TRC_TIMEZONE=Asia/Tokyo
```

## Data Storage

All data is stored locally in a SQLite database. The database location is resolved in this order:

1. `CLI_TRACKER_DB_PATH` environment variable
2. `$XDG_DATA_HOME/data.db`
3. `~/.cli-tracker/data.db` (default)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint
npm run lint

# Format
npm run format
```

## License

MIT
