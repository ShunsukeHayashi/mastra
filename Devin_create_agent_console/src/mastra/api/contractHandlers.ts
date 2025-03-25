import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { mastra } from '../index';
import { 
  uploadContractTool, 
  legalCheckTool, 
  setupApprovalWorkflowTool, 
  finalizeContractTool 
} from '../tools/contractTools';

/**
 * Handler for uploading contract documents
 */
export const uploadContractHandler = async (req: Request, res: Response) => {
  try {
    const { fileName, fileContent, fileType } = req.body;
    
    logger.info('Uploading contract document', { fileName, fileType });
    
    const result = await uploadContractTool.execute({
      context: {
        fileName,
        fileContent,
        fileType,
      },
      mastra,
    });
    
    logger.info('Contract upload successful', { 
      contractId: result.contractId, 
      fileName: result.fileName 
    });
    
    return res.status(200).json(result);
  } catch (error: unknown) {
    logger.error('Error uploading contract', { error });
    
    return res.status(500).json({
      code: 500,
      message: 'コントラクトのアップロードに失敗しました',
      details: error instanceof Error ? error.message : '不明なエラーが発生しました',
    });
  }
};

/**
 * Handler for legal check on a contract
 */
export const legalCheckHandler = async (req: Request, res: Response) => {
  try {
    const { contractId, contractContent } = req.body;
    
    logger.info('Performing legal check on contract', { contractId });
    
    const result = await legalCheckTool.execute({
      context: {
        contractId,
        contractContent,
      },
      mastra,
    });
    
    logger.info('Legal check successful', { 
      contractId: result.contractId, 
      riskLevel: result.riskLevel,
      issuesCount: result.issues.length
    });
    
    return res.status(200).json(result);
  } catch (error: unknown) {
    logger.error('Error performing legal check', { error });
    
    return res.status(500).json({
      code: 500,
      message: 'リーガルチェックに失敗しました',
      details: error instanceof Error ? error.message : '不明なエラーが発生しました',
    });
  }
};

/**
 * Handler for setting up approval workflow
 */
export const setupApprovalHandler = async (req: Request, res: Response) => {
  try {
    const { contractId, contractType, riskLevel, approvers } = req.body;
    
    logger.info('Setting up approval workflow', { 
      contractId, 
      contractType, 
      riskLevel 
    });
    
    const result = await setupApprovalWorkflowTool.execute({
      context: {
        contractId,
        contractType,
        riskLevel,
        approvers,
      },
      mastra,
    });
    
    logger.info('Approval workflow setup successful', { 
      workflowId: result.workflowId, 
      contractId: result.contractId,
      stepsCount: result.steps.length
    });
    
    return res.status(200).json(result);
  } catch (error: unknown) {
    logger.error('Error setting up approval workflow', { error });
    
    return res.status(500).json({
      code: 500,
      message: '承認ワークフローの設定に失敗しました',
      details: error instanceof Error ? error.message : '不明なエラーが発生しました',
    });
  }
};

/**
 * Handler for finalizing a contract
 */
export const finalizeContractHandler = async (req: Request, res: Response) => {
  try {
    const { contractId, workflowId } = req.body;
    
    logger.info('Finalizing contract', { contractId, workflowId });
    
    const result = await finalizeContractTool.execute({
      context: {
        contractId,
        workflowId,
      },
      mastra,
    });
    
    logger.info('Contract finalization successful', { 
      contractId: result.contractId, 
      status: result.status,
      storageLocation: result.storageLocation
    });
    
    return res.status(200).json(result);
  } catch (error: unknown) {
    logger.error('Error finalizing contract', { error });
    
    return res.status(500).json({
      code: 500,
      message: 'コントラクトの最終処理に失敗しました',
      details: error instanceof Error ? error.message : '不明なエラーが発生しました',
    });
  }
};

/**
 * Handler for listing contracts
 */
export const listContractsHandler = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.body;
    
    logger.info('Listing contracts', { status, page, limit });
    
    // In a real implementation, this would fetch contracts from a database
    // For MVP, we'll return mock data
    
    const mockContracts = [
      {
        contractId: 'contract-001',
        title: 'NDAサンプル契約',
        parties: ['株式会社A', '株式会社B'],
        status: 'pending',
        riskLevel: 'low',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        contractId: 'contract-002',
        title: '業務委託契約書',
        parties: ['株式会社A', '株式会社C'],
        status: 'approved',
        riskLevel: 'medium',
        uploadedAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    
    logger.info('Contracts listed successfully', { 
      count: mockContracts.length 
    });
    
    return res.status(200).json({
      contracts: mockContracts,
      pagination: {
        total: mockContracts.length,
        page,
        limit,
        pages: Math.ceil(mockContracts.length / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Error listing contracts', { error });
    
    return res.status(500).json({
      code: 500,
      message: 'コントラクト一覧の取得に失敗しました',
      details: error instanceof Error ? error.message : '不明なエラーが発生しました',
    });
  }
};
