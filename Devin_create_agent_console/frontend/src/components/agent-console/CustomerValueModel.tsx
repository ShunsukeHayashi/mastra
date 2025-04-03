import React from 'react';

const CustomerValueModel: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-slate-800 p-3 rounded-md">
        <h4 className="text-sm font-medium mb-2">顧客価値計算式</h4>
        <div className="p-2 bg-slate-700 rounded">
          <code className="text-sm font-mono">
            CustomerValue = ∫<sub>Start</sub><sup>Goal</sup> TaskDensity(Agent, t) × OLP dt
          </code>
        </div>
      </div>
      
      <div className="bg-slate-800 p-3 rounded-md">
        <h4 className="text-sm font-medium mb-2">価値要素</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">タスク密度</p>
            <div className="flex items-center">
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <span className="ml-2 text-xs">高</span>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-slate-400 mb-1">OLP係数</p>
            <div className="flex items-center">
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <span className="ml-2 text-xs">0.75</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-800 p-3 rounded-md">
        <h4 className="text-sm font-medium mb-2">価値創出グラフ</h4>
        <div className="h-32 bg-slate-700 rounded-md p-2 relative">
          {/* Simplified graph representation */}
          <div className="absolute bottom-2 left-2 right-2 h-24">
            <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
              <div className="w-1/6 h-20% bg-secondary-500 mx-0.5"></div>
              <div className="w-1/6 h-40% bg-secondary-500 mx-0.5"></div>
              <div className="w-1/6 h-60% bg-secondary-500 mx-0.5"></div>
              <div className="w-1/6 h-80% bg-secondary-500 mx-0.5"></div>
              <div className="w-1/6 h-70% bg-secondary-500 mx-0.5"></div>
              <div className="w-1/6 h-90% bg-secondary-500 mx-0.5"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-full border-t border-slate-500"></div>
          </div>
          <div className="absolute bottom-0 left-2 text-xs text-slate-400">Start</div>
          <div className="absolute bottom-0 right-2 text-xs text-slate-400">Goal</div>
        </div>
      </div>
    </div>
  );
};

export default CustomerValueModel;
