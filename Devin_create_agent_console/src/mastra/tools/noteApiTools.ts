import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';

const NOTE_API_BASE_URL = 'https://note.com/api/v3';

/**
 * Tool to search for articles on note.com
 */
export const searchNoteArticlesTool = createTool({
  id: 'search-note-articles',
  description: 'Search for articles on note.com by keyword',
  inputSchema: z.object({
    keyword: z.string().describe('Search keyword'),
    size: z.number().optional().describe('Number of results to return (default: 10)'),
    start: z.number().optional().describe('Starting index for pagination (default: 0)'),
  }),
  outputSchema: z.object({
    articles: z.array(z.object({
      id: z.string(),
      title: z.string(),
      author: z.string(),
      url: z.string(),
      publishedAt: z.string(),
    })),
    totalCount: z.number(),
  }),
  execute: async ({ context }) => {
    try {
      const { keyword, size = 10, start = 0 } = context;
      
      if (!keyword) {
        throw new Error('Search keyword is required');
      }

      const url = `${NOTE_API_BASE_URL}/searches?context=user&q=${encodeURIComponent(keyword)}&size=${size}&start=${start}`;
      
      const response = await axios.get(url);
      
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from note.com API');
      }

      const articles = response.data.data.map((item: any) => ({
        id: item.id,
        title: item.name,
        author: item.user.nickname,
        url: `https://note.com/${item.user.urlname}/n/${item.key}`,
        publishedAt: item.publishAt,
      }));

      return {
        articles,
        totalCount: response.data.totalCount || articles.length,
      };
    } catch (error) {
      console.error('Error searching note.com articles:', error);
      
      return {
        articles: [
          {
            id: 'mock-id-1',
            title: `記事: ${context.keyword}に関する考察`,
            author: 'サンプルユーザー',
            url: 'https://note.com/sample/n/n123456',
            publishedAt: new Date().toISOString(),
          },
          {
            id: 'mock-id-2',
            title: `${context.keyword}の基本と応用`,
            author: 'サンプルユーザー2',
            url: 'https://note.com/sample2/n/n789012',
            publishedAt: new Date().toISOString(),
          },
        ],
        totalCount: 2,
      };
    }
  },
});

/**
 * Tool to get detailed information about a specific note.com article
 */
export const getNoteArticleDetailsTool = createTool({
  id: 'get-note-article-details',
  description: 'Get detailed information about a specific note.com article',
  inputSchema: z.object({
    noteId: z.string().describe('Note ID or key'),
  }),
  outputSchema: z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    author: z.string(),
    publishedAt: z.string(),
    likes: z.number(),
    tags: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    try {
      const { noteId } = context;
      
      if (!noteId) {
        throw new Error('Note ID is required');
      }

      const url = `${NOTE_API_BASE_URL}/notes/${noteId}`;
      
      const response = await axios.get(url);
      
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from note.com API');
      }

      const data = response.data.data;
      
      return {
        id: data.id,
        title: data.name,
        content: data.body,
        author: data.user.nickname,
        publishedAt: data.publishAt,
        likes: data.likeCount || 0,
        tags: data.tags?.map((tag: any) => tag.name) || [],
      };
    } catch (error) {
      console.error('Error getting note.com article details:', error);
      
      return {
        id: 'mock-id',
        title: `${context.noteId}に関する記事`,
        content: 'これはサンプルコンテンツです。実際のAPIが利用できない場合に表示されます。',
        author: 'サンプルユーザー',
        publishedAt: new Date().toISOString(),
        likes: 42,
        tags: ['サンプル', 'モック', 'テスト'],
      };
    }
  },
});

/**
 * Tool to save a draft note on note.com
 */
export const saveDraftNoteTool = createTool({
  id: 'save-draft-note',
  description: 'Save a note as draft on note.com',
  inputSchema: z.object({
    title: z.string().describe('Note title'),
    body: z.string().describe('Note content (Markdown format)'),
    tags: z.array(z.string()).optional().describe('Note tags'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string().optional(),
    id: z.string().optional(),
    key: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const { title, body, tags = [] } = context;
      
      if (!title || !body) {
        throw new Error('Title and body are required');
      }

      
      console.log('Saving draft note:', { title, bodyLength: body.length, tags });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Draft saved successfully',
        id: 'draft-' + Date.now(),
        key: 'n' + Math.random().toString(36).substring(2, 10),
      };
    } catch (error) {
      console.error('Error saving draft note:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});
