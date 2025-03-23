import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Tool to evaluate the textual quality of content
 * This tool assesses grammar, style, clarity, and overall writing quality
 */
export const evaluateTextualQualityTool = createTool({
  id: 'evaluate-textual-quality',
  description: 'Evaluates the textual quality of content including grammar, style, clarity, and overall writing',
  inputSchema: z.object({
    content: z.string().describe('The content to evaluate'),
    contentType: z.enum(['article', 'section', 'paragraph']).describe('Type of content being evaluated'),
    targetAudience: z.string().optional().describe('Target audience for the content'),
  }),
  outputSchema: z.object({
    score: z.number().min(0).max(100).describe('Overall textual quality score (0-100)'),
    grammarScore: z.number().min(0).max(100).describe('Grammar and spelling score (0-100)'),
    styleScore: z.number().min(0).max(100).describe('Writing style score (0-100)'),
    clarityScore: z.number().min(0).max(100).describe('Clarity and readability score (0-100)'),
    strengths: z.array(z.string()).describe('Textual strengths identified'),
    weaknesses: z.array(z.string()).describe('Areas for textual improvement'),
    improvementSuggestions: z.array(z.string()).describe('Specific suggestions to improve textual quality'),
  }),
  execute: async (context, options?) => {
    try {
      const { content, contentType, targetAudience } = context.context;
      
      // In a real implementation, this would use an LLM API
      // Mock evaluation results
      const evaluationResults = {
        score: 75,
        grammarScore: 80,
        styleScore: 75,
        clarityScore: 70,
        strengths: [
          "適切な専門用語の使用",
          "論理的な文章構造",
          "読者の関心を引く導入部"
        ],
        weaknesses: [
          "一部の文が長すぎて理解しづらい",
          "段落間の接続が弱い箇所がある",
          "専門用語の説明が不足している部分がある"
        ],
        improvementSuggestions: [
          "長文を短く分割して読みやすくする",
          "段落間の接続語を追加して流れを改善する",
          "専門用語にはより詳細な説明を加える"
        ]
      };
      
      return {
        score: Math.round(evaluationResults.score),
        grammarScore: Math.round(evaluationResults.grammarScore),
        styleScore: Math.round(evaluationResults.styleScore),
        clarityScore: Math.round(evaluationResults.clarityScore),
        strengths: evaluationResults.strengths,
        weaknesses: evaluationResults.weaknesses,
        improvementSuggestions: evaluationResults.improvementSuggestions,
      };
    } catch (error: unknown) {
      console.error('Error evaluating textual quality:', error);
      throw new Error(`Error evaluating textual quality: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

/**
 * Tool to evaluate content completeness
 * This tool assesses whether the content covers all necessary aspects of the topic
 */
export const evaluateCompletenessTool = createTool({
  id: 'evaluate-completeness',
  description: 'Evaluates whether content covers all necessary aspects of a topic',
  inputSchema: z.object({
    content: z.string().describe('The content to evaluate'),
    topic: z.string().describe('The main topic of the content'),
    requiredAspects: z.array(z.string()).optional().describe('Specific aspects that should be covered'),
    contentType: z.enum(['article', 'section', 'paragraph']).describe('Type of content being evaluated'),
  }),
  outputSchema: z.object({
    score: z.number().min(0).max(100).describe('Overall completeness score (0-100)'),
    coveredAspects: z.array(
      z.object({
        aspect: z.string(),
        coverageScore: z.number().min(0).max(100),
        excerpt: z.string().optional(),
      })
    ).describe('Aspects covered and their coverage quality'),
    missingAspects: z.array(z.string()).describe('Important aspects that are missing or inadequately covered'),
    redundantContent: z.array(z.string()).optional().describe('Content that is redundant or unnecessary'),
    improvementSuggestions: z.array(z.string()).describe('Suggestions to improve completeness'),
  }),
  execute: async (context, options?) => {
    try {
      const { content, topic, requiredAspects, contentType } = context.context;
      
      // Mock evaluation results
      const evaluationResults = {
        score: 70,
        coveredAspects: [
          {
            aspect: "基本概念",
            coverageScore: 85,
            excerpt: "記事の冒頭部分で基本概念を明確に説明している"
          },
          {
            aspect: "実用例",
            coverageScore: 75,
            excerpt: "いくつかの実用例が提示されているが、詳細さに欠ける"
          },
          {
            aspect: "歴史的背景",
            coverageScore: 60,
            excerpt: "歴史的背景への言及はあるが、浅い"
          }
        ],
        missingAspects: [
          "最新の研究動向",
          "専門家の見解",
          "将来の展望"
        ],
        redundantContent: [
          "関連性の低い事例の詳細な説明",
          "繰り返しの多い導入部"
        ],
        improvementSuggestions: [
          "最新の研究動向を追加する",
          "専門家の見解を引用して信頼性を高める",
          "将来の展望についてのセクションを追加する",
          "関連性の低い事例の説明を簡潔にする"
        ]
      };
      
      return {
        score: Math.round(evaluationResults.score),
        coveredAspects: evaluationResults.coveredAspects,
        missingAspects: evaluationResults.missingAspects,
        redundantContent: evaluationResults.redundantContent || [],
        improvementSuggestions: evaluationResults.improvementSuggestions,
      };
    } catch (error: unknown) {
      console.error('Error evaluating content completeness:', error);
      throw new Error(`Error evaluating content completeness: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

/**
 * Tool to evaluate content relevancy
 * This tool assesses how well the content matches user intent and search queries
 */
export const evaluateRelevancyTool = createTool({
  id: 'evaluate-relevancy',
  description: 'Evaluates how well content matches user intent and search queries',
  inputSchema: z.object({
    content: z.string().describe('The content to evaluate'),
    targetKeywords: z.array(z.string()).describe('Target keywords the content should address'),
    userIntent: z.string().describe('The presumed user intent or search query'),
    contentType: z.enum(['article', 'section', 'paragraph']).describe('Type of content being evaluated'),
  }),
  outputSchema: z.object({
    score: z.number().min(0).max(100).describe('Overall relevancy score (0-100)'),
    keywordRelevance: z.array(
      z.object({
        keyword: z.string(),
        relevanceScore: z.number().min(0).max(100),
        usage: z.number(),
        context: z.string().optional(),
      })
    ).describe('Relevance score for each target keyword'),
    intentMatch: z.number().min(0).max(100).describe('How well the content matches user intent (0-100)'),
    topicFocus: z.number().min(0).max(100).describe('How focused the content is on the main topic (0-100)'),
    improvementSuggestions: z.array(z.string()).describe('Suggestions to improve relevancy'),
  }),
  execute: async (context, options?) => {
    try {
      const { content, targetKeywords, userIntent, contentType } = context.context;
      
      // Mock evaluation results
      const evaluationResults = {
        score: 75,
        keywordRelevance: [
          {
            keyword: "AI",
            relevanceScore: 85,
            usage: 12,
            context: "AIの最新技術動向について詳しく説明している部分"
          },
          {
            keyword: "機械学習",
            relevanceScore: 70,
            usage: 5,
            context: "機械学習の基本原理について触れている部分"
          },
          {
            keyword: "データ分析",
            relevanceScore: 60,
            usage: 3,
            context: "データ分析の重要性について簡単に言及している部分"
          }
        ],
        intentMatch: 80,
        topicFocus: 75,
        improvementSuggestions: [
          "「データ分析」に関する具体的な事例を追加する",
          "ユーザーの意図である「初心者向け解説」をより意識した表現に修正する",
          "専門用語の説明をより丁寧に行う",
          "キーワードの自然な使用頻度を増やす"
        ]
      };
      
      return {
        score: Math.round(evaluationResults.score),
        keywordRelevance: evaluationResults.keywordRelevance,
        intentMatch: Math.round(evaluationResults.intentMatch),
        topicFocus: Math.round(evaluationResults.topicFocus),
        improvementSuggestions: evaluationResults.improvementSuggestions,
      };
    } catch (error: unknown) {
      console.error('Error evaluating content relevancy:', error);
      throw new Error(`Error evaluating content relevancy: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

/**
 * Tool to evaluate content faithfulness
 * This tool assesses whether the content is factually accurate and faithful to sources
 */
export const evaluateFaithfulnessTool = createTool({
  id: 'evaluate-faithfulness',
  description: 'Evaluates whether content is factually accurate and faithful to sources',
  inputSchema: z.object({
    content: z.string().describe('The content to evaluate'),
    sources: z.array(
      z.object({
        id: z.string(),
        text: z.string(),
        title: z.string().optional(),
        url: z.string().optional(),
      })
    ).optional().describe('Source materials that the content should be faithful to'),
    contentType: z.enum(['article', 'section', 'paragraph']).describe('Type of content being evaluated'),
  }),
  outputSchema: z.object({
    score: z.number().min(0).max(100).describe('Overall faithfulness score (0-100)'),
    factualAccuracy: z.number().min(0).max(100).describe('Factual accuracy score (0-100)'),
    sourceAlignment: z.number().min(0).max(100).optional().describe('Alignment with provided sources (0-100)'),
    factualErrors: z.array(
      z.object({
        claim: z.string(),
        error: z.string(),
        correction: z.string(),
      })
    ).describe('Identified factual errors'),
    unsupportedClaims: z.array(z.string()).describe('Claims made without adequate support'),
    improvementSuggestions: z.array(z.string()).describe('Suggestions to improve faithfulness'),
  }),
  execute: async (context, options?) => {
    try {
      const { content, sources, contentType } = context.context;
      
      // Mock evaluation results
      const evaluationResults = {
        score: 65,
        factualAccuracy: 70,
        sourceAlignment: sources && sources.length > 0 ? 60 : undefined,
        factualErrors: [
          {
            claim: "AIは2020年に人間の知能を超えた",
            error: "現時点でAIは特定のタスクでは人間を上回るが、汎用知能では超えていない",
            correction: "AIは特定のタスクでは人間の能力を超えているが、汎用人工知能（AGI）はまだ実現していない"
          },
          {
            claim: "機械学習は1990年代に発明された",
            error: "機械学習の概念と初期の実装は1950年代から存在している",
            correction: "機械学習の概念は1950年代に登場し、1990年代に大きな進展があった"
          }
        ],
        unsupportedClaims: [
          "AIの発展により今後10年で多くの職業が消滅する",
          "すべての企業がAIを導入すべきである",
          "AIの判断は常に客観的で偏りがない"
        ],
        improvementSuggestions: [
          "事実の主張には信頼できる情報源を引用する",
          "時系列の正確性を確認する",
          "推測と事実を明確に区別する",
          "極端な表現や一般化を避ける"
        ]
      };
      
      return {
        score: Math.round(evaluationResults.score),
        factualAccuracy: Math.round(evaluationResults.factualAccuracy),
        sourceAlignment: evaluationResults.sourceAlignment ? Math.round(evaluationResults.sourceAlignment) : undefined,
        factualErrors: evaluationResults.factualErrors,
        unsupportedClaims: evaluationResults.unsupportedClaims,
        improvementSuggestions: evaluationResults.improvementSuggestions,
      };
    } catch (error: unknown) {
      console.error('Error evaluating content faithfulness:', error);
      throw new Error(`Error evaluating content faithfulness: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

/**
 * Tool to evaluate readability prediction
 * This tool predicts how readable the content will be for the target audience
 */
export const evaluateReadabilityTool = createTool({
  id: 'evaluate-readability',
  description: 'Predicts how readable the content will be for the target audience',
  inputSchema: z.object({
    content: z.string().describe('The content to evaluate'),
    contentType: z.enum(['article', 'section', 'paragraph']).describe('Type of content being evaluated'),
    targetAudience: z.string().optional().describe('Target audience for the content (e.g., "general", "expert", "beginner")'),
    language: z.string().default('ja').describe('Content language (default: Japanese)'),
  }),
  outputSchema: z.object({
    score: z.number().min(0).max(100).describe('Overall readability score (0-100)'),
    readThroughRate: z.number().min(0).max(100).describe('Predicted read-through rate (0-100%)'),
    complexityMetrics: z.object({
      sentenceLength: z.object({
        average: z.number(),
        max: z.number(),
        distribution: z.object({
          short: z.number(),
          medium: z.number(),
          long: z.number(),
        }),
      }),
      paragraphLength: z.object({
        average: z.number(),
        max: z.number(),
      }),
      vocabularyLevel: z.number().min(1).max(5).describe('Vocabulary complexity level (1-5)'),
      technicalTerms: z.number().describe('Number of technical or specialized terms'),
    }).describe('Metrics related to text complexity'),
    audienceMatch: z.number().min(0).max(100).optional().describe('How well the content matches the target audience (0-100)'),
    improvementSuggestions: z.array(z.string()).describe('Suggestions to improve readability'),
  }),
  execute: async (context, options?) => {
    try {
      const { content, contentType, targetAudience, language } = context.context;
      
      // Mock evaluation results
      const evaluationResults = {
        score: 75,
        readThroughRate: 70,
        complexityMetrics: {
          sentenceLength: {
            average: 25,
            max: 45,
            distribution: {
              short: 30,
              medium: 50,
              long: 20,
            },
          },
          paragraphLength: {
            average: 3,
            max: 6,
          },
          vocabularyLevel: 3,
          technicalTerms: 12,
        },
        audienceMatch: targetAudience ? 80 : undefined,
        improvementSuggestions: [
          "長い文（40字以上）を分割して理解しやすくする",
          "専門用語にはより丁寧な説明を加える",
          "段落の長さをより均一にする",
          "箇条書きを活用して情報を整理する",
          "複雑な概念は具体例を用いて説明する"
        ]
      };
      
      return {
        score: Math.round(evaluationResults.score),
        readThroughRate: Math.round(evaluationResults.readThroughRate),
        complexityMetrics: evaluationResults.complexityMetrics,
        audienceMatch: evaluationResults.audienceMatch ? Math.round(evaluationResults.audienceMatch) : undefined,
        improvementSuggestions: evaluationResults.improvementSuggestions,
      };
    } catch (error: unknown) {
      console.error('Error evaluating readability:', error);
      throw new Error(`Error evaluating readability: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

/**
 * Tool to create an evaluation and improvement loop
 * This tool manages the process of evaluating content and suggesting improvements
 */
export const createEvaluationImprovementLoopTool = createTool({
  id: 'create-evaluation-improvement-loop',
  description: 'Creates an evaluation and improvement loop for content generation',
  inputSchema: z.object({
    content: z.string().describe('The content to evaluate'),
    contentType: z.enum(['article', 'section', 'paragraph']).describe('Type of content being evaluated'),
    targetKeywords: z.array(z.string()).describe('Target keywords for the content'),
    targetAudience: z.string().optional().describe('Target audience for the content'),
    evaluationTypes: z.array(
      z.enum([
        'textual-quality',
        'completeness',
        'relevancy',
        'faithfulness',
        'bias',
        'readability',
        'seo',
        'engagement'
      ])
    ).describe('Types of evaluations to perform'),
    improvementThreshold: z.number().min(0).max(100).default(70).describe('Minimum acceptable score (0-100)'),
  }),
  outputSchema: z.object({
    overallScore: z.number().min(0).max(100).describe('Overall content quality score (0-100)'),
    evaluationResults: z.record(z.any()).describe('Results from each evaluation type'),
    passesThreshold: z.boolean().describe('Whether the content passes the improvement threshold'),
    improvementPlan: z.object({
      prioritizedSuggestions: z.array(
        z.object({
          suggestion: z.string(),
          impact: z.enum(['high', 'medium', 'low']),
          category: z.string(),
        })
      ),
      focusAreas: z.array(z.string()),
    }).describe('Plan for improving the content'),
    recommendedActions: z.array(
      z.object({
        action: z.string(),
        section: z.string().optional(),
        priority: z.enum(['critical', 'high', 'medium', 'low']),
      })
    ).describe('Specific actions recommended to improve the content'),
  }),
  execute: async (context, options?) => {
    try {
      const { content, contentType, targetKeywords, targetAudience, evaluationTypes, improvementThreshold } = context.context;
      
      // Mock evaluation results with explicit type
      const mockEvaluations: Record<string, { score: number; [key: string]: any }> = {
        'textual-quality': { score: 75, strengths: ["論理的な構造"], weaknesses: ["長文が多い"] },
        'completeness': { score: 70, missingAspects: ["最新の研究動向"] },
        'relevancy': { score: 80, intentMatch: 85 },
        'readability': { score: 65, readThroughRate: 60 },
        'seo': { score: 75, keywordOptimization: { titleScore: 80 } },
        'engagement': { score: 70, interestScore: 65 }
      };
      
      // Filter evaluations based on requested types
      const filteredEvaluations: Record<string, any> = {};
      let totalScore = 0;
      let evaluationCount = 0;
      
      evaluationTypes.forEach((type: string) => {
        const evalType = type;
        if (mockEvaluations[evalType]) {
          filteredEvaluations[evalType] = mockEvaluations[evalType];
          totalScore += mockEvaluations[evalType].score;
          evaluationCount++;
        }
      });
      
      const overallScore = evaluationCount > 0 ? Math.round(totalScore / evaluationCount) : 0;
      const passesThreshold = overallScore >= improvementThreshold;
      
      // Generate improvement plan
      const allSuggestions = [
        { suggestion: "長文を短く分割して読みやすくする", impact: "high", category: "readability" },
        { suggestion: "最新の研究動向を追加する", impact: "medium", category: "completeness" },
        { suggestion: "H2見出しにキーワードを自然に組み込む", impact: "high", category: "seo" },
        { suggestion: "専門用語の説明をより丁寧に行う", impact: "medium", category: "engagement" },
        { suggestion: "箇条書きを活用して情報を整理する", impact: "medium", category: "readability" },
        { suggestion: "導入部を簡潔にし、より早く本題に入る", impact: "high", category: "engagement" }
      ] as const;
      
      // Prioritize suggestions based on lowest scoring categories
      const sortedEvaluations = Object.entries(filteredEvaluations)
        .sort(([, a], [, b]) => (a as any).score - (b as any).score)
        .map(([type]) => type);
      
      const focusAreas = sortedEvaluations.slice(0, 3);
      
      const prioritizedSuggestions = allSuggestions
        .filter(s => focusAreas.includes(s.category))
        .sort((a, b) => {
          const impactOrder = { high: 0, medium: 1, low: 2 };
          return impactOrder[a.impact] - impactOrder[b.impact];
        });
      
      // Generate recommended actions
      const recommendedActions = [
        { action: "長文（40字以上）をすべて分割する", section: "全体", priority: "critical" },
        { action: "最新の研究動向についてのセクションを追加", section: "コンテンツ後半", priority: "high" },
        { action: "すべてのH2見出しにキーワードを含める", section: "見出し", priority: "high" },
        { action: "専門用語リストを作成し、各用語に説明を追加", section: "用語解説", priority: "medium" },
        { action: "長い段落を箇条書きに変換", section: "説明セクション", priority: "medium" }
      ];
      
      return {
        overallScore,
        evaluationResults: filteredEvaluations,
        passesThreshold,
        improvementPlan: {
          prioritizedSuggestions,
          focusAreas,
        },
        recommendedActions: recommendedActions.map(action => ({
          action: action.action,
          section: action.section,
          priority: action.priority
        })),
      };
    } catch (error: unknown) {
      console.error('Error creating evaluation improvement loop:', error);
      throw new Error(`Error creating evaluation improvement loop: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});
