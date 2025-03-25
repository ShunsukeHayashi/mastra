import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// SerpAPI key from environment variable or fallback to provided key
const SERP_API_KEY = process.env.SERP_API_KEY || '58dce76654d38b381c90fd62cfb33a11576052d0d88943d804953f774a597439';

// Define result schemas
const SerpApiOrganicResult = z.object({
  position: z.number().optional(),
  title: z.string(),
  link: z.string(),
  snippet: z.string().optional(),
  source: z.string().optional(),
});

const SerpApiRelatedQuestion = z.object({
  question: z.string(),
  title: z.string().optional(),
  link: z.string().optional(),
});

const SerpApiKnowledgeGraph = z.object({
  title: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  source: z.object({
    name: z.string().optional(),
    link: z.string().optional(),
  }).optional(),
  attributes: z.record(z.string()).optional(),
});

/**
 * SerpAPI tool for searching the web with Japanese-specific parameters
 */
export const serpApiTool = createTool({
  id: 'serp-api',
  description: 'Google検索を実行し、検索結果を取得します。日本語検索に最適化されています。',
  inputSchema: z.object({
    query: z.string().describe('検索クエリ'),
    num: z.number().optional().describe('取得する結果の数 (デフォルト: 10)'),
    includeKnowledgeGraph: z.boolean().optional().describe('ナレッジグラフの結果を含めるかどうか (デフォルト: true)'),
    includeRelatedQuestions: z.boolean().optional().describe('関連する質問を含めるかどうか (デフォルト: true)'),
  }),
  outputSchema: z.object({
    organicResults: z.array(SerpApiOrganicResult),
    relatedQuestions: z.array(SerpApiRelatedQuestion).optional(),
    knowledgeGraph: SerpApiKnowledgeGraph.optional(),
    searchMetadata: z.object({
      status: z.string(),
      totalResults: z.number().optional(),
      searchTime: z.number().optional(),
      searchQuery: z.string(),
    }),
  }),
  execute: async ({ context }) => {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        api_key: SERP_API_KEY,
        engine: 'google',
        q: context.query,
        location: 'Japan',
        google_domain: 'google.co.jp',
        gl: 'jp',
        hl: 'ja',
        filter: '0',
      });

      if (context.num) {
        params.append('num', context.num.toString());
      }

      // Make request to SerpAPI
      const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the response to match our output schema
      const result = {
        organicResults: [],
        searchMetadata: {
          status: 'success',
          totalResults: data.search_information?.total_results 
            ? parseInt(data.search_information.total_results.replace(/,/g, ''), 10) 
            : undefined,
          searchTime: data.search_information?.time_taken_displayed,
          searchQuery: context.query,
        },
      };
      
      // Add organic results
      if (data.organic_results) {
        result.organicResults = data.organic_results.map(item => ({
          position: item.position,
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          source: item.source,
        }));
      }
      
      // Add related questions if requested and available
      if (context.includeRelatedQuestions !== false && data.related_questions) {
        result.relatedQuestions = data.related_questions.map(item => ({
          question: item.question,
          title: item.title || item.question,
          link: item.link,
        }));
      }
      
      // Add knowledge graph if requested and available
      if (context.includeKnowledgeGraph !== false && data.knowledge_graph) {
        const kg = data.knowledge_graph;
        result.knowledgeGraph = {
          title: kg.title,
          type: kg.type,
          description: kg.description,
          source: kg.source ? {
            name: kg.source.name,
            link: kg.source.link,
          } : undefined,
          attributes: kg.attributes,
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error executing SerpAPI search:', error);
      throw error;
    }
  },
});

/**
 * SerpAPI tool specifically for SEO competitor analysis
 */
