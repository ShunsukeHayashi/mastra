import express from 'express';
import { z } from 'zod';
import { serpApiTool } from '../tools/serpApiTool.mjs';

/**
 * @swagger
 * tags:
 *   name: DX Proposal
 *   description: DX Proposal generation endpoints
 */

const router = express.Router();

// Schema validation for DX Proposal API
const dxProposalSchema = z.object({
  companyUrl: z.string().min(1, 'Company URL is required'),
  focusAreas: z.array(z.string()).optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

// In-memory storage for workflow states
const workflowStates = {};

// Extract company information from URL using SerpAPI
async function extractCompanyInfo(companyUrl) {
  try {
    // Extract domain from URL
    let domain = companyUrl.toLowerCase();
    if (domain.startsWith('http')) {
      domain = domain.split('://')[1];
    }
    if (domain.includes('/')) {
      domain = domain.split('/')[0];
    }
    
    // Use SerpAPI to search for company information
    const result = await serpApiTool.execute({
      context: {
        query: `${domain} 会社概要 OR 企業情報`,
        num: 10,
        includeKnowledgeGraph: true,
      }
    });
    
    // Extract company information from search results
    const companyInfo = {
      name: '',
      industry: '',
      description: '',
      products: [],
      size: '',
      founded: '',
      location: '',
      competitors: [],
      technologies: [],
      challenges: [],
    };
    
    // Try to extract company name from knowledge graph
    if (result.knowledgeGraph && result.knowledgeGraph.title) {
      companyInfo.name = result.knowledgeGraph.title;
    } else {
      // Extract from first result title
      const firstResult = result.organicResults[0];
      if (firstResult) {
        const titleParts = firstResult.title.split('|');
        companyInfo.name = titleParts[0].trim();
      }
    }
    
    // Extract description from knowledge graph or snippets
    if (result.knowledgeGraph && result.knowledgeGraph.description) {
      companyInfo.description = result.knowledgeGraph.description;
    } else {
      // Combine snippets for description
      const snippets = result.organicResults
        .filter(r => r.snippet)
        .map(r => r.snippet)
        .slice(0, 3);
      
      companyInfo.description = snippets.join(' ');
    }
    
    // Extract industry from search results
    const industryKeywords = ['業界', '業種', 'セクター', 'インダストリー'];
    for (const result of result.organicResults) {
      if (result.snippet) {
        for (const keyword of industryKeywords) {
          if (result.snippet.includes(keyword)) {
            const parts = result.snippet.split(keyword);
            if (parts.length > 1) {
              const industryPart = parts[1].split('。')[0].trim();
              if (industryPart && industryPart.length < 30) {
                companyInfo.industry = industryPart;
                break;
              }
            }
          }
        }
        if (companyInfo.industry) break;
      }
    }
    
    // If industry not found, use a generic one based on domain
    if (!companyInfo.industry) {
      if (domain.includes('shop') || domain.includes('store')) {
        companyInfo.industry = '小売業';
      } else if (domain.includes('tech') || domain.includes('soft')) {
        companyInfo.industry = 'IT・ソフトウェア';
      } else if (domain.includes('bank') || domain.includes('finance')) {
        companyInfo.industry = '金融・銀行';
      } else {
        companyInfo.industry = 'その他';
      }
    }
    
    // Extract products from search results
    const productKeywords = ['製品', 'サービス', 'プロダクト'];
    const productCandidates = [];
    
    for (const result of result.organicResults) {
      if (result.snippet) {
        for (const keyword of productKeywords) {
          if (result.snippet.includes(keyword)) {
            const parts = result.snippet.split(keyword);
            if (parts.length > 1) {
              const productPart = parts[1].split('。')[0].trim();
              if (productPart && productPart.length < 50) {
                productCandidates.push(productPart);
              }
            }
          }
        }
      }
    }
    
    // If no products found, extract from title and snippets
    if (productCandidates.length === 0) {
      for (const result of result.organicResults) {
        if (result.title.includes('製品') || result.title.includes('サービス')) {
          productCandidates.push(result.title.replace(/製品|サービス/g, '').trim());
        }
      }
    }
    
    // Limit to 5 products
    companyInfo.products = productCandidates.slice(0, 5);
    
    // If still no products, add generic ones
    if (companyInfo.products.length === 0) {
      companyInfo.products = ['主力製品/サービス情報は見つかりませんでした'];
    }
    
    return companyInfo;
  } catch (error) {
    console.error('Error extracting company info:', error);
    return {
      name: '不明',
      industry: '不明',
      description: '企業情報の取得に失敗しました。',
      products: ['情報なし'],
      size: '',
      founded: '',
      location: '',
      competitors: [],
      technologies: [],
      challenges: [],
    };
  }
}

// Generate DX opportunities based on company info
function generateDXOpportunities(companyInfo) {
  // Default opportunities based on industry
  const opportunities = [];
  
  if (companyInfo.industry.includes('IT') || companyInfo.industry.includes('ソフトウェア')) {
    opportunities.push({
      area: 'AIを活用した製品開発の効率化',
      currentState: '従来の開発手法による長いリリースサイクル',
      targetState: 'AIを活用した開発プロセスの自動化と効率化',
      impact: '開発期間の短縮、品質向上、コスト削減',
      difficulty: '中',
      priority: '高',
      technologies: ['機械学習', 'CI/CD自動化', 'コード生成AI']
    });
  } else if (companyInfo.industry.includes('小売') || companyInfo.industry.includes('EC')) {
    opportunities.push({
      area: 'パーソナライズされた顧客体験の構築',
      currentState: '画一的なWebサイトとマーケティング',
      targetState: 'AIによる個別化されたレコメンデーションと体験',
      impact: '顧客満足度向上、リピート率向上、客単価増加',
      difficulty: '中',
      priority: '高',
      technologies: ['レコメンデーションエンジン', '顧客セグメンテーションAI', 'パーソナライズドマーケティング']
    });
  } else if (companyInfo.industry.includes('製造') || companyInfo.industry.includes('工場')) {
    opportunities.push({
      area: 'スマートファクトリー化による生産効率向上',
      currentState: '従来型の生産ラインと限定的なデータ活用',
      targetState: 'IoTとAIを活用した予測型生産管理システム',
      impact: '生産効率向上、不良品率低減、エネルギー消費削減',
      difficulty: '高',
      priority: '高',
      technologies: ['IoTセンサー', '予測保全AI', 'デジタルツイン']
    });
  } else if (companyInfo.industry.includes('金融') || companyInfo.industry.includes('銀行')) {
    opportunities.push({
      area: 'AIを活用したリスク分析と不正検知',
      currentState: 'ルールベースの限定的な不正検知システム',
      targetState: 'リアルタイムAI不正検知と予測型リスク分析',
      impact: '不正検知率向上、リスク低減、コンプライアンス強化',
      difficulty: '高',
      priority: '高',
      technologies: ['機械学習', 'リアルタイム分析', 'ブロックチェーン']
    });
  }
  
  // Add generic opportunities for all industries
  opportunities.push({
    area: 'データ駆動型意思決定基盤の構築',
    currentState: '分断されたデータソースと限定的な分析',
    targetState: '統合データプラットフォームとAI分析ダッシュボード',
    impact: '意思決定の迅速化、データ活用促進、業務効率化',
    difficulty: '中',
    priority: '高',
    technologies: ['データレイク', 'ビジネスインテリジェンス', '機械学習']
  });
  
  opportunities.push({
    area: 'デジタル顧客エンゲージメントの強化',
    currentState: '従来型のコミュニケーションチャネル',
    targetState: 'オムニチャネル統合とAIチャットボット活用',
    impact: '顧客満足度向上、応対コスト削減、24時間対応の実現',
    difficulty: '中',
    priority: '中',
    technologies: ['チャットボットAI', 'オムニチャネルCRM', '感情分析']
  });
  
  return opportunities;
}

// Generate implementation roadmap
function generateImplementationRoadmap() {
  return [
    {
      phase: 'フェーズ1: 基盤構築と組織準備',
      description: 'デジタル基盤の整備と組織体制の構築',
      timeline: '3-6ヶ月',
      deliverables: [
        'DX推進チームの編成',
        'データ基盤アーキテクチャの設計',
        'クラウド環境の構築',
        'デジタル人材育成計画の策定'
      ]
    },
    {
      phase: 'フェーズ2: パイロットプロジェクト実施',
      description: '優先度の高いDX施策の小規模実装と検証',
      timeline: '6-9ヶ月',
      deliverables: [
        'パイロットプロジェクトの実施と効果測定',
        'ユーザーフィードバックの収集と分析',
        '本格展開に向けた課題抽出と対策立案'
      ]
    },
    {
      phase: 'フェーズ3: 本格展開と最適化',
      description: '全社的な展開と継続的な改善',
      timeline: '9-18ヶ月',
      deliverables: [
        'DXソリューションの全社展開',
        'KPI達成状況のモニタリングと最適化',
        '社内デジタル人材の育成強化',
        '新たなDX機会の継続的な発掘'
      ]
    }
  ];
}

// Generate investment summary
function generateInvestmentSummary() {
  return {
    totalCost: '1億円〜1.5億円（3年間）',
    roi: '投資額の2.5倍（5年間）',
    paybackPeriod: '3年'
  };
}

// Generate DX proposal
async function generateDXProposal(companyUrl, focusAreas = [], budget = '', timeline = '') {
  try {
    // Extract company information
    const companyInfo = await extractCompanyInfo(companyUrl);
    
    // Generate DX opportunities
    const opportunities = generateDXOpportunities(companyInfo);
    
    // Generate implementation roadmap
    const implementationRoadmap = generateImplementationRoadmap();
    
    // Generate investment summary
    const investmentSummary = generateInvestmentSummary();
    
    // Generate executive summary
    const executiveSummary = `${companyInfo.name}のデジタルトランスフォーメーション（DX）は、業界内での競争力強化と顧客体験の向上を実現する重要な戦略です。本提案では、データ活用基盤の構築、AIを活用した業務効率化、そしてデジタル顧客体験の革新を通じて、持続的な成長を支援する包括的なDX戦略を提案します。段階的な実装アプローチにより、リスクを最小化しながら確実な成果を積み上げていくことが可能です。`;
    
    // Generate business challenges
    const businessChallenges = [
      'デジタル技術の急速な進化に対応するための組織変革',
      'データの分断と活用不足による機会損失',
      'デジタル人材の確保と育成',
      '競合他社のDX推進による競争激化'
    ];
    
    // Generate conclusion
    const conclusion = `${companyInfo.name}にとってのDXは、単なる技術導入ではなく、ビジネスモデルと組織文化の変革を伴う戦略的取り組みです。本提案で示したデータ活用基盤の構築、AIを活用した業務効率化、そしてデジタル顧客体験の革新を通じて、業界内での競争優位性を確立し、持続的な成長を実現することが可能です。段階的な実装アプローチにより、リスクを最小化しながら確実な成果を積み上げていくことをお勧めします。`;
    
    // Generate presentation points
    const presentationPoints = [
      `${companyInfo.industry}業界におけるDXの重要性と競争優位性への影響`,
      'データ活用とAI導入による業務効率化と意思決定の高度化',
      'デジタル顧客体験の革新による顧客満足度と売上の向上',
      '段階的な実装アプローチによるリスク低減と効果測定',
      'DX推進のための組織体制と人材育成の重要性'
    ];
    
    // Compile the complete proposal
    const proposal = {
      companyInfo,
      executiveSummary,
      businessChallenges,
      opportunities,
      implementationRoadmap,
      investmentSummary,
      conclusion
    };
    
    return {
      status: 'completed',
      proposal,
      presentationPoints
    };
  } catch (error) {
    console.error('Error generating DX proposal:', error);
    return {
      status: 'failed',
      error: `DX提案書の生成に失敗しました: ${error.message}`
    };
  }
}

/**
 * @swagger
 * /api/dx-proposal:
 *   post:
 *     summary: Generate a DX proposal for a company
 *     tags: [DX Proposal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DXProposalInput'
 *     responses:
 *       202:
 *         description: Proposal generation started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkflowResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/dx-proposal', async (req, res) => {
  try {
    const { companyUrl, focusAreas, budget, timeline } = req.body;
    
    // Validate request data
    try {
      dxProposalSchema.parse({
        companyUrl,
        focusAreas: focusAreas || [],
        budget: budget || '',
        timeline: timeline || ''
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: '入力データが無効です',
        details: error.errors
      });
    }
    
    // Generate workflow ID
    const workflowId = `dx-proposal-${Date.now()}`;
    
    // Store initial workflow state
    workflowStates[workflowId] = {
      status: 'pending',
      createdAt: new Date().toISOString(),
      input: {
        companyUrl,
        focusAreas: focusAreas || [],
        budget: budget || '',
        timeline: timeline || ''
      }
    };
    
    // Start async processing
    setTimeout(async () => {
      try {
        // Update workflow state to processing
        workflowStates[workflowId] = {
          ...workflowStates[workflowId],
          status: 'processing',
          updatedAt: new Date().toISOString()
        };
        
        let result;
        try {
          // Try to import and use the actual Mastra workflow
          const dxProposalWorkflowModule = await import('../workflows/dxProposalWorkflow.mjs');
          
          if (dxProposalWorkflowModule && dxProposalWorkflowModule.dxProposalWorkflow) {
            console.log(`Executing actual Mastra workflow for ${workflowId}`);
            try {
              const triggerResult = await dxProposalWorkflowModule.dxProposalWorkflow.trigger({
                companyUrl,
                focusAreas: focusAreas || [],
                budget: budget || '',
                timeline: timeline || ''
              });
              
              if (triggerResult) {
                result = triggerResult;
                console.log(`Mastra workflow execution completed for ${workflowId}`);
              } else {
                console.warn(`Mastra workflow execution failed for ${workflowId}`);
                throw new Error('Workflow execution failed');
              }
            } catch (workflowError) {
              console.error(`Error in workflow execution: ${workflowError?.message || 'Unknown error'}`);
              throw workflowError;
            }
          } else {
            console.warn(`Mastra workflow not available, using mock data for ${workflowId}`);
            throw new Error('Workflow not available');
          }
        } catch (error) {
          console.warn(`Using fallback implementation for ${workflowId}: ${error?.message || 'Unknown error'}`);
          
          // Fallback to direct implementation if workflow is not available
          result = await generateDXProposal(
            companyUrl,
            focusAreas || [],
            budget || '',
            timeline || ''
          );
        
        }
        
        // Update workflow state with result
        workflowStates[workflowId] = {
          ...workflowStates[workflowId],
          status: 'completed',
          result,
          completedAt: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error executing DX proposal workflow:', error);
        
        // Update workflow state with error
        workflowStates[workflowId] = {
          ...workflowStates[workflowId],
          status: 'failed',
          error: error.message || '不明なエラー',
          failedAt: new Date().toISOString()
        };
      }
    }, 0);
    
    // Return immediate response with workflow ID
    return res.status(202).json({
      success: true,
      message: 'DX提案書の生成を開始しました',
      workflowId,
      estimatedCompletionTime: '2-3分程度'
    });
  } catch (error) {
    console.error('Error handling DX proposal request:', error);
    
    return res.status(500).json({
      success: false,
      error: 'DX提案書の生成中にエラーが発生しました',
      message: error.message || '不明なエラー'
    });
  }
});

/**
 * @swagger
 * /api/dx-proposal/{workflowId}:
 *   get:
 *     summary: Get the status or result of a DX proposal generation
 *     tags: [DX Proposal]
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the workflow to retrieve
 *     responses:
 *       200:
 *         description: Workflow status or result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkflowStatus'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/dx-proposal/:workflowId', (req, res) => {
  try {
    const { workflowId } = req.params;
    
    if (!workflowId) {
      return res.status(400).json({
        success: false,
        error: 'ワークフローIDが必要です'
      });
    }
    
    const workflowState = workflowStates[workflowId];
    
    if (!workflowState) {
      return res.status(404).json({
        success: false,
        error: '指定されたワークフローが見つかりません'
      });
    }
    
    if (workflowState.status === 'completed') {
      return res.status(200).json({
        success: true,
        status: 'completed',
        result: workflowState.result,
        completedAt: workflowState.completedAt
      });
    } else if (workflowState.status === 'failed') {
      return res.status(500).json({
        success: false,
        status: 'failed',
        error: workflowState.error || 'ワークフローの実行に失敗しました',
        failedAt: workflowState.failedAt
      });
    } else {
      return res.status(200).json({
        success: true,
        status: workflowState.status,
        message: 'DX提案書を生成中です',
        createdAt: workflowState.createdAt
      });
    }
  } catch (error) {
    console.error('Error getting DX proposal status:', error);
    
    return res.status(500).json({
      success: false,
      error: 'ワークフローステータスの取得中にエラーが発生しました',
      message: error.message || '不明なエラー'
    });
  }
});

/**
 * @swagger
 * /api/dx-proposal/{workflowId}/pdf:
 *   get:
 *     summary: Get the DX proposal as a PDF
 *     tags: [DX Proposal]
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the workflow to retrieve as PDF
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         description: Workflow not completed yet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/dx-proposal/:workflowId/pdf', async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    if (!workflowId) {
      return res.status(400).json({
        success: false,
        error: 'ワークフローIDが必要です'
      });
    }
    
    const workflowState = workflowStates[workflowId];
    
    if (!workflowState) {
      return res.status(404).json({
        success: false,
        error: '指定されたワークフローが見つかりません'
      });
    }
    
    if (workflowState.status !== 'completed') {
      return res.status(422).json({
        success: false,
        error: 'ワークフローがまだ完了していません',
        status: workflowState.status
      });
    }
    
    if (!workflowState.result || !workflowState.result.proposal) {
      return res.status(500).json({
        success: false,
        error: '提案書データが見つかりません'
      });
    }
    
    try {
      // Import PDF generator
      const { generateDXProposalPDF } = await import('../../utils/pdfGenerator.mjs');
      
      // Generate PDF
      const pdfPath = await generateDXProposalPDF(workflowState.result.proposal);
      
      // Send PDF file
      return res.download(pdfPath, `${workflowState.result.proposal.companyInfo.name}_DX提案書.pdf`, (err) => {
        if (err) {
          console.error('Error sending PDF file:', err);
        }
      });
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      
      return res.status(500).json({
        success: false,
        error: 'PDF生成中にエラーが発生しました',
        message: pdfError.message || '不明なエラー'
      });
    }
  } catch (error) {
    console.error('Error getting DX proposal PDF:', error);
    
    return res.status(500).json({
      success: false,
      error: 'PDF取得中にエラーが発生しました',
      message: error.message || '不明なエラー'
    });
  }
});

export const dxProposalApiRouter = router;
