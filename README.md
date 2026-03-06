# CLI Timer App Development Plan

## 1. Project Overview

A CLI application for time tracking and management.
Records and aggregates work time per task, and generates reports by project.

### 1.1. Concept

- **Simple**: Start tracking instantly with `trc start "task name"`
- **Fast**: Native CLI with quick startup
- **Clear**: Display optimized for the terminal

---

## 2. Feature List

| # | Feature | Command Example | Description |
|---|---------|----------------|-------------|
| F1 | Start Timer | `trc start "code review"` | Start a new timer |
| F2 | Stop Timer | `trc stop` | Stop the running timer |
| F3 | Check Status | `trc status` | Show current timer state and elapsed time |
| F4 | List Entries | `trc list` | List today's entries |
| F5 | Report | `trc report` | Aggregated report by day/week/month |
| F6 | Project | `trc start "task@myproject"` | Record with project association (`@` notation) |
| F7 | Continue | `trc continue` | Resume the last timer with the same settings |
| F8 | Delete Entry | `trc delete <id>` | Delete an entry |
| F9 | Edit Entry | `trc edit <id> --desc "new desc"` | Edit an entry (duration auto-recalculated) |
| F10 | Tags | `trc start -t bug,frontend "fix"` | Classify with tags |
| F11 | Project Mgmt | `trc project list` | Project CRUD operations |
| F12 | Export | `trc export --format csv` | Export as CSV/YAML |
| F13 | Import | `trc import backup.csv` | Restore data from CSV/YAML |
| F14 | Add Entry | `trc add "meeting" --start "09:00" --hm 1h30m` | Manually add a past entry (`--hm` supported) |
| F15 | Recalculate | `trc recalc` | Bulk recalculate duration for all entries |
| F16 | Pomodoro | `trc pomo "coding@project"` | 25min work + 5min break cycle |
| F17 | Goal Setting | `trc goal set --daily 8h` | Daily/weekly/monthly goals with progress |
| F18 | Interactive TUI | `trc ui` | Real-time dashboard in TUI |

---

## 3. Command Reference

```
trc <command> [options]
```

### Global Options

| Option | Description |
|--------|-------------|
| `--timezone <tz>` | Set display timezone (e.g. `Asia/Tokyo`) |
| `-V, --version` | Show version |
| `-h, --help` | Show help |

### Timer

| Command | Options | Description |
|---------|---------|-------------|
| `trc start [description]` | `-p, --project <name>` Specify project | Start a timer |
| | `-t, --tags <tags>` Comma-separated tags | `description@project` shorthand supported |
| `trc stop` | | Stop the running timer |
| `trc status` | | Show current timer state and elapsed time |
| `trc continue` | | Resume the last timer with the same settings |

### Entry Management

| Command | Options | Description |
|---------|---------|-------------|
| `trc list` | `-d, --date <YYYY-MM-DD>` Specify date | List entries (default: today) |
| | `-p, --project <name>` Filter by project | |
| `trc add [description]` | `--start <datetime>` Start time (required) | Add a completed entry |
| | `--end <datetime>` End time | Either `--end` or `--hm` is required |
| | `--hm <duration>` Duration (e.g. `1h30m`) | `description@project` shorthand supported |
| | `-p, --project <name>` / `-t, --tags <tags>` | |
| | `--no-split` Skip splitting overlapping entries | |
| `trc edit <id>` | `--desc <description>` Change description | Edit an entry (duration auto-recalculated) |
| | `--start <datetime>` / `--end <datetime>` | |
| | `-p, --project <name>` | |
| `trc delete <id>` | | Delete an entry |
| `trc recalc` | | Bulk recalculate duration for all entries |

### Project

| Command | Description |
|---------|-------------|
| `trc project list` | List all projects |
| `trc project add <name>` | Add a project |
| `trc project rename <old> <new>` | Rename a project |
| `trc project remove <name>` | Remove a project |

### Report

| Command | Options | Description |
|---------|---------|-------------|
| `trc report` | `--period <day\|week\|month>` Period (default: `week`) | Show aggregated report |
| | `-p, --project <name>` Filter by project | |

### Export / Import

| Command | Options | Description |
|---------|---------|-------------|
| `trc export` | `--format <csv\|yaml>` Format (default: `csv`) | Export data |
| `trc import <file>` | `--format <csv\|yaml>` Format (auto-detected from extension) | Import data |

### Goal

| Command | Options | Description |
|---------|---------|-------------|
| `trc goal` | | Show goal progress |
| `trc goal set` | `--daily <duration>` Daily goal (e.g. `8h`) | Set goal time |
| | `--weekly <duration>` Weekly goal (e.g. `40h`) | |
| | `--monthly <duration>` Monthly goal (e.g. `160h`) | |
| `trc goal clear` | | Clear all goals |

### Pomodoro

| Command | Options | Description |
|---------|---------|-------------|
| `trc pomodoro [description]` | `--work <minutes>` Work duration (default: `25`) | Start a Pomodoro timer |
| (alias: `trc pomo`) | `--break <minutes>` Break duration (default: `5`) | `description@project` shorthand supported |
| | `--rounds <count>` Number of rounds (default: `4`) | |
| | `-p, --project <name>` / `-t, --tags <tags>` | |

### Interactive TUI

