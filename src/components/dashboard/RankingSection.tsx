import React from 'react';

interface RankingProfile {
  id: number;
  rank: number;
  name: string;
  imageUrl: string;
  comment: string;
}

const RankingSection: React.FC = () => {
  const rankings: RankingProfile[] = [
    {
      id: 1,
      rank: 1,
      name: 'みく',
      imageUrl: 'assets/avatar/female.png',
      comment: 'お話上手でした！'
    },
    {
      id: 2,
      rank: 2,
      name: 'あい',
      imageUrl: 'assets/avatar/female.png',
      comment: 'お話上手でした！'
    },
    {
      id: 3,
      rank: 3,
      name: 'あい',
      imageUrl: 'assets/avatar/female.png',
      comment: 'お話上手でした！'
    }

  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">昨日のランキングTOP10</h2>
        <button className="text-sm text-white">ランキングを見る＞</button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {rankings.map((profile) => (
          <div key={profile.id} className="bg-primary rounded-lg shadow p-3 border border-secondary">
            <div className="relative">
              <img
                src={profile.imageUrl}
                alt={profile.name}
                className="w-full aspect-square object-cover rounded border border-secondary"
              />
              <div className="absolute top-2 left-2 bg-secondary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {profile.rank}
              </div>
            </div>
            <div className="mt-2">
              <div className="font-medium text-white">{profile.name}</div>
              <div className="text-xs text-white mt-1">{profile.comment}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingSection; 