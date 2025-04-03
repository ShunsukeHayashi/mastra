import React from 'react';

const FeedbackEvaluation: React.FC = () => {
  const evaluators = ['ユーザー', 'エージェント', 'システム', '外部評価者'];
  
  return (
    <div>
      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">評価者</h4>
        <div className="flex flex-wrap gap-2">
          {evaluators.map((evaluator, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-slate-800 rounded-full text-sm"
            >
              {evaluator}
            </span>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-slate-800 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">コンテンツ品質評価</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <span className="ml-2 text-xs">85%</span>
            </div>
            <div className="text-xs text-slate-400">テキスト品質</div>
            
            <div className="flex items-center">
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '90%' }}></div>
              </div>
              <span className="ml-2 text-xs">90%</span>
            </div>
            <div className="text-xs text-slate-400">完全性</div>
            
            <div className="flex items-center">
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <span className="ml-2 text-xs">75%</span>
            </div>
            <div className="text-xs text-slate-400">関連性</div>
            
            <div className="flex items-center">
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '95%' }}></div>
              </div>
              <span className="ml-2 text-xs">95%</span>
            </div>
            <div className="text-xs text-slate-400">バイアス</div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">フィードバックコメント</h4>
          <div className="space-y-2">
            <div className="p-2 bg-slate-700 rounded text-xs">
              <span className="text-secondary-400 font-medium">ユーザー: </span>
              目的に合致した内容で満足しています。
            </div>
            <div className="p-2 bg-slate-700 rounded text-xs">
              <span className="text-secondary-400 font-medium">システム: </span>
              全体的な品質は高いですが、関連性をさらに高めるための改善の余地があります。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackEvaluation;
