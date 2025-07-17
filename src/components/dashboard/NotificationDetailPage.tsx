import React from 'react';

const NotificationDetailPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="max-w-md mx-auto min-h-screen bg-primary">
        <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
            <button onClick={onBack} className="mr-2 text-2xl text-white">&#60;</button>
            <span className="text-lg font-bold flex-1 text-center text-white">お知らせ詳細</span>
        </div>
        <div className="p-6">
            <h2 className="font-bold text-xl mb-2 text-white">通知タイトル</h2>
            <div className="text-white mb-4">ここに通知の詳細内容が表示されます。</div>
            <div className="text-xs text-white">2025/02/20 13:32</div>
        </div>
    </div>
);

export default NotificationDetailPage; 