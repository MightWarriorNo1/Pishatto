import React from 'react';

const LineLogin: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary">
        <h1 className="text-2xl font-bold mb-6 text-white">LINEログイン</h1>
        <button className="bg-primary text-white px-6 py-3 rounded-full font-bold text-lg">LINEでログイン</button>
        <div className="mt-4 text-white">※ここにLINE認証の処理を実装</div>
    </div>
);

export default LineLogin; 