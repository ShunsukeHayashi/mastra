import { z } from 'zod';

/**
 * Company information schema
 */
export const CompanyInfo = z.object({
  name: z.string().describe('会社名'),
  industry: z.string().describe('業界'),
  description: z.string().describe('会社概要'),
  products: z.array(z.string()).describe('主要製品・サービス'),
  size: z.string().optional().describe('企業規模（従業員数など）'),
  founded: z.string().optional().describe('設立年'),
  location: z.string().optional().describe('本社所在地'),
  competitors: z.array(z.string()).optional().describe('主要競合他社'),
  technologies: z.array(z.string()).optional().describe('使用技術・システム'),
  challenges: z.array(z.string()).optional().describe('課題・ニーズ'),
});

/**
 * DX opportunity schema
 */
export const DXOpportunity = z.object({
  area: z.string().describe('DX適用領域'),
  currentState: z.string().describe('現状'),
  targetState: z.string().describe('目標状態'),
  impact: z.string().describe('期待される効果'),
  difficulty: z.enum(['低', '中', '高']).describe('実装難易度'),
  priority: z.enum(['低', '中', '高']).describe('優先度'),
  technologies: z.array(z.string()).describe('推奨技術・ソリューション'),
  estimatedCost: z.string().optional().describe('概算コスト'),
  estimatedTimeframe: z.string().optional().describe('想定実装期間'),
  kpis: z.array(z.string()).optional().describe('成功指標（KPI）'),
});

/**
 * DX proposal schema
 */
export const DXProposal = z.object({
  companyInfo: CompanyInfo,
  executiveSummary: z.string().describe('エグゼクティブサマリー'),
  businessChallenges: z.array(z.string()).describe('ビジネス課題'),
  opportunities: z.array(DXOpportunity).describe('DX機会'),
  implementationRoadmap: z.array(
    z.object({
      phase: z.string().describe('フェーズ'),
      description: z.string().describe('説明'),
      timeline: z.string().describe('タイムライン'),
      deliverables: z.array(z.string()).describe('成果物'),
    })
  ).describe('実装ロードマップ'),
  investmentSummary: z.object({
    totalCost: z.string().describe('総コスト'),
    roi: z.string().describe('投資対効果（ROI）'),
    paybackPeriod: z.string().describe('回収期間'),
  }).describe('投資概要'),
  conclusion: z.string().describe('結論'),
});

/**
 * DX proposal agent input schema
 */
export const DXProposalInput = z.object({
  companyUrl: z.string().describe('企業のURL'),
  focusAreas: z.array(z.string()).optional().describe('重点領域（例：業務効率化、顧客体験向上、新規事業創出）'),
  budget: z.string().optional().describe('予算範囲'),
  timeline: z.string().optional().describe('実装タイムライン'),
});

/**
 * DX proposal agent output schema
 */
export const DXProposalOutput = z.object({
  proposal: DXProposal,
  presentationPoints: z.array(z.string()).describe('プレゼンテーションのポイント'),
});
