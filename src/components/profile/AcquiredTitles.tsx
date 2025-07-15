import React from 'react';

const titles = ['VIP', '常連', '初回特典'];

const AcquiredTitles: React.FC = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="font-bold text-lg mb-2">獲得タイトル</h2>
        <div className="flex gap-2">
            {titles.map(title => (
                <span key={title} className="bg-yellow-300 text-yellow-900 px-3 py-1 rounded-full font-bold text-sm">{title}</span>
            ))}
        </div>
    </div>
);

export default AcquiredTitles; 