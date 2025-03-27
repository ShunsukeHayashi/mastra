# DX提案書生成エージェント

企業URLを入力するだけで、AIによるデジタルトランスフォーメーション（DX）提案書を自動生成するMastraエージェントです。

## 概要

DX提案書生成エージェントは、企業のWebサイトURLから情報を抽出し、業界特性や企業規模に応じた最適なDX戦略を提案します。経営層向けの提案書形式で出力され、エグゼクティブサマリー、ビジネス課題、DX機会、実装ロードマップ、投資概要などを含みます。

## 主な機能

- **企業情報抽出**: SerpAPIを使用して企業URLから会社情報を自動収集
- **DX機会分析**: 業界特性に基づいたDX機会の特定と評価
- **提案書生成**: 構造化されたDX提案書の自動作成
- **日本語最適化**: 日本企業向けに最適化された検索と出力

## アーキテクチャ

```
User Input（URL）
   ↓
extractCompanyInfoTool（SerpAPI）
   ↓
analyzeDXOpportunitiesTool
   ↓
generateProposalSections
   ↓
assembleDXProposal
   ↓
API/Gradio出力
```

## 使用方法

### APIを使用する場合

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

### REST APIエンドポイント

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

提案書の取得:
```
GET /api/dx-proposal/:workflowId
```

### Gradioインターフェース

Gradioインターフェースを使用すると、ブラウザから簡単にDX提案書を生成できます。

```bash
cd src/gradio
python dx_proposal_demo.py
```

## 設定

### 環境変数

- `SERP_API_KEY`: SerpAPIのAPIキー（必須）
- `PORT`: APIサーバーのポート番号（デフォルト: 4111）

## 拡張予定の機能

- PDF出力機能
- Slack連携
- 業界別テンプレート
- 競合分析セクション

## 依存関係

- Mastra Framework
- SerpAPI
- Anthropic Claude API
- Express/Flask (APIサーバー)
- Gradio (UIインターフェース)

## ライセンス

Copyright (c) 2025 Shunsuke Hayashi
