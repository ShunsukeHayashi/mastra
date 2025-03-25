import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { contractAgent } from './contractAgent';

export { contractAgent };

// Note.com API base URL
const NOTE_API_BASE_URL = 'https://note.com/api';

// Tool to search for articles by keyword
export const searchNoteArticlesTool = createTool({
  id: 'search-note-articles',
  description: 'Search for articles on Note.com by keyword',
  inputSchema: z.object({
    keyword: z.string().describe('Keyword to search for'),
    size: z.number().optional().describe('Number of results to return (default: 10)'),
    start: z.number().optional().describe('Starting index for pagination (default: 0)'),
  }),
  outputSchema: z.object({
    articles: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        author: z.string(),
        url: z.string(),
        publishedAt: z.string(),
      })
    ),
    totalCount: z.number(),
  }),
  execute: async ({ context }) => {
    try {
      const size = context.size || 10;
      const start = context.start || 0;
      const encodedKeyword = encodeURIComponent(context.keyword);
      
      const url = `${NOTE_API_BASE_URL}/v3/searches?context=user&q=${encodedKeyword}&size=${size}&start=${start}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to search articles: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the response to match our output schema
      // Note: This is a mock transformation since we don't know the exact response structure
      // In a real implementation, you would map the actual response fields
      const articles = data.data?.notes?.map((note: any) => ({
        id: note.id,
        title: note.name || note.title,
        author: note.user?.nickname || 'Unknown',
        url: `https://note.com/${note.user?.urlname}/n/${note.key}`,
        publishedAt: note.publishAt || note.created_at,
      })) || [];
      
      return {
        articles,
        totalCount: data.data?.totalCount || articles.length,
      };
    } catch (error) {
      console.error('Error searching Note.com articles:', error);
      throw error;
    }
  },
});

// Tool to get article details by ID
export const getNoteArticleDetailsTool = createTool({
  id: 'get-note-article-details',
  description: 'Get detailed information about a specific Note.com article',
  inputSchema: z.object({
    articleId: z.string().describe('ID of the article to retrieve'),
  }),
  outputSchema: z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    author: z.string(),
    url: z.string(),
    publishedAt: z.string(),
    tags: z.array(z.string()).optional(),
  }),
  execute: async ({ context }) => {
    try {
      const url = `${NOTE_API_BASE_URL}/v3/notes/${context.articleId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get article details: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the response to match our output schema
      // Note: This is a mock transformation since we don't know the exact response structure
      return {
        id: data.data?.id || context.articleId,
        title: data.data?.name || data.data?.title || 'Unknown Title',
        content: data.data?.body || data.data?.content || 'No content available',
        author: data.data?.user?.nickname || 'Unknown Author',
        url: `https://note.com/${data.data?.user?.urlname}/n/${data.data?.key}`,
        publishedAt: data.data?.publishAt || data.data?.created_at || new Date().toISOString(),
        tags: data.data?.tags?.map((tag: any) => tag.name) || [],
      };
    } catch (error) {
      console.error('Error getting Note.com article details:', error);
      throw error;
    }
  },
});

// Note.com Agent
export const noteAgent = new Agent({
  name: 'Note.com Agent',
  instructions: `
      あなたはNote.comの記事を検索したり詳細情報を取得したりするのを手伝う便利なアシスタントです。

      主な機能は、ユーザーがNote.comの記事を見つけて読むのを支援することです。応答する際は：
      - キーワードが提供されていない場合は、常に検索キーワードを尋ねてください
      - 検索結果が多い場合は、最も関連性の高い記事を優先して表示してください
      - 記事の詳細を要求された場合は、タイトル、著者、内容の要約を含めてください
      - 応答は簡潔かつ情報豊富に保ってください
      - 日本語で応答してください

      記事を検索するには searchNoteArticlesTool を使用し、記事の詳細を取得するには getNoteArticleDetailsTool を使用してください。
`,
  model: anthropic('claude-3-5-sonnet-20241022'),
  tools: { searchNoteArticlesTool, getNoteArticleDetailsTool },
});
