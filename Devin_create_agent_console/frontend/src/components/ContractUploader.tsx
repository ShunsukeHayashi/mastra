import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import contractApi from '../api/contractApi';

interface ContractUploaderProps {
  onUploadSuccess?: (contractId: string) => void;
  onUploadError?: (error: string) => void;
}

const ContractUploader: React.FC<ContractUploaderProps> = ({ 
  onUploadSuccess, 
  onUploadError 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file: File) => {
    setUploadError(null);
    
    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(fileType || '')) {
      const error = 'サポートされているファイル形式は PDF, DOC, DOCX のみです';
      setUploadError(error);
      if (onUploadError) onUploadError(error);
      return;
    }
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      const error = 'ファイルサイズは 10MB 以下にしてください';
      setUploadError(error);
      if (onUploadError) onUploadError(error);
      return;
    }
    
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);
    
    try {
      // Call API to upload contract
      const response = await contractApi.uploadContract(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (onUploadSuccess) {
        onUploadSuccess(response.contractId);
      }
      
      // Reset after successful upload
      setTimeout(() => {
        setFile(null);
        setIsUploading(false);
        setUploadProgress(0);
      }, 1500);
      
    } catch (error) {
      clearInterval(progressInterval);
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      setUploadError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
      setIsUploading(false);
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md">
      <div 
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 text-center ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
        />
        
        {!file ? (
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-base sm:text-lg mb-2">ここにファイルをドラッグ＆ドロップ</p>
            <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">または</p>
            <button 
              onClick={handleSelectFileClick}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm sm:text-base"
            >
              ファイルを選択
            </button>
            <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
              サポートされているファイル形式: PDF, DOC, DOCX
            </p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-center mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mb-2 sm:mb-0 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-base sm:text-lg font-medium text-center sm:text-left break-all">
                {file.name.length > 25 ? `${file.name.substring(0, 25)}...` : file.name}
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            
            {isUploading ? (
              <div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">アップロード中... {uploadProgress}%</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center">
                <button 
                  onClick={() => setFile(null)}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  キャンセル
                </button>
                <button 
                  onClick={handleUpload}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  アップロード
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {uploadError && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{uploadError}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractUploader;
