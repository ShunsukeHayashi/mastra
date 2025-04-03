import React, { useState } from 'react';
import ProcessFlow from './ProcessFlow';
import AgentList from './AgentList';
import MicroTaskList from './MicroTaskList';
import TaskPlanner from './TaskPlanner';
import FeedbackEvaluation from './FeedbackEvaluation';
import CustomerValueModel from './CustomerValueModel';
import DeliverableOutcomeEvaluation from './DeliverableOutcomeEvaluation';
import AgentThinkingProcess from './AgentThinkingProcess';
import AgentStatusBoard from './AgentStatusBoard';

const sampleAgents = [
  {
    name: '意図解析エージェント',
    status: 'active',
    llm: 'Claude 3.5 Sonnet',
    tools: ['テキスト分析', 'キーワード抽出'],
    role: 'ユーザー入力の解析',
    responsibility: ['目的特定', 'ニーズ分析', '要件抽出'],
    olp_principles: ['透明性', '説明可能性', '公平性']
  },
  {
    name: 'ツール生成エージェント',
    status: 'idle',
    llm: 'Claude 3.5 Sonnet',
    tools: ['コード生成', 'スキーマ検証'],
    role: 'ツール定義の生成',
    responsibility: ['スキーマ定義', '関数実装', 'テスト生成'],
    olp_principles: ['再利用性', 'モジュール性', '型安全性']
  },
  {
    name: 'エージェント生成エージェント',
    status: 'idle',
    llm: 'Claude 3.5 Sonnet',
    tools: ['エージェント定義', 'プロンプト生成'],
    role: 'エージェント定義の生成',
    responsibility: ['指示文生成', 'ツール関連付け', '動作検証'],
    olp_principles: ['自律性', '協調性', '目的整合性']
  }
];

const sampleMicroTasks = [
  {
    id: 'MT001',
    detail: 'ユーザー入力からキーワードと意図を抽出する',
    dt: '2025-04-03T10:00:00',
    assigned_agent: '意図解析エージェント'
  },
  {
    id: 'MT002',
    detail: '抽出された意図からツール要件を特定する',
    dt: '2025-04-03T10:15:00',
    assigned_agent: '意図解析エージェント'
  },
  {
    id: 'MT003',
    detail: 'ツール要件に基づいてツール定義を生成する',
    dt: '2025-04-03T10:30:00',
    assigned_agent: 'ツール生成エージェント'
  }
];

const sampleTaskSequence = [
  'ユーザー入力解析',
  'ツール要件特定',
  'ツール定義生成',
  'エージェント定義生成',
  'ワークフロー定義生成',
  'Mastra設定更新',
  'APIエンドポイント作成'
];

const AgentConsole: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="border-pattern">
        <h2 className="text-xl font-bold mb-4">Promotion Engine - Agent Console</h2>
        <p className="text-slate-300">
          本コンソールはゴールから明確な成果物を導くための包括的なプロセスサービスフレームワークです。
          ユーザーのゴールを明確化し、Intentを特定後、NeedsとWantsを整理・分類します。
          数式ベース（P=g(N,W)）で成果物コンセプトを生成し、具体的なマイクロタスクに分解。
          各エージェントが時間軸に沿って順次タスクを実行し、360度フィードバック評価を経て最終的な成果物を提供します。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="border-pattern">
              <label htmlFor="userInput" className="block text-lg font-medium mb-2">
                ユーザー入力
              </label>
              <textarea
                id="userInput"
                rows={4}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="ゴールや要件を入力してください..."
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-secondary-600 hover:bg-secondary-700 rounded-md transition-colors flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <span className="thinking-animation mr-2"></span>
                      処理中...
                    </>
                  ) : (
                    '解析開始'
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="mb-6">
            <div className="border-pattern">
              <h3 className="text-lg font-medium mb-4">プロセスフロー</h3>
              <ProcessFlow />
            </div>
          </div>

          <div className="mb-6">
            <div className="tabs flex border-b border-slate-700 mb-4">
              <button
                className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-secondary-500 text-secondary-400' : 'text-slate-400'}`}
                onClick={() => setActiveTab('overview')}
              >
                概要
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'agents' ? 'border-b-2 border-secondary-500 text-secondary-400' : 'text-slate-400'}`}
                onClick={() => setActiveTab('agents')}
              >
                エージェント
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'tasks' ? 'border-b-2 border-secondary-500 text-secondary-400' : 'text-slate-400'}`}
                onClick={() => setActiveTab('tasks')}
              >
                タスク
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'evaluation' ? 'border-b-2 border-secondary-500 text-secondary-400' : 'text-slate-400'}`}
                onClick={() => setActiveTab('evaluation')}
              >
                評価
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="border-pattern">
                <h3 className="text-lg font-medium mb-4">システム概要</h3>
                <AgentThinkingProcess />
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="border-pattern">
                <h3 className="text-lg font-medium mb-4">エージェント一覧</h3>
                <AgentList agents={sampleAgents} />
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <div className="border-pattern">
                  <h3 className="text-lg font-medium mb-4">マイクロタスク</h3>
                  <MicroTaskList microTasks={sampleMicroTasks} />
                </div>
                <div className="border-pattern">
                  <h3 className="text-lg font-medium mb-4">タスクプランナー</h3>
                  <TaskPlanner taskSequence={sampleTaskSequence} />
                </div>
              </div>
            )}

            {activeTab === 'evaluation' && (
              <div className="space-y-6">
                <div className="border-pattern">
                  <h3 className="text-lg font-medium mb-4">360度フィードバック評価</h3>
                  <FeedbackEvaluation />
                </div>
                <div className="border-pattern">
                  <h3 className="text-lg font-medium mb-4">顧客価値モデル</h3>
                  <CustomerValueModel />
                </div>
                <div className="border-pattern">
                  <h3 className="text-lg font-medium mb-4">成果物評価</h3>
                  <DeliverableOutcomeEvaluation />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="border-pattern sticky top-4">
            <h3 className="text-lg font-medium mb-4">エージェントステータス</h3>
            <AgentStatusBoard agents={sampleAgents} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentConsole;
