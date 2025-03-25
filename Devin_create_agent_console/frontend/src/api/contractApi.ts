import axios from 'axios';

// API base URL - use environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4111/api';

// Mock API responses for development
const MOCK_API = true; // Set to false to use real API

// Define contract types
export interface ContractUploadRequest {
  fileName: string;
  fileContent: string; // base64 encoded
  fileType: string;
}

export interface ContractUploadResponse {
  contractId: string;
  status: string;
  message: string;
}

export interface ContractLegalCheckRequest {
  contractId: string;
}

export interface ContractLegalCheckResponse {
  contractId: string;
  riskLevel: 'low' | 'medium' | 'high';
  issues: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  summary: string;
}

export interface ContractApprovalRequest {
  contractId: string;
  approvers: string[];
}

export interface ContractApprovalResponse {
  contractId: string;
  approvalId: string;
  status: string;
  approvers: Array<{
    name: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
}

export interface ContractFinalizeRequest {
  contractId: string;
}

export interface ContractFinalizeResponse {
  contractId: string;
  status: string;
  storageLocation: string;
}

export interface ContractListResponse {
  contracts: Array<{
    contractId: string;
    fileName: string;
    uploadDate: string;
    status: string;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
}

// Helper function to convert File to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Extract the base64 part from the data URL
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('FileReader did not return a string'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

// Mock data for development
const mockContracts = [
  {
    contractId: 'contract-001',
    fileName: 'NDA_株式会社テクノロジー.pdf',
    uploadDate: '2025-03-24T10:30:00Z',
    status: 'approved',
    riskLevel: 'low' as const,
  },
  {
    contractId: 'contract-002',
    fileName: '業務委託契約書_山田商事.docx',
    uploadDate: '2025-03-23T14:15:00Z',
    status: 'pending',
    riskLevel: 'medium' as const,
  },
  {
    contractId: 'contract-003',
    fileName: '秘密保持契約書_グローバル株式会社.pdf',
    uploadDate: '2025-03-22T09:45:00Z',
    status: 'draft',
    riskLevel: 'high' as const,
  },
  {
    contractId: 'contract-004',
    fileName: '販売代理店契約_ABC株式会社.pdf',
    uploadDate: '2025-03-20T16:20:00Z',
    status: 'rejected',
    riskLevel: 'high' as const,
  },
];

// Contract API client
const contractApi = {
  // Upload a contract document
  uploadContract: async (file: File): Promise<ContractUploadResponse> => {
    try {
      if (MOCK_API) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock response
        return {
          contractId: `contract-${Date.now().toString().slice(-6)}`,
          status: 'success',
          message: 'ファイルが正常にアップロードされました',
        };
      }
      
      const fileContent = await fileToBase64(file);
      const fileType = file.name.split('.').pop()?.toLowerCase() || '';
      
      const response = await axios.post<ContractUploadResponse>(
        `${API_BASE_URL}/contracts/upload`,
        {
          fileName: file.name,
          fileContent,
          fileType,
        }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'アップロードに失敗しました');
      }
      throw new Error('契約書のアップロード中にエラーが発生しました');
    }
  },
  
  // Request legal check for a contract
  requestLegalCheck: async (contractId: string): Promise<ContractLegalCheckResponse> => {
    try {
      if (MOCK_API) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock response
        return {
          contractId,
          riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          issues: [
            {
              type: '責任範囲',
              description: '第10条の責任範囲が不明確です。具体的な責任の制限を明記することをお勧めします。',
              severity: 'medium',
            },
            {
              type: '契約期間',
              description: '契約の自動更新条項がありません。契約終了時の取り扱いを明確にしてください。',
              severity: 'low',
            },
          ],
          summary: 'この契約書には一部リスクが含まれています。特に責任範囲と契約期間に関する条項を見直すことをお勧めします。',
        };
      }
      
      const response = await axios.post<ContractLegalCheckResponse>(
        `${API_BASE_URL}/contracts/legal-check`,
        { contractId }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'リーガルチェックに失敗しました');
      }
      throw new Error('リーガルチェック中にエラーが発生しました');
    }
  },
  
  // Set up approval workflow for a contract
  setupApproval: async (contractId: string, approvers: string[]): Promise<ContractApprovalResponse> => {
    try {
      if (MOCK_API) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock response
        return {
          contractId,
          approvalId: `approval-${Date.now().toString().slice(-6)}`,
          status: 'pending',
          approvers: approvers.map(name => ({
            name,
            status: 'pending',
          })),
        };
      }
      
      const response = await axios.post<ContractApprovalResponse>(
        `${API_BASE_URL}/contracts/approval`,
        { contractId, approvers }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || '承認フローの設定に失敗しました');
      }
      throw new Error('承認フローの設定中にエラーが発生しました');
    }
  },
  
  // Finalize a contract after approval
  finalizeContract: async (contractId: string): Promise<ContractFinalizeResponse> => {
    try {
      if (MOCK_API) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock response
        return {
          contractId,
          status: 'finalized',
          storageLocation: 'https://storage.example.com/contracts/' + contractId,
        };
      }
      
      const response = await axios.post<ContractFinalizeResponse>(
        `${API_BASE_URL}/contracts/finalize`,
        { contractId }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || '契約書の締結に失敗しました');
      }
      throw new Error('契約書の締結中にエラーが発生しました');
    }
  },
  
  // Get list of contracts
  listContracts: async (): Promise<ContractListResponse> => {
    try {
      if (MOCK_API) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock response
        return {
          contracts: mockContracts,
        };
      }
      
      const response = await axios.get<ContractListResponse>(
        `${API_BASE_URL}/contracts/list`
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || '契約書一覧の取得に失敗しました');
      }
      throw new Error('契約書一覧の取得中にエラーが発生しました');
    }
  },
};

// Agent chat API
export const chatWithAgent = async (
  message: string, 
  conversationId?: string,
  onToken?: (token: string) => void
): Promise<{
  conversationId: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/contracts/agent-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationId,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Stream not available');
    }

    let resultConversationId = conversationId;
    
    const decoder = new TextDecoder();
    let done = false;
    
    while (!done) {
      const { value, done: streamDone } = await reader.read();
      if (streamDone) {
        done = true;
        break;
      }
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n\n').filter(line => line.trim().startsWith('data:'));
      
      for (const line of lines) {
        const eventData = JSON.parse(line.replace('data:', '').trim());
        
        if (eventData.token && onToken) {
          onToken(eventData.token);
        }
        
        if (eventData.done) {
          done = true;
          if (eventData.conversationId) {
            resultConversationId = eventData.conversationId;
          }
        }
      }
    }

    return { conversationId: resultConversationId! };
  } catch (error) {
    console.error('Error in agent chat', error);
    throw error;
  }
};

export default contractApi;
