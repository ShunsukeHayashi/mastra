import React from 'react';
import { motion } from 'framer-motion';

interface Command {
  id: string;
  text: string;
  type: 'system' | 'thinking' | 'action' | 'output';
  completed: boolean;
}

interface AgentGenerationSequenceProps {
  commands: Command[];
  currentIndex: number;
  isProcessing: boolean;
}

const AgentGenerationSequence: React.FC<AgentGenerationSequenceProps> = ({
  commands,
  currentIndex,
  isProcessing
}) => {
  return (
    <div className="space-y-1 font-mono text-sm">
      {commands.map((cmd, index) => (
        <motion.div
          key={cmd.id}
          className={`p-2 rounded ${
            index === currentIndex 
              ? 'bg-slate-700/80 border-l-2 border-secondary-500' 
              : index < currentIndex 
                ? 'bg-slate-800/30' 
                : 'bg-slate-800/10'
          }`}
          initial={{ opacity: index <= currentIndex ? 1 : 0.5, y: index <= currentIndex ? 0 : 10 }}
          animate={{ 
            opacity: index <= currentIndex ? 1 : 0.5, 
            y: 0,
            borderColor: index === currentIndex ? 'rgb(168, 85, 247)' : 'transparent'
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2">
              {cmd.completed ? (
                <svg className="w-full h-full text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : index === currentIndex && isProcessing ? (
                <svg className="w-full h-full text-secondary-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <div className="w-2 h-2 mx-auto mt-1.5 rounded-full bg-slate-600"></div>
              )}
            </div>
            <div className={`text-xs ${
              cmd.type === 'system' 
                ? 'text-blue-400' 
                : cmd.type === 'thinking' 
                  ? 'text-secondary-400 italic' 
                  : cmd.type === 'action' 
                    ? 'text-yellow-400' 
                    : 'text-green-400'
            }`}>
              {cmd.text}
            </div>
          </div>
        </motion.div>
      ))}
      
      {isProcessing && currentIndex === commands.length - 1 && (
        <motion.div
          className="p-2 text-xs text-secondary-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          処理完了中...
        </motion.div>
      )}
    </div>
  );
};

export default AgentGenerationSequence;
