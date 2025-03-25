import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Import handler function types
type RequestHandler = (req: Request, res: Response) => Promise<any>;

// Import original handlers
import { 
  uploadContractHandler as originalUploadHandler, 
  legalCheckHandler as originalLegalHandler, 
  setupApprovalHandler as originalApprovalHandler, 
  finalizeContractHandler as originalFinalizeHandler, 
  listContractsHandler as originalListHandler 
} from '../mastra/api/contractHandlers';

// Wrap handlers to match Express middleware pattern
const uploadContractHandler: express.RequestHandler = (req, res, next) => {
  originalUploadHandler(req, res).catch(next);
};

const legalCheckHandler: express.RequestHandler = (req, res, next) => {
  originalLegalHandler(req, res).catch(next);
};

const setupApprovalHandler: express.RequestHandler = (req, res, next) => {
  originalApprovalHandler(req, res).catch(next);
};

const finalizeContractHandler: express.RequestHandler = (req, res, next) => {
  originalFinalizeHandler(req, res).catch(next);
};

const listContractsHandler: express.RequestHandler = (req, res, next) => {
  originalListHandler(req, res).catch(next);
};

const router = express.Router();

// Schema validation middleware
const validateRequest = (schema: z.ZodType<any, any>) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          code: 400,
          message: 'Validation error',
          details: error.errors,
        });
      }
      next(error);
    }
  };
};

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

// Contract API routes
router.post('/contracts/upload', validateRequest(uploadContractSchema) as express.RequestHandler, uploadContractHandler);
router.post('/contracts/legal-check', validateRequest(legalCheckSchema) as express.RequestHandler, legalCheckHandler);
router.post('/contracts/approval', validateRequest(setupApprovalSchema) as express.RequestHandler, setupApprovalHandler);
router.post('/contracts/finalize', validateRequest(finalizeContractSchema) as express.RequestHandler, finalizeContractHandler);
router.get('/contracts/list', validateRequest(listContractsSchema) as express.RequestHandler, listContractsHandler);

export default router;
