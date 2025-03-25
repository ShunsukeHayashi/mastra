import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const Layout: React.FC = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span className="text-xl font-bold">コントラクトエージェント</span>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className={`py-2 ${location.pathname === '/' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
              ホーム
            </Link>
            <Link to="/upload" className={`py-2 ${location.pathname === '/upload' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
              アップロード
            </Link>
            <Link to="/dashboard" className={`py-2 ${location.pathname === '/dashboard' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
              ダッシュボード
            </Link>
            <Link to="/settings" className={`py-2 ${location.pathname === '/settings' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
              設定
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="text-gray-600 hover:text-primary-600"
              >
                ログアウト
              </button>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="text-gray-600 hover:text-primary-600 py-2 px-3">
                  ログイン
                </Link>
                <Link to="/signup" className="bg-primary-600 hover:bg-primary-700 text-white rounded-md py-2 px-4 transition-colors">
                  はじめる
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">コントラクトエージェント</h3>
              <p className="text-gray-600">
                AIを活用した自動化で契約書管理のプロセスを効率化します。
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">サービス</h3>
              <ul className="space-y-2">
                <li><Link to="/upload" className="text-gray-600 hover:text-primary-600">アップロード</Link></li>
                <li><Link to="/dashboard" className="text-gray-600 hover:text-primary-600">ダッシュボード</Link></li>
                <li><Link to="/settings" className="text-gray-600 hover:text-primary-600">設定</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">会社情報</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-600 hover:text-primary-600">会社概要</Link></li>
                <li><Link to="/privacy" className="text-gray-600 hover:text-primary-600">プライバシーポリシー</Link></li>
                <li><Link to="/terms" className="text-gray-600 hover:text-primary-600">利用規約</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600">© 2025 コントラクトエージェント. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-600 hover:text-primary-600">Twitter</a>
              <a href="#" className="text-gray-600 hover:text-primary-600">LinkedIn</a>
              <a href="#" className="text-gray-600 hover:text-primary-600">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
