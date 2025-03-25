import { Request, Response } from 'express';
import { logger } from '../utils/logger';

// Note.com API base URL
const NOTE_API_BASE_URL = 'https://note.com/api';

/**
 * Handler for searching Note.com articles
 */
export const searchNoteHandler = async (req: Request, res: Response) => {
  try {
    const { keyword, size = 10, start = 0 } = req.body;
    
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
    const articles = data.data?.notes?.map((note: any) => ({
      id: note.id || '',
      title: note.name || note.title || 'Unknown Title',
      author: note.user?.nickname || 'Unknown',
      url: note.user?.urlname && note.key 
        ? `https://note.com/${note.user.urlname}/n/${note.key}`
        : '#',
      publishedAt: note.publishAt || note.created_at || new Date().toISOString(),
    })) || [];
    
    logger.info('Note.com search successful', { 
      keyword, 
      resultCount: articles.length 
    });
    
    return res.status(200).json({
      articles,
      totalCount: data.data?.totalCount || articles.length,
    });
  } catch (error: unknown) {
    logger.error('Error searching Note.com articles', { error });
    
    return res.status(500).json({
      code: 500,
      message: 'Error searching Note.com articles',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Handler for getting Note.com article details
 */
export const getNoteDetailsHandler = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.body;
    
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
      tags: data.data?.tags?.map((tag: any) => tag.name) || [],
    };
    
    logger.info('Note.com article details retrieved successfully', { 
      articleId, 
      title: article.title 
    });
    
    return res.status(200).json(article);
  } catch (error: unknown) {
    logger.error('Error getting Note.com article details', { error });
    
    return res.status(500).json({
      code: 500,
      message: 'Error getting Note.com article details',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
