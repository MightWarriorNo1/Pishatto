import React, { useState } from 'react';

const IdentityVerificationPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const [status, setStatus] = useState<'未提出' | '審査中' | '承認済み'>('未提出');
    return (
        <div className="max-w-md mx-auto min-h-screen bg-white">
            <div className="flex items-center px-4 py-3 border-b bg-white">
                {onBack && <button onClick={onBack} className="mr-2 text-2xl text-gray-500">&#60;</button>}
                <span className="text-lg font-bold flex-1 text-center">本人確認</span>
            </div>
            <div className="p-6">
                <h2 className="font-bold text-xl mb-2">本人確認書類の提出</h2>
                <div className="mb-4 text-gray-700">本人確認のため、身分証明書をアップロードしてください。</div>
                <div className="mb-4">
                    <input type="file" accept="image/*" className="mb-2" />
                    <div className="text-xs text-gray-400">運転免許証、パスポート、マイナンバーカード等</div>
                </div>
                <div className="mb-4">
                    <span className="font-bold">現在のステータス：</span>
                    <span className="text-blue-500 font-bold">{status}</span>
                </div>
                <button className="w-full bg-orange-500 text-white py-3 rounded font-bold" onClick={() => setStatus('審査中')}>提出する</button>
            </div>
        </div>
    );
};

export default IdentityVerificationPage; 