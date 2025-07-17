import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CastProfile {
  id: number;
  name: string;
  age: number;
  location: string;
  isPremium: boolean;
  imageUrl: string;
  hasHeart?: boolean;
  points?: number;
}

const NewCastSection: React.FC = () => {
  const navigate = useNavigate();

  const castProfiles: CastProfile[] = [
    {
      id: 1,
      name: 'カナ',
      age: 24,
      location: '名古屋',
      isPremium: true,
      imageUrl: 'assets/avatar/female.png',
      points: 7500,
    },
    {
      id: 2,
      name: 'もな',
      age: 20,
      location: '名古屋',
      isPremium: true,
      imageUrl: 'assets/avatar/female.png',
      hasHeart: true,
      points: 7500,
    },
    {
      id: 3,
      name: 'ava',
      age: 26,
      location: '名古屋',
      isPremium: true,
      imageUrl: 'assets/avatar/female.png',
      points: 7500,
    },
  ];

  const handleCastClick = (castId: number) => {
    navigate(`/cast/${castId}`);
  };

  return (
    <div className="bg-primary rounded-lg shadow p-4 mb-4 border border-secondary">
      <h2 className="font-bold text-lg mb-2 text-white">新着キャスト</h2>
      <div className="grid grid-cols-3 gap-3">
        {castProfiles.map((profile) => (
          <div
            key={profile.id}
            className="bg-primary rounded-lg shadow relative cursor-pointer transition-transform hover:scale-105 border border-secondary"
            onClick={() => handleCastClick(profile.id)}
          >
            <div className="aspect-w-3 aspect-h-4 relative">
              <img
                src={profile.imageUrl}
                alt={profile.name}
                className="w-full h-full object-cover rounded-lg border border-secondary"
              />
              {profile.isPremium && (
                <div className="absolute top-[132px] h-[25px] w-[80%] bg-gradient-to-r from-red-600 to-red-400 text-white text-xs px-2 py-1 rounded">
                  プレミアム
                </div>
              )}
            </div>
            <div className="p-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white">● {profile.age}歳</span>
                <span className="text-white">{profile.name}</span>
              </div>
              <div className="text-white text-xs mt-1">
                {profile.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewCastSection; 