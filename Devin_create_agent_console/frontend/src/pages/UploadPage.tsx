import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ContractUploader from '../components/ContractUploader';

const UploadPage: React.FC = () => {
  const [uploadSuccess, setUploadSuccess] = useState(false);
  // Keep setUploadError for the handler but remove unused state variable
  const [, setUploadError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUploadSuccess = () => {
    setUploadSuccess(true);
    // Navigate to dashboard after successful upload
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/" className="text-gray-500 hover:text-primary-600 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">契約書アップロード</h1>
        </div>
        
        <ContractUploader 
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
        
        {uploadSuccess && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              アップロードが完了しました。ダッシュボードに移動します...
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">アップロードのヒント</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              ファイルサイズは10MB以下にしてください
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              スキャンされたPDFの場合、テキスト認識が可能なことを確認してください
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              アップロード後、AIが自動的に契約内容を解析します
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              解析後、リーガルチェックと承認フローが自動的に設定されます
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
