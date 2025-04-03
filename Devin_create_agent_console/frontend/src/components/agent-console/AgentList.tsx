import React from 'react';

interface Agent {
  name: string;
  status: string;
  llm: string;
  tools: string[];
  role: string;
  responsibility: string[];
  olp_principles: string[];
}

interface AgentListProps {
  agents: Agent[];
}

const AgentList: React.FC<AgentListProps> = ({ agents }) => {
  return (
    <div className="space-y-4">
      {agents.map((agent, index) => (
        <div key={index} className="agent-card">
          <div className="flex justify-between items-start">
            <h4 className="text-lg font-medium">{agent.name}</h4>
            <span className={`px-2 py-1 rounded-full text-xs ${
              agent.status === 'active' 
                ? 'bg-green-900 text-green-300' 
                : 'bg-slate-700 text-slate-300'
            }`}>
              {agent.status === 'active' ? 'アクティブ' : '待機中'}
            </span>
          </div>
          
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">LLM</p>
              <p className="text-sm">{agent.llm}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-400">役割</p>
              <p className="text-sm">{agent.role}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-400">ツール</p>
              <div className="flex flex-wrap gap-1">
                {agent.tools.map((tool, idx) => (
                  <span key={idx} className="text-xs bg-slate-700 px-2 py-1 rounded">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-slate-400">責任</p>
              <div className="flex flex-wrap gap-1">
                {agent.responsibility.map((resp, idx) => (
                  <span key={idx} className="text-xs bg-slate-700 px-2 py-1 rounded">
                    {resp}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <p className="text-sm text-slate-400">OLPの原則</p>
              <div className="flex flex-wrap gap-1">
                {agent.olp_principles.map((principle, idx) => (
                  <span key={idx} className="text-xs bg-secondary-900 text-secondary-300 px-2 py-1 rounded">
                    {principle}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentList;
