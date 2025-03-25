import express from 'express';
import { z } from 'zod';
import { validateRequest } from './middleware';
import { searchNoteHandler, getNoteDetailsHandler } from './noteHandlers';
import { serpSearchHandler, analyzeCompetitorsHandler, createSeoPlanHandler } from './serpHandlers';
import { 
  uploadContractHandler, 
  legalCheckHandler, 
  setupApprovalHandler, 
  finalizeContractHandler, 
  listContractsHandler 
} from './contractHandlers';

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

// Schema validation for Contract API endpoints
const uploadContractSchema = z.object({
  body: z.object({
    fileName: z.string().min(1, 'ファイル名は必須です'),
    fileContent: z.string().min(1, 'ファイル内容は必須です'),
    fileType: z.enum(['pdf', 'docx', 'doc'], {
      errorMap: () => ({ message: 'ファイルタイプは pdf, docx, doc のいずれかである必要があります' }),
    }),
  }),
});

const legalCheckSchema = z.object({
  body: z.object({
    contractId: z.string().min(1, 'コントラクトIDは必須です'),
    contractContent: z.string().min(1, 'コントラクト内容は必須です'),
  }),
});

const setupApprovalSchema = z.object({
  body: z.object({
    contractId: z.string().min(1, 'コントラクトIDは必須です'),
    contractType: z.string().min(1, 'コントラクトタイプは必須です'),
    riskLevel: z.enum(['low', 'medium', 'high'], {
      errorMap: () => ({ message: 'リスクレベルは low, medium, high のいずれかである必要があります' }),
    }),
    approvers: z.array(z.object({
      name: z.string(),
      email: z.string().email('有効なメールアドレスを入力してください'),
      role: z.string(),
    })).optional(),
  }),
});

const finalizeContractSchema = z.object({
  body: z.object({
    contractId: z.string().min(1, 'コントラクトIDは必須です'),
    workflowId: z.string().min(1, 'ワークフローIDは必須です'),
  }),
});

const listContractsSchema = z.object({
  body: z.object({
    status: z.enum(['all', 'draft', 'pending', 'approved', 'rejected']).optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }),
});

// Note.com API routes
router.post('/search-note', validateRequest(searchNoteSchema) as any, searchNoteHandler);
router.post('/note-details', validateRequest(getNoteDetailsSchema) as any, getNoteDetailsHandler);

// SerpAPI routes
router.post('/serp-search', validateRequest(serpSearchSchema) as any, serpSearchHandler);
router.post('/analyze-competitors', validateRequest(analyzeCompetitorsSchema) as any, analyzeCompetitorsHandler);
router.post('/create-seo-plan', validateRequest(createSeoPlanSchema) as any, createSeoPlanHandler);

// Contract API routes
router.post('/contracts/upload', validateRequest(uploadContractSchema) as any, uploadContractHandler);
router.post('/contracts/legal-check', validateRequest(legalCheckSchema) as any, legalCheckHandler);
router.post('/contracts/approval', validateRequest(setupApprovalSchema) as any, setupApprovalHandler);
router.post('/contracts/finalize', validateRequest(finalizeContractSchema) as any, finalizeContractHandler);
router.post('/contracts/list', validateRequest(listContractsSchema) as any, listContractsHandler);

export default router;
