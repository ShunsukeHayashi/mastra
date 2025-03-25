import { z } from 'zod';

/**
 * Utility functions for contract management
 */

// Contract status types
export const ContractStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FINALIZED: 'finalized',
} as const;

export type ContractStatus = typeof ContractStatus[keyof typeof ContractStatus];

// Risk level types
export const RiskLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type RiskLevel = typeof RiskLevel[keyof typeof RiskLevel];

// Contract formats
export const ContractFormat = {
  PDF: 'pdf',
  DOCX: 'docx',
  DOC: 'doc',
} as const;

export type ContractFormat = typeof ContractFormat[keyof typeof ContractFormat];

// Common schema for contract information
export const contractInfoSchema = z.object({
  contractId: z.string(),
  title: z.string().optional(),
  uploadedAt: z.string(),
  updatedAt: z.string().optional(),
  status: z.enum(['draft', 'pending', 'approved', 'rejected', 'finalized']),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  parties: z.array(z.string()).optional(),
});

export type ContractInfo = z.infer<typeof contractInfoSchema>;

/**
 * Format date according to Japanese conventions
 */
export const formatJapaneseDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

/**
 * Get human-readable status in Japanese
 */
export const getStatusInJapanese = (status: ContractStatus): string => {
  const statusMap: Record<ContractStatus, string> = {
    draft: '下書き',
    pending: '承認待ち',
    approved: '承認済み',
    rejected: '却下',
    finalized: '締結済み',
  };
  
  return statusMap[status] || status;
};

/**
 * Get human-readable risk level in Japanese
 */
export const getRiskLevelInJapanese = (riskLevel: RiskLevel): string => {
  const riskMap: Record<RiskLevel, string> = {
    low: '低',
    medium: '中',
    high: '高',
  };
  
  return riskMap[riskLevel] || riskLevel;
};

/**
 * Get contract type in Japanese
 */
export const getContractTypeInJapanese = (contractType: string): string => {
  const typeMap: Record<string, string> = {
    'nda': '秘密保持契約',
    'service': 'サービス契約',
    'employment': '雇用契約',
    'partnership': '業務提携契約',
    'sales': '販売契約',
    'lease': 'リース契約',
    'license': 'ライセンス契約',
    'other': 'その他',
  };
  
  return typeMap[contractType.toLowerCase()] || contractType;
};

/**
 * Generate a unique contract ID
 */
export const generateContractId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `contract-${timestamp}-${randomStr}`;
};

/**
 * Generate a unique workflow ID
 */
export const generateWorkflowId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `workflow-${timestamp}-${randomStr}`;
};

/**
 * Get approval steps based on risk level and contract type
 */
export const getDefaultApprovalSteps = (
  riskLevel: RiskLevel, 
  contractType: string
): Array<{
  stepId: string;
  approverRole: string;
  order: number;
}> => {
  // Base steps that all contracts need
  const baseSteps = [
    {
      stepId: `step-${Date.now()}-1`,
      approverRole: '部門責任者',
      order: 1,
    },
  ];
  
  // For medium and high risk, add legal review
  if (riskLevel === RiskLevel.MEDIUM || riskLevel === RiskLevel.HIGH) {
    baseSteps.push({
      stepId: `step-${Date.now()}-2`,
      approverRole: '法務担当',
      order: 2,
    });
  }
  
  // For high risk, add executive approval
  if (riskLevel === RiskLevel.HIGH) {
    baseSteps.push({
      stepId: `step-${Date.now()}-3`,
      approverRole: '経営幹部',
      order: 3,
    });
  }
  
  // Special handling for specific contract types
  if (contractType.toLowerCase() === 'partnership' || contractType.toLowerCase() === 'license') {
    // These contract types always need IP review
    const ipReviewStep = {
      stepId: `step-${Date.now()}-ip`,
      approverRole: '知財担当',
      order: baseSteps.length + 1,
    };
    baseSteps.push(ipReviewStep);
  }
  
  return baseSteps;
};
