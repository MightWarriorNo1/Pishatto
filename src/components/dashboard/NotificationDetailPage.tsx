import React from 'react';

const NotificationDetailPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="max-w-md mx-auto min-h-screen bg-white">
        <div className="flex items-center px-4 py-3 border-b bg-white">
            <button onClick={onBack} className="mr-2 text-2xl text-gray-500">&#60;</button>
            <span className="text-lg font-bold flex-1 text-center">お知らせ詳細</span>
        </div>
        <div className="p-6">
            <h2 className="font-bold text-xl mb-2">通知タイトル</h2>
            <div className="text-gray-700 mb-4">ここに通知の詳細内容が表示されます。</div>
            <div className="text-xs text-gray-400">2025/02/20 13:32</div>
        </div>
    </div>
);

export default NotificationDetailPage; 