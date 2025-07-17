import React from 'react';
import { FiStar } from 'react-icons/fi';

interface FavoriteProfile {
  id: number;
  name: string;
  age: number;
  imageUrl: string;
  rating: number;
  price: number;
  duration: number;
}

const FavoritesSection: React.FC = () => {
  const favorites: FavoriteProfile[] = [];

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-primary rounded-lg border border-secondary">
        <div className="w-48 h-48 mb-6">
          <img
            src="/assets/avatar/image-1.png"
            alt="お気に入りなし"
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-lg font-bold text-center mb-2 text-white">
          あなただけのお気に入りリストを作りましょう
        </h2>
        <p className="text-sm text-white text-center">
          まずは、プロフィールの横の星マークをタップしてお気に入りをしましょう
        </p>
      </div>
    );
  }

  return (
    <div className="bg-primary rounded-lg shadow p-4 mb-4 border border-secondary">
      <h2 className="font-bold text-lg mb-2 text-white">お気に入り</h2>
      {favorites.map((profile) => (
        <div key={profile.id} className="bg-primary rounded-lg shadow p-3 border border-secondary">
          <div className="flex space-x-4">
            <div className="w-24 h-24">
              <img
                src={profile.imageUrl}
                alt={profile.name}
                className="w-full h-full object-cover rounded border border-secondary"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-white">{profile.name}</span>
                  <span className="text-sm text-white ml-2">{profile.age}歳</span>
                </div>
                <div className="flex items-center text-white">
                  <FiStar className="w-4 h-4 fill-current" />
                  <span className="ml-1">{profile.rating}</span>
                </div>
              </div>
              <div className="text-white text-sm mt-2">
                {profile.price.toLocaleString()}円 / {profile.duration}分
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FavoritesSection; 