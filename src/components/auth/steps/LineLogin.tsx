import React from 'react';

const LineLogin: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <h1 className="text-2xl font-bold mb-6">LINEログイン</h1>
        <button className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg">LINEでログイン</button>
        <div className="mt-4 text-gray-400">※ここにLINE認証の処理を実装</div>
    </div>
);

export default LineLogin; 