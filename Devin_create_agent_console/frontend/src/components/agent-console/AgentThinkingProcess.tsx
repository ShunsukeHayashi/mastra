import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AgentThinkingProcess: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    { title: 'ゴール定義', desc: 'ユーザー入力から最終的な目標状態を特定', icon: '🎯' },
    { title: '逆算思考', desc: '目標から必要なステップを逆算して特定', icon: '🔄' },
    { title: '前提条件分析', desc: '各ステップの実行に必要な前提条件を特定', icon: '🔍' },
    { title: '順序再構成', desc: '逆算したステップを実行順に並べ替え', icon: '📋' },
    { title: '実行とフィードバック', desc: 'ステップを実行し、継続的にフィードバックを評価', icon: '🔄' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-4 rounded-md">
        <h3 className="text-md font-medium mb-3">Working Backwards思考プロセス</h3>
        <p className="text-sm text-slate-300 mb-4">
          エージェントは目標から逆算して思考し、必要なステップを特定します。
          この方法により、複雑な問題を効率的に解決できます。
        </p>
        
        <div className="space-y-0">
          {steps.map((step, i) => (
            <motion.div 
              key={i} 
              className={`p-3 border-l-2 transition-all ${
                i === activeStep ? 'border-secondary-500' : 'border-slate-700'
              }`}
              whileHover={{ 
                x: 5, 
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                transition: { duration: 0.2 }
              }}
              onClick={() => setActiveStep(i)}
            >
              <div className="flex items-start cursor-pointer">
                <motion.div 
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 text-xl ${
                    i === activeStep ? 'bg-secondary-900' : 'bg-slate-700'
                  }`}
                  animate={{ 
                    scale: i === activeStep ? [1, 1.1, 1] : 1,
                    backgroundColor: i === activeStep ? 'rgb(76, 29, 149)' : 'rgb(51, 65, 85)'
                  }}
                  transition={{ duration: 0.5, repeat: i === activeStep ? Infinity : 0, repeatType: 'reverse' }}
                >
                  {step.icon}
                </motion.div>
                <div className="flex-grow">
                  <h4 className="text-sm font-medium">{step.title}</h4>
                  <p className={`text-xs ${i === activeStep ? 'text-secondary-200' : 'text-slate-400'}`}>{step.desc}</p>
                </div>
              </div>
              
              {i === activeStep && (
                <motion.div 
                  className="mt-2 ml-12 p-2 bg-slate-900/60 rounded text-xs text-slate-300"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  {i === 0 && "ユーザーの要求から最終的なゴール状態を明確に定義します。ここでは「エージェント生成」が目標です。"}
                  {i === 1 && "最終ゴールから始めて、それを達成するために何が必要かを逆算していきます。エージェント生成には「ツール選定」「思考パターン設計」などが必要です。"}
                  {i === 2 && "各ステップが実行可能かを確認するため、前提条件を分析します。例えば「ツール選定」には利用可能なAPIリストが必要です。"}
                  {i === 3 && "逆順で特定したステップを、実行可能な順序に並べ替えます。「ゴール定義」→「ツール選定」→...といった順序になります。"}
                  {i === 4 && "順序化されたステップを実行し、各ステップの結果を継続的に評価してフィードバックを提供します。"}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="bg-slate-800 p-4 rounded-md">
        <h3 className="text-md font-medium mb-3">数式ベースの成果物生成</h3>
        <div className="space-y-2">
          {['P = g(N, W)', 'M = g(N, W)', 'C = h(M)', 'O = f(C)'].map((formula, index) => (
            <motion.div 
              key={index}
              className="p-2 bg-slate-700 rounded"
              whileHover={{ y: -2, backgroundColor: 'rgba(71, 85, 105, 0.8)' }}
              transition={{ duration: 0.2 }}
            >
              <code className="text-sm font-mono">
                {formula} <span className="text-slate-400">
                  {index === 0 && "// 成果物コンセプト = 関数(Needs, Wants)"}
                  {index === 1 && "// メッセージ = 関数(Needs, Wants)"}
                  {index === 2 && "// コンテンツ = 関数(メッセージ)"}
                  {index === 3 && "// 成果物 = 関数(コンテンツ)"}
                </span>
              </code>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentThinkingProcess;
