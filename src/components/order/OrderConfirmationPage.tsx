import React from 'react';

const OrderConfirmationPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="max-w-md mx-auto min-h-screen bg-white">
        <div className="flex items-center px-4 py-3 border-b bg-white">
            <button onClick={onBack} className="mr-2 text-2xl text-gray-500">&#60;</button>
            <span className="text-lg font-bold flex-1 text-center">注文確認</span>
        </div>
        <div className="p-6">
            <h2 className="font-bold text-xl mb-2">注文内容</h2>
            <div className="mb-4 text-gray-700">ここに注文の詳細が表示されます。</div>
            <button className="w-full bg-orange-500 text-white py-3 rounded font-bold">確定する</button>
        </div>
    </div>
);

export default OrderConfirmationPage; 