import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Note.com API base URL
const NOTE_API_BASE_URL = 'https://note.com/api';

/**
 * Tool to search for articles by keyword
 */
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
        const errorText = await response.text();
        throw new Error(`Failed to search articles: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Transform the response to match our output schema
      // Note: This is a mock transformation since we don't know the exact response structure
      // In a real implementation, you would map the actual response fields
      const articles = data.data?.notes?.map((note: any) => ({
        id: note.id || '',
        title: note.name || note.title || 'Unknown Title',
        author: note.user?.nickname || 'Unknown',
        url: note.user?.urlname && note.key 
          ? `https://note.com/${note.user.urlname}/n/${note.key}`
          : '#',
        publishedAt: note.publishAt || note.created_at || new Date().toISOString(),
      })) || [];
      
      return {
        articles,
        totalCount: data.data?.totalCount || articles.length,
      };
    } catch (error) {
      console.error('Error searching Note.com articles:', error);
      throw new Error(`Error searching Note.com articles: ${error.message}`);
    }
  },
});

/**
 * Tool to get article details by ID
 */
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
        const errorText = await response.text();
        throw new Error(`Failed to get article details: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Transform the response to match our output schema
      return {
        id: data.data?.id || context.articleId,
        title: data.data?.name || data.data?.title || 'Unknown Title',
        content: data.data?.body || data.data?.content || 'No content available',
        author: data.data?.user?.nickname || 'Unknown Author',
        url: data.data?.user?.urlname && data.data?.key 
          ? `https://note.com/${data.data.user.urlname}/n/${data.data.key}`
          : '#',
        publishedAt: data.data?.publishAt || data.data?.created_at || new Date().toISOString(),
        tags: data.data?.tags?.map((tag: any) => tag.name) || [],
      };
    } catch (error) {
      console.error('Error getting Note.com article details:', error);
      throw new Error(`Error getting Note.com article details: ${error.message}`);
    }
  },
});

/**
 * Tool to save a draft note
 */
export const saveDraftNoteTool = createTool({
  id: 'save-draft-note',
  description: 'Save a note as draft on Note.com',
  inputSchema: z.object({
    title: z.string().describe('Title of the note'),
    body: z.string().describe('Content of the note'),
    eyecatch: z.string().optional().describe('URL or base64 of the eyecatch image'),
  }),
  outputSchema: z.object({
    id: z.string(),
    key: z.string(),
    success: z.boolean(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const url = `${NOTE_API_BASE_URL}/v1/text_notes/draft_save`;
      
      const requestBody = {
        title: context.title,
        body: context.body,
        status: 'draft',
      };
      
      if (context.eyecatch) {
        requestBody['eyecatch'] = context.eyecatch;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save draft note: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      return {
        id: data.id || '',
        key: data.key || '',
        success: true,
        message: 'Draft note saved successfully',
      };
    } catch (error) {
      console.error('Error saving draft note:', error);
      return {
        id: '',
        key: '',
        success: false,
        message: `Error saving draft note: ${error.message}`,
      };
    }
  },
});

/**
 * Tool to get comments for a note
 */
export const getNoteCommentsTool = createTool({
  id: 'get-note-comments',
  description: 'Get comments for a specific Note.com article',
  inputSchema: z.object({
    noteId: z.string().describe('ID of the note'),
  }),
  outputSchema: z.object({
    comments: z.array(
      z.object({
        id: z.string(),
        body: z.string(),
        createdAt: z.string(),
        author: z.object({
          id: z.string(),
          nickname: z.string(),
          profileImageUrl: z.string().optional(),
        }),
      })
    ),
    totalCount: z.number(),
  }),
  execute: async ({ context }) => {
    try {
      const url = `${NOTE_API_BASE_URL}/v1/note/${context.noteId}/comments`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get note comments: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Transform the response to match our output schema
      const comments = data.comments?.map((comment: any) => ({
        id: comment.id || '',
        body: comment.body || '',
        createdAt: comment.created_at || new Date().toISOString(),
        author: {
          id: comment.user?.id || '',
          nickname: comment.user?.nickname || 'Unknown',
          profileImageUrl: comment.user?.profile_image_url,
        },
      })) || [];
      
      return {
        comments,
        totalCount: data.total || comments.length,
      };
    } catch (error) {
      console.error('Error getting note comments:', error);
      throw new Error(`Error getting note comments: ${error.message}`);
    }
  },
});

/**
 * Tool to get creator details
 */
export const getCreatorDetailsTool = createTool({
  id: 'get-creator-details',
  description: 'Get details about a specific Note.com creator',
  inputSchema: z.object({
    username: z.string().describe('Username of the creator'),
  }),
  outputSchema: z.object({
    id: z.string(),
    nickname: z.string(),
    username: z.string(),
    profileImageUrl: z.string().optional(),
    description: z.string().optional(),
    followerCount: z.number(),
    followingCount: z.number(),
    noteCount: z.number(),
  }),
  execute: async ({ context }) => {
    try {
      const url = `${NOTE_API_BASE_URL}/v2/creators/${context.username}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get creator details: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Transform the response to match our output schema
      return {
        id: data.data?.id || '',
        nickname: data.data?.nickname || 'Unknown',
        username: data.data?.name || context.username,
        profileImageUrl: data.data?.profile_image_url,
        description: data.data?.description || '',
        followerCount: data.data?.follower_count || 0,
        followingCount: data.data?.following_count || 0,
        noteCount: data.data?.note_count || 0,
      };
    } catch (error) {
      console.error('Error getting creator details:', error);
      throw new Error(`Error getting creator details: ${error.message}`);
    }
  },
});

/**
 * Tool to get creator's content
 */
export const getCreatorContentsTool = createTool({
  id: 'get-creator-contents',
  description: 'Get content for a specific Note.com creator',
  inputSchema: z.object({
    kind: z.string().optional().describe('Type of content (note, etc.)'),
    page: z.number().optional().describe('Page number'),
  }),
  outputSchema: z.object({
    contents: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        url: z.string(),
        publishedAt: z.string(),
      })
    ),
    totalCount: z.number(),
  }),
  execute: async ({ context }) => {
    try {
      const params = new URLSearchParams();
      if (context.kind) {
        params.append('kind', context.kind);
      }
      if (context.page) {
        params.append('page', context.page.toString());
      }
      
      const url = `${NOTE_API_BASE_URL}/v2/creators/info/contents?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get creator contents: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Transform the response to match our output schema
      const contents = data.data?.contents?.map((content: any) => ({
        id: content.id || '',
        title: content.name || content.title || 'Unknown Title',
        url: content.user?.urlname && content.key 
          ? `https://note.com/${content.user.urlname}/n/${content.key}`
          : '#',
        publishedAt: content.publishAt || content.created_at || new Date().toISOString(),
      })) || [];
      
      return {
        contents,
        totalCount: data.data?.totalCount || contents.length,
      };
    } catch (error) {
      console.error('Error getting creator contents:', error);
      throw new Error(`Error getting creator contents: ${error.message}`);
    }
  },
});
