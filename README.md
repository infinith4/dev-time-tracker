# CLI タイマーアプリ 開発プラン

## 1. プロジェクト概要

時間計測・管理機能を CLI で実行できるアプリケーション。
タスクごとの作業時間を記録・集計し、プロジェクト単位でのレポートを生成する。

### 1.1. コンセプト

- **シンプル**: `trc start "タスク名"` で即座に計測開始
- **高速**: CLI ネイティブで起動が速い
- **見やすい**: ターミナルに最適化された表示

---

## 2. 機能一覧

| # | 機能 | コマンド例 | 説明 |
|---|------|-----------|------|
| F1 | タイマー開始 | `trc start "レビュー作業"` | 新しいタイマーを開始 |
| F2 | タイマー停止 | `trc stop` | 実行中のタイマーを停止 |
| F3 | ステータス確認 | `trc status` | 現在のタイマー状態と経過時間を表示 |
| F4 | タイマー一覧 | `trc list` | 今日の記録を一覧表示 |
| F5 | レポート表示 | `trc report` | 日/週/月単位の集計レポート |
| F6 | プロジェクト指定 | `trc start "タスク@myproject"` | プロジェクトに紐づけて記録（`@`記法対応） |
| F7 | 直前の再開 | `trc continue` | 直前のタイマーと同じ内容で再開 |
| F8 | エントリ削除 | `trc delete <id>` | 記録を削除 |
| F9 | エントリ編集 | `trc edit <id> --desc "新しい説明"` | 記録を修正（duration自動再計算） |
| F10 | タグ付け | `trc start -t bug,frontend "修正"` | タグで分類 |
| F11 | プロジェクト管理 | `trc project list` | プロジェクトの CRUD |
| F12 | エクスポート | `trc export --format csv` | CSV/YAML で出力 |
| F13 | インポート | `trc import backup.csv` | CSV/YAML からデータ復元 |
| F14 | エントリ追加 | `trc add "会議" --start "09:00" --hm 1h30m` | 過去のエントリを手動追加（`--hm`対応） |
| F15 | Duration再計算 | `trc recalc` | 全エントリのdurationを一括再計算 |
| F16 | ポモドーロモード | `trc pomo "coding@project"` | 25分作業 + 5分休憩のサイクル |
| F17 | 目標設定 | `trc goal set --daily 8h` | 日次/週次/月次の目標時間と達成率表示 |
| F18 | インタラクティブUI | `trc ui` | TUI でリアルタイムダッシュボード表示 |

---

## 3. コマンド体系

```
trc <command> [options]
```

### Global Options

| オプション | 説明 |
|-----------|------|
| `--timezone <tz>` | 表示のタイムゾーンを指定 (e.g. `Asia/Tokyo`) |
| `-V, --version` | バージョンを表示 |
| `-h, --help` | ヘルプを表示 |

### Timer

| コマンド | オプション | 説明 |
|---------|-----------|------|
| `trc start [description]` | `-p, --project <name>` プロジェクト指定 | タイマーを開始する |
| | `-t, --tags <tags>` タグをカンマ区切り指定 | `description@project` 記法も使用可 |
| `trc stop` | | 実行中のタイマーを停止する |
| `trc status` | | 現在のタイマー状態と経過時間を表示する |
| `trc continue` | | 直前のタイマーと同じ内容で再開する |

### Entry Management

| コマンド | オプション | 説明 |
|---------|-----------|------|
| `trc list` | `-d, --date <YYYY-MM-DD>` 日付指定 | 記録を一覧表示する（デフォルト: 今日） |
| | `-p, --project <name>` プロジェクト絞り込み | |
| `trc add [description]` | `--start <datetime>` 開始時刻 (必須) | 完了済みエントリを追加する |
| | `--end <datetime>` 終了時刻 | `--end` か `--hm` のどちらかが必須 |
| | `--hm <duration>` 所要時間 (e.g. `1h30m`) | `description@project` 記法も使用可 |
| | `-p, --project <name>` / `-t, --tags <tags>` | |
| `trc edit <id>` | `--desc <description>` 説明を変更 | 記録を修正する（duration自動再計算） |
| | `--start <datetime>` / `--end <datetime>` | |
| | `-p, --project <name>` | |
| `trc delete <id>` | | 記録を削除する |
| `trc recalc` | | 全エントリのdurationを一括再計算する |

### Project

