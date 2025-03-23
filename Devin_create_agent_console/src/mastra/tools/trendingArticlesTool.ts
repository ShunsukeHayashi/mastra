import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Import but don't re-export to avoid naming conflicts
import './noteApiTools';

// Note.com API base URL
const NOTE_API_BASE_URL = 'https://note.com/api';

// Popular categories for trending content
const POPULAR_CATEGORIES = [
  '自己啓発', // Self-improvement
  '書籍紹介', // Book introductions
  'ビジネス', // Business
  'マーケティング', // Marketing
  'プログラミング', // Programming
  'デザイン', // Design
  'ライフスタイル', // Lifestyle
  '健康', // Health
  '投資', // Investment
  'AI', // AI
];

/**
 * Tool to get trending articles across popular categories
 * This tool fetches trending articles from note.com across multiple popular categories
 * and generates rankings based on popularity metrics
 */
export const getTrendingArticlesTool = createTool({
  id: 'get-trending-articles',
  description: 'Get trending articles across popular categories on Note.com',
  inputSchema: z.object({
    limit: z.number().optional().describe('Number of articles per category (default: 5)'),
    categories: z.array(z.string()).optional().describe('Specific categories to search (default: all popular categories)'),
  }),
  outputSchema: z.object({
    trendingArticles: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        author: z.string(),
        url: z.string(),
        category: z.string(),
        publishedAt: z.string(),
        likeCount: z.number().optional(),
        commentCount: z.number().optional(),
      })
    ),
    categoryRankings: z.array(
      z.object({
        category: z.string(),
        articleCount: z.number(),
        averageLikes: z.number(),
      })
    ),
  }),
  execute: async ({ context }) => {
    try {
      const limit = context.limit || 5;
      const categories = context.categories || POPULAR_CATEGORIES;
      const trendingArticles: Array<{
        id: string;
        title: string;
        author: string;
        url: string;
        category: string;
        publishedAt: string;
        likeCount?: number;
        commentCount?: number;
      }> = [];
      const categoryStats: Record<string, { articleCount: number; totalLikes: number }> = {};
      
      // Fetch articles for each category
      for (const category of categories) {
        const encodedCategory = encodeURIComponent(category);
        const url = `${NOTE_API_BASE_URL}/v3/searches?context=user&q=${encodedCategory}&size=${limit}&start=0`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.warn(`Failed to fetch articles for category ${category}: ${response.status} ${response.statusText}`);
          continue;
        }
        
        const data = await response.json();
        const articles = data.data?.notes || [];
        
        // Initialize category stats
        if (!categoryStats[category]) {
          categoryStats[category] = {
            articleCount: 0,
            totalLikes: 0,
          };
        }
        
        // Process articles
        for (const article of articles) {
          const likeCount = article.like_count || 0;
          
          trendingArticles.push({
            id: article.id || '',
            title: article.name || article.title || 'Unknown Title',
            author: article.user?.nickname || 'Unknown',
            url: article.user?.urlname && article.key 
              ? `https://note.com/${article.user.urlname}/n/${article.key}`
              : '#',
            category,
            publishedAt: article.publishAt || article.created_at || new Date().toISOString(),
            likeCount,
            commentCount: article.comment_count || 0,
          });
          
          // Update category stats
          categoryStats[category].articleCount += 1;
          categoryStats[category].totalLikes += likeCount;
        }
      }
      
      // Sort articles by like count (descending)
      trendingArticles.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      
      // Generate category rankings
      const categoryRankings = Object.entries(categoryStats).map(([category, stats]: [string, { articleCount: number; totalLikes: number }]) => ({
        category,
        articleCount: stats.articleCount,
        averageLikes: stats.articleCount > 0 ? Math.round(stats.totalLikes / stats.articleCount) : 0,
      }));
      
      // Sort category rankings by average likes (descending)
      categoryRankings.sort((a, b) => b.averageLikes - a.averageLikes);
      
      return {
        trendingArticles,
        categoryRankings,
      };
    } catch (error: unknown) {
      console.error('Error getting trending articles:', error);
      throw new Error(`Error getting trending articles: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

/**
 * Tool to analyze trending themes from note.com articles
 * This tool identifies common themes and topics across trending articles
 */
export const analyzeTrendingThemesTool = createTool({
  id: 'analyze-trending-themes',
  description: 'Analyze trending themes and topics from popular Note.com articles',
  inputSchema: z.object({
    articles: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        category: z.string().optional(),
      })
    ).describe('Array of articles to analyze'),
  }),
  outputSchema: z.object({
    themes: z.array(
      z.object({
        name: z.string(),
        keywords: z.array(z.string()),
        relevanceScore: z.number(),
        categories: z.array(z.string()),
      })
    ),
    recommendedTopics: z.array(
      z.object({
        topic: z.string(),
        estimatedPopularity: z.number(),
        relatedCategories: z.array(z.string()),
      })
    ),
  }),
  execute: async ({ context }) => {
    try {
      // Extract titles for analysis
      const titles = context.articles.map(article => article.title);
      const categories = context.articles.map(article => article.category || 'unknown');
      
      // Simple keyword extraction (in a real implementation, this would use NLP)
      const keywordMap: Record<string, { count: number; categories: Set<string> }> = {};
      
      // Extract keywords from titles (simplified implementation)
      titles.forEach((title, index) => {
        const words = title.split(/\s+/).filter(word => 
          word.length > 1 && 
          !['の', 'に', 'は', 'を', 'が', 'と', 'で', 'から', 'より', 'による'].includes(word)
        );
        
        words.forEach(word => {
          if (!keywordMap[word]) {
            keywordMap[word] = { count: 0, categories: new Set() };
          }
          keywordMap[word].count += 1;
          if (categories[index] !== 'unknown') {
            keywordMap[word].categories.add(categories[index]);
          }
        });
      });
      
      // Generate themes based on keyword co-occurrence
      const themes = Object.entries(keywordMap)
        .filter(([_, data]) => data.count > 1)
        .map(([keyword, data]) => ({
          name: keyword,
          keywords: [keyword],
          relevanceScore: data.count,
          categories: Array.from(data.categories),
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10);
      
      // Generate recommended topics
      const recommendedTopics = themes.map(theme => ({
        topic: `${theme.name}に関する${theme.categories[0] || ''}`,
        estimatedPopularity: theme.relevanceScore * 10,
        relatedCategories: theme.categories,
      }));
      
      return {
        themes,
        recommendedTopics,
      };
    } catch (error: unknown) {
      console.error('Error analyzing trending themes:', error);
      throw new Error(`Error analyzing trending themes: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

/**
 * Tool to schedule periodic trending article retrieval
 * This tool sets up a schedule to periodically fetch trending articles
 */
export const scheduleTrendingRetrievalTool = createTool({
  id: 'schedule-trending-retrieval',
  description: 'Schedule periodic retrieval of trending articles from Note.com',
  inputSchema: z.object({
    intervalHours: z.number().min(1).max(24).default(6).describe('Interval in hours between retrievals'),
    categories: z.array(z.string()).optional().describe('Specific categories to monitor'),
    limit: z.number().optional().default(10).describe('Number of articles per category'),
  }),
  outputSchema: z.object({
    scheduleId: z.string(),
    nextRetrievalTime: z.string(),
    categories: z.array(z.string()),
    intervalHours: z.number(),
  }),
  execute: async ({ context }) => {
    try {
      const intervalHours = context.intervalHours || 6;
      const categories = context.categories || POPULAR_CATEGORIES;
      const limit = context.limit || 10;
      
      // In a real implementation, this would set up a scheduled job
      // For now, we'll just return the schedule details
      const scheduleId = `trending-schedule-${Date.now()}`;
      const nextRetrievalTime = new Date(Date.now() + intervalHours * 60 * 60 * 1000).toISOString();
      
      // Log the schedule creation (in a real implementation, this would be stored)
      console.log(`Created trending article retrieval schedule: ${scheduleId}`);
      console.log(`Next retrieval at: ${nextRetrievalTime}`);
      console.log(`Categories: ${categories.join(', ')}`);
      console.log(`Articles per category: ${limit}`);
      
      return {
        scheduleId,
        nextRetrievalTime,
        categories,
        intervalHours,
      };
    } catch (error: unknown) {
      console.error('Error scheduling trending article retrieval:', error);
      throw new Error(`Error scheduling trending article retrieval: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});
