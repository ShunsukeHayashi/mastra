import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { motion } from 'framer-motion';

interface AIIntegrationProps {
  agentName: string;
  initialPrompt?: string;
  onResponse?: (response: string) => void;
}

const AIIntegration: React.FC<AIIntegrationProps> = ({
  agentName,
  initialPrompt = "あなたはエージェントとして自律的に動作します。ユーザーの指示を理解し、適切なタスクを実行してください。",
  onResponse
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  
  const initialMessageSent = useRef(false);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages: initialPrompt && !initialMessageSent.current 
      ? [{ id: '1', role: 'user', content: initialPrompt }] 
      : [],
  });
  
  useEffect(() => {
    if (initialPrompt && !initialMessageSent.current && messages.length <= 1) {
      initialMessageSent.current = true;
    }
  }, [initialPrompt, messages]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsThinking(true);
    
    await handleSubmit(e);
    
    const latestResponse = messages[messages.length - 1]?.content;
    if (latestResponse && onResponse) {
      onResponse(latestResponse);
    }
    
    setIsThinking(false);
  };

  return (
    <div className="bg-slate-800 p-4 rounded-md">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-md font-medium">
          {agentName}のAI統合
          {isLoading && (
            <span className="ml-2 text-xs text-secondary-400">思考中...</span>
          )}
        </h3>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </motion.div>
      </div>
      
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="mt-4 space-y-4">
          {/* メッセージ履歴 */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`p-2 rounded-md text-sm ${
                  message.role === 'user' 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-secondary-900/30 text-secondary-100'
                }`}
              >
                <div className="text-xs text-slate-400 mb-1">
                  {message.role === 'user' ? 'ユーザー' : agentName}
                </div>
                <div>{message.content}</div>
              </div>
            ))}
            
            {isThinking && (
              <div className="p-2 rounded-md bg-secondary-900/30 text-secondary-100 text-sm">
                <div className="text-xs text-slate-400 mb-1">{agentName}</div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-secondary-500 rounded-full mr-1 animate-pulse"></span>
                  <span className="w-2 h-2 bg-secondary-500 rounded-full mr-1 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
          </div>
          
          {/* 入力フォーム */}
          <form onSubmit={onSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={`${agentName}に指示を入力...`}
              className="flex-grow bg-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              className="bg-secondary-600 text-white px-3 py-2 rounded-md text-sm disabled:opacity-50"
              disabled={isLoading || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              送信
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AIIntegration;
