import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { DXProposalInput, DXProposalOutput } from '../utils/companyResearch';
import { extractCompanyInfoTool, analyzeDXOpportunitiesTool } from '../tools/companyResearchTools';

const dxAgent = new Agent({
  name: 'DX Proposal Agent',
  model: anthropic('claude-3-5-sonnet-20241022'),
  instructions: `
    あなたは企業向けのデジタルトランスフォーメーション（DX）提案書を作成する専門家アシスタントです。
    
    主な機能:
    1. 企業URLからの情報収集と分析
    2. 業界特性に基づいたDX機会の特定
    3. 具体的な導入ロードマップの作成
    4. 投資対効果（ROI）の試算
    5. 経営層向け提案資料の作成
    
    以下のワークフローに従って作業します:
    
    【フェーズ1: 企業調査】
    - 企業URLから会社情報を抽出
    - 業種、規模、主要製品・サービスの特定
    - 現状の技術活用状況と課題の把握
    
    【フェーズ2: DX機会分析】
    - 業界特性に基づいたDX機会の特定
    - 各機会の現状と目標状態の定義
    - 期待される効果と実装難易度の評価
    
    【フェーズ3: 提案書作成】
    - エグゼクティブサマリーの作成
    - 具体的なDX機会の詳細説明
    - 段階的な実装ロードマップの設計
    
    【フェーズ4: 投資計画】
    - 概算コストの試算
    - 投資対効果（ROI）の分析
    - 投資回収期間の試算
    
    【フェーズ5: 提案資料完成】
    - 経営層向けプレゼンテーションポイントの整理
    - 提案書の最終調整
    - 提案に向けた準備事項の確認
  `,
  tools: { 
    extractCompanyInfoTool,
    analyzeDXOpportunitiesTool
  },
});

const extractCompanyInfo = new Step({
  id: 'extract-company-info',
  description: '企業URLから会社情報を抽出します',
  inputSchema: z.object({
    companyUrl: z.string().describe('企業のURL'),
  }),
  execute: async ({ context, mastra }) => {
    const triggerData = context?.getStepResult<{ 
      companyUrl: string;
    }>('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    const response = await dxAgent.stream([
      {
        role: 'user',
        content: `以下の企業URLから会社情報を抽出してください：${triggerData.companyUrl}`,
      },
    ]);

    let content = '';
    for await (const chunk of response.textStream) {
      content += chunk;
    }

    const nameRegex = /会社名[：:]\s*([^\n]+)/;
    const nameMatch = content.match(nameRegex);
    const name = nameMatch ? nameMatch[1].trim() : '不明';
    
    const industryRegex = /業界[：:]\s*([^\n]+)/;
    const industryMatch = content.match(industryRegex);
    const industry = industryMatch ? industryMatch[1].trim() : '不明';
    
    const descriptionRegex = /会社概要[：:]([\s\S]*?)(?=主要製品|$)/;
    const descriptionMatch = content.match(descriptionRegex);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '情報が取得できませんでした';
    
    const productsRegex = /主要製品[・サービス]*[：:]([\s\S]*?)(?=企業規模|設立年|本社所在地|主要競合|使用技術|課題|$)/;
    const productsMatch = content.match(productsRegex);
    const productsText = productsMatch ? productsMatch[1].trim() : '';
    const products = productsText
      ? productsText.split(/\n|・|,|、/).map(item => item.trim()).filter(item => item.length > 0)
      : ['情報なし'];
    
    const sizeRegex = /企業規模[：:]\s*([^\n]+)/;
    const sizeMatch = content.match(sizeRegex);
    const size = sizeMatch ? sizeMatch[1].trim() : undefined;
    
    const foundedRegex = /設立年[：:]\s*([^\n]+)/;
    const foundedMatch = content.match(foundedRegex);
    const founded = foundedMatch ? foundedMatch[1].trim() : undefined;
    
    const locationRegex = /本社所在地[：:]\s*([^\n]+)/;
    const locationMatch = content.match(locationRegex);
    const location = locationMatch ? locationMatch[1].trim() : undefined;
    
    const companyInfo = {
      name,
      industry,
      description,
      products,
      size,
      founded,
      location,
    };

    return {
      companyInfo,
    };
  },
});