| Command | Description |
|---------|-------------|
| `trc ui` | Launch real-time dashboard (`q`: Quit, `s`: Start/Stop, `r`: Refresh) |

---

## 4. Output Examples

### 4.1. `trc status`

```
⏱  Running: code review
   Project: myproject
   Started: 14:30:00
   Elapsed: 1h 23m 45s
```

### 4.2. `trc list`

```
Today's Entries (2026-03-02)
┌────┬──────────┬──────────┬───────────┬──────────┬──────────┐
│ ID │ Project  │ Desc     │ Start     │ End      │ Duration │
├────┼──────────┼──────────┼───────────┼──────────┼──────────┤
│  1 │ backend  │ API impl │ 09:00     │ 11:30    │ 2h 30m   │
│  2 │ frontend │ UI fix   │ 13:00     │ 14:15    │ 1h 15m   │
│  3 │ backend  │ review   │ 14:30     │ running  │ 1h 23m   │
├────┼──────────┼──────────┼───────────┼──────────┼──────────┤
│    │          │          │           │ Total    │ 5h 08m   │
└────┴──────────┴──────────┴───────────┴──────────┴──────────┘
```

### 4.3. `trc report --period week`

```
Weekly Report (2026-02-23 ~ 2026-03-01)
Total: 38h 45m

By Project:
  backend   ████████████████░░░░  22h 30m (58%)
  frontend  ████████░░░░░░░░░░░░  12h 15m (32%)
  docs      ████░░░░░░░░░░░░░░░░   4h 00m (10%)

By Day:
  Mon  ████████  8h 15m
  Tue  ███████░  7h 30m
  Wed  ████████  8h 00m
  Thu  ███████░  7h 45m
  Fri  ███████░  7h 15m
  Sat  ░░░░░░░░  0h 00m
  Sun  ░░░░░░░░  0h 00m
```

### 4.4. `trc goal`

```
Goal Progress

  Daily     ████████░░░░░░░░░░░░  6h 12m / 8h 00m (77%)
  Weekly    ██████████████░░░░░░ 28h 30m / 40h 00m (71%)
```

### 4.5. `trc pomodoro "coding@my-project"`

```
Pomodoro: 4 rounds (25m work / 5m break)

●  Pomodoro 1/4 — Working: coding@my-project
   ██████████░░░░░░░░░░ 12:34 remaining
```

### 4.6. `trc ui`

```
╔══════════════════════════════════════════════╗
║  trc — Time Tracker           2026-03-03    ║
╠══════════════════════════════════════════════╣
║                                              ║
║  ▶ Running: coding feature X                 ║
║    Project: my-project                       ║
║    Elapsed: 1h 23m 45s                       ║
║                                              ║
╠══════════════════════════════════════════════╣
║  Today: 6h 12m                               ║
║                                              ║
║  my-project    ████████████░░░░ 4h 30m       ║
║  client-work   ████░░░░░░░░░░░░ 1h 42m       ║
║                                              ║
╠══════════════════════════════════════════════╣
║  Goal: ████████░░░░ 6h 12m / 8h (77%)       ║
╠══════════════════════════════════════════════╣
║  Recent Entries                              ║
║  #12 standup meeting     09:00-09:15  15m    ║
║  #13 coding feature X    09:30-       1h 23m ║
╠══════════════════════════════════════════════╣
║  [q] Quit  [s] Start/Stop  [r] Refresh       ║
╚══════════════════════════════════════════════╝
```

---

## 5. Development Commands

```bash
# Setup
cd cli-tracker
npm install

# Development
npm run dev -- start "test"      # Run directly with ts-node

# Build
npm run build                    # Bundle with tsup

# Test
npm test                         # Run Vitest
npm run test:coverage            # With coverage

# Lint
npm run lint                     # ESLint
npm run format                   # Prettier

# Local Install
npm run build                    # Build first
npm link                         # Register `trc` command globally

# PATH setup (if npm global bin is not in PATH)
echo 'export TRC_TIMEZONE=Asia/Tokyo' >> ~/.bashrc
echo 'export PATH="$PATH:$(npm prefix -g)/bin"' >> ~/.bashrc
source ~/.bashrc
```

---

## 6. Timezone Configuration

You can change the display timezone using IANA timezone names (e.g. `Asia/Tokyo`, `America/New_York`).

### Option 1: Command-line option

```bash
trc --timezone Asia/Tokyo list
trc --timezone America/New_York report --period week
```

### Option 2: Environment variable (persistent)

```bash
# Add to .bashrc / .zshrc
export TRC_TIMEZONE=Asia/Tokyo
```

Once set, all times are displayed in the specified timezone without the `--timezone` flag.

```bash
trc list    # Displayed in Asia/Tokyo
```

### Priority

1. `--timezone` option (highest priority)
2. `TRC_TIMEZONE` environment variable
3. System local time (default)

---

## 7. Installation

```bash
npm install -g @infinith4/cli-tracker
```

---

## 8. Non-Functional Requirements

| Item | Requirement |
|------|-------------|
| Startup Speed | Command execution within 200ms |
| Data Capacity | Smooth operation with 1 year of data (~100K entries) |
| Supported OS | macOS, Linux, Windows |
| Node.js | v18 or later |
| Data Location | `~/.cli-tracker/data.db` (XDG_DATA_HOME supported) |
| Offline | Fully local operation, no network required |