| コマンド | 説明 |
|---------|------|
| `trc project list` | プロジェクト一覧を表示 |
| `trc project add <name>` | プロジェクトを追加 |
| `trc project rename <old> <new>` | プロジェクト名を変更 |
| `trc project remove <name>` | プロジェクトを削除 |

### Report

| コマンド | オプション | 説明 |
|---------|-----------|------|
| `trc report` | `--period <day\|week\|month>` 集計期間（デフォルト: `week`） | 集計レポートを表示する |
| | `-p, --project <name>` プロジェクト絞り込み | |

### Export / Import

| コマンド | オプション | 説明 |
|---------|-----------|------|
| `trc export` | `--format <csv\|yaml>` 出力形式（デフォルト: `csv`） | データをエクスポートする |
| `trc import <file>` | `--format <csv\|yaml>` 形式指定（拡張子から自動判定） | データをインポートする |

### Goal

| コマンド | オプション | 説明 |
|---------|-----------|------|
| `trc goal` | | 目標の達成状況を表示する |
| `trc goal set` | `--daily <duration>` 日次目標 (e.g. `8h`) | 目標時間を設定する |
| | `--weekly <duration>` 週次目標 (e.g. `40h`) | |
| | `--monthly <duration>` 月次目標 (e.g. `160h`) | |
| `trc goal clear` | | 目標をクリアする |

### Pomodoro

| コマンド | オプション | 説明 |
|---------|-----------|------|
| `trc pomodoro [description]` | `--work <minutes>` 作業時間（デフォルト: `25`） | ポモドーロタイマーを開始する |
| (alias: `trc pomo`) | `--break <minutes>` 休憩時間（デフォルト: `5`） | `description@project` 記法も使用可 |
| | `--rounds <count>` ラウンド数（デフォルト: `4`） | |
| | `-p, --project <name>` / `-t, --tags <tags>` | |

### Interactive TUI

| コマンド | 説明 |
|---------|------|
| `trc ui` | リアルタイムダッシュボードを起動（`q`: 終了, `s`: Start/Stop, `r`: 更新） |

---

## 4. 出力イメージ

### 4.1. `trc status`

```
⏱  Running: レビュー作業
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
│  1 │ backend  │ API実装   │ 09:00     │ 11:30    │ 2h 30m   │
│  2 │ frontend │ UI修正    │ 13:00     │ 14:15    │ 1h 15m   │
│  3 │ backend  │ レビュー  │ 14:30     │ running  │ 1h 23m   │
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


## 5. 開発コマンド

```bash
# セットアップ
cd cli-tracker
npm install

# 開発
npm run dev -- start "テスト"    # ts-node で直接実行

# ビルド
npm run build                    # tsup でバンドル

# テスト
npm test                         # Vitest 実行
npm run test:coverage            # カバレッジ付き

# リント
npm run lint                     # ESLint
npm run format                   # Prettier

# ローカルインストール
npm run build                    # 先にビルド
npm link                         # グローバルに `trc` コマンドを登録

# PATH 設定（npm global bin が PATH に含まれていない場合）
echo 'TRC_TIMEZONE=Asia/Tokyo"' >> ~/.bashrc
echo 'export PATH="$PATH:$(npm prefix -g)/bin"' >> ~/.bashrc
source ~/.bashrc
```

---

## 6. タイムゾーン設定

日時の表示をタイムゾーン指定で変更できます。IANA タイムゾーン名（例: `Asia/Tokyo`, `America/New_York`）を使用します。

### 方法1: コマンドオプションで指定

```bash
trc --timezone Asia/Tokyo list
trc --timezone America/New_York report --period week
```

### 方法2: 環境変数で常時適用

```bash
# .bashrc / .zshrc に追加
export TRC_TIMEZONE=Asia/Tokyo
```

設定後は `--timezone` オプションなしでも JST で表示されます。

```bash
trc list    # Asia/Tokyo で表示
```

### 優先順位

1. `--timezone` オプション（最優先）
2. `TRC_TIMEZONE` 環境変数
3. システムのローカルタイム（デフォルト）

---

## 7. インストール

```bash
npm install -g @infinith4/cli-tracker
```

---

## 8. 非機能要件

| 項目 | 要件 |
|------|------|
| 起動速度 | 200ms 以内にコマンド実行完了 |
| データ容量 | 1年分の記録（約10万エントリ）でも快適動作 |
| 対応 OS | macOS, Linux, Windows |
| Node.js | v18 以上 |
| データ保存先 | `~/.cli-tracker/data.db`（XDG_DATA_HOME 対応） |
| オフライン | 完全ローカル動作、ネットワーク不要 |