const analyzeDXOpportunities = new Step({
  id: 'analyze-dx-opportunities',
  description: '企業情報を分析してDX機会を特定します',
  inputSchema: z.object({
    companyInfo: z.any(),
  }),
  execute: async ({ context, mastra }) => {
    const companyInfoResult = context?.getStepResult<{ 
      companyInfo: any;
    }>('extract-company-info');

    if (!companyInfoResult) {
      throw new Error('Company info not found');
    }

    const response = await dxAgent.stream([
      {
        role: 'user',
        content: `
          以下の企業情報を分析して、DX機会を特定してください：
          ${JSON.stringify(companyInfoResult.companyInfo, null, 2)}
          
          各DX機会には以下の情報を含めてください：
          - 適用領域
          - 現状
          - 目標状態
          - 期待される効果
          - 実装難易度（低/中/高）
          - 優先度（低/中/高）
          - 推奨技術・ソリューション
        `,
      },
    ]);

    let content = '';
    for await (const chunk of response.textStream) {
      content += chunk;
    }
    
    const opportunitiesRegex = /【DX機会】([\s\S]*?)(?:【|$)/;
    const opportunitiesMatch = content.match(opportunitiesRegex);
    const opportunitiesText = opportunitiesMatch ? opportunitiesMatch[1].trim() : '';
    
    const opportunities: Array<{
      area: string;
      currentState: string;
      targetState: string;
      impact: string;
      difficulty: '低' | '中' | '高';
      priority: '低' | '中' | '高';
      technologies: string[];
    }> = [];
    
    const opportunityRegex = /(\d+)[\.．]\s*([^\n]+)\n([\s\S]*?)(?=\d+[\.．]|$)/g;
    let opportunityMatch;
    
    while ((opportunityMatch = opportunityRegex.exec(opportunitiesText)) !== null) {
      const opportunityTitle = opportunityMatch[2].trim();
      const opportunityContent = opportunityMatch[3].trim();
      
      const currentStateRegex = /現状[：:]\s*([^\n]+)/;
      const currentStateMatch = opportunityContent.match(currentStateRegex);
      const currentState = currentStateMatch ? currentStateMatch[1].trim() : '情報なし';
      
      const targetStateRegex = /目標[状態]*[：:]\s*([^\n]+)/;
      const targetStateMatch = opportunityContent.match(targetStateRegex);
      const targetState = targetStateMatch ? targetStateMatch[1].trim() : '情報なし';
      
      const impactRegex = /[期待される]*効果[：:]\s*([^\n]+)/;
      const impactMatch = opportunityContent.match(impactRegex);
      const impact = impactMatch ? impactMatch[1].trim() : '情報なし';
      
      const difficultyRegex = /難易度[：:]\s*([^\n]+)/;
      const difficultyMatch = opportunityContent.match(difficultyRegex);
      const difficultyText = difficultyMatch ? difficultyMatch[1].trim() : '中';
      const difficulty = (difficultyText === '低' || difficultyText === '高') ? difficultyText : '中';
      
      const priorityRegex = /優先度[：:]\s*([^\n]+)/;
      const priorityMatch = opportunityContent.match(priorityRegex);
      const priorityText = priorityMatch ? priorityMatch[1].trim() : '中';
      const priority = (priorityText === '低' || priorityText === '高') ? priorityText : '中';
      
      const technologiesRegex = /推奨技術[・ソリューション]*[：:]([\s\S]*?)(?=現状|目標|効果|難易度|優先度|$)/;
      const technologiesMatch = opportunityContent.match(technologiesRegex);
      const technologiesText = technologiesMatch ? technologiesMatch[1].trim() : '';
      const technologies = technologiesText
        ? technologiesText.split(/\n|・|,|、/).map(item => item.trim()).filter(item => item.length > 0)
        : ['クラウドサービス'];
      
      opportunities.push({
        area: opportunityTitle,
        currentState,
        targetState,
        impact,
        difficulty,
        priority,
        technologies,
      });
    }
    
    if (opportunities.length === 0) {
      opportunities.push({
        area: 'ビジネスプロセスのデジタル化',
        currentState: '紙ベースの業務プロセスが多く、効率が低い',
        targetState: '主要業務プロセスのデジタル化による効率向上',
        impact: '業務効率30%向上、コスト削減20%',
        difficulty: '中',
        priority: '高',
        technologies: ['業務自動化ツール', 'ワークフロー管理システム', 'クラウドサービス'],
      });
    }

    return {
      opportunities,
    };
  },
});

