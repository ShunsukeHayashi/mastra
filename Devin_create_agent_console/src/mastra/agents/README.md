# DX提案書生成エージェント

企業URLを入力するだけで、AIによるデジタルトランスフォーメーション（DX）提案書を自動生成するMastraエージェントです。

## 概要

DX提案書生成エージェント（`dxProposalAgent.ts`）は、企業のWebサイトURLから情報を抽出し、業界特性や企業規模に応じた最適なDX戦略を提案します。経営層向けの提案書形式で出力され、エグゼクティブサマリー、ビジネス課題、DX機会、実装ロードマップ、投資概要などを含みます。

## 機能

- **企業情報抽出**: SerpAPIを使用して企業URLから会社情報を自動収集
- **DX機会分析**: 業界特性に基づいたDX機会の特定と評価
- **提案書生成**: 構造化されたDX提案書の自動作成
- **日本語最適化**: 日本企業向けに最適化された検索と出力

## 使用方法

### エージェントの直接使用

```typescript
import { dxProposalAgent } from '../agents/dxProposalAgent';

// DX提案書を生成
const result = await dxProposalAgent.generate({
  messages: [
    {
      role: 'user',
      content: '企業URL: https://www.example.co.jp について、DX提案書を作成してください。'
    }
  ]
});

console.log(result.content);
```

### ワークフローを通じた使用

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

## エージェント構成

`dxProposalAgent.ts`は以下のコンポーネントで構成されています：

1. **エージェント定義**: Claude 3.5 Sonnetモデルを使用したエージェント
2. **指示**: 日本語での詳細な指示セット
3. **ツール**: 企業情報抽出とDX機会分析のためのツール

```typescript
export const dxProposalAgent = new Agent({
  name: 'DX Proposal Agent',
  instructions: `
    あなたは企業向けのデジタルトランスフォーメーション（DX）提案書を作成する専門家アシスタントです。
    ...
  `,
  model: anthropic('claude-3-5-sonnet-20241022'),
  tools: { 
    extractCompanyInfoTool,
    analyzeDXOpportunitiesTool
  },
});
```

## ツール

エージェントは以下のツールを使用します：

1. **extractCompanyInfoTool**: 企業URLから会社情報を抽出
2. **analyzeDXOpportunitiesTool**: 企業情報を分析してDX機会を特定

## 出力形式

エージェントは以下の構造で提案書を出力します：

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
