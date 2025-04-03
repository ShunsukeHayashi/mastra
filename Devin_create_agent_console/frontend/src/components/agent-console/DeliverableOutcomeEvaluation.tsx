import React from 'react';

const DeliverableOutcomeEvaluation: React.FC = () => {
  const successCriteria = [
    '目的との整合性',
    'ユーザー要件の充足度',
    '実装の完全性',
    '品質基準の達成度',
    '拡張性と再利用性'
  ];
  
  return (
    <div className="space-y-4">
      <div className="bg-slate-800 p-3 rounded-md">
        <h4 className="text-sm font-medium mb-2">評価者</h4>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-secondary-900 text-secondary-300 rounded-full text-sm">
            システム評価
          </span>
          <span className="px-3 py-1 bg-slate-700 rounded-full text-sm">
            ユーザー評価
          </span>
          <span className="px-3 py-1 bg-slate-700 rounded-full text-sm">
            外部評価
          </span>
        </div>
      </div>
      
      <div className="bg-slate-800 p-3 rounded-md">
        <h4 className="text-sm font-medium mb-2">成功基準</h4>
        <div className="space-y-2">
          {successCriteria.map((criteria, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm">{criteria}</span>
              <div className="flex items-center">
                <div className="w-24 bg-slate-700 rounded-full h-2.5 mr-2">
                  <div 
                    className={`h-2.5 rounded-full ${
                      index % 3 === 0 ? 'bg-green-500' : 
                      index % 3 === 1 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} 
                    style={{ width: `${85 + (index * 3) % 15}%` }}
                  ></div>
                </div>
                <span className="text-xs">{85 + (index * 3) % 15}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-slate-800 p-3 rounded-md">
        <h4 className="text-sm font-medium mb-2">総合評価</h4>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">成果物品質スコア</span>
          <span className="text-lg font-bold text-secondary-400">87<span className="text-sm">/100</span></span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div className="bg-secondary-500 h-2.5 rounded-full" style={{ width: '87%' }}></div>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          成果物は高品質で、ほとんどの要件を満たしています。いくつかの改善点はありますが、全体的に目標を達成しています。
        </p>
      </div>
    </div>
  );
};

export default DeliverableOutcomeEvaluation;
