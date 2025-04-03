import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DynamicAgentGenerator from './DynamicAgentGenerator';
import AgentThinkingProcess from './AgentThinkingProcess';
import AgentSimulation from './AgentSimulation';
import AIIntegration from './AIIntegration';

interface AgentIntegrationProps {
  agentName: string;
  taskDescription?: string;
}

const AgentIntegration: React.FC<AgentIntegrationProps> = ({
  agentName,
  taskDescription = "ユーザーの指示に基づいてタスクを実行します。"
}) => {
  const [activeTab, setActiveTab] = useState<'generator' | 'thinking' | 'simulation' | 'chat'>('generator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  
  const handleGenerationComplete = () => {
    setIsGenerating(false);
    setIsGenerated(true);
  };
  
  const startGeneration = () => {
    setIsGenerating(true);
  };
  
  const tabs = [
    { id: 'generator', label: '生成プロセス' },
    { id: 'thinking', label: '思考プロセス' },
    { id: 'simulation', label: 'シミュレーション' },
    { id: 'chat', label: 'チャット' }
  ];
  
  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden">
      <div className="p-4 bg-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{agentName}</h2>
          
          {!isGenerating && !isGenerated ? (
            <motion.button
              className="px-3 py-1 bg-secondary-600 text-white text-sm rounded-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGeneration}
            >
              エージェント生成
            </motion.button>
          ) : isGenerating ? (
            <div className="flex items-center text-secondary-400 text-sm">
              <div className="w-2 h-2 bg-secondary-500 rounded-full mr-2 animate-pulse"></div>
              生成中...
            </div>
          ) : (
            <div className="flex items-center text-green-400 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              生成完了
            </div>
          )}
        </div>
        
        {isGenerated && (
          <div className="mt-4 flex space-x-1 border-b border-slate-700">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`px-3 py-2 text-sm rounded-t-md transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-slate-700 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4">
        {isGenerating && (
          <DynamicAgentGenerator 
            agentName={agentName} 
            onComplete={handleGenerationComplete} 
          />
        )}
        
        {isGenerated && (
          <>
            {activeTab === 'generator' && (
              <DynamicAgentGenerator 
                agentName={agentName} 
                onComplete={() => {}} 
              />
            )}
            
            {activeTab === 'thinking' && (
              <AgentThinkingProcess />
            )}
            
            {activeTab === 'simulation' && (
              <AgentSimulation 
                agentName={agentName}
                taskDescription={taskDescription}
              />
            )}
            
            {activeTab === 'chat' && (
              <AIIntegration 
                agentName={agentName}
                initialPrompt={`あなたは${agentName}として振る舞ってください。${taskDescription}`}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AgentIntegration;