export const analyzeCompetitorContentTool = createTool({
  id: 'analyze-competitor-content',
  description: 'キーワードに基づいて競合コンテンツを分析し、SEO情報を提供します。',
  inputSchema: z.object({
    keyword: z.string().describe('分析するキーワード'),
    siteFilter: z.string().optional().describe('特定のサイトに限定する場合のドメイン (例: site:note.com)'),
    numResults: z.number().optional().describe('分析する結果の数 (デフォルト: 5)'),
  }),
  outputSchema: z.object({
    topCompetitors: z.array(z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string().optional(),
      position: z.number(),
    })),
    keywordInsights: z.object({
      searchVolume: z.string().optional(),
      competitionLevel: z.string().optional(),
      suggestedKeywords: z.array(z.string()).optional(),
    }),
    analysisRecommendations: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    try {
      // Prepare query with site filter if provided
      let query = context.keyword;
      if (context.siteFilter) {
        query = `${query} ${context.siteFilter}`;
      }
      
      // Build query parameters
      const params = new URLSearchParams({
        api_key: SERP_API_KEY,
        engine: 'google',
        q: query,
        location: 'Japan',
        google_domain: 'google.co.jp',
        gl: 'jp',
        hl: 'ja',
        num: (context.numResults || 5).toString(),
      });
      
      // Make request to SerpAPI
      const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract top competitors
      const topCompetitors = data.organic_results 
        ? data.organic_results.slice(0, context.numResults || 5).map(result => ({
            title: result.title,
            url: result.link,
            snippet: result.snippet,
            position: result.position,
          }))
        : [];
      
      // Extract related keywords from related searches if available
      const suggestedKeywords = data.related_searches
        ? data.related_searches.map(item => item.query)
        : [];
      
      // Generate analysis recommendations based on results
      const analysisRecommendations = [
        '上位表示されているコンテンツのタイトル構造を分析し、類似のパターンを採用する',
        'スニペットに表示されている重要なキーワードを本文中に適切に配置する',
        '競合コンテンツよりも詳細で包括的な情報を提供する',
        'ユーザーの検索意図に合わせたコンテンツ構造を設計する',
        '関連キーワードを見出しや本文に自然に組み込む',
      ];
      
      return {
        topCompetitors,
        keywordInsights: {
          searchVolume: data.search_information?.total_results 
            ? `約${data.search_information.total_results}件` 
            : '不明',
          competitionLevel: topCompetitors.length > 0 ? '高' : '中',
          suggestedKeywords,
        },
        analysisRecommendations,
      };
    } catch (error) {
      console.error('Error analyzing competitor content:', error);
      throw error;
    }
  },
});

/**
 * Tool for creating SEO-optimized content plans based on keyword research
 */
