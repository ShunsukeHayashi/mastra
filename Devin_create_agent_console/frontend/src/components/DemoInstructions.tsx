import React from 'react';
import { Link } from 'react-router-dom';

const DemoInstructions: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        デモモード
      </h3>
      <p className="text-blue-700 mb-3 text-sm sm:text-base">
        このデモでは、契約書管理システムの主要機能をお試しいただけます。実際のデータは保存されません。
      </p>
      <div className="space-y-2 text-sm text-blue-600">
        <div className="flex items-start">
          <span className="font-medium mr-2">1.</span>
          <span>「アップロード」ページから契約書をアップロード（任意のPDFファイル）</span>
        </div>
        <div className="flex items-start">
          <span className="font-medium mr-2">2.</span>
          <span>「ダッシュボード」でアップロードした契約書の自動分析結果を確認</span>
        </div>
        <div className="flex items-start">
          <span className="font-medium mr-2">3.</span>
          <span>承認フローのシミュレーションを体験</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link 
          to="/upload" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          アップロードを試す
        </Link>
        <Link 
          to="/dashboard" 
          className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          サンプルデータを見る
        </Link>
      </div>
    </div>
  );
};

export default DemoInstructions;
