import React, { useState, useRef, useEffect } from 'react';
import { chatWithAgent } from '../api/contractApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIAgentChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'こんにちは！契約書管理AIアシスタントです。契約書に関するご質問や、アップロードした契約書の分析依頼などをお気軽にどうぞ。',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock API flag - set to false to use real API
  const MOCK_API = true;

  // Sample responses for demo/mock mode
  const demoResponses: Record<string, string> = {
    'default': 'ご質問ありがとうございます。契約書の管理や分析についてお手伝いできることがあれば、お気軽にお申し付けください。',
    'リスク': '契約書のリスク分析を行いました。主な懸念点は以下の通りです：\n\n1. 第5条: 責任範囲が不明確です\n2. 第8条: 解約条件が一方的である可能性があります\n3. 第12条: 知的財産権の帰属について曖昧な表現があります\n\n詳細な分析レポートをダッシュボードに追加しました。',
    '承認': '承認フローを自動設定しました。この契約書は以下の承認ステップが必要です：\n\n1. 法務部門確認 (山田様)\n2. 事業部責任者承認 (佐藤様)\n3. 経営層最終承認 (鈴木様)\n\n各承認者にSlack通知を送信しました。承認状況はダッシュボードで確認できます。',
    'NDA': 'NDA（秘密保持契約）のテンプレートを用意しました。主な条項は以下の通りです：\n\n1. 秘密情報の定義\n2. 秘密保持義務の範囲\n3. 情報の取り扱い方法\n4. 契約期間と義務の存続\n\nこのテンプレートをカスタマイズして利用できます。',
    '分析': '契約書の自動分析を開始します。分析には以下の項目が含まれます：\n\n- 契約の種類と目的の特定\n- 重要条項のハイライト\n- リスク箇所の検出\n- 類似契約との比較\n\n分析結果は数分後にダッシュボードに表示されます。',
    'マストラ': 'Mastraは高度なAIエージェントフレームワークです。契約書管理システムでは、Mastraを活用して以下の機能を実現しています：\n\n1. 自然言語による契約書解析\n2. 承認フローの自動最適化\n3. リスク検出と通知\n4. 契約履歴の管理と検索\n\nMastraのAI機能により、契約業務の効率が大幅に向上します。'
  };

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userInput = input; // Store input before clearing
    setInput('');
    setIsLoading(true);

    if (MOCK_API) {
      // Mock API mode - simulate response with delay
      setTimeout(() => {
        let responseContent = demoResponses.default;
        
        // Check for keywords in the input to provide relevant responses
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes('リスク') || lowerInput.includes('risk')) {
          responseContent = demoResponses.リスク;
        } else if (lowerInput.includes('承認') || lowerInput.includes('フロー') || lowerInput.includes('flow')) {
          responseContent = demoResponses.承認;
        } else if (lowerInput.includes('nda') || lowerInput.includes('秘密保持')) {
          responseContent = demoResponses.NDA;
        } else if (lowerInput.includes('分析') || lowerInput.includes('解析')) {
          responseContent = demoResponses.分析;
        } else if (lowerInput.includes('mastra') || lowerInput.includes('マストラ')) {
          responseContent = demoResponses.マストラ;
        }

        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
      return;
    }

    // Real API mode - use streaming response
    try {
      // Create an initial blank response that will be updated with streaming content
      const tempResponseId = `temp-${Date.now()}`;
      setMessages(prev => [
        ...prev,
        {
          id: tempResponseId,
          role: 'assistant',
          content: '',
          timestamp: new Date()
        }
      ]);

      // Stream the response
      const { conversationId: newConversationId } = await chatWithAgent(
        userInput,
        conversationId,
        (token) => {
          // Update the message content with each token
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempResponseId 
                ? { ...msg, content: msg.content + token } 
                : msg
            )
          );
        }
      );
      
      // Save conversation ID for future messages
      setConversationId(newConversationId);
    } catch (error) {
      console.error('Error chatting with agent:', error);
      
      // Show error message
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'すみません、エラーが発生しました。もう一度お試しください。',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp to Japanese time
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[500px] sm:h-[600px]">
      <div className="bg-primary-600 text-white p-4">
        <h3 className="font-semibold text-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          契約書管理AIアシスタント
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div 
                  className={`text-xs mt-1 text-right ${
                    message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="契約書に関する質問を入力してください..."
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading || !input.trim()}
          >
            送信
          </button>
        </form>
        <div className="mt-2 text-xs text-gray-500">
          <p>キーワード例: 「リスク分析」「承認フロー」「NDA」「契約書分析」「マストラとは」</p>
        </div>
      </div>
    </div>
  );
};

export default AIAgentChat;
