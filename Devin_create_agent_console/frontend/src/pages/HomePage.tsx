import React from 'react';
import { Link } from 'react-router-dom';
import DemoInstructions from '../components/DemoInstructions';
import AIAgentChat from '../components/AIAgentChat';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Demo Instructions */}
      <div className="container mx-auto px-4 py-6">
        <DemoInstructions />
      </div>

      {/* AI Agent Demo Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Mastra AIエージェントデモ</h2>
            <p className="text-center mb-8 text-gray-600">
              Mastraフレームワークを活用したAIエージェントをお試しください。<br />
              契約書に関する質問や分析依頼などをチャットで行えます。
            </p>
            <AIAgentChat />
          </div>
        </div>
      </section>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              契約書管理を、もっとスマートに
            </h1>
            <p className="text-xl mb-8">
              AIを活用した自動化で、契約書のアップロードから承認、保管まで
              すべてのプロセスを効率化します。
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/upload" className="bg-white text-primary-700 hover:bg-gray-100 font-semibold py-3 px-6 rounded-md transition-colors">
                今すぐ始める
              </Link>
              <Link to="/about" className="bg-transparent border border-white text-white hover:bg-white/10 font-semibold py-3 px-6 rounded-md transition-colors">
                詳細を見る
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">主な機能</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">簡単アップロード</h3>
              <p className="text-gray-600">
                PDFやWord形式の契約書をドラッグ＆ドロップでアップロード。AIが自動的に内容を解析します。
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AIリーガルチェック</h3>
              <p className="text-gray-600">
                AIが契約書の内容を解析し、リスク箇所や不備を自動的に検出。法務担当者の負担を軽減します。
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">自動承認フロー</h3>
              <p className="text-gray-600">
                契約内容に応じて最適な承認フローを自動生成。Slackやメールで承認者に通知します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">ご利用の流れ</h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
                <h3 className="text-2xl font-semibold mb-2">契約書をアップロード</h3>
                <p className="text-gray-600">
                  PDFやWord形式の契約書をシステムにアップロードするだけ。AIが自動的に内容を解析します。
                </p>
              </div>
              <div className="md:w-1/2 bg-gray-100 rounded-lg p-4">
                <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500">アップロード画面イメージ</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row-reverse items-center mb-12">
              <div className="md:w-1/2 mb-6 md:mb-0 md:pl-8">
                <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
                <h3 className="text-2xl font-semibold mb-2">AIによるリーガルチェック</h3>
                <p className="text-gray-600">
                  AIが契約書の内容を解析し、リスク箇所や不備を自動的に検出。必要に応じてリーガル担当者に通知します。
                </p>
              </div>
              <div className="md:w-1/2 bg-gray-100 rounded-lg p-4">
                <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500">リーガルチェック画面イメージ</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
                <h3 className="text-2xl font-semibold mb-2">承認フローの自動設定</h3>
                <p className="text-gray-600">
                  契約内容に応じて最適な承認フローを自動生成。Slackやメールで承認者に通知し、スムーズな承認プロセスを実現します。
                </p>
              </div>
              <div className="md:w-1/2 bg-gray-100 rounded-lg p-4">
                <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500">承認フロー画面イメージ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">契約書管理の効率化を始めましょう</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            AIを活用した自動化で、契約書管理の時間を大幅に削減。
            今すぐ無料でお試しいただけます。
          </p>
          <Link to="/upload" className="bg-white text-primary-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-md inline-block transition-colors">
            無料で始める
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
