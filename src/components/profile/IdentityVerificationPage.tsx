import React, { useState } from 'react';

const IdentityVerificationPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const [status, setStatus] = useState<'未提出' | '審査中' | '承認済み'>('未提出');
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary">
            <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
                {onBack && <button onClick={onBack} className="mr-2 text-2xl text-white">&#60;</button>}
                <span className="text-lg font-bold flex-1 text-center text-white">本人確認</span>
            </div>
            <div className="p-6">
                <h2 className="font-bold text-xl mb-2 text-white">本人確認書類の提出</h2>
                <div className="mb-4 text-white">本人確認のため、身分証明書をアップロードしてください。</div>
                <div className="mb-4">
                    <input type="file" accept="image/*" className="mb-2" />
                    <div className="text-xs text-white">運転免許証、パスポート、マイナンバーカード等</div>
                </div>
                <div className="mb-4">
                    <span className="font-bold text-white">現在のステータス：</span>
                    <span className="text-white font-bold">{status}</span>
                </div>
                <button className="w-full bg-secondary text-white py-3 rounded font-bold hover:bg-red-700 transition-all duration-200" onClick={() => setStatus('審査中')}>提出する</button>
            </div>
        </div>
    );
};

export default IdentityVerificationPage; 