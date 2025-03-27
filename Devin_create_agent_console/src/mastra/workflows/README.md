# DX提案書生成ワークフロー

企業URLを入力するだけで、AIによるデジタルトランスフォーメーション（DX）提案書を自動生成するMastraワークフローです。

## 概要

DX提案書生成ワークフロー（`dxProposalWorkflow.ts`）は、企業のWebサイトURLから情報を抽出し、業界特性や企業規模に応じた最適なDX戦略を提案するワークフローです。複数のステップを通じて、企業情報の収集、DX機会の分析、提案書の生成を行います。

## ワークフロー構成

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
const result = await dxProposalWorkflow.execute({
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

## ワークフロー定義

`dxProposalWorkflow.ts`は以下のコンポーネントで構成されています：

1. **入力スキーマ**: Zodを使用した入力パラメータの検証
2. **ステップ定義**: 企業情報抽出、DX機会分析、提案書生成のステップ
3. **ワークフロー実行**: ステップの順次実行と結果の集約

```typescript
export const dxProposalWorkflow = new Workflow({
  steps: [
    extractCompanyInfoStep,
    analyzeDXOpportunitiesStep,
    generateProposalStep
  ],
  input: dxProposalInputSchema,
});
```

## 入力パラメータ

ワークフローは以下の入力パラメータを受け付けます：

```typescript
const dxProposalInputSchema = z.object({
  companyUrl: z.string().url('有効なURLを入力してください'),
  focusAreas: z.array(z.string()).optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});
```

## 出力形式

ワークフローは以下の構造で提案書を出力します：

```typescript
interface DXProposal {
  companyInfo: CompanyInfo;
  executiveSummary: string;
  businessChallenges: Array<{
    title: string;
    description: string;
    impact: string;
  }>;
  opportunities: Array<{
    title: string;
    description: string;
    benefits: string[];
    implementation: string;
    timeline: string;
    cost: string;
  }>;
  implementationRoadmap: Array<{
    phase: string;
    timeline: string;
    tasks: string[];
    milestones: string[];
    resources: string;
  }>;
  investmentSummary: {
    totalCost: string;
    breakdown: Record<string, string>;
    roi: string;
    paybackPeriod: string;
  };
  conclusion: string;
}
```

## 依存関係

- Mastra Framework
- SerpAPI
- Anthropic Claude API

## 環境変数

- `SERP_API_KEY`: SerpAPIのAPIキー（必須）

## 拡張予定の機能

- PDF出力機能
- Slack連携
- 業界別テンプレート
- 競合分析セクション
