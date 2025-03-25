import { Request, Response } from 'express';
import { logger } from '../utils/logger';

// SerpAPI key from environment variable or fallback to provided key
const SERP_API_KEY = process.env.SERP_API_KEY || '58dce76654d38b381c90fd62cfb33a11576052d0d88943d804953f774a597439';

/**
 * Handler for SerpAPI search
 */
export const serpSearchHandler = async (req: Request, res: Response) => {
  try {
    const { 
      query, 
      num = 10, 
      includeKnowledgeGraph = true, 
      includeRelatedQuestions = true 
    } = req.body;
    
    logger.info('Performing SerpAPI search', { 
      query, 
      num, 
      includeKnowledgeGraph, 
      includeRelatedQuestions 
    });
    
    // Build query parameters
    const params = new URLSearchParams({
      api_key: SERP_API_KEY,
      engine: 'google',
      q: query,
      location: 'Japan',
      google_domain: 'google.co.jp',
      gl: 'jp',
      hl: 'ja',
      filter: '0',
      num: num.toString(),
    });
    
    // Make request to SerpAPI
    const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
    
    if (response.status === 401) {
      logger.error('SerpAPI unauthorized', { status: response.status });
      return res.status(401).json({
        code: 401,
        message: 'Unauthorized - Invalid API key',
        details: 'The provided SerpAPI key is invalid or has expired',
      });
    }
    
    if (response.status === 429) {
      logger.error('SerpAPI rate limit exceeded', { status: response.status });
      return res.status(429).json({
        code: 429,
        message: 'Too many requests',
        details: 'SerpAPI rate limit exceeded. Please try again later.',
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      logger.error('SerpAPI error', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorText 
      });
      
      return res.status(response.status).json({
        code: response.status,
        message: `SerpAPI error: ${response.statusText}`,
        details: errorText,
      });
    }
    
    const data = await response.json();
    
    // Transform the response to match our output schema
    const result: any = {
      organicResults: [],
      searchMetadata: {
        status: 'success',
        totalResults: data.search_information?.total_results 
          ? parseInt(data.search_information.total_results.replace(/,/g, ''), 10) 
          : undefined,
        searchTime: data.search_information?.time_taken_displayed,
        searchQuery: query,
      },
    };
    
    // Add organic results
    if (data.organic_results) {
      result.organicResults = data.organic_results.map((item: any) => ({
        position: item.position,
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        source: item.source,
      }));
    }
    
    // Add related questions if requested and available
    if (includeRelatedQuestions && data.related_questions) {
      result.relatedQuestions = data.related_questions.map((item: any) => ({
        question: item.question,
        title: item.title || item.question,
        link: item.link,
      }));
    }
    
    // Add knowledge graph if requested and available
    if (includeKnowledgeGraph && data.knowledge_graph) {
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
    
    logger.info('SerpAPI search successful', { 
      query, 
      resultCount: result.organicResults.length 
    });
    
    return res.status(200).json(result);
  } catch (error: unknown) {
    logger.error('Error executing SerpAPI search', { error });
    
    return res.status(500).json({
      code: 500,
      message: 'Error executing SerpAPI search',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Handler for analyzing competitor content
 */
export const analyzeCompetitorsHandler = async (req: Request, res: Response) => {
  try {
    const { keyword, siteFilter, numResults = 5 } = req.body;
    
    logger.info('Analyzing competitor content', { 
      keyword, 
      siteFilter, 
      numResults 
    });
    
    // Prepare query with site filter if provided
    let query = keyword;
    if (siteFilter) {
      query = `${query} ${siteFilter}`;
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
      num: numResults.toString(),
    });
    
    // Make request to SerpAPI
    const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
    
    if (response.status === 401) {
      logger.error('SerpAPI unauthorized', { status: response.status });
      return res.status(401).json({
        code: 401,
        message: 'Unauthorized - Invalid API key',
        details: 'The provided SerpAPI key is invalid or has expired',
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      logger.error('SerpAPI error', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorText 
      });
      
      return res.status(response.status).json({
        code: response.status,
        message: `SerpAPI error: ${response.statusText}`,
        details: errorText,
      });
    }
    
    const data = await response.json();
    
    // Extract top competitors
    const topCompetitors = data.organic_results 
      ? data.organic_results.slice(0, numResults).map((result: any) => ({
          title: result.title,
          url: result.link,
          snippet: result.snippet,
          position: result.position,
        }))
      : [];
    
    // Extract related keywords from related searches if available
    const suggestedKeywords = data.related_searches
      ? data.related_searches.map((item: any) => item.query)
      : [];
    
    // Generate analysis recommendations based on results
    const analysisRecommendations = [
      '上位表示されているコンテンツのタイトル構造を分析し、類似のパターンを採用する',
      'スニペットに表示されている重要なキーワードを本文中に適切に配置する',
      '競合コンテンツよりも詳細で包括的な情報を提供する',
      'ユーザーの検索意図に合わせたコンテンツ構造を設計する',
      '関連キーワードを見出しや本文に自然に組み込む',
    ];
    
    const result = {
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
    
    logger.info('Competitor analysis successful', { 
      keyword, 
      competitorCount: topCompetitors.length 
    });
    
    return res.status(200).json(result);
  } catch (error: unknown) {
    logger.error('Error analyzing competitor content', { error });
    
    return res.status(500).json({
      code: 500,
      message: 'Error analyzing competitor content',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Handler for creating SEO content plan
 */
export const createSeoPlanHandler = async (req: Request, res: Response) => {
  try {
    const { 
      mainKeyword, 
      targetAudience, 
      contentType, 
      competitorUrls = [] 
    } = req.body;
    
    logger.info('Creating SEO content plan', { 
      mainKeyword, 
      targetAudience,
      contentType,
      competitorUrlsCount: competitorUrls.length
    });
    
    // First, get keyword insights using SerpAPI
    const params = new URLSearchParams({
      api_key: SERP_API_KEY,
      engine: 'google',
      q: mainKeyword,
      location: 'Japan',
      google_domain: 'google.co.jp',
      gl: 'jp',
      hl: 'ja',
    });
    
    // Make request to SerpAPI
    const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
    
    if (response.status === 401) {
      logger.error('SerpAPI unauthorized', { status: response.status });
      return res.status(401).json({
        code: 401,
        message: 'Unauthorized - Invalid API key',
        details: 'The provided SerpAPI key is invalid or has expired',
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      logger.error('SerpAPI error', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorText 
      });
      
      return res.status(response.status).json({
        code: response.status,
        message: `SerpAPI error: ${response.statusText}`,
        details: errorText,
      });
    }
    
    const data = await response.json();
    
    // Extract related keywords from related searches and questions
    const relatedKeywords: string[] = [];
    
    if (data.related_searches) {
      data.related_searches.forEach((item: any) => {
        relatedKeywords.push(item.query);
      });
    }
    
    if (data.related_questions) {
      data.related_questions.forEach((item: any) => {
        relatedKeywords.push(item.question);
      });
    }
    
    // Generate a title based on top-ranking content patterns
    let title = `【完全ガイド】${mainKeyword}の基本から応用まで`;
    if (data.organic_results && data.organic_results.length > 0) {
      // Analyze patterns in top titles
      const topTitles = data.organic_results.slice(0, 5).map((r: any) => r.title);
      if (topTitles.some((t: string) => t.includes('おすすめ'))) {
        title = `【2025年最新】${mainKeyword}のおすすめ5選と選び方`;
      } else if (topTitles.some((t: string) => t.includes('方法'))) {
        title = `${mainKeyword}の方法・手順を徹底解説【初心者向け】`;
      } else if (topTitles.some((t: string) => t.includes('比較'))) {
        title = `${mainKeyword}を徹底比較！失敗しない選び方ガイド`;
      }
    }
    
    // Generate headline structure based on content type and keyword
    const headlineStructure = [
      {
        level: 1,
        headline: title,
        keyPoints: [`${mainKeyword}の概要`, '記事の目的と内容'],
      },
      {
        level: 2,
        headline: `${mainKeyword}とは？基本的な理解`,
        keyPoints: ['定義と基本概念', '重要性と背景'],
      },
      {
        level: 2,
        headline: `${mainKeyword}の主なメリット`,
        keyPoints: ['具体的なメリット3-5点', '実例や統計データ'],
      },
      {
        level: 2,
        headline: `${mainKeyword}の選び方・ポイント`,
        keyPoints: ['選択基準', '注意点', '専門家のアドバイス'],
      },
      {
        level: 2,
        headline: `${mainKeyword}のおすすめ5選`,
        keyPoints: ['各選択肢の詳細説明', '特徴と利点', '価格情報'],
      },
      {
        level: 2,
        headline: `${mainKeyword}に関するよくある質問`,
        keyPoints: ['FAQ形式で5-7つの質問と回答'],
      },
      {
        level: 2,
        headline: `まとめ：${mainKeyword}の活用法`,
        keyPoints: ['記事の要点まとめ', '次のステップ', 'リソース紹介'],
      },
    ];
    
    // Adjust headline structure based on content type if provided
    if (contentType) {
      if (contentType.includes('ハウツー')) {
        headlineStructure[3] = {
          level: 2,
          headline: `${mainKeyword}の手順・ステップ`,
          keyPoints: ['準備するもの', 'ステップバイステップの解説', '注意点'],
        };
        headlineStructure[4] = {
          level: 2,
          headline: `${mainKeyword}の応用テクニック`,
          keyPoints: ['上級者向けのコツ', '効率化のポイント'],
        };
      } else if (contentType.includes('比較')) {
        headlineStructure[3] = {
          level: 2,
          headline: `${mainKeyword}の比較ポイント`,
          keyPoints: ['比較基準', '評価方法'],
        };
        headlineStructure[4] = {
          level: 2,
          headline: `${mainKeyword}の種類別比較表`,
          keyPoints: ['詳細な比較表', '各項目の解説'],
        };
      }
    }
    
    // Generate meta description
    const metaDescription = `${mainKeyword}について徹底解説。基本から応用まで、初心者にもわかりやすく解説します。選び方のポイントやおすすめ商品も紹介。`;
    
    // Determine keywords to include based on related searches and questions
    const keywordsToInclude = [
      mainKeyword,
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
    
    // Estimate word count based on headline structure and content type
    const estimatedWordCount = contentType && contentType.includes('ハウツー') 
      ? 2000 
      : contentType && contentType.includes('比較') 
        ? 3000 
        : 2500;
    
    const result = {
      title,
      metaDescription,
      headlineStructure,
      keywordsToInclude,
      contentRecommendations,
      estimatedWordCount,
    };
    
    logger.info('SEO content plan created successfully', { 
      mainKeyword, 
      title 
    });
    
    return res.status(200).json(result);
  } catch (error: unknown) {
    logger.error('Error creating SEO content plan', { error });
    
    return res.status(500).json({
      code: 500,
      message: 'Error creating SEO content plan',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
