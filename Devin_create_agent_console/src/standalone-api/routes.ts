import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Import handler function types
type RequestHandler = (req: Request, res: Response) => Promise<any>;

// Import agent chat handler
import { agentChatHandler } from './handlers/agentChatHandler.js';

// Mock contract data store
const contracts = new Map<string, any>();

// Mock handlers for contract API endpoints
const uploadContractHandler: express.RequestHandler = (req, res, next) => {
  try {
    const { fileName, fileContent, fileType } = req.body;
    const contractId = `contract-${uuidv4().substring(0, 8)}`;
    
    // Store contract in mock database
    contracts.set(contractId, {
      contractId,
      fileName,
      fileType,
      uploadDate: new Date().toISOString(),
      status: 'pending',
      riskLevel: 'medium',
    });
    
    console.info(`[INFO] Contract uploaded: ${contractId}`);
    
    res.status(200).json({
      contractId,
      fileName,
      fileType,
      status: 'success',
      message: 'コントラクトが正常にアップロードされました',
    });
  } catch (error) {
    next(error);
  }
};

const legalCheckHandler: express.RequestHandler = (req, res, next) => {
  try {
    const { contractId, contractContent } = req.body;
    
    // Check if contract exists
    if (!contracts.has(contractId)) {
      return res.status(404).json({
        code: 404,
        message: '指定されたコントラクトが見つかりません',
      });
    }
    
    // Update contract with legal check results
    const contract = contracts.get(contractId);
    const riskLevel = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
    
    contract.riskLevel = riskLevel;
    contract.legalCheckDate = new Date().toISOString();
    
    console.info(`[INFO] Legal check completed for contract: ${contractId}`);
    
    res.status(200).json({
      contractId,
      riskLevel,
      issues: riskLevel === 'high' ? [
        { section: '第3条', description: '責任範囲が不明確です', severity: 'high' },
        { section: '第7条', description: '賠償額の上限が設定されていません', severity: 'medium' },
      ] : riskLevel === 'medium' ? [
        { section: '第5条', description: '知的財産権の帰属が曖昧です', severity: 'medium' },
      ] : [],
      status: 'success',
      message: 'リーガルチェックが完了しました',
    });
  } catch (error) {
    next(error);
  }
};

const setupApprovalHandler: express.RequestHandler = (req, res, next) => {
  try {
    const { contractId, contractType, riskLevel, approvers } = req.body;
    
    // Check if contract exists
    if (!contracts.has(contractId)) {
      return res.status(404).json({
        code: 404,
        message: '指定されたコントラクトが見つかりません',
      });
    }
    
    // Generate workflow ID
    const workflowId = `workflow-${uuidv4().substring(0, 8)}`;
    
    // Update contract with workflow info
    const contract = contracts.get(contractId);
    contract.workflowId = workflowId;
    contract.approvalStatus = 'pending';
    
    console.info(`[INFO] Approval workflow created for contract: ${contractId}`);
    
    // Generate approval steps based on risk level
    const steps = [];
    
    // Always add department manager
    steps.push({
      id: 1,
      role: '部門責任者',
      status: 'pending',
      email: 'manager@example.com',
    });
    
    // Add legal review for medium and high risk
    if (riskLevel === 'medium' || riskLevel === 'high') {
      steps.push({
        id: 2,
        role: '法務担当者',
        status: 'pending',
        email: 'legal@example.com',
      });
    }
    
    // Add executive review for high risk
    if (riskLevel === 'high') {
      steps.push({
        id: 3,
        role: '経営層',
        status: 'pending',
        email: 'executive@example.com',
      });
    }
    
    res.status(200).json({
      contractId,
      workflowId,
      steps,
      status: 'success',
      message: '承認ワークフローが設定されました',
    });
  } catch (error) {
    next(error);
  }
};

const finalizeContractHandler: express.RequestHandler = (req, res, next) => {
  try {
    const { contractId, workflowId } = req.body;
    
    // Check if contract exists
    if (!contracts.has(contractId)) {
      return res.status(404).json({
        code: 404,
        message: '指定されたコントラクトが見つかりません',
      });
    }
    
    // Update contract status
    const contract = contracts.get(contractId);
    contract.status = 'finalized';
    contract.finalizationDate = new Date().toISOString();
    
    console.info(`[INFO] Contract finalized: ${contractId}`);
    
    res.status(200).json({
      contractId,
      status: 'finalized',
      storageLocation: `https://storage.example.com/contracts/${contractId}`,
      message: 'コントラクトが締結され、保管されました',
    });
  } catch (error) {
    next(error);
  }
};

const listContractsHandler: express.RequestHandler = (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Convert contracts map to array
    let contractsList = Array.from(contracts.values());
    
    // Filter by status if provided
    if (status && status !== 'all') {
      contractsList = contractsList.filter(contract => contract.status === status);
    }
    
    // If no contracts in the store, return mock data
    if (contractsList.length === 0) {
      contractsList = [
        {
          contractId: 'contract-sample1',
          title: 'NDAサンプル契約',
          company: '株式会社A',
          status: 'pending',
          riskLevel: 'low',
          uploadDate: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          contractId: 'contract-sample2',
          title: '業務委託契約書',
          company: '株式会社B',
          status: 'approved',
          riskLevel: 'medium',
          uploadDate: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    }
    
    console.info(`[INFO] Listing contracts, count: ${contractsList.length}`);
    
    res.status(200).json({
      contracts: contractsList,
      pagination: {
        total: contractsList.length,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(contractsList.length / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
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

// Agent chat schema
const agentChatSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'メッセージは必須です'),
    conversationId: z.string().optional(),
  }),
});

// Contract API routes
router.post('/contracts/upload', validateRequest(uploadContractSchema) as express.RequestHandler, uploadContractHandler);
router.post('/contracts/legal-check', validateRequest(legalCheckSchema) as express.RequestHandler, legalCheckHandler);
router.post('/contracts/approval', validateRequest(setupApprovalSchema) as express.RequestHandler, setupApprovalHandler);
router.post('/contracts/finalize', validateRequest(finalizeContractSchema) as express.RequestHandler, finalizeContractHandler);
router.get('/contracts/list', validateRequest(listContractsSchema) as express.RequestHandler, listContractsHandler);

// Agent chat route
router.post('/contracts/agent-chat', validateRequest(agentChatSchema) as express.RequestHandler, agentChatHandler);

export default router;
