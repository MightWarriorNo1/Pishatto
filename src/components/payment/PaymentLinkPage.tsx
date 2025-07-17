import React from 'react';

const PaymentLinkPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => (
    <div className="max-w-md mx-auto min-h-screen bg-primary flex flex-col">
        <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
            {onBack && <button onClick={onBack} className="mr-2 text-2xl text-white">&#60;</button>}
            <span className="text-lg font-bold flex-1 text-center text-white">お支払いリンク</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="bg-primary rounded-lg p-6 mb-6 w-full text-center border border-secondary">
                <div className="text-white mb-2">サービス利用前にお支払いが必要です。</div>
                <div className="text-white font-bold text-lg mb-2">https://pay.example.com/abc123</div>
                <button className="bg-secondary text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition-all duration-200">リンクをコピー</button>
            </div>
        </div>
    </div>
);

export default PaymentLinkPage; 