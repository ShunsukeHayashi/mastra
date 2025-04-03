import React, { ReactNode } from 'react';

interface AgentProviderProps {
  children: ReactNode;
}

const AgentProvider: React.FC<AgentProviderProps> = ({ children }) => {
  return (
    <div className="agent-provider">
      {children}
    </div>
  );
};

export default AgentProvider;
