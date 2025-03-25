import React from 'react';
import { Link } from 'react-router-dom';

interface Contract {
  contractId: string;
  title: string;
  company: string;
  status: 'pending' | 'approved' | 'rejected' | 'finalized';
  uploadDate: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ContractListProps {
  contracts: Contract[];
  onViewContract?: (contractId: string) => void;
  onApproveContract?: (contractId: string) => void;
}

const ContractList: React.FC<ContractListProps> = ({ 
  contracts, 
  onViewContract,
  onApproveContract
}) => {
  // Helper function to get status text and color
  const getStatusInfo = (status: Contract['status']) => {
    switch (status) {
      case 'pending':
        return { text: '承認待ち', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      case 'approved':
        return { text: '承認済み', bgColor: 'bg-green-100', textColor: 'text-green-800' };
      case 'rejected':
        return { text: '却下', bgColor: 'bg-red-100', textColor: 'text-red-800' };
      case 'finalized':
        return { text: '締結済み', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
      default:
        return { text: '不明', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  // Helper function to get risk level text and color
  const getRiskInfo = (riskLevel: Contract['riskLevel']) => {
    switch (riskLevel) {
      case 'low':
        return { text: '低', bgColor: 'bg-green-100', textColor: 'text-green-800' };
      case 'medium':
        return { text: '中', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      case 'high':
        return { text: '高', bgColor: 'bg-red-100', textColor: 'text-red-800' };
      default:
        return { text: '不明', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  // Format date to Japanese format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  return (
    <>
      {/* Desktop view - Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイトル
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アップロード日
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                リスクレベル
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contracts.length > 0 ? (
              contracts.map((contract) => {
                const statusInfo = getStatusInfo(contract.status);
                const riskInfo = getRiskInfo(contract.riskLevel);
                
                return (
                  <tr key={contract.contractId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {contract.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contract.company}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contract.uploadDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${riskInfo.bgColor} ${riskInfo.textColor}`}>
                        {riskInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => onViewContract && onViewContract(contract.contractId)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        表示
                      </button>
                      {contract.status === 'pending' && (
                        <button 
                          onClick={() => onApproveContract && onApproveContract(contract.contractId)}
                          className="text-green-600 hover:text-green-900"
                        >
                          承認
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  契約書がありません。新しい契約書を
                  <Link to="/upload" className="text-primary-600 hover:text-primary-900 ml-1">
                    アップロード
                  </Link>
                  してください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile view - Card list */}
      <div className="sm:hidden">
        {contracts.length > 0 ? (
          <div className="space-y-4">
            {contracts.map((contract) => {
              const statusInfo = getStatusInfo(contract.status);
              const riskInfo = getRiskInfo(contract.riskLevel);
              
              return (
                <div key={contract.contractId} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{contract.title}</h3>
                      <p className="text-xs text-gray-500">{contract.company}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-gray-500">アップロード日:</p>
                      <p className="font-medium">{formatDate(contract.uploadDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">リスクレベル:</p>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${riskInfo.bgColor} ${riskInfo.textColor}`}>
                        {riskInfo.text}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 border-t border-gray-100 pt-3">
                    <button 
                      onClick={() => onViewContract && onViewContract(contract.contractId)}
                      className="text-primary-600 hover:text-primary-900 text-xs font-medium"
                    >
                      表示
                    </button>
                    {contract.status === 'pending' && (
                      <button 
                        onClick={() => onApproveContract && onApproveContract(contract.contractId)}
                        className="text-green-600 hover:text-green-900 text-xs font-medium"
                      >
                        承認
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">
              契約書がありません。新しい契約書を
              <Link to="/upload" className="text-primary-600 hover:text-primary-900 ml-1">
                アップロード
              </Link>
              してください。
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ContractList;
