import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Tool to evaluate SEO optimization of content
 * This tool assesses how well the content is optimized for search engines
 */
export const evaluateSeoOptimizationTool = createTool({
  id: 'evaluate-seo-optimization',
  description: 'Evaluates how well content is optimized for search engines',
  inputSchema: z.object({
    content: z.string().describe('The content to evaluate'),
    targetKeywords: z.array(z.string()).describe('Target keywords for SEO'),
    contentType: z.enum(['article', 'section', 'paragraph']).describe('Type of content being evaluated'),
    title: z.string().optional().describe('Title of the content'),
    metaDescription: z.string().optional().describe('Meta description of the content'),
  }),
  outputSchema: z.object({
    score: z.number().min(0).max(100).describe('Overall SEO score (0-100)'),
    keywordOptimization: z.array(
      z.object({
        keyword: z.string(),
        density: z.number(),
        placement: z.object({
          title: z.boolean().optional(),
          headings: z.boolean(),
          firstParagraph: z.boolean(),
          throughout: z.boolean(),
        }),
        optimizationScore: z.number().min(0).max(100),
      })
    ).describe('Keyword optimization analysis'),
    structureScore: z.number().min(0).max(100).describe('Content structure score (0-100)'),
    readabilityScore: z.number().min(0).max(100).describe('Readability score (0-100)'),
    metaTagsScore: z.number().min(0).max(100).optional().describe('Meta tags optimization score (0-100)'),
    improvementSuggestions: z.array(z.string()).describe('Suggestions to improve SEO'),
  }),
  execute: async (context, options?) => {
    try {
      const { content, targetKeywords, contentType, title, metaDescription } = context.context;
      
      // Mock response for SEO optimization evaluation
      const mockResponse = {
        score: 80,
        keywordOptimization: targetKeywords.map((keyword, index) => ({
          keyword,
          density: 0.5 + (index % 5) * 0.1,
          placement: {
            title: title ? title.includes(keyword) : undefined,
            headings: index % 2 === 0,
            firstParagraph: index % 3 === 0,
            throughout: true,
          },
          optimizationScore: 75 + (index % 3) * 5,
        })),
        structureScore: 85,
        readabilityScore: 80,
        metaTagsScore: title && metaDescription ? 75 : undefined,
        improvementSuggestions: [
          "H2、H3見出しにキーワードをより効果的に配置する",
          "導入部分にメインキーワードを自然に組み込む",
          "内部リンクを追加して関連コンテンツへの導線を作る",
          "画像のalt属性にキーワードを含める",
          "メタディスクリプションを最適化する"
        ]
      };
      
      return mockResponse;
    } catch (error: unknown) {
      console.error('Error evaluating SEO optimization:', error);
      throw new Error(`Error evaluating SEO optimization: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

/**
 * Tool to evaluate reader engagement potential
 * This tool predicts how engaging the content will be for readers
 */
export const evaluateReaderEngagementTool = createTool({
  id: 'evaluate-reader-engagement',
  description: 'Evaluates how engaging the content will be for readers',
  inputSchema: z.object({
    content: z.string().describe('The content to evaluate'),
    contentType: z.enum(['article', 'section', 'paragraph']).describe('Type of content being evaluated'),
    targetAudience: z.string().optional().describe('Target audience for the content'),
  }),
  outputSchema: z.object({
    score: z.number().min(0).max(100).describe('Overall engagement score (0-100)'),
    readThroughRate: z.number().min(0).max(100).describe('Predicted read-through rate (0-100%)'),
    interestFactors: z.array(
      z.object({
        factor: z.string(),
        score: z.number().min(0).max(100),
        excerpt: z.string().optional(),
      })
    ).describe('Factors affecting reader interest'),
    paceAnalysis: z.object({
      overall: z.enum(['slow', 'moderate', 'fast', 'varied']),
      sections: z.array(z.object({
        section: z.string(),
        pace: z.enum(['slow', 'moderate', 'fast']),
      })).optional(),
    }).describe('Analysis of content pacing'),
    improvementSuggestions: z.array(z.string()).describe('Suggestions to improve engagement'),
  }),
  execute: async (context, options?) => {
    try {
      const { content, contentType, targetAudience } = context.context;
      
      // Mock response for reader engagement evaluation
      const mockResponse = {
        score: 75,
        readThroughRate: 65,
        interestFactors: [
          {
            factor: "導入部の魅力",
            score: 85,
            excerpt: "あなたは今までに考えたこともないような革新的な方法を..."
          },
          {
            factor: "ストーリーテリング",
            score: 60,
            excerpt: "この技術が開発された背景には..."
          },
          {
            factor: "実用的な情報",
            score: 90,
            excerpt: "次の5つのステップで簡単に実践できます..."
          },
          {
            factor: "視覚的要素",
            score: 40,
            excerpt: "（画像や図表が少ない）"
          }
        ],
        paceAnalysis: {
          overall: "varied",
          sections: [
            {
              section: "導入部",
              pace: "fast"
            },
            {
              section: "主要コンセプト説明",
              pace: "slow"
            },
            {
              section: "実践方法",
              pace: "moderate"
            },
            {
              section: "結論",
              pace: "fast"
            }
          ]
        },
        improvementSuggestions: [
          "より多くの実例や事例を追加する",
          "長い説明部分を箇条書きや短いセクションに分割する",
          "読者に問いかける質問を追加して参加意識を高める",
          "視覚的要素（図表、画像）を追加する",
          "専門用語をより簡潔に説明する"
        ]
      };
      
      return mockResponse;
    } catch (error: unknown) {
      console.error('Error evaluating reader engagement:', error);
      throw new Error(`Error evaluating reader engagement: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

/**
 * Tool to evaluate toxicity in content
 * This tool assesses whether the content contains harmful, offensive, or inappropriate language
 */
export const evaluateToxicityTool = createTool({
  id: 'evaluate-toxicity',
  description: 'Evaluates whether content contains harmful, offensive, or inappropriate language',
  inputSchema: z.object({
    content: z.string().describe('The content to evaluate'),
    contentType: z.enum(['article', 'section', 'paragraph']).describe('Type of content being evaluated'),
    audience: z.string().optional().describe('Target audience for the content'),
  }),
  outputSchema: z.object({
    score: z.number().min(0).max(100).describe('Overall toxicity score (0-100, higher is less toxic)'),
    toxicityTypes: z.array(
      z.object({
        type: z.string(),
        severity: z.enum(['none', 'low', 'medium', 'high']),
        excerpt: z.string().optional(),
      })
    ).describe('Types of toxicity detected'),
    audienceAppropriatenessScore: z.number().min(0).max(100).optional().describe('Appropriateness for target audience (0-100)'),
    improvementSuggestions: z.array(z.string()).describe('Suggestions to reduce toxicity'),
  }),
  execute: async (context, options?) => {
    try {
      const { content, contentType, audience } = context.context;
      
      // Mock response for toxicity evaluation
      const mockResponse = {
        score: 95,
        toxicityTypes: [
          {
            type: "不適切な表現",
            severity: "low",
            excerpt: "この考え方は愚かであり..."
          }
        ],
        audienceAppropriatenessScore: audience ? 90 : undefined,
        improvementSuggestions: [
          "否定的な表現をより中立的な言葉に置き換える",
          "個人や集団を批判する表現を避ける",
          "感情的な否定表現を客観的な分析に変更する"
        ]
      };
      
      return mockResponse;
    } catch (error: unknown) {
      console.error('Error evaluating content toxicity:', error);
      throw new Error(`Error evaluating content toxicity: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

/**
 * Tool to evaluate bias in content
 * This tool assesses whether the content contains biases or one-sided perspectives
 */
export const evaluateBiasTool = createTool({
  id: 'evaluate-bias',
  description: 'Evaluates whether content contains biases or one-sided perspectives',
  inputSchema: z.object({
    content: z.string().describe('The content to evaluate'),
    contentType: z.enum(['article', 'section', 'paragraph']).describe('Type of content being evaluated'),
    topic: z.string().describe('The main topic of the content'),
  }),
  outputSchema: z.object({
    score: z.number().min(0).max(100).describe('Overall bias score (0-100, higher is less biased)'),
    biasTypes: z.array(
      z.object({
        type: z.string(),
        severity: z.enum(['low', 'medium', 'high']),
        excerpt: z.string().optional(),
      })
    ).describe('Types of bias detected'),
    perspectiveBalance: z.number().min(0).max(100).describe('Balance of perspectives (0-100)'),
    languageTone: z.object({
      neutral: z.number().min(0).max(100),
      persuasive: z.number().min(0).max(100),
      emotional: z.number().min(0).max(100),
    }).describe('Analysis of language tone'),
    improvementSuggestions: z.array(z.string()).describe('Suggestions to reduce bias'),
  }),
  execute: async (context, options?) => {
    try {
      const { content, contentType, topic } = context.context;
      
      // Mock response for bias evaluation
      const mockResponse = {
        score: 70,
        biasTypes: [
          {
            type: "確証バイアス",
            severity: "medium",
            excerpt: "すべての研究結果がこの見解を支持しています..."
          },
          {
            type: "選択的情報提示",
            severity: "high",
            excerpt: "この方法の利点は多数ありますが..."
          },
          {
            type: "感情的言語の使用",
            severity: "low",
            excerpt: "驚くべき効果をもたらす革命的な技術..."
          }
        ],
        perspectiveBalance: 65,
        languageTone: {
          neutral: 60,
          persuasive: 30,
          emotional: 10,
        },
        improvementSuggestions: [
          "反対の見解や批判的な意見も公平に紹介する",
          "「すべて」「常に」などの絶対的表現を避ける",
          "感情的な形容詞を客観的な表現に置き換える",
          "複数の情報源からバランスよく引用する"
        ]
      };
      
      return mockResponse;
    } catch (error: unknown) {
      console.error('Error evaluating content bias:', error);
      throw new Error(`Error evaluating content bias: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});
