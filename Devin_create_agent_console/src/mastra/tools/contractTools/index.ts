import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { ToolExecutionContext } from '@mastra/core/tools';

/**
 * Tool to upload and analyze contract documents
 */
export const uploadContractTool = createTool({
  id: 'upload-contract',
  description: 'Upload and analyze a contract document',
  inputSchema: z.object({
    fileName: z.string().describe('Name of the contract file'),
    fileContent: z.string().describe('Base64 encoded content of the file'),
    fileType: z.enum(['pdf', 'docx', 'doc']).describe('Type of the contract file'),
  }),
  outputSchema: z.object({
    contractId: z.string(),
    fileName: z.string(),
    fileType: z.string(),
    uploadedAt: z.string(),
    status: z.string(),
  }),
  execute: async (params) => {
    const { context } = params;
    try {
      // In a real implementation, this would save the file to storage
      // and initiate document processing
      console.log(`Processing contract: ${context.fileName}`);
      
      // Mock implementation for MVP
      const contractId = `contract-${Date.now()}`;
      const uploadedAt = new Date().toISOString();
      
      return {
        contractId,
        fileName: context.fileName,
        fileType: context.fileType,
        uploadedAt,
        status: 'uploaded',
      };
    } catch (error: unknown) {
      console.error('Error uploading contract:', error);
      throw new Error(`Error uploading contract: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

/**
 * Tool to perform legal check on a contract
 */
export const legalCheckTool = createTool({
  id: 'legal-check',
  description: 'Perform legal check on a contract document',
  inputSchema: z.object({
    contractId: z.string().describe('ID of the contract to check'),
    contractContent: z.string().describe('Content of the contract for analysis'),
  }),
  outputSchema: z.object({
    contractId: z.string(),
    riskLevel: z.enum(['low', 'medium', 'high']),
    issues: z.array(z.object({
      type: z.string(),
      description: z.string(),
      severity: z.enum(['low', 'medium', 'high']),
      recommendation: z.string().optional(),
    })),
    summary: z.string(),
    needsLegalReview: z.boolean(),
  }),
  execute: async (params) => {
    const { context } = params;
    try {
      console.log(`Performing legal check on contract: ${context.contractId}`);
      
      // In a real implementation, this would use GPT or other NLP to analyze the contract
      // For MVP, we'll return mock data
      
      // Mock analysis based on contract content
      const hasConfidentialityClause = context.contractContent.toLowerCase().includes('confidential');
      const hasLiabilityClause = context.contractContent.toLowerCase().includes('liability');
      const hasTerminationClause = context.contractContent.toLowerCase().includes('termination');
      
      const issues = [];
      let riskLevel = 'low';
      
      if (!hasConfidentialityClause) {
        issues.push({
          type: 'Missing Clause',
          description: 'No confidentiality clause found in the contract',
          severity: 'high',
          recommendation: 'Add a standard confidentiality clause to protect sensitive information',
        });
        riskLevel = 'high';
      }
      
      if (!hasLiabilityClause) {
        issues.push({
          type: 'Missing Clause',
          description: 'No liability limitation clause found',
          severity: 'medium',
          recommendation: 'Consider adding a liability limitation clause',
        });
        riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      }
      
      if (!hasTerminationClause) {
        issues.push({
          type: 'Missing Clause',
          description: 'No termination clause found',
          severity: 'medium',
          recommendation: 'Add a termination clause to define how the contract can be ended',
        });
        riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      }
      
      const needsLegalReview = riskLevel !== 'low';
      
      return {
        contractId: context.contractId,
        riskLevel: riskLevel as 'low' | 'medium' | 'high',
        issues,
        summary: `Contract analysis complete. Risk level: ${riskLevel}. ${issues.length} issues found.`,
        needsLegalReview,
      };
    } catch (error: unknown) {
      console.error('Error performing legal check:', error);
      throw new Error(`Error performing legal check: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

/**
 * Tool to set up approval workflow for a contract
 */
export const setupApprovalWorkflowTool = createTool({
  id: 'setup-approval-workflow',
  description: 'Set up approval workflow for a contract',
  inputSchema: z.object({
    contractId: z.string().describe('ID of the contract'),
    contractType: z.string().describe('Type of the contract (NDA, SLA, etc.)'),
    riskLevel: z.enum(['low', 'medium', 'high']).describe('Risk level from legal check'),
    approvers: z.array(z.object({
      name: z.string(),
      email: z.string(),
      role: z.string(),
    })).optional().describe('Optional list of approvers. If not provided, will be determined automatically'),
  }),
  outputSchema: z.object({
    workflowId: z.string(),
    contractId: z.string(),
    steps: z.array(z.object({
      stepId: z.string(),
      approverName: z.string(),
      approverEmail: z.string(),
      approverRole: z.string(),
      status: z.enum(['pending', 'approved', 'rejected']),
      order: z.number(),
    })),
    status: z.enum(['created', 'in_progress', 'completed', 'rejected']),
    createdAt: z.string(),
  }),
  execute: async (params) => {
    const { context } = params;
    try {
      console.log(`Setting up approval workflow for contract: ${context.contractId}`);
      
      // In a real implementation, this would create a workflow in a workflow engine
      // For MVP, we'll return mock data
      
      // Generate approvers if not provided
      const approvers = context.approvers || [
        {
          name: 'Legal Department',
          email: 'legal@company.com',
          role: 'Legal Reviewer',
        },
        {
          name: 'Department Manager',
          email: 'manager@company.com',
          role: 'Business Approver',
        },
        {
          name: 'Finance Department',
          email: 'finance@company.com',
          role: 'Financial Approver',
        },
      ];
      
      // Add CEO for high risk contracts
      if (context.riskLevel === 'high') {
        approvers.push({
          name: 'CEO',
          email: 'ceo@company.com',
          role: 'Executive Approver',
        });
      }
      
      // Create workflow steps
      const steps = approvers.map((approver, index) => ({
        stepId: `step-${Date.now()}-${index}`,
        approverName: approver.name,
        approverEmail: approver.email,
        approverRole: approver.role,
        status: 'pending' as const,
        order: index + 1,
      }));
      
      const workflowId = `workflow-${Date.now()}`;
      const createdAt = new Date().toISOString();
      
      return {
        workflowId,
        contractId: context.contractId,
        steps,
        status: 'created' as const,
        createdAt,
      };
    } catch (error: unknown) {
      console.error('Error setting up approval workflow:', error);
      throw new Error(`Error setting up approval workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

/**
 * Tool to finalize and store a contract after approval
 */
export const finalizeContractTool = createTool({
  id: 'finalize-contract',
  description: 'Finalize and store a contract after approval',
  inputSchema: z.object({
    contractId: z.string().describe('ID of the contract'),
    workflowId: z.string().describe('ID of the approval workflow'),
  }),
  outputSchema: z.object({
    contractId: z.string(),
    status: z.enum(['finalized', 'error']),
    storageLocation: z.string(),
    finalizedAt: z.string(),
    searchTags: z.array(z.string()),
  }),
  execute: async (params) => {
    const { context } = params;
    try {
      console.log(`Finalizing contract: ${context.contractId}`);
      
      // In a real implementation, this would store the contract in a document management system
      // For MVP, we'll return mock data
      
      const finalizedAt = new Date().toISOString();
      const storageLocation = `contracts/${context.contractId}/final`;
      
      return {
        contractId: context.contractId,
        status: 'finalized' as const,
        storageLocation,
        finalizedAt,
        searchTags: ['NDA', 'legal', 'contract', `contract-${context.contractId}`],
      };
    } catch (error: unknown) {
      console.error('Error finalizing contract:', error);
      throw new Error(`Error finalizing contract: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});
