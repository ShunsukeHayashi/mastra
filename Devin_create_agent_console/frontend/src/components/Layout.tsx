import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const Layout: React.FC = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span className="text-lg sm:text-xl font-bold">コントラクトエージェント</span>
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
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isLoggedIn ? (
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="text-gray-600 hover:text-primary-600 text-sm sm:text-base"
              >
                ログアウト
              </button>
            ) : (
              <div className="hidden sm:flex space-x-2">
                <Link to="/login" className="text-gray-600 hover:text-primary-600 py-2 px-3 text-sm sm:text-base">
                  ログイン
                </Link>
                <Link to="/signup" className="bg-primary-600 hover:bg-primary-700 text-white rounded-md py-2 px-3 sm:px-4 text-sm sm:text-base transition-colors">
                  はじめる
                </Link>
              </div>
            )}
            
            <button 
              className="md:hidden text-gray-600 hover:text-primary-600 focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label="メニュー"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="container mx-auto px-4 py-2">
              <nav className="flex flex-col space-y-3">
                <Link 
                  to="/" 
                  className={`py-2 px-3 rounded-md ${location.pathname === '/' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ホーム
                </Link>
                <Link 
                  to="/upload" 
                  className={`py-2 px-3 rounded-md ${location.pathname === '/upload' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  アップロード
                </Link>
                <Link 
                  to="/dashboard" 
                  className={`py-2 px-3 rounded-md ${location.pathname === '/dashboard' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ダッシュボード
                </Link>
                <Link 
                  to="/settings" 
                  className={`py-2 px-3 rounded-md ${location.pathname === '/settings' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  設定
                </Link>
                {!isLoggedIn && (
                  <div className="flex space-x-2 pt-2 border-t border-gray-100">
                    <Link 
                      to="/login" 
                      className="text-gray-600 hover:text-primary-600 py-2 px-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ログイン
                    </Link>
                    <Link 
                      to="/signup" 
                      className="bg-primary-600 hover:bg-primary-700 text-white rounded-md py-2 px-4 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      はじめる
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <footer className="bg-gray-50 border-t border-gray-200 py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">コントラクトエージェント</h3>
              <p className="text-sm sm:text-base text-gray-600">
                AIを活用した自動化で契約書管理のプロセスを効率化します。
              </p>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">サービス</h3>
              <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li><Link to="/upload" className="text-gray-600 hover:text-primary-600">アップロード</Link></li>
                <li><Link to="/dashboard" className="text-gray-600 hover:text-primary-600">ダッシュボード</Link></li>
                <li><Link to="/settings" className="text-gray-600 hover:text-primary-600">設定</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">会社情報</h3>
              <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li><Link to="/about" className="text-gray-600 hover:text-primary-600">会社概要</Link></li>
                <li><Link to="/privacy" className="text-gray-600 hover:text-primary-600">プライバシーポリシー</Link></li>
                <li><Link to="/terms" className="text-gray-600 hover:text-primary-600">利用規約</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs sm:text-sm text-gray-600">© 2025 コントラクトエージェント. All rights reserved.</p>
            <div className="flex space-x-4 mt-3 md:mt-0 text-xs sm:text-sm">
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
