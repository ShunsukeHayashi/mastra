import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Tool to analyze business requirements and convert to technical requirements
export const analyzeRequirementsTool = createTool({
  id: 'analyze-requirements',
  description: 'ビジネス要件を分析し、技術要件に変換するツール',
  inputSchema: z.object({
    businessRequirement: z.string().describe('経営者から提示されたビジネス要件'),
    context: z.string().optional().describe('プロジェクトや既存システムに関する追加コンテキスト'),
  }),
  outputSchema: z.object({
    originalRequirement: z.string(),
    technicalRequirements: z.array(
      z.object({
        id: z.string(),
        description: z.string(),
        technicalDetails: z.string(),
        assumptions: z.array(z.string()).optional(),
        questions: z.array(z.string()).optional(),
      })
    ),
    clarificationQuestions: z.array(z.string()).optional(),
  }),
  execute: async ({ context }) => {
    // 実際の実装では、LLMを使用して要件を分析し変換する処理を行います
    // このサンプル実装では、モックデータを返します
    
    const requirementId = `req-${Date.now()}`;
    
    return {
      originalRequirement: context.businessRequirement,
      technicalRequirements: [
        {
          id: requirementId,
          description: '要件の技術的な説明',
          technicalDetails: '実装に必要な技術的な詳細',
          assumptions: ['前提条件1', '前提条件2'],
          questions: ['技術的な質問1', '技術的な質問2'],
        }
      ],
      clarificationQuestions: [
        '要件をより明確にするための質問1',
        '要件をより明確にするための質問2',
      ],
    };
  },
});

// Tool to prioritize requirements and evaluate implementation difficulty
export const prioritizeRequirementsTool = createTool({
  id: 'prioritize-requirements',
  description: '要件の優先順位付けと実装難易度を評価するツール',
  inputSchema: z.object({
    requirements: z.array(
      z.object({
        id: z.string(),
        description: z.string(),
      })
    ),
    businessContext: z.string().optional().describe('ビジネス上の優先事項や制約に関する情報'),
    technicalContext: z.string().optional().describe('技術的な制約や既存システムに関する情報'),
  }),
  outputSchema: z.object({
    prioritizedRequirements: z.array(
      z.object({
        id: z.string(),
        priority: z.enum(['高', '中', '低']),
        difficulty: z.enum(['高', '中', '低']),
        estimatedEffort: z.string(),
        dependencies: z.array(z.string()).optional(),
        risks: z.array(z.string()).optional(),
      })
    ),
  }),
  execute: async ({ context }) => {
    // 実際の実装では、要件の優先順位付けと難易度評価のロジックを実装します
    // このサンプル実装では、モックデータを返します
    
    return {
      prioritizedRequirements: context.requirements.map(req => ({
        id: req.id,
        priority: '高' as const,
        difficulty: '中' as const,
        estimatedEffort: '2-3人日',
        dependencies: [],
        risks: ['リスク1', 'リスク2'],
      })),
    };
  },
});

// Tool to generate technical specifications
export const generateTechnicalSpecTool = createTool({
  id: 'generate-technical-spec',
  description: '技術仕様書を生成するツール',
  inputSchema: z.object({
    technicalRequirements: z.array(
      z.object({
        id: z.string(),
        description: z.string(),
        technicalDetails: z.string(),
        priority: z.enum(['高', '中', '低']).optional(),
        difficulty: z.enum(['高', '中', '低']).optional(),
      })
    ),
    format: z.enum(['markdown', 'json']).optional().describe('出力フォーマット（デフォルト: markdown）'),
  }),
  outputSchema: z.object({
    specification: z.string(),
    format: z.enum(['markdown', 'json']),
  }),
  execute: async ({ context }) => {
    // 実際の実装では、技術仕様書を生成するロジックを実装します
    // このサンプル実装では、モックデータを返します
    
    const format = context.format || 'markdown';
    let specification = '';
    
    if (format === 'markdown') {
      specification = `# 技術仕様書

## 概要
このドキュメントは、経営者から提示された要件を技術的な仕様に変換したものです。

## 要件一覧
${context.technicalRequirements.map(req => `
### ${req.id}: ${req.description}
**優先度**: ${req.priority || '未設定'}
**難易度**: ${req.difficulty || '未設定'}

**技術詳細**:
${req.technicalDetails}
`).join('\n')}

## 実装計画
1. 要件分析と設計
2. 開発環境のセットアップ
3. 実装
4. テスト
5. デプロイ
`;
    } else {
      // JSON形式
      specification = JSON.stringify({
        title: '技術仕様書',
        requirements: context.technicalRequirements,
        implementationPlan: [
          '要件分析と設計',
          '開発環境のセットアップ',
          '実装',
          'テスト',
          'デプロイ'
        ]
      }, null, 2);
    }
    
    return {
      specification,
      format,
    };
  },
});
