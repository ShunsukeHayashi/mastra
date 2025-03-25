import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import fetch from 'node-fetch';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logger
const logger = {
  info: (message, meta) => console.info(`[INFO] ${message}`, meta || ''),
  error: (message, meta) => console.error(`[ERROR] ${message}`, meta || ''),
  warn: (message, meta) => console.warn(`[WARN] ${message}`, meta || ''),
  debug: (message, meta) => console.debug(`[DEBUG] ${message}`, meta || '')
};

// Create Express server
const app = express();
const port = process.env.PORT || 4112; // Use a different port

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info(`API request: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`API response: ${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  
  next();
};

app.use(requestLogger);

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  logger.error('API error', { error: err.message, stack: err.stack });
  
  // Handle specific error types
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized',
      details: err.message,
    });
  }
  
  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      code: 404,
      message: 'Resource not found',
      details: err.message,
    });
  }
  
  if (err.name === 'RateLimitError') {
    return res.status(429).json({
      code: 429,
      message: 'Too many requests',
      details: err.message,
    });
  }
  
  // Default to 500 internal server error
  return res.status(500).json({
    code: 500,
    message: 'Internal server error',
    details: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
};

// SerpAPI key from environment variable or fallback to provided key
const SERP_API_KEY = process.env.SERP_API_KEY || '58dce76654d38b381c90fd62cfb33a11576052d0d88943d804953f774a597439';

// Note.com API base URL
const NOTE_API_BASE_URL = 'https://note.com/api';

/**
 * Handler for SerpAPI search
 */
const serpSearchHandler = async (req, res) => {
  try {
    const { 
      query, 
      num = 10, 
      includeKnowledgeGraph = true, 
      includeRelatedQuestions = true 
    } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        code: 400,
        message: 'Validation failed',
        details: 'Query parameter is required and must be a string',
      });
    }
    
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
    const result = {
      organicResults: [],
      searchMetadata: {
        status: 'success',
        totalResults: data.search_information?.total_results 
          ? (typeof data.search_information.total_results === 'string'
              ? parseInt(data.search_information.total_results.replace(/,/g, ''), 10)
              : data.search_information.total_results)
          : undefined,
        searchTime: data.search_information?.time_taken_displayed,
        searchQuery: query,
      },
    };
    
    // Add organic results
    if (data.organic_results) {
      result.organicResults = data.organic_results.map((item) => ({
        position: item.position,
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        source: item.source,
      }));
    }
    
    // Add related questions if requested and available
    if (includeRelatedQuestions && data.related_questions) {
      result.relatedQuestions = data.related_questions.map((item) => ({
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
  } catch (error) {
    logger.error('Error executing SerpAPI search', { error });
    
    return res.status(500).json({
      code: 500,
      message: 'Error executing SerpAPI search',
      details: error.message,
    });
  }
};

/**
 * Handler for analyzing competitor content
 */
const analyzeCompetitorsHandler = async (req, res) => {
  try {
    const { keyword, siteFilter, numResults = 5 } = req.body;
    
    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({
        code: 400,
        message: 'Validation failed',
        details: 'Keyword parameter is required and must be a string',
      });
    }
    
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
      ? data.organic_results.slice(0, numResults).map((result) => ({
          title: result.title,
          url: result.link,
          snippet: result.snippet,
          position: result.position,
        }))
      : [];
    
    // Extract related keywords from related searches if available
    const suggestedKeywords = data.related_searches
      ? data.related_searches.map((item) => item.query)
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
  } catch (error) {
    logger.error('Error analyzing competitor content', { error });
    
    return res.status(500).json({
      code: 500,
      message: 'Error analyzing competitor content',
      details: error.message,
    });
  }
};

/**
 * Handler for creating SEO content plan
 */
const createSeoPlanHandler = async (req, res) => {
  try {
    const { 
      mainKeyword, 
      targetAudience, 
      contentType, 
      competitorUrls = [] 
    } = req.body;
    
    if (!mainKeyword || typeof mainKeyword !== 'string') {
      return res.status(400).json({
        code: 400,
        message: 'Validation failed',
        details: 'Main keyword parameter is required and must be a string',
      });
    }
    
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
    const relatedKeywords = [];
    
    if (data.related_searches) {
      data.related_searches.forEach((item) => {
        relatedKeywords.push(item.query);
      });
    }
    
    if (data.related_questions) {
      data.related_questions.forEach((item) => {
        relatedKeywords.push(item.question);
      });
    }
    
    // Generate a title based on top-ranking content patterns
    let title = `【完全ガイド】${mainKeyword}の基本から応用まで`;
    if (data.organic_results && data.organic_results.length > 0) {
      // Analyze patterns in top titles
      const topTitles = data.organic_results.slice(0, 5).map((r) => r.title);
      if (topTitles.some((t) => t.includes('おすすめ'))) {
        title = `【2025年最新】${mainKeyword}のおすすめ5選と選び方`;
      } else if (topTitles.some((t) => t.includes('方法'))) {
        title = `${mainKeyword}の方法・手順を徹底解説【初心者向け】`;
      } else if (topTitles.some((t) => t.includes('比較'))) {
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
  } catch (error) {
    logger.error('Error creating SEO content plan', { error });
    
    return res.status(500).json({
      code: 500,
      message: 'Error creating SEO content plan',
      details: error.message,
    });
  }
};

/**
 * Handler for searching Note.com articles
 */
const searchNoteHandler = async (req, res) => {
  try {
    const { keyword, size = 10, start = 0 } = req.body;
    
    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({
        code: 400,
        message: 'Validation failed',
        details: 'Keyword parameter is required and must be a string',
      });
    }
    
    logger.info('Searching Note.com articles', { keyword, size, start });
    
    const encodedKeyword = encodeURIComponent(keyword);
    const url = `${NOTE_API_BASE_URL}/v3/searches?context=user&q=${encodedKeyword}&size=${size}&start=${start}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Note.com API error', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorText 
      });
      
      return res.status(response.status).json({
        code: response.status,
        message: `Note.com API error: ${response.statusText}`,
        details: errorText,
      });
    }
    
    const data = await response.json();
    
    // Transform the response to match our output schema
    let articles = [];
    
    // Check if data structure matches expected format
    if (data.data?.notes && Array.isArray(data.data.notes)) {
      articles = data.data.notes.map((note) => ({
        id: note.id || '',
        title: note.name || note.title || 'Unknown Title',
        author: note.user?.nickname || 'Unknown',
        url: note.user?.urlname && note.key 
          ? `https://note.com/${note.user.urlname}/n/${note.key}`
          : '#',
        publishedAt: note.publishAt || note.created_at || new Date().toISOString(),
      }));
    } else if (data.data?.contents && Array.isArray(data.data.contents)) {
      // Alternative data structure
      articles = data.data.contents.map((note) => ({
        id: note.id || '',
        title: note.name || note.title || 'Unknown Title',
        author: note.user?.nickname || 'Unknown',
        url: note.user?.urlname && note.key 
          ? `https://note.com/${note.user.urlname}/n/${note.key}`
          : '#',
        publishedAt: note.publishAt || note.created_at || new Date().toISOString(),
      }));
    } else {
      logger.warn('Unexpected Note.com API response structure', { 
        dataKeys: Object.keys(data),
        dataDataKeys: data.data ? Object.keys(data.data) : null
      });
    }
    
    logger.info('Note.com search successful', { 
      keyword, 
      resultCount: articles.length 
    });
    
    return res.status(200).json({
      articles,
      totalCount: data.data?.totalCount || articles.length,
    });
  } catch (error) {
    logger.error('Error searching Note.com articles', { error });
    
    return res.status(500).json({
      code: 500,
      message: 'Error searching Note.com articles',
      details: error.message,
    });
  }
};