export const createSeoContentPlanTool = createTool({
  id: 'create-seo-content-plan',
  description: 'キーワード調査に基づいてSEO最適化されたコンテンツプランを作成します。',
  inputSchema: z.object({
    mainKeyword: z.string().describe('メインキーワード'),
    targetAudience: z.string().optional().describe('ターゲットオーディエンス'),
    contentType: z.string().optional().describe('コンテンツタイプ (例: ハウツー、リスト記事、解説記事)'),
    competitorUrls: z.array(z.string()).optional().describe('分析する競合URLのリスト'),
  }),
  outputSchema: z.object({
    title: z.string(),
    metaDescription: z.string(),
    headlineStructure: z.array(z.object({
      level: z.number(),
      headline: z.string(),
      keyPoints: z.array(z.string()).optional(),
    })),
    keywordsToInclude: z.array(z.string()),
    contentRecommendations: z.array(z.string()),
    estimatedWordCount: z.number(),
  }),
  execute: async ({ context }) => {
    try {
      // First, get keyword insights using SerpAPI
      const params = new URLSearchParams({
        api_key: SERP_API_KEY,
        engine: 'google',
        q: context.mainKeyword,
        location: 'Japan',
        google_domain: 'google.co.jp',
        gl: 'jp',
        hl: 'ja',
      });
      
      // Make request to SerpAPI
      const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract related keywords from related searches and questions
      const relatedKeywords = [];
      
      if (data.related_searches) {
        data.related_searches.forEach(item => {
          relatedKeywords.push(item.query);
        });
      }
      
      if (data.related_questions) {
        data.related_questions.forEach(item => {
          relatedKeywords.push(item.question);
        });
      }
      
      // Generate a title based on top-ranking content patterns
      let title = `【完全ガイド】${context.mainKeyword}の基本から応用まで`;
      if (data.organic_results && data.organic_results.length > 0) {
        // Analyze patterns in top titles
        const topTitles = data.organic_results.slice(0, 5).map(r => r.title);
        if (topTitles.some(t => t.includes('おすすめ'))) {
          title = `【2025年最新】${context.mainKeyword}のおすすめ5選と選び方`;
        } else if (topTitles.some(t => t.includes('方法'))) {
          title = `${context.mainKeyword}の方法・手順を徹底解説【初心者向け】`;
        } else if (topTitles.some(t => t.includes('比較'))) {
          title = `${context.mainKeyword}を徹底比較！失敗しない選び方ガイド`;
        }
      }
      
      // Generate headline structure based on content type and keyword
      const headlineStructure = [
        {
          level: 1,
          headline: title,
          keyPoints: [`${context.mainKeyword}の概要`, '記事の目的と内容'],
        },
        {
          level: 2,
          headline: `${context.mainKeyword}とは？基本的な理解`,
          keyPoints: ['定義と基本概念', '重要性と背景'],
        },
        {
          level: 2,
          headline: `${context.mainKeyword}の主なメリット`,
          keyPoints: ['具体的なメリット3-5点', '実例や統計データ'],
        },
        {
          level: 2,
          headline: `${context.mainKeyword}の選び方・ポイント`,
          keyPoints: ['選択基準', '注意点', '専門家のアドバイス'],
        },
        {
          level: 2,
          headline: `${context.mainKeyword}のおすすめ5選`,
          keyPoints: ['各選択肢の詳細説明', '特徴と利点', '価格情報'],
        },
        {
          level: 2,
          headline: `${context.mainKeyword}に関するよくある質問`,
          keyPoints: ['FAQ形式で5-7つの質問と回答'],
        },
        {
          level: 2,
          headline: `まとめ：${context.mainKeyword}の活用法`,
          keyPoints: ['記事の要点まとめ', '次のステップ', 'リソース紹介'],
        },
      ];
      
      // Adjust headline structure based on content type if provided
      if (context.contentType) {
        if (context.contentType.includes('ハウツー')) {
          headlineStructure[3] = {
            level: 2,
            headline: `${context.mainKeyword}の手順・ステップ`,
            keyPoints: ['準備するもの', 'ステップバイステップの解説', '注意点'],
          };
          headlineStructure[4] = {
            level: 2,
            headline: `${context.mainKeyword}の応用テクニック`,
            keyPoints: ['上級者向けのコツ', '効率化のポイント'],
          };
        } else if (context.contentType.includes('比較')) {
          headlineStructure[3] = {
            level: 2,
            headline: `${context.mainKeyword}の比較ポイント`,
            keyPoints: ['比較基準', '評価方法'],
          };
          headlineStructure[4] = {
            level: 2,
            headline: `${context.mainKeyword}の種類別比較表`,
            keyPoints: ['詳細な比較表', '各項目の解説'],
          };
        }
      }
      
      // Generate meta description
      const metaDescription = `${context.mainKeyword}について徹底解説。基本から応用まで、初心者にもわかりやすく解説します。選び方のポイントやおすすめ商品も紹介。`;
      
      // Determine keywords to include based on related searches and questions
      const keywordsToInclude = [
        context.mainKeyword,
        ...relatedKeywords.slice(0, 10),
      ];
      
      // Generate content recommendations
      const contentRecommendations = [
        '導入部分で読者の悩みや課題に共感する文章を入れる',
        '各セクションの冒頭で要点を簡潔にまとめる',
        '具体的な例や事例を豊富に含める',
        '専門用語は初心者にもわかるように解説する',
        '表やリスト形式を活用して情報を整理する',
        '画像や図解を適切に配置して視覚的に理解しやすくする',
        'まとめセクションで記事全体の要点を再確認する',
        '関連記事や参考資料へのリンクを含める',
      ];
      
      // Estimate word count based on headline structure
      const estimatedWordCount = 2500; // 基本的な記事の長さ
      
      return {
        title,
        metaDescription,
        headlineStructure,
        keywordsToInclude,
        contentRecommendations,
        estimatedWordCount,
      };
    } catch (error) {
      console.error('Error creating SEO content plan:', error);
      throw error;
    }
  },
});
