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
        <h2 className="text-lg font-bold">昨日のランキングTOP10</h2>
        <button className="text-sm text-gray-500">ランキングを見る＞</button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {rankings.map((profile) => (
          <div key={profile.id} className="bg-white rounded-lg shadow p-3">
            <div className="relative">
              <img
                src={profile.imageUrl}
                alt={profile.name}
                className="w-full aspect-square object-cover rounded"
              />
              <div className="absolute top-2 left-2 bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {profile.rank}
              </div>
            </div>
            <div className="mt-2">
              <div className="font-medium">{profile.name}</div>
              <div className="text-xs text-gray-500 mt-1">{profile.comment}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingSection; 