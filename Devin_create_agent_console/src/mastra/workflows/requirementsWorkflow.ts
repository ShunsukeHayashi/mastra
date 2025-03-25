import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { requirementsTranslatorAgent } from '../agents/requirementsTranslatorAgent';
import { analyzeRequirementsTool, prioritizeRequirementsTool, generateTechnicalSpecTool } from '../tools/requirementsTools';

// Step 1: Analyze business requirements
const analyzeRequirementsStep = new Step({
  id: 'analyze-requirements-step',
  description: 'ビジネス要件を分析し、技術要件に変換するステップ',
  inputSchema: z.object({
    businessRequirement: z.string().describe('経営者から提示されたビジネス要件'),
    context: z.string().optional().describe('プロジェクトや既存システムに関する追加コンテキスト'),
  }),
  execute: async ({ context, mastra }) => {
    const triggerData = context?.getStepResult<{ 
      businessRequirement: string;
      context?: string;
    }>('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    // エージェントに要件分析を依頼
    const prompt = `
      以下のビジネス要件を分析し、技術要件に変換してください：
      
      ${triggerData.businessRequirement}
      
      ${triggerData.context ? `追加コンテキスト：${triggerData.context}` : ''}
    `;

    const response = await requirementsTranslatorAgent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    // 要件分析ツールを使用して技術要件に変換
    const analyzedRequirements = await analyzeRequirementsTool.execute({
      context: {
        businessRequirement: triggerData.businessRequirement,
        context: triggerData.context,
      },
      mastra,
    });

    return {
      originalRequirement: analyzedRequirements.originalRequirement,
      technicalRequirements: analyzedRequirements.technicalRequirements,
      clarificationQuestions: analyzedRequirements.clarificationQuestions,
      agentResponse: response.content,
    };
  },
});

// Step 2: Prioritize requirements
const prioritizeRequirementsStep = new Step({
  id: 'prioritize-requirements-step',
  description: '要件の優先順位付けと実装難易度を評価するステップ',
  inputSchema: z.object({
    technicalRequirements: z.array(
      z.object({
        id: z.string(),
        description: z.string(),
      })
    ),
    businessContext: z.string().optional(),
    technicalContext: z.string().optional(),
  }),
  execute: async ({ context, mastra }) => {
    const prevStepData = context?.getStepResult<{
      technicalRequirements: Array<{
        id: string;
        description: string;
      }>;
    }>('analyze-requirements-step');

    if (!prevStepData) {
      throw new Error('Previous step data not found');
    }

    // 優先順位付けツールを使用
    const prioritizedRequirements = await prioritizeRequirementsTool.execute({
      context: {
        requirements: prevStepData.technicalRequirements,
        businessContext: context?.getInput<string>('businessContext'),
        technicalContext: context?.getInput<string>('technicalContext'),
      },
      mastra,
    });

    return {
      prioritizedRequirements: prioritizedRequirements.prioritizedRequirements,
    };
  },
});

// Step 3: Generate technical specification
const generateTechnicalSpecStep = new Step({
  id: 'generate-technical-spec-step',
  description: '技術仕様書を生成するステップ',
  inputSchema: z.object({
    format: z.enum(['markdown', 'json']).optional(),
  }),
  execute: async ({ context, mastra }) => {
    const analyzeStepData = context?.getStepResult<{
      technicalRequirements: Array<{
        id: string;
        description: string;
        technicalDetails: string;
      }>;
    }>('analyze-requirements-step');

    const prioritizeStepData = context?.getStepResult<{
      prioritizedRequirements: Array<{
        id: string;
        priority: '高' | '中' | '低';
        difficulty: '高' | '中' | '低';
      }>;
    }>('prioritize-requirements-step');

    if (!analyzeStepData || !prioritizeStepData) {
      throw new Error('Required step data not found');
    }

    // 技術要件と優先順位情報をマージ
    const enrichedRequirements = analyzeStepData.technicalRequirements.map(req => {
      const priorityInfo = prioritizeStepData.prioritizedRequirements.find(p => p.id === req.id);
      return {
        ...req,
        priority: priorityInfo?.priority || '中',
        difficulty: priorityInfo?.difficulty || '中',
      };
    });

    // 技術仕様書生成ツールを使用
    const technicalSpec = await generateTechnicalSpecTool.execute({
      context: {
        technicalRequirements: enrichedRequirements,
        format: context?.getInput<'markdown' | 'json'>('format') || 'markdown',
      },
      mastra,
    });

    return {
      specification: technicalSpec.specification,
      format: technicalSpec.format,
    };
  },
});

// Requirements Translator Workflow
const requirementsTranslatorWorkflow = new Workflow({
  name: 'requirements-translator-workflow',
  triggerSchema: z.object({
    businessRequirement: z.string().describe('経営者から提示されたビジネス要件'),
    context: z.string().optional().describe('プロジェクトや既存システムに関する追加コンテキスト'),
    businessContext: z.string().optional().describe('ビジネス上の優先事項や制約に関する情報'),
    technicalContext: z.string().optional().describe('技術的な制約や既存システムに関する情報'),
    format: z.enum(['markdown', 'json']).optional().describe('出力フォーマット（デフォルト: markdown）'),
  }),
})
  .step(analyzeRequirementsStep)
  .step(prioritizeRequirementsStep)
  .step(generateTechnicalSpecStep);

requirementsTranslatorWorkflow.commit();

export { requirementsTranslatorWorkflow };
