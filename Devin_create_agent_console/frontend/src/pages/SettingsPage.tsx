import React, { useState } from 'react';

const SettingsPage: React.FC = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    slack: true,
    browser: false,
  });
  
  const [approvalSettings, setApprovalSettings] = useState({
    autoApproveNDA: false,
    requireLegalForHigh: true,
    requireCEOForHigh: true,
  });
  
  const [integrationSettings, setIntegrationSettings] = useState({
    slackWorkspace: 'workspace-xyz',
    slackChannel: '#contracts',
    googleDrive: true,
    dropbox: false,
  });
  
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    });
  };
  
  const handleApprovalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setApprovalSettings({
      ...approvalSettings,
      [name]: checked,
    });
  };
  
  const handleIntegrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value, type } = e.target;
    setIntegrationSettings({
      ...integrationSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">設定</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 通知設定 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">通知設定</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="email" className="text-gray-700">メール通知</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="email" 
                  name="email" 
                  checked={notificationSettings.email}
                  onChange={handleNotificationChange}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="email" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${notificationSettings.email ? 'bg-primary-500' : 'bg-gray-300'}`}
                ></label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="slack" className="text-gray-700">Slack通知</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="slack" 
                  name="slack" 
                  checked={notificationSettings.slack}
                  onChange={handleNotificationChange}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="slack" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${notificationSettings.slack ? 'bg-primary-500' : 'bg-gray-300'}`}
                ></label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="browser" className="text-gray-700">ブラウザ通知</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="browser" 
                  name="browser" 
                  checked={notificationSettings.browser}
                  onChange={handleNotificationChange}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="browser" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${notificationSettings.browser ? 'bg-primary-500' : 'bg-gray-300'}`}
                ></label>
              </div>
            </div>
          </div>
        </div>
        
        {/* 承認フロー設定 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">承認フロー設定</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="autoApproveNDA" className="text-gray-700">標準NDAの自動承認</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="autoApproveNDA" 
                  name="autoApproveNDA" 
                  checked={approvalSettings.autoApproveNDA}
                  onChange={handleApprovalChange}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="autoApproveNDA" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${approvalSettings.autoApproveNDA ? 'bg-primary-500' : 'bg-gray-300'}`}
                ></label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="requireLegalForHigh" className="text-gray-700">高リスク契約の法務承認必須</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="requireLegalForHigh" 
                  name="requireLegalForHigh" 
                  checked={approvalSettings.requireLegalForHigh}
                  onChange={handleApprovalChange}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="requireLegalForHigh" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${approvalSettings.requireLegalForHigh ? 'bg-primary-500' : 'bg-gray-300'}`}
                ></label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="requireCEOForHigh" className="text-gray-700">高リスク契約のCEO承認必須</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="requireCEOForHigh" 
                  name="requireCEOForHigh" 
                  checked={approvalSettings.requireCEOForHigh}
                  onChange={handleApprovalChange}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="requireCEOForHigh" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${approvalSettings.requireCEOForHigh ? 'bg-primary-500' : 'bg-gray-300'}`}
                ></label>
              </div>
            </div>
          </div>
        </div>
        
        {/* 外部連携設定 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">外部連携設定</h2>
          
          <div className="space-y-4">
            <div className="mb-4">
              <label htmlFor="slackWorkspace" className="block text-sm font-medium text-gray-700 mb-1">
                Slackワークスペース
              </label>
              <input
                type="text"
                id="slackWorkspace"
                name="slackWorkspace"
                value={integrationSettings.slackWorkspace}
                onChange={handleIntegrationChange}
                className="input-field"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="slackChannel" className="block text-sm font-medium text-gray-700 mb-1">
                Slackチャンネル
              </label>
              <input
                type="text"
                id="slackChannel"
                name="slackChannel"
                value={integrationSettings.slackChannel}
                onChange={handleIntegrationChange}
                className="input-field"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="googleDrive" className="text-gray-700">Google Drive連携</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="googleDrive" 
                  name="googleDrive" 
                  checked={integrationSettings.googleDrive}
                  onChange={handleIntegrationChange}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="googleDrive" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${integrationSettings.googleDrive ? 'bg-primary-500' : 'bg-gray-300'}`}
                ></label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="dropbox" className="text-gray-700">Dropbox連携</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="dropbox" 
                  name="dropbox" 
                  checked={integrationSettings.dropbox}
                  onChange={handleIntegrationChange}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="dropbox" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${integrationSettings.dropbox ? 'bg-primary-500' : 'bg-gray-300'}`}
                ></label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button className="btn-secondary mr-4">キャンセル</button>
        <button className="btn-primary">保存</button>
      </div>
    </div>
  );
};

export default SettingsPage;
