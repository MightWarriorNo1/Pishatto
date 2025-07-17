import React from 'react';

const titles = ['VIP', '常連', '初回特典'];

const AcquiredTitles: React.FC = () => (
    <div className="bg-primary rounded-lg shadow p-4 mb-4 border border-secondary">
        <h2 className="font-bold text-lg mb-2 text-white">獲得タイトル</h2>
        <div className="flex gap-2">
            {titles.map(title => (
                <span key={title} className="bg-secondary text-white px-3 py-1 rounded-full font-bold text-sm">{title}</span>
            ))}
        </div>
    </div>
);

export default AcquiredTitles; 