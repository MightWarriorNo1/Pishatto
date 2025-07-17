import React from 'react';

const OrderConfirmationPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="max-w-md mx-auto min-h-screen bg-primary">
        <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
            <button onClick={onBack} className="mr-2 text-2xl text-white">&#60;</button>
            <span className="text-lg font-bold flex-1 text-center text-white">注文確認</span>
        </div>
        <div className="p-6">
            <h2 className="font-bold text-xl mb-2 text-white">注文内容</h2>
            <div className="mb-4 text-white">ここに注文の詳細が表示されます。</div>
            <button className="w-full bg-secondary text-white py-3 rounded font-bold hover:bg-red-700 transition-all duration-200">確定する</button>
        </div>
    </div>
);

export default OrderConfirmationPage; 