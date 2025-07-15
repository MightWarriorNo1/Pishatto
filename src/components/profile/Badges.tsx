import React from 'react';

const badges = ['💎', '🏆', '🌟'];

const Badges: React.FC = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="font-bold text-lg mb-2">バッジ</h2>
        <div className="flex gap-2">
            {badges.map((badge, i) => (
                <span key={i} className="text-2xl">{badge}</span>
            ))}
        </div>
    </div>
);

export default Badges; 