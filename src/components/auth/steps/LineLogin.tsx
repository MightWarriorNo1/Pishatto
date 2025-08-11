import React from 'react';

const LineLogin: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary via-gray-800 to-secondary p-6">
        <h1 className="text-2xl font-bold mb-6 text-white">LINEログイン</h1>
        <button aria-label="LINEでログイン" className="bg-secondary hover:bg-red-400 text-white px-6 py-3 rounded-full font-bold text-lg focus:outline-none focus:ring-2 focus:ring-secondary/60">
            LINEでログイン
        </button>
        <div className="mt-4 text-white text-sm">※ここにLINE認証の処理を実装</div>
    </div>
);

export default LineLogin; 