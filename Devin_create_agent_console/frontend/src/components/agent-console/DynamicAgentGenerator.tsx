import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DynamicAgentGeneratorProps {
  agentName: string;
  onComplete?: () => void;
}

const DynamicAgentGenerator: React.FC<DynamicAgentGeneratorProps> = ({ 
  agentName, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [thinking, setThinking] = useState(true);
  const [commandOutput, setCommandOutput] = useState<string[]>([]);
  
  const generationSteps = [
    { id: 'goal', title: 'ゴール定義', desc: 'エージェントの目標と役割を定義' },
    { id: 'tools', title: 'ツール選択', desc: '必要なツールと機能を選定' },
    { id: 'thinking', title: '思考パターン', desc: '最適な思考プロセスを選択' },
    { id: 'prompt', title: 'プロンプト生成', desc: 'エージェント指示を最適化' },
    { id: 'test', title: '動作検証', desc: 'エージェントの動作を検証' }
  ];

  const commandSequence = [
    `> エージェント「${agentName}」の生成を開始...`,
    `> ツール要件を分析中...`,
    `> Claude 3.5 Sonnetモデルを選択...`,
    `> エージェント指示を最適化中...`,
    `> 自律動作パターンを設定...`,
    `> OLPプリンシパルを適用中...`,
    `> 状態管理システムを初期化中...`,
    `> エージェント「${agentName}」の生成完了`,
  ];

  useEffect(() => {
    if (currentStep < generationSteps.length) {
      const thinkingTimer = setTimeout(() => {
        setThinking(false);
        
        if (currentStep < commandSequence.length) {
          const outputTimer = setTimeout(() => {
            setCommandOutput(prev => [...prev, commandSequence[currentStep]]);
          }, 500);
          
          return () => clearTimeout(outputTimer);
        }
      }, 2000);
      
      const nextStepTimer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setThinking(true);
      }, 3500);
      
      return () => {
        clearTimeout(thinkingTimer);
        clearTimeout(nextStepTimer);
      };
    } else if (onComplete) {
      onComplete();
    }
  }, [currentStep, onComplete]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-4 rounded-md">
        <h3 className="text-md font-medium mb-3">エージェント生成プロセス</h3>
        
        <div className="relative">
          {generationSteps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`p-3 mb-3 rounded-md border ${
                index === currentStep 
                  ? 'bg-secondary-900/50 border-secondary-500' 
                  : index < currentStep 
                    ? 'bg-slate-700/50 border-green-800' 
                    : 'bg-slate-700/30 border-slate-600'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: index <= currentStep ? 1 : 0.5, 
                x: 0,
                scale: index === currentStep ? 1.02 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  index < currentStep 
                    ? 'bg-green-900 text-green-300' 
                    : index === currentStep 
                      ? 'bg-secondary-900 text-secondary-300' 
                      : 'bg-slate-700 text-slate-400'
                }`}>
                  {index < currentStep ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium">{step.title}</h4>
                  <p className="text-xs text-slate-400">{step.desc}</p>
                </div>
              </div>
              
              {index === currentStep && thinking && (
                <div className="mt-3 p-2 bg-slate-900/60 rounded-md">
                  <div className="flex items-center text-secondary-300">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-xs">思考中...</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="bg-slate-800 p-4 rounded-md">
        <h3 className="text-sm font-medium mb-2">コマンドシーケンス</h3>
        <div className="font-mono text-sm bg-slate-900 p-3 rounded-md max-h-40 overflow-y-auto">
          {commandOutput.map((cmd, i) => (
            <motion.div 
              key={i}
              className="text-xs mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className={i === commandOutput.length - 1 && commandOutput[i].includes('完了') ? 'text-green-400' : 'text-slate-300'}>
                {cmd}
              </span>
            </motion.div>
          ))}
          {commandOutput.length < commandSequence.length && (
            <motion.div 
              className="text-xs h-4"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-secondary-400">▌</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicAgentGenerator;
