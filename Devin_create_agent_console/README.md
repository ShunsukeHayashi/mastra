# DX提案書生成エージェント

企業URLを入力するだけで、AIによるデジタルトランスフォーメーション（DX）提案書を自動生成するMastraエージェントです。

![DX提案書ジェネレーター](https://i.imgur.com/example.png)

## 概要

DX提案書生成エージェントは、企業のWebサイトURLから情報を抽出し、業界特性や企業規模に応じた最適なDX戦略を提案します。経営層向けの提案書形式で出力され、エグゼクティブサマリー、ビジネス課題、DX機会、実装ロードマップ、投資概要などを含みます。

## 機能

- **企業情報抽出**: SerpAPIを使用して企業URLから会社情報を自動収集
- **DX機会分析**: 業界特性に基づいたDX機会の特定と評価
- **提案書生成**: 構造化されたDX提案書の自動作成
- **日本語最適化**: 日本企業向けに最適化された検索と出力

## インストール

```bash
# リポジトリのクローン
git clone https://github.com/ShunsukeHayashi/mastra.git
cd mastra/Devin_create_agent_console

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してSERP_API_KEYを設定
```

## 使用方法

### APIサーバーの起動

```bash
cd src/gradio
python api_server.py
```

APIサーバーはデフォルトでポート4111で起動します。

### Gradioインターフェースの起動

```bash
cd src/gradio
python dx_proposal_demo.py
```

Gradioインターフェースにアクセスして、企業URLを入力するだけでDX提案書を生成できます。

### APIの使用例

```typescript
import { dxProposalWorkflow } from '../workflows/dxProposalWorkflow';

// DX提案書を生成
const result = await dxProposalWorkflow.run({
  companyUrl: 'https://www.example.co.jp',
  focusAreas: ['業務効率化', '顧客体験向上'],
  budget: '1000万円〜5000万円',
  timeline: '6ヶ月〜1年',
});

console.log(result.proposal);
```

## REST APIエンドポイント

### 提案書生成リクエスト

```
POST /api/dx-proposal
```

リクエスト例:
```json
{
  "companyUrl": "https://www.toyota.co.jp",
  "focusAreas": ["業務効率化", "顧客体験向上", "新規事業創出"],
  "budget": "1000万円〜5000万円",
  "timeline": "6ヶ月〜1年"
}
```

レスポンス例:
```json
{
  "success": true,
  "message": "DX提案書の生成を開始しました",
  "workflowId": "dx-proposal-1743085518",
  "estimatedCompletionTime": "2-3分程度"
}
```

### 提案書取得リクエスト

```
GET /api/dx-proposal/:workflowId
```

レスポンス例:
```json
{
  "success": true,
  "status": "completed",
  "result": {
    "proposal": {
      "companyInfo": { ... },
      "executiveSummary": "...",
      "businessChallenges": [ ... ],
      "opportunities": [ ... ],
      "implementationRoadmap": [ ... ],
      "investmentSummary": { ... },
      "conclusion": "..."
    },
    "presentationPoints": [ ... ]
  },
  "completedAt": "2025-03-27T14:25:35.000Z"
}
```

## プロジェクト構造

```
src/
├── gradio/                 # Gradioインターフェース
│   ├── api_server.py       # APIサーバー
│   └── dx_proposal_demo.py # Gradioデモ
├── mastra/
│   ├── agents/             # エージェント定義
│   │   └── dxProposalAgent.ts
│   ├── api/                # APIエンドポイント
│   │   ├── dxProposalApi.ts
│   │   └── index.mjs
│   ├── tools/              # ツール定義
│   │   ├── companyResearchTools.ts
│   │   └── serpApiTool.ts
│   ├── utils/              # ユーティリティ
│   │   └── companyResearch.ts
│   └── workflows/          # ワークフロー定義
│       └── dxProposalWorkflow.ts
└── docs/                   # ドキュメント
    └── DX_PROPOSAL_AGENT.md
```

## 環境変数

- `SERP_API_KEY`: SerpAPIのAPIキー（必須）
- `PORT`: APIサーバーのポート番号（デフォルト: 4111）

## 拡張予定の機能

- PDF出力機能
- Slack連携
- 業界別テンプレート
- 競合分析セクション

## ライセンス

Copyright (c) 2025 Shunsuke Hayashi