const createImplementationRoadmap = new Step({
  id: 'create-implementation-roadmap',
  description: 'DX機会に基づいた実装ロードマップを作成します',
  inputSchema: z.object({
    companyInfo: z.any(),
    opportunities: z.array(z.any()),
  }),
  execute: async ({ context, mastra }) => {
    const companyInfoResult = context?.getStepResult<{ 
      companyInfo: any;
    }>('extract-company-info');

    const opportunitiesResult = context?.getStepResult<{ 
      opportunities: any[];
    }>('analyze-dx-opportunities');

    if (!companyInfoResult || !opportunitiesResult) {
      throw new Error('Required data not found');
    }

    const response = await dxAgent.stream([
      {
        role: 'user',
        content: `
          以下の企業情報とDX機会に基づいて、段階的な実装ロードマップを作成してください：
          
          【企業情報】
          ${JSON.stringify(companyInfoResult.companyInfo, null, 2)}
          
          【DX機会】
          ${JSON.stringify(opportunitiesResult.opportunities, null, 2)}
          
          各フェーズには以下の情報を含めてください：
          - フェーズ名
          - 説明
          - 期間
          - 成果物
        `,
      },
    ]);

    let content = '';
    for await (const chunk of response.textStream) {
      content += chunk;
    }

    const roadmapRegex = /【実装ロードマップ】([\s\S]*?)(?:【|$)/;
    const roadmapMatch = content.match(roadmapRegex);
    const roadmapText = roadmapMatch ? roadmapMatch[1].trim() : '';
    
    const phases = [];
    const phaseRegex = /フェーズ(\d+)[：:]\s*([^\n]+)\n([\s\S]*?)(?=フェーズ\d+[：:]|$)/g;
    let phaseMatch;
    
    while ((phaseMatch = phaseRegex.exec(roadmapText)) !== null) {
      const phaseNumber = phaseMatch[1];
      const phaseTitle = phaseMatch[2].trim();
      const phaseContent = phaseMatch[3].trim();
      
      const timelineRegex = /期間[：:]\s*([^\n]+)/;
      const timelineMatch = phaseContent.match(timelineRegex);
      const timeline = timelineMatch ? timelineMatch[1].trim() : '3〜6ヶ月';
      
      const deliverablesRegex = /成果物[：:]([\s\S]*?)(?=期間[：:]|$)/;
      const deliverablesMatch = phaseContent.match(deliverablesRegex);
      const deliverables: string[] = [];
      
      if (deliverablesMatch) {
        const deliverablesText = deliverablesMatch[1].trim();
        deliverablesText
          .split(/\n|・|,|、/)
          .map(item => item.trim())
          .filter(item => item.length > 0)
          .forEach(item => deliverables.push(item));
      }
      
      phases.push({
        phase: `フェーズ${phaseNumber}: ${phaseTitle}`,
        description: phaseContent,
        timeline: timeline,
        deliverables: deliverables.length > 0 ? deliverables : [`${phaseTitle}の完了報告書`],
      });
    }
    
    const implementationRoadmap = phases.length > 0 ? phases : [
      {
        phase: 'フェーズ1: 現状分析と計画策定',
        description: '現状のビジネスプロセスと技術スタックを分析し、DX戦略の詳細計画を策定します。',
        timeline: '1〜3ヶ月',
        deliverables: ['現状分析レポート', 'DX戦略計画書', 'ロードマップ詳細'],
      },
      {
        phase: 'フェーズ2: 基盤構築と初期実装',
        description: 'DXの基盤となるシステムやプロセスを構築し、優先度の高い領域から実装を開始します。',
        timeline: '3〜6ヶ月',
        deliverables: ['基盤システム', '初期機能', '進捗レポート'],
      },
      {
        phase: 'フェーズ3: 本格展開と最適化',
        description: '初期実装の成果を基に全社的な展開を行い、継続的な改善と最適化を実施します。',
        timeline: '6〜12ヶ月',
        deliverables: ['全社展開計画', '最適化レポート', '効果測定結果'],
      },
    ];
    
    return {
      implementationRoadmap,
    };
  },
});

