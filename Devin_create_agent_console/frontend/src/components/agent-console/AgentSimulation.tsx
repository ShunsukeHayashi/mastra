import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentSimulationProps {
  agentName: string;
  taskDescription: string;
  onComplete?: () => void;
}

const AgentSimulation: React.FC<AgentSimulationProps> = ({
  agentName,
  taskDescription,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [thoughts, setThoughts] = useState<string[]>([]);
  
  const simulationSteps = [
    { id: 'analyze', label: 'タスク分析', duration: 3000 },
    { id: 'plan', label: '計画立案', duration: 4000 },
    { id: 'execute', label: 'タスク実行', duration: 5000 },
    { id: 'evaluate', label: '結果評価', duration: 3000 },
    { id: 'report', label: 'レポート生成', duration: 2000 }
  ];
  
  const thoughtPatterns = {
    analyze: [
      "ユーザーの要求を分析しています...",
      "キーワードを抽出しています...",
      "タスクの目的を特定しています...",
      "関連する情報を検索しています..."
    ],
    plan: [
      "最適な実行計画を立案しています...",
      "必要なリソースを特定しています...",
      "タスクを小さなステップに分解しています...",
      "実行順序を最適化しています..."
    ],
    execute: [
      "タスクを実行しています...",
      "データを処理しています...",
      "結果を生成しています...",
      "進捗状況をモニタリングしています..."
    ],
    evaluate: [
      "結果の品質を評価しています...",
      "目標達成度を測定しています...",
      "改善点を特定しています...",
      "フィードバックを分析しています..."
    ],
    report: [
      "最終レポートを作成しています...",
      "結果をまとめています...",
      "推奨事項を生成しています...",
      "ユーザーへの報告を準備しています..."
    ]
  };
  
  useEffect(() => {
    if (currentStep >= simulationSteps.length) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
      return;
    }
    
    const currentStepId = simulationSteps[currentStep].id as keyof typeof thoughtPatterns;
    const currentThoughts = thoughtPatterns[currentStepId];
    
    const thoughtInterval = setInterval(() => {
      const randomThought = currentThoughts[Math.floor(Math.random() * currentThoughts.length)];
      setThoughts(prev => [...prev, randomThought]);
    }, 1000);
    
    const nextStepTimeout = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, simulationSteps[currentStep].duration);
    
    return () => {
      clearInterval(thoughtInterval);
      clearTimeout(nextStepTimeout);
    };
  }, [currentStep, onComplete]);
  
  return (
    <div className="bg-slate-800 p-4 rounded-md">
      <h3 className="text-md font-medium mb-3">
        {agentName}の思考プロセス
        {isComplete && <span className="ml-2 text-green-400 text-sm">✓ 完了</span>}
      </h3>
      
      <div className="mb-4 p-3 bg-slate-700/50 rounded-md">
        <h4 className="text-sm font-medium mb-1">タスク:</h4>
        <p className="text-sm text-slate-300">{taskDescription}</p>
      </div>
      
      <div className="space-y-3">
        {simulationSteps.map((step, index) => (
          <motion.div
            key={step.id}
            className={`p-3 rounded-md ${
              index === currentStep 
                ? 'bg-secondary-900/30 border-l-2 border-secondary-500' 
                : index < currentStep 
                  ? 'bg-slate-700/30 border-l-2 border-green-500' 
                  : 'bg-slate-700/10 border-l-2 border-slate-600'
            }`}
            animate={{
              x: index === currentStep ? [0, 5, 0] : 0,
              transition: { duration: 0.5, repeat: index === currentStep ? Infinity : 0, repeatType: 'reverse' }
            }}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                index < currentStep 
                  ? 'bg-green-900 text-green-300' 
                  : index === currentStep 
                    ? 'bg-secondary-900 text-secondary-300' 
                    : 'bg-slate-700 text-slate-400'
              }`}>
                {index < currentStep ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <span className="text-sm">{step.label}</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-slate-900 rounded-md max-h-40 overflow-y-auto">
        <h4 className="text-xs font-medium mb-2 text-slate-400">思考ログ:</h4>
        <AnimatePresence>
          {thoughts.map((thought, index) => (
            <motion.div
              key={index}
              className="text-xs mb-1 text-slate-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-secondary-400">[{new Date().toLocaleTimeString('ja-JP')}]</span> {thought}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {!isComplete && (
          <motion.div
            className="text-xs text-secondary-400"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            思考中...
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AgentSimulation;
