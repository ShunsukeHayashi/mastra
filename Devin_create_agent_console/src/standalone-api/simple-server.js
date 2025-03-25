import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 4112;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4111', 'https://docu-flow-agent.lovable.app', 'https://v0-mastra-contract-agent.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json({ limit: '50mb' }));

// Mock contract data store
const contracts = new Map();

// Mock conversation store
const conversations = new Map();

// Mock responses for contract-related queries
const getMockResponse = (message) => {
  const lowercaseMessage = message.toLowerCase();
  
  if (lowercaseMessage.includes('nda') || lowercaseMessage.includes('秘密保持')) {
    return 'NDA（秘密保持契約）は、機密情報を保護するための法的文書です。主な条項には、機密情報の定義、使用制限、開示制限、期間、例外事項などが含まれます。当社のAIエージェントは、NDSの自動分析、リスク評価、承認フロー設定をサポートします。';
  } else if (lowercaseMessage.includes('リスク') || lowercaseMessage.includes('risk')) {
    return '契約書のリスク分析では、責任範囲、賠償条項、知的財産権、解約条件、準拠法などの重要な条項を評価します。当社のAIエージェントは、契約書をスキャンして潜在的なリスク要因を特定し、リスクレベル（低・中・高）を判定します。高リスク項目が検出された場合は、法務部門への自動通知も行います。';
  } else if (lowercaseMessage.includes('承認') || lowercaseMessage.includes('approval')) {
    return '承認フローの設定は契約書の種類とリスクレベルに基づいて自動化されています。通常のフローは、1) 部門責任者、2) 法務担当者、3) 経営層の順に承認が必要です。高リスク契約の場合は、追加の専門家レビューが自動的に追加されます。承認者はSlackやメールで通知を受け取り、ワンクリックで承認操作が可能です。';
  } else if (lowercaseMessage.includes('保管') || lowercaseMessage.includes('storage')) {
    return '契約書は承認完了後、自動的に安全なクラウドストレージに保管されます。各契約書には、タイトル、契約相手、契約種類、有効期限などのメタデータが付与され、簡単に検索できます。また、契約期限の30日前に自動リマインダーが送信される機能も実装されています。';
  } else {
    return 'こんにちは！契約書管理AIエージェントです。契約書のアップロード、リスク分析、承認フロー設定、保管管理などについてお手伝いできます。具体的な質問があればお気軽にお尋ねください。';
  }
};

// Agent chat endpoint
app.post('/api/contracts/agent-chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    // Get or create conversation
    let convoId = conversationId;
    if (!convoId) {
      convoId = uuidv4();
    }
    
    if (!conversations.has(convoId)) {
      conversations.set(convoId, []);
    }
    
    const conversation = conversations.get(convoId);
    
    // Add user message to history
    conversation.push({
      role: 'user',
      content: message
    });
    
    console.info(`[INFO] Processing agent chat message: ${message.substring(0, 30)}...`);
    
    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Get mock response
    const response = getMockResponse(message);
    
    // Stream the response token by token to simulate AI generation
    const tokens = response.split('');
    let fullResponse = '';
    
    // Add a small delay between tokens to simulate typing
    for (const token of tokens) {
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
      fullResponse += token;
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    
    // Add assistant response to conversation history
    conversation.push({
      role: 'assistant',
      content: response
    });
    
    // Send end of stream
    res.write(`data: ${JSON.stringify({ done: true, conversationId: convoId })}\n\n`);
    res.end();
    
  } catch (error) {
    console.error('[ERROR] Error in agent chat', error);
    res.status(500).json({
      code: 500,
      message: 'AIエージェントでエラーが発生しました',
      details: error.message || 'Unknown error'
    });
  }
});

// Upload contract endpoint
app.post('/api/contracts/upload', (req, res) => {
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
    console.error('[ERROR] Error uploading contract', error);
    res.status(500).json({
      code: 500,
      message: 'コントラクトのアップロードに失敗しました',
      details: error.message || 'Unknown error'
    });
  }
});

// List contracts endpoint
app.get('/api/contracts/list', (req, res) => {
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
    console.error('[ERROR] Error listing contracts', error);
    res.status(500).json({
      code: 500,
      message: 'コントラクト一覧の取得に失敗しました',
      details: error.message || 'Unknown error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.info(`[INFO] 🚀 Contract API Server running on port ${PORT}`);
  console.info(`[INFO] 📝 Contract API available at http://localhost:${PORT}/api/contracts`);
  console.info(`[INFO] 💓 Health check available at http://localhost:${PORT}/health`);
});