const calculateInvestmentSummary = new Step({
  id: 'calculate-investment-summary',
  description: 'DX提案の投資概要と投資対効果を計算します',
  inputSchema: z.object({
    companyInfo: z.any(),
    opportunities: z.array(z.any()),
    implementationRoadmap: z.array(z.any()),
  }),
  execute: async ({ context, mastra }) => {
    const companyInfoResult = context?.getStepResult<{ 
      companyInfo: any;
    }>('extract-company-info');

    const opportunitiesResult = context?.getStepResult<{ 
      opportunities: any[];
    }>('analyze-dx-opportunities');

    const roadmapResult = context?.getStepResult<{ 
      implementationRoadmap: any[];
    }>('create-implementation-roadmap');

    if (!companyInfoResult || !opportunitiesResult || !roadmapResult) {
      throw new Error('Required data not found');
    }

    const response = await dxAgent.stream([
      {
        role: 'user',
        content: `
          以下の情報に基づいて、DX提案の投資概要と投資対効果（ROI）を計算してください：
          
          【企業情報】
          ${JSON.stringify(companyInfoResult.companyInfo, null, 2)}
          
          【DX機会】
          ${JSON.stringify(opportunitiesResult.opportunities, null, 2)}
          
          【実装ロードマップ】
          ${JSON.stringify(roadmapResult.implementationRoadmap, null, 2)}
          
          以下の情報を含めてください：
          - 総コスト
          - ROI
          - 回収期間
        `,
      },
    ]);

    let content = '';
    for await (const chunk of response.textStream) {
      content += chunk;
    }

    const totalCostRegex = /総コスト[：:]\s*([^\n]+)/;
    const totalCostMatch = content.match(totalCostRegex);
    const totalCost = totalCostMatch ? totalCostMatch[1].trim() : '5,000万円〜1億円';
    
    const roiRegex = /ROI[：:]\s*([^\n]+)/;
    const roiMatch = content.match(roiRegex);
    const roi = roiMatch ? roiMatch[1].trim() : '150%〜200%（3年間）';
    
    const paybackPeriodRegex = /回収期間[：:]\s*([^\n]+)/;
    const paybackPeriodMatch = content.match(paybackPeriodRegex);
    const paybackPeriod = paybackPeriodMatch ? paybackPeriodMatch[1].trim() : '18〜24ヶ月';
    
    return {
      investmentSummary: {
        totalCost,
        roi,
        paybackPeriod,
      },
    };
  },
});

