# AI駆動開発 (AI-Driven Development)

GitHub Copilot、OpenAI Codex、Claude Codeを活用したAI駆動開発環境です。

## 概要

このプロジェクトは、3つの主要なAIコーディングアシスタントで共通して使用できる開発環境を提供します：

- **GitHub Copilot** - VS Code/JetBrains統合
- **OpenAI Codex** - CLI/API統合
- **Claude Code** - CLI統合

## クイックスタート

### 1. 環境セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/your-org/dev-timer.git
cd dev-timer

# VS Codeで開く（推奨拡張機能がインストールされます）
code .
```

### 2. プロジェクト構成

```
.
├── .claude/          # Claude Code設定
│   └── skills/       # エージェントスキル
├── .codex/           # Codex設定
│   └── agents/       # エージェント定義
├── .copilot/         # GitHub Copilot設定
│   └── prompts/      # プロンプトテンプレート
├── .vscode/          # VS Code設定
├── .agent/           # ExecPlans（実行計画）
├── AGENTS.md         # エージェント定義
├── CLAUDE.md         # Claude Code指示
├── frontend/         # React/TypeScriptフロントエンド
├── backendapp/       # Python/FastAPIバックエンド
├── csharp-backend/   # C#/.NET Web API
├── batch-csharp/     # C#バッチ処理
└── java-backend/     # Java/Spring Bootバックエンド
```

## AIエージェント

4つのエージェントが定義されています（詳細は`AGENTS.md`参照）：

| エージェント | 役割 |
|-------------|------|
| 実装コーディング | 機能実装、クリーンコード |
| 単体テスト | テストケース設計・実装 |
| E2Eテスト | ユーザーシナリオテスト |
| コードレビュー | 品質・セキュリティチェック |

## 開発コマンド

### フロントエンド (TypeScript/React)
```bash
cd frontend
npm install
npm run dev      # 開発サーバー起動
npm run build    # ビルド
npm test         # テスト実行
```

### バックエンド (Python/FastAPI)
```bash
pip install -r backendapp/requirements.txt
uvicorn backendapp.main:app --reload
pytest tests/
```

### C# Backend/Batch
```bash
dotnet build
dotnet test csharp-backend.Tests/
dotnet test batch-csharp.Tests/
```

### Java Backend
```bash
cd java-backend
mvn compile
mvn test
```

## AIツール別設定

### Claude Code
- 設定ファイル: `CLAUDE.md`, `.claude/settings.local.json`
- スキル: `.claude/skills/`

### Codex
- 設定ファイル: `.codex/config.toml`, `.codex/INSTRUCTIONS.md`
- エージェント: `.codex/agents/`

### GitHub Copilot
- 設定ファイル: `.copilot/INSTRUCTIONS.md`, `.copilot/context.json`
- プロンプト: `.copilot/prompts/`

## ExecPlans

複雑な機能実装やリファクタリングでは、ExecPlan（実行計画）を使用します。
詳細は`.agent/PLANS.md`を参照してください。

## ライセンス

MIT License
