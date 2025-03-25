import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Store conversation history (in-memory for demo purposes)
// In a production app, this would be stored in a database
const conversations = new Map<string, Array<{ role: 'user' | 'assistant', content: string }>>();

// Mock responses for contract-related queries
const getMockResponse = (message: string): string => {
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

export const agentChatHandler = async (req: Request, res: Response) => {
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
    
    const conversation = conversations.get(convoId)!;
    
    // Add user message to history
    conversation.push({
      role: 'user',
      content: message
    });
    
    console.info('[INFO] Processing agent chat message', { conversationId: convoId, messageLength: message.length });
    
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
    console.error('[ERROR] Error in agent chat', { error });
    res.status(500).json({
      code: 500,
      message: 'AIエージェントでエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