const generateDXProposal = new Step({
  id: 'generate-dx-proposal',
  description: '最終的なDX提案書を生成します',
  inputSchema: z.object({
    companyInfo: z.any(),
    opportunities: z.array(z.any()),
    implementationRoadmap: z.array(z.any()),
    investmentSummary: z.object({
      totalCost: z.string(),
      roi: z.string(),
      paybackPeriod: z.string(),
    }),
  }),
  execute: async ({ context, mastra }) => {
    const companyInfoResult = context?.getStepResult<{ 
      companyInfo: any;
    }>('extract-company-info');

    const opportunitiesResult = context?.getStepResult<{ 
      opportunities: any[];
    }>('analyze-dx-opportunities');

    const roadmapResult = context?.getStepResult<{ 
      implementationRoadmap: any[];
    }>('create-implementation-roadmap');

    const investmentResult = context?.getStepResult<{ 
      investmentSummary: {
        totalCost: string;
        roi: string;
        paybackPeriod: string;
      };
    }>('calculate-investment-summary');

    if (!companyInfoResult || !opportunitiesResult || !roadmapResult || !investmentResult) {
      throw new Error('Required data not found');
    }

    const response = await dxAgent.stream([
      {
        role: 'user',
        content: `
          以下の情報に基づいて、最終的なDX提案書とプレゼンテーションのポイントを生成してください：
          
          【企業情報】
          ${JSON.stringify(companyInfoResult.companyInfo, null, 2)}
          
          【DX機会】
          ${JSON.stringify(opportunitiesResult.opportunities, null, 2)}
          
          【実装ロードマップ】
          ${JSON.stringify(roadmapResult.implementationRoadmap, null, 2)}
          
          【投資概要】
          ${JSON.stringify(investmentResult.investmentSummary, null, 2)}
          
          以下の情報を含めてください：
          - エグゼクティブサマリー
          - ビジネス課題
          - 結論
          - プレゼンテーションポイント
        `,
      },
    ]);

    let content = '';
    for await (const chunk of response.textStream) {
      content += chunk;
    }

    const executiveSummaryRegex = /【エグゼクティブサマリー】([\s\S]*?)(?:【|$)/;
    const executiveSummaryMatch = content.match(executiveSummaryRegex);
    const executiveSummary = executiveSummaryMatch ? executiveSummaryMatch[1].trim() : '';
    
    const challengesRegex = /【ビジネス課題】([\s\S]*?)(?:【|$)/;
    const challengesMatch = content.match(challengesRegex);
    const businessChallenges: string[] = [];
    
    if (challengesMatch) {
      challengesMatch[1]
        .trim()
        .split(/\n|・|,|、/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .forEach(item => businessChallenges.push(item));
    }
    
    const conclusionRegex = /【結論】([\s\S]*?)(?:【|$)/;
    const conclusionMatch = content.match(conclusionRegex);
    const conclusion = conclusionMatch ? conclusionMatch[1].trim() : '';
    
    const presentationPointsRegex = /【プレゼンテーションポイント】([\s\S]*?)(?:【|$)/;
    const presentationPointsMatch = content.match(presentationPointsRegex);
    const presentationPoints: string[] = [];
    
    if (presentationPointsMatch) {
      presentationPointsMatch[1]
        .trim()
        .split(/\n|・|,|、/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .forEach(item => presentationPoints.push(item));
    }
    
    const defaultBusinessChallenges = [
      '既存システムの老朽化による業務効率の低下',
      'デジタル技術活用の遅れによる競争力の低下',
      '顧客ニーズの変化への対応の遅れ',
      'データ活用不足による意思決定の遅延',
    ];
    
    const defaultPresentationPoints = [
      '業界特性を踏まえた具体的なDX施策の提案',
      '段階的な実装アプローチによるリスク低減',
      '明確なROIと投資回収計画の提示',
      '経営課題とDX施策の明確な紐付け',
      '成功事例に基づく実現可能性の高い提案',
    ];
    
    return {
      proposal: {
        companyInfo: companyInfoResult.companyInfo,
        executiveSummary: executiveSummary || `${companyInfoResult.companyInfo.name}様のビジネス課題を解決し、競争力を強化するためのDX戦略提案書です。本提案では、${opportunitiesResult.opportunities.length}つの重点領域におけるデジタル化施策を通じて、業務効率の向上、コスト削減、および新たな顧客体験の創出を実現します。段階的な実装アプローチにより、投資リスクを最小化しながら、最大の効果を得ることが可能です。`,
        businessChallenges: businessChallenges.length > 0 ? businessChallenges : defaultBusinessChallenges,
        opportunities: opportunitiesResult.opportunities,
        implementationRoadmap: roadmapResult.implementationRoadmap,
        investmentSummary: investmentResult.investmentSummary,
        conclusion: conclusion || `本提案のDX施策を実施することで、${companyInfoResult.companyInfo.name}様は業界内での競争優位性を確立し、持続可能な成長を実現することが可能です。デジタル技術の戦略的活用により、業務効率の向上、コスト削減、および顧客満足度の向上を同時に達成し、企業価値の最大化を図ります。`,
      },
      presentationPoints: presentationPoints.length > 0 ? presentationPoints : defaultPresentationPoints,
    };
  },
});

const dxProposalWorkflow = new Workflow({
  name: 'dx-proposal-workflow',
  triggerSchema: z.object({
    companyUrl: z.string().describe('企業のURL'),
    focusAreas: z.array(z.string()).optional().describe('重点領域（例：業務効率化、顧客体験向上、新規事業創出）'),
    budget: z.string().optional().describe('予算範囲'),
    timeline: z.string().optional().describe('実装タイムライン'),
  }),
})
.step(extractCompanyInfo)
.step(analyzeDXOpportunities)
.step(createImplementationRoadmap)
.step(calculateInvestmentSummary)
.step(generateDXProposal);

dxProposalWorkflow.commit();

export { dxProposalWorkflow };
