import express from 'express';
import { z } from 'zod';
import { validateRequest } from './middleware';
import { searchNoteHandler, getNoteDetailsHandler } from './noteHandlers';
import { serpSearchHandler, analyzeCompetitorsHandler, createSeoPlanHandler } from './serpHandlers';
import { processBusinessCardHandler, getWorkflowStatusHandler } from './businessCardHandlers';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Schema validation for Note.com API endpoints
const searchNoteSchema = z.object({
  body: z.object({
    keyword: z.string().min(1, 'Keyword is required'),
    size: z.number().optional(),
    start: z.number().optional(),
  }),
});

const getNoteDetailsSchema = z.object({
  body: z.object({
    articleId: z.string().min(1, 'Article ID is required'),
  }),
});

// Schema validation for SerpAPI endpoints
const serpSearchSchema = z.object({
  body: z.object({
    query: z.string().min(1, 'Search query is required'),
    num: z.number().optional(),
    includeKnowledgeGraph: z.boolean().optional(),
    includeRelatedQuestions: z.boolean().optional(),
  }),
});

const analyzeCompetitorsSchema = z.object({
  body: z.object({
    keyword: z.string().min(1, 'Keyword is required'),
    siteFilter: z.string().optional(),
    numResults: z.number().optional(),
  }),
});

const createSeoPlanSchema = z.object({
  body: z.object({
    mainKeyword: z.string().min(1, 'Main keyword is required'),
    targetAudience: z.string().optional(),
    contentType: z.string().optional(),
    competitorUrls: z.array(z.string()).optional(),
  }),
});

// Schema validation for Business Card API endpoints
const processBusinessCardSchema = z.object({
  body: z.object({
    imageBase64: z.string().min(1, '名刺画像が必要です'),
    senderName: z.string().min(1, '送信者の名前が必要です'),
    senderCompany: z.string().min(1, '送信者の会社名が必要です'),
    senderEmail: z.string().email('有効なメールアドレスを入力してください'),
    senderPosition: z.string().optional(),
    meetingContext: z.string().optional(),
    additionalNotes: z.string().optional(),
  }),
});

// Note.com API routes
router.post('/search-note', validateRequest(searchNoteSchema) as express.RequestHandler, searchNoteHandler as unknown as express.RequestHandler);
router.post('/note-details', validateRequest(getNoteDetailsSchema) as express.RequestHandler, getNoteDetailsHandler as unknown as express.RequestHandler);

// SerpAPI routes
router.post('/serp-search', validateRequest(serpSearchSchema) as express.RequestHandler, serpSearchHandler as unknown as express.RequestHandler);
router.post('/analyze-competitors', validateRequest(analyzeCompetitorsSchema) as express.RequestHandler, analyzeCompetitorsHandler as unknown as express.RequestHandler);
router.post('/create-seo-plan', validateRequest(createSeoPlanSchema) as express.RequestHandler, createSeoPlanHandler as unknown as express.RequestHandler);

// Business Card API routes
router.post('/business-card/process', validateRequest(processBusinessCardSchema) as express.RequestHandler, processBusinessCardHandler as unknown as express.RequestHandler);
router.get('/business-card/status/:workflowId', getWorkflowStatusHandler as unknown as express.RequestHandler);

// Serve business card UI
router.get('/business-card', (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'business-card.html');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.type('text/html').send(content);
  } catch (error) {
    console.error('Error serving business card UI:', error);
    res.status(500).send('Error loading business card UI');
  }
});

export default router;
