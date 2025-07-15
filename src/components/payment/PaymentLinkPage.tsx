import React from 'react';

const PaymentLinkPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => (
    <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col">
        <div className="flex items-center px-4 py-3 border-b bg-white">
            {onBack && <button onClick={onBack} className="mr-2 text-2xl text-gray-500">&#60;</button>}
            <span className="text-lg font-bold flex-1 text-center">お支払いリンク</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="bg-gray-100 rounded-lg p-6 mb-6 w-full text-center">
                <div className="text-gray-700 mb-2">サービス利用前にお支払いが必要です。</div>
                <div className="text-blue-500 font-bold text-lg mb-2">https://pay.example.com/abc123</div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded font-bold">リンクをコピー</button>
            </div>
        </div>
    </div>
);

export default PaymentLinkPage; 