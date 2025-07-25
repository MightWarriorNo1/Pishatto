import React from 'react';

const recommendedCasts = [
    { name: 'さくら', img: 'https://placehold.co/80x80', desc: '明るく元気なキャストです！' },
    { name: 'ゆい', img: 'https://placehold.co/80x80', desc: 'おしゃべり大好き！' },
];

const RecommendedCastsSection: React.FC = () => (
    <div className="bg-primary rounded-lg shadow p-4 mb-4 border border-secondary">
        <h2 className="font-bold text-lg mb-2 text-white">おすすめキャスト</h2>
        <div className="flex gap-4">
            {recommendedCasts.map(cast => (
                <div key={cast.name} className="flex flex-col items-center">
                    <img src={cast.img} alt={cast.name} className="w-20 h-20 rounded-full object-cover mb-2 border-2 border-secondary" />
                    <span className="font-bold text-sm mb-1 text-white">{cast.name}</span>
                    <span className="text-xs text-white text-center">{cast.desc}</span>
                </div>
            ))}
        </div>
    </div>
);

export default RecommendedCastsSection; 