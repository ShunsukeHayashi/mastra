# DX提案書生成ツール

企業URLを入力するだけで、AIによるデジタルトランスフォーメーション（DX）提案書を自動生成するためのMastraツールです。

## 概要

DX提案書生成ツール（`companyResearchTools.ts`）は、企業のWebサイトURLから情報を抽出し、業界特性や企業規模に応じた最適なDX戦略を提案するためのツールセットです。SerpAPIを使用して企業情報を収集し、AIを活用してDX機会を分析します。

## 主要ツール

### extractCompanyInfoTool

企業URLから会社情報を抽出するツールです。

```typescript
export const extractCompanyInfoTool = createTool({
  name: 'extractCompanyInfo',
  description: '企業URLから会社情報を抽出します',
  input: z.object({
    companyUrl: z.string().url('有効なURLを入力してください'),
  }),
  output: z.object({
    companyInfo: CompanyInfoSchema,
  }),
  execute: async ({ companyUrl }) => {
    const companyInfo = await extractCompanyInfo(companyUrl);
    return { companyInfo };
  },
});
```

### analyzeDXOpportunitiesTool

企業情報を分析してDX機会を特定するツールです。

```typescript
export const analyzeDXOpportunitiesTool = createTool({
  name: 'analyzeDXOpportunities',
  description: '企業情報を分析してDX機会を特定します',
  input: z.object({
    companyInfo: CompanyInfoSchema,
    focusAreas: z.array(z.string()).optional(),
  }),
  output: z.object({
    opportunities: z.array(DXOpportunitySchema),
  }),
  execute: async ({ companyInfo, focusAreas }) => {
    const opportunities = await analyzeDXOpportunities(companyInfo, focusAreas);
    return { opportunities };
  },
});
```

## データスキーマ

### CompanyInfoSchema

企業情報を表すスキーマです。

```typescript
export const CompanyInfoSchema = z.object({
  name: z.string(),
  industry: z.string(),
  description: z.string(),
  size: z.string().optional(),
  location: z.string().optional(),
  founded: z.string().optional(),
  products: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  competitors: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
});
```

### DXOpportunitySchema

DX機会を表すスキーマです。

```typescript
export const DXOpportunitySchema = z.object({
  title: z.string(),
  description: z.string(),
  benefits: z.array(z.string()),
  implementation: z.string(),
  timeline: z.string(),
  cost: z.string(),
  priority: z.enum(['高', '中', '低']),
  complexity: z.enum(['高', '中', '低']),
  impact: z.enum(['高', '中', '低']),
});
```

## 使用方法

### ツールの直接使用

```typescript
import { extractCompanyInfoTool, analyzeDXOpportunitiesTool } from '../tools/companyResearchTools';

// 企業情報を抽出
const companyInfoResult = await extractCompanyInfoTool.execute({
  companyUrl: 'https://www.example.co.jp',
});

// DX機会を分析
const opportunitiesResult = await analyzeDXOpportunitiesTool.execute({
  companyInfo: companyInfoResult.companyInfo,
  focusAreas: ['業務効率化', '顧客体験向上'],
});

console.log(opportunitiesResult.opportunities);
```

### エージェントを通じた使用

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

## 依存関係

- Mastra Framework
- SerpAPI
- Anthropic Claude API

## 環境変数

- `SERP_API_KEY`: SerpAPIのAPIキー（必須）

## 拡張予定の機能

- 競合分析ツール
- 業界別テンプレート
- 投資対効果（ROI）計算ツール
