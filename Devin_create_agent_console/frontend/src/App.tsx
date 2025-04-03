import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AgentConsole from './components/agent-console/AgentConsole';
import MockAIProvider from './components/agent-console/MockAIProvider';

const App: React.FC = () => {
  return (
    <MockAIProvider>
      <Router>
        <div className="min-h-screen bg-slate-900 text-white">
          <header className="bg-slate-800 p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold text-primary-300">
                Promotion Engine - Visionary Agent Console
              </h1>
            </div>
          </header>
          <main className="container mx-auto py-6 px-4">
            <Routes>
              <Route path="/" element={<AgentConsole />} />
            </Routes>
          </main>
          <footer className="bg-slate-800 p-4 mt-8">
            <div className="container mx-auto text-center text-sm text-slate-400">
              © 2025 Mastra Framework - Promotion Engine
            </div>
          </footer>
        </div>
      </Router>
    </MockAIProvider>
  );
};

export default App;
