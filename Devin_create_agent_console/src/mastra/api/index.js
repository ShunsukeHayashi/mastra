const express = require('express');
const { z } = require('zod');
const { validateRequest } = require('./middleware');
const { searchNoteHandler, getNoteDetailsHandler } = require('./noteHandlers');
const { serpSearchHandler, analyzeCompetitorsHandler, createSeoPlanHandler } = require('./serpHandlers');

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

// Note.com API routes
router.post('/search-note', validateRequest(searchNoteSchema), searchNoteHandler);
router.post('/note-details', validateRequest(getNoteDetailsSchema), getNoteDetailsHandler);

// SerpAPI routes
router.post('/serp-search', validateRequest(serpSearchSchema), serpSearchHandler);
router.post('/analyze-competitors', validateRequest(analyzeCompetitorsSchema), analyzeCompetitorsHandler);
router.post('/create-seo-plan', validateRequest(createSeoPlanSchema), createSeoPlanHandler);

module.exports = router;