/**
 * Handler for getting Note.com article details
 */
const getNoteDetailsHandler = async (req, res) => {
  try {
    const { articleId } = req.body;
    
    if (!articleId || typeof articleId !== 'string') {
      return res.status(400).json({
        code: 400,
        message: 'Validation failed',
        details: 'Article ID parameter is required and must be a string',
      });
    }
    
    logger.info('Getting Note.com article details', { articleId });
    
    const url = `${NOTE_API_BASE_URL}/v3/notes/${articleId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 404) {
      logger.warn('Note.com article not found', { articleId });
      return res.status(404).json({
        code: 404,
        message: 'Article not found',
        details: `Article with ID ${articleId} not found`,
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Note.com API error', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorText 
      });
      
      return res.status(response.status).json({
        code: response.status,
        message: `Note.com API error: ${response.statusText}`,
        details: errorText,
      });
    }
    
    const data = await response.json();
    
    // Transform the response to match our output schema
    const article = {
      id: data.data?.id || articleId,
      title: data.data?.name || data.data?.title || 'Unknown Title',
      content: data.data?.body || data.data?.content || 'No content available',
      author: data.data?.user?.nickname || 'Unknown Author',
      url: data.data?.user?.urlname && data.data?.key 
        ? `https://note.com/${data.data.user.urlname}/n/${data.data.key}`
        : '#',
      publishedAt: data.data?.publishAt || data.data?.created_at || new Date().toISOString(),
      tags: data.data?.tags?.map((tag) => tag.name) || [],
    };
    
    logger.info('Note.com article details retrieved successfully', { 
      articleId, 
      title: article.title 
    });
    
    return res.status(200).json(article);
  } catch (error) {
    logger.error('Error getting Note.com article details', { error });
    
    return res.status(500).json({
      code: 500,
      message: 'Error getting Note.com article details',
      details: error.message,
    });
  }
};

// Set up API routes
app.post('/api/serp-search', serpSearchHandler);
app.post('/api/analyze-competitors', analyzeCompetitorsHandler);
app.post('/api/create-seo-plan', createSeoPlanHandler);
app.post('/api/search-note', searchNoteHandler);
app.post('/api/note-details', getNoteDetailsHandler);

// Set up Swagger UI
try {
  const openApiPath = path.join(__dirname, 'openapi.yaml');
  const openApiYaml = fs.readFileSync(openApiPath, 'utf8');
  const openApiSpec = YAML.parse(openApiYaml);
  
  app.use('/docs', swaggerUi.serve);
  app.get('/docs', swaggerUi.setup(openApiSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Mastra API Documentation',
    customfavIcon: '',
  }));
  
  logger.info('Swagger UI initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Swagger UI', { error });
  
  // Fallback route
  app.get('/docs', (req, res) => {
    res.status(500).json({
      code: 500,
      message: 'Failed to load API documentation',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  });
}

// Root route
app.get('/', (req, res) => {
  res.redirect('/docs');
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`API server running on port ${port}`);
  logger.info(`API documentation available at http://localhost:${port}/docs`);
});

export default app;
