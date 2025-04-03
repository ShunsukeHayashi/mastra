import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Agent {
  name: string;
  status: string;
  llm: string;
  tools: string[];
  role: string;
  responsibility: string[];
  olp_principles: string[];
}

interface AgentStatusBoardProps {
  agents: Agent[];
}

interface AgentActivity {
  message: string;
  time: number;
  type: 'thinking' | 'processing' | 'complete' | 'error';
}

const AgentStatusBoard: React.FC<AgentStatusBoardProps> = ({ agents }) => {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [activities, setActivities] = useState<{[key: string]: AgentActivity[]}>({});
  const [resourceUsage, setResourceUsage] = useState({
    cpu: 45,
    memory: 60,
    api: 23,
    tokens: 35
  });
  
  useEffect(() => {
    const activeAgents = agents.filter(a => a.status === 'active');
    
    if (activeAgents.length === 0) return;
    
    const interval = setInterval(() => {
      const newActivities = {...activities};
      
      activeAgents.forEach(agent => {
        const thinkingActions = [
          "ユーザー入力を分析中...",
          "キーワードを抽出中...",
          "意図を特定中...",
          "コンテキストを解析中...",
          "関連情報を検索中..."
        ];
        
        const processingActions = [
          "データを処理中...",
          "パターンを検出中...",
          "結果を評価中...",
          "レスポンスを生成中...",
          "次のステップを計画中..."
        ];
        
        const completeActions = [
          "タスク完了: キーワード抽出",
          "タスク完了: 意図分析",
          "タスク完了: コンテキスト理解",
          "タスク完了: 関連情報取得",
          "タスク完了: レスポンス生成"
        ];
        
        const actionTypes: ('thinking' | 'processing' | 'complete' | 'error')[] = ['thinking', 'processing', 'complete'];
        const randomType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
        
        let actions: string[];
        if (randomType === 'thinking') actions = thinkingActions;
        else if (randomType === 'processing') actions = processingActions;
        else actions = completeActions;
        
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
        if (!newActivities[agent.name]) {
          newActivities[agent.name] = [];
        }
        
        if (newActivities[agent.name].length >= 5) {
          newActivities[agent.name].shift();
        }
        
        newActivities[agent.name].push({
          message: randomAction,
          time: Date.now(),
          type: randomType
        });
      });
      
      setActivities(newActivities);
      
      setResourceUsage(prev => ({
        cpu: Math.min(100, Math.max(30, prev.cpu + (Math.random() * 10 - 5))),
        memory: Math.min(100, Math.max(40, prev.memory + (Math.random() * 8 - 4))),
        api: Math.min(100, Math.max(15, prev.api + (Math.random() * 6 - 3))),
        tokens: Math.min(100, Math.max(20, prev.tokens + (Math.random() * 12 - 6)))
      }));
      
    }, 3000);
    
    return () => clearInterval(interval);
  }, [agents, activities]);

  const formatTime = (timestamp: number): string => {
    const time = new Date(timestamp);
    
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">アクティブエージェント</h4>
        <motion.span 
          className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {agents.filter(a => a.status === 'active').length}/{agents.length}
        </motion.span>
      </div>
      
      {agents.map((agent, index) => (
        <motion.div
          key={index}
          className={`p-3 rounded-md ${
            agent.status === 'active' 
              ? 'bg-slate-800 border-l-4 border-green-500' 
              : 'bg-slate-800 border-l-4 border-slate-600'
          }`}
          whileHover={{ y: -2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
          onClick={() => setExpandedAgent(expandedAgent === agent.name ? null : agent.name)}
          layout
        >
          <div className="flex justify-between items-center cursor-pointer">
            <h5 className="text-sm font-medium">{agent.name}</h5>
            {agent.status === 'active' && (
              <motion.div 
                className="flex items-center"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                <span className="text-xs text-green-400">実行中</span>
              </motion.div>
            )}
            {agent.status === 'idle' && (
              <div className="flex items-center">
                <span className="w-2 h-2 bg-slate-500 rounded-full mr-1"></span>
                <span className="text-xs text-slate-400">待機中</span>
              </div>
            )}
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">進捗状況</span>
              {agent.status === 'active' ? (
                <motion.span
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >75%</motion.span>
              ) : (
                <span>0%</span>
              )}
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
              {agent.status === 'active' ? (
                <motion.div 
                  className="bg-secondary-500 h-1.5 rounded-full"
                  initial={{ width: '70%' }}
                  animate={{ width: ['70%', '75%', '73%', '78%', '75%'] }}
                  transition={{ duration: 10, repeat: Infinity }}
                ></motion.div>
              ) : (
                <div className="h-1.5 rounded-full" style={{ width: '0%' }}></div>
              )}
            </div>
          </div>
          
          {agent.status === 'active' && (
            <div className="mt-2 text-xs">
              <span className="text-slate-400">現在のタスク: </span>
              <motion.span
                animate={{ opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ユーザー入力からキーワードと意図を抽出する
              </motion.span>
            </div>
          )}
          
          <AnimatePresence>
            {expandedAgent === agent.name && (
              <motion.div
                className="mt-3 pt-3 border-t border-slate-700"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <span className="text-xs text-slate-400">LLM:</span>
                    <p className="text-xs">{agent.llm}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">役割:</span>
                    <p className="text-xs">{agent.role}</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <span className="text-xs text-slate-400">ツール:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {agent.tools.map((tool, i) => (
                      <motion.span 
                        key={i} 
                        className="px-2 py-0.5 bg-slate-700 rounded-full text-xs"
                        whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.3)' }}
                      >
                        {tool}
                      </motion.span>
                    ))}
                  </div>
                </div>
                
                {agent.status === 'active' && activities[agent.name] && (
                  <div className="mb-3">
                    <span className="text-xs text-slate-400">最近のアクティビティ:</span>
                    <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                      {activities[agent.name].map((activity, i) => (
                        <motion.div 
                          key={i} 
                          className={`text-xs p-1.5 rounded flex justify-between ${
                            activity.type === 'thinking' 
                              ? 'bg-slate-900/60 text-secondary-300' 
                              : activity.type === 'processing' 
                                ? 'bg-blue-900/30 text-blue-300' 
                                : activity.type === 'complete' 
                                  ? 'bg-green-900/30 text-green-300'
                                  : 'bg-red-900/30 text-red-300'
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span>{activity.message}</span>
                          <span className="text-slate-500 ml-2">{formatTime(activity.time)}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    className="text-xs py-1 px-2 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    詳細を表示
                  </motion.button>
                  <motion.button
                    className="text-xs py-1 px-2 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {agent.status === 'active' ? '一時停止' : '開始'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
      
      <motion.div 
        className="bg-slate-800 p-3 rounded-md mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h4 className="text-sm font-medium mb-2">システムリソース</h4>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">CPU使用率</span>
              <motion.span
                key={resourceUsage.cpu}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {Math.round(resourceUsage.cpu)}%
              </motion.span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
              <motion.div 
                className="bg-blue-500 h-1.5 rounded-full" 
                animate={{ width: `${resourceUsage.cpu}%` }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">メモリ使用率</span>
              <motion.span
                key={resourceUsage.memory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {Math.round(resourceUsage.memory)}%
              </motion.span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
              <motion.div 
                className="bg-purple-500 h-1.5 rounded-full" 
                animate={{ width: `${resourceUsage.memory}%` }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">API呼び出し</span>
              <motion.span
                key={resourceUsage.api}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {Math.round(resourceUsage.api)}/100
              </motion.span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
              <motion.div 
                className="bg-yellow-500 h-1.5 rounded-full" 
                animate={{ width: `${resourceUsage.api}%` }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">トークン使用量</span>
              <motion.span
                key={resourceUsage.tokens}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {Math.round(resourceUsage.tokens)}K/100K
              </motion.span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
              <motion.div 
                className="bg-green-500 h-1.5 rounded-full" 
                animate={{ width: `${resourceUsage.tokens}%` }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AgentStatusBoard;
