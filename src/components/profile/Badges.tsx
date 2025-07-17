
import React from 'react';

const badges = ['💎', '🏆', '🌟'];

const Badges: React.FC = () => (
    <div className="bg-primary rounded-lg shadow p-4 mb-4 border border-secondary">
        <h2 className="font-bold text-lg mb-2 text-white">バッジ</h2>
        <div className="flex gap-2">
            {badges.map((badge, i) => (
                <span key={i} className="text-2xl text-white">{badge}</span>
            ))}
        </div>
    </div>
);

export default Badges; 