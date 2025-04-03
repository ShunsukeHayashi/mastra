import React, { ReactNode, createContext, useState, useContext } from 'react';

interface MockAIContextType {
  isConnected: boolean;
  isProcessing: boolean;
  startProcessing: () => void;
  stopProcessing: () => void;
}

const MockAIContext = createContext<MockAIContextType>({
  isConnected: false,
  isProcessing: false,
  startProcessing: () => {},
  stopProcessing: () => {}
});

export const useMockAI = () => useContext(MockAIContext);

interface MockAIProviderProps {
  children: ReactNode;
}

export const MockAIProvider: React.FC<MockAIProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const startProcessing = () => setIsProcessing(true);
  const stopProcessing = () => setIsProcessing(false);
  
  return (
    <MockAIContext.Provider value={{
      isConnected,
      isProcessing,
      startProcessing,
      stopProcessing
    }}>
      {children}
    </MockAIContext.Provider>
  );
};

export default MockAIProvider;
