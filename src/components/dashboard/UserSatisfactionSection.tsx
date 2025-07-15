import React from 'react';
import { FiStar } from 'react-icons/fi';

interface SatisfactionProfile {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  price: number;
  duration: number;
}

const UserSatisfactionSection: React.FC = () => {
  const profiles: SatisfactionProfile[] = [
    {
      id: 1,
      name: 'あい',
      rating: 4.8,
      reviews: 27,
      imageUrl: 'assets/avatar/female.png',
      price: 16000,
      duration: 30
    },
    {
      id: 2,
      name: 'sdfe',
      rating: 5.8,
      reviews: 217,
      imageUrl: 'assets/avatar/female.png',
      price: 26000,
      duration: 30
    },
    {
      id: 3,
      name: 'あい',
      rating: 4.8,
      reviews: 27,
      imageUrl: 'assets/avatar/female.png',
      price: 16000,
      duration: 30
    },
    {
      id: 4,
      name: 'あい',
      rating: 4.8,
      reviews: 27,
      imageUrl: 'assets/avatar/female.png',
      price: 16000,
      duration: 30
    },
    {
      id: 5,
      name: 'あい',
      rating: 4.8,
      reviews: 27,
      imageUrl: 'assets/avatar/female.png',
      price: 16000,
      duration: 30
    },
    {
      id: 6,
      name: 'あい',
      rating: 4.8,
      reviews: 27,
      imageUrl: 'assets/avatar/female.png',
      price: 16000,
      duration: 30
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">ユーザー満足度の高いキャスト</h2>
        <button className="text-sm text-gray-500">すべて見る＞</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="bg-white rounded-lg shadow p-3">
            <div className="flex space-x-3">
              <div className="w-full">
                <img
                  src={profile.imageUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{profile.name}</span>
                <div className="flex items-center text-yellow-400">
                  <FiStar className="w-3 h-3" />
                  <span className="ml-1 text-xs">{profile.rating}</span>
                </div>
              </div>
              <div className="text-gray-500 text-xs mt-1">
                <div>レビュー {profile.reviews}件</div>
                <div className="mt-1 text-blue-600">
                  {profile.price.toLocaleString()}円 / {profile.duration}分
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSatisfactionSection;