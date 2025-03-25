import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContractList from '../components/ContractList';
import contractApi from '../api/contractApi';

interface Contract {
  contractId: string;
  title: string;
  company: string;
  status: 'pending' | 'approved' | 'rejected' | 'finalized';
  uploadDate: string;
  riskLevel: 'low' | 'medium' | 'high';
}

const DashboardPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setIsLoading(true);
        // For demo purposes, use sample data instead of API call
        // In production, uncomment the API call below
        // const response = await contractApi.listContracts();
        
        // Sample contracts data
        const sampleContracts: Contract[] = [
          {
            contractId: 'sample-1',
            title: '秘密保持契約書',
            company: '株式会社テクノロジー',
            status: 'approved',
            uploadDate: '2025-03-24',
            riskLevel: 'low',
          },
          {
            contractId: 'sample-2',
            title: 'サービス契約書',
            company: '株式会社ビジネス',
            status: 'pending',
            uploadDate: '2025-03-23',
            riskLevel: 'medium',
          },
          {
            contractId: 'sample-3',
            title: '業務提携契約書',
            company: '株式会社パートナー',
            status: 'pending',
            uploadDate: '2025-03-22',
            riskLevel: 'high',
          },
        ];
        
        setContracts(sampleContracts);
        setError(null);
      } catch (err) {
        setError('契約書一覧の取得に失敗しました。後でもう一度お試しください。');
        console.error('Error fetching contracts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const handleViewContract = (contractId: string) => {
    console.log(`View contract: ${contractId}`);
    // Navigate to contract details page or open modal
  };

  const handleApproveContract = (contractId: string) => {
    console.log(`Approve contract: ${contractId}`);
    // Implement approval logic
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">契約書ダッシュボード</h1>
        <Link to="/upload" className="btn-primary">
          新規アップロード
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">契約書の状態</h2>
          <div className="flex justify-between items-center">
            <div className="text-4xl font-bold text-primary-600">{contracts.length}</div>
            <div className="text-gray-500">合計</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-green-50 p-2 rounded">
              <div className="text-green-600 font-semibold">{contracts.filter(c => c.status === 'approved').length}</div>
              <div className="text-sm text-gray-600">承認済み</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="text-yellow-600 font-semibold">{contracts.filter(c => c.status === 'pending').length}</div>
              <div className="text-sm text-gray-600">承認待ち</div>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <div className="text-red-600 font-semibold">{contracts.filter(c => c.status === 'rejected').length}</div>
              <div className="text-sm text-gray-600">却下</div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-blue-600 font-semibold">{contracts.filter(c => c.status === 'finalized').length}</div>
              <div className="text-sm text-gray-600">締結済み</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">最近のアクティビティ</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="bg-blue-100 text-blue-600 p-1 rounded mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm">秘密保持契約が承認されました</p>
                <p className="text-xs text-gray-500">2時間前</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-green-100 text-green-600 p-1 rounded mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-sm">新しい契約書がアップロードされました</p>
                <p className="text-xs text-gray-500">昨日</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-yellow-100 text-yellow-600 p-1 rounded mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm">リーガルチェックでリスクが検出されました</p>
                <p className="text-xs text-gray-500">2日前</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">承認待ち</h2>
          {contracts.filter(c => c.status === 'pending').length > 0 ? (
            <ul className="space-y-3">
              {contracts
                .filter(c => c.status === 'pending')
                .slice(0, 3)
                .map((contract, index) => (
                  <li key={contract.contractId} className="border-l-4 border-yellow-500 pl-3 py-1">
                    <p className="font-medium">{contract.title}</p>
                    <p className="text-sm text-gray-600">承認者: 担当者</p>
                    <p className="text-xs text-gray-500">期限: {new Date(new Date().getTime() + (index + 1) * 86400000).toLocaleDateString('ja-JP')}</p>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">現在、承認待ちの契約書はありません</p>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">契約書一覧</h2>
            <div className="flex space-x-2">
              <select className="form-select text-sm">
                <option value="all">すべてのステータス</option>
                <option value="pending">承認待ち</option>
                <option value="approved">承認済み</option>
                <option value="rejected">却下</option>
                <option value="finalized">締結済み</option>
              </select>
              <select className="form-select text-sm">
                <option value="newest">新しい順</option>
                <option value="oldest">古い順</option>
                <option value="risk-high">リスク高い順</option>
                <option value="risk-low">リスク低い順</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">契約書データを読み込み中...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
            <button 
              className="mt-4 text-primary-600 hover:text-primary-800 font-medium"
              onClick={() => window.location.reload()}
            >
              再読み込み
            </button>
          </div>
        ) : (
          <ContractList 
            contracts={contracts} 
            onViewContract={handleViewContract}
            onApproveContract={handleApproveContract}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
