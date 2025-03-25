import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { Step } from '@mastra/core/workflows';
import { Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { 
  uploadContractTool, 
  legalCheckTool, 
  setupApprovalWorkflowTool, 
  finalizeContractTool 
} from '../../tools/contractTools';

// Create an agent for contract analysis
const contractAnalysisAgent = new Agent({
  name: 'Contract Analysis Agent',
  model: anthropic('claude-3-5-sonnet-20241022'),
  instructions: `
    You are a specialized legal contract analyzer. Your job is to:
    
    1. Analyze contract documents for legal risks and issues
    2. Identify missing clauses or problematic terms
    3. Provide clear summaries of contract content
    4. Recommend appropriate approval workflows based on contract type and risk level
    
    Focus on being thorough but concise in your analysis.
  `,
});

// Step 1: Upload Contract Document
const uploadContractStep = new Step({
  id: 'upload-contract',
  description: 'Uploads and processes a contract document',
  inputSchema: z.object({
    fileName: z.string().describe('Name of the contract file'),
    fileContent: z.string().describe('Base64 encoded content of the file'),
    fileType: z.enum(['pdf', 'docx', 'doc']).describe('Type of the contract file'),
  }),
  execute: async ({ context, mastra }) => {
    const triggerData = context?.getStepResult<{ 
      fileName: string;
      fileContent: string;
      fileType: 'pdf' | 'docx' | 'doc';
    }>('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    // Upload the contract using the tool
    const uploadResult = await uploadContractTool.execute({
      context: {
        fileName: triggerData.fileName,
        fileContent: triggerData.fileContent,
        fileType: triggerData.fileType,
      },
      mastra,
    });

    return uploadResult;
  },
});

// Step 2: Perform Legal Check
const legalCheckStep = new Step({
  id: 'legal-check',
  description: 'Performs legal check on the uploaded contract',
  inputSchema: z.object({
    contractId: z.string(),
    contractContent: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    const uploadResult = context?.getStepResult<{
      contractId: string;
      fileName: string;
      fileType: string;
      uploadedAt: string;
      status: string;
    }>('upload-contract');

    if (!uploadResult) {
      throw new Error('Upload result not found');
    }

    // For MVP, we'll use a mock contract content
    // In a real implementation, this would extract text from the uploaded document
    const mockContractContent = `
      CONFIDENTIALITY AGREEMENT
      
      This Confidentiality Agreement (the "Agreement") is entered into as of [DATE] by and between [PARTY A] and [PARTY B].
      
      1. CONFIDENTIAL INFORMATION
      "Confidential Information" means any information disclosed by one party to the other, either directly or indirectly, in writing, orally or by inspection of tangible objects, which is designated as "Confidential," "Proprietary" or some similar designation.
      
      2. NON-DISCLOSURE
      The receiving party shall not disclose any Confidential Information to third parties.
      
      3. TERM
      This Agreement shall remain in effect for a period of 3 years from the date of disclosure.
      
      4. GOVERNING LAW
      This Agreement shall be governed by the laws of [JURISDICTION].
      
      5. LIABILITY
      Neither party shall be liable for any indirect, incidental, special or consequential damages.
      
      6. TERMINATION
      This Agreement may be terminated by either party with 30 days written notice.
    `;

    // Perform legal check
    const legalCheckResult = await legalCheckTool.execute({
      context: {
        contractId: uploadResult.contractId,
        contractContent: mockContractContent,
      },
      mastra,
    });

    return legalCheckResult;
  },
});

// Step 3: Setup Approval Workflow
const setupApprovalStep = new Step({
  id: 'setup-approval',
  description: 'Sets up approval workflow based on legal check results',
  inputSchema: z.object({
    contractId: z.string(),
    riskLevel: z.enum(['low', 'medium', 'high']),
    contractType: z.string().optional(),
  }),
  execute: async ({ context, mastra }) => {
    const legalCheckResult = context?.getStepResult<{
      contractId: string;
      riskLevel: 'low' | 'medium' | 'high';
      issues: Array<{
        type: string;
        description: string;
        severity: 'low' | 'medium' | 'high';
        recommendation?: string;
      }>;
      summary: string;
      needsLegalReview: boolean;
    }>('legal-check');

    if (!legalCheckResult) {
      throw new Error('Legal check result not found');
    }

    // Setup approval workflow
    const approvalResult = await setupApprovalWorkflowTool.execute({
      context: {
        contractId: legalCheckResult.contractId,
        contractType: 'NDA', // Default to NDA for MVP
        riskLevel: legalCheckResult.riskLevel,
      },
      mastra,
    });

    return approvalResult;
  },
});

// Step 4: Finalize Contract (after approval)
const finalizeContractStep = new Step({
  id: 'finalize-contract',
  description: 'Finalizes and stores the contract after approval',
  inputSchema: z.object({
    contractId: z.string(),
    workflowId: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    const approvalResult = context?.getStepResult<{
      workflowId: string;
      contractId: string;
      steps: Array<{
        stepId: string;
        approverName: string;
        approverEmail: string;
        approverRole: string;
        status: 'pending' | 'approved' | 'rejected';
        order: number;
      }>;
      status: 'created' | 'in_progress' | 'completed' | 'rejected';
      createdAt: string;
    }>('setup-approval');

    if (!approvalResult) {
      throw new Error('Approval result not found');
    }

    // In a real implementation, we would check if all approvals are complete
    // For MVP, we'll assume approval is complete

    // Finalize the contract
    const finalizeResult = await finalizeContractTool.execute({
      context: {
        contractId: approvalResult.contractId,
        workflowId: approvalResult.workflowId,
      },
      mastra,
    });

    return finalizeResult;
  },
});

// Create the contract upload and processing workflow
const contractUploadWorkflow = new Workflow({
  name: 'contract-upload-workflow',
  triggerSchema: z.object({
    fileName: z.string().describe('Name of the contract file'),
    fileContent: z.string().describe('Base64 encoded content of the file'),
    fileType: z.enum(['pdf', 'docx', 'doc']).describe('Type of the contract file'),
  }),
})
  .step(uploadContractStep)
  .then(legalCheckStep)
  .then(setupApprovalStep);

// Create the contract finalization workflow
const contractFinalizationWorkflow = new Workflow({
  name: 'contract-finalization-workflow',
  triggerSchema: z.object({
    contractId: z.string().describe('ID of the contract to finalize'),
    workflowId: z.string().describe('ID of the approval workflow'),
  }),
})
  .step(finalizeContractStep);

// Commit the workflows
contractUploadWorkflow.commit();
contractFinalizationWorkflow.commit();

export { contractUploadWorkflow, contractFinalizationWorkflow };
