import React, { useEffect, useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { getFavorites, unfavoriteCast } from '../../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Utility function to get the first available avatar from comma-separated string
const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
  if (!avatarString) {
    return '/assets/avatar/female.png';
  }
  
  // Split by comma and get the first non-empty avatar
  const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
  
  if (avatars.length === 0) {
    return '/assets/avatar/female.png';
  }
  
  return `${API_BASE_URL}/${avatars[0]}`;
};

const FavoritesSection: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getFavorites(user.id).then((data) => {
        setFavorites(data.casts || []);
        setLoading(false);
      });
    }
  }, [user]);

  const handleUnfavorite = async (castId: number) => {
    if (!user) return;
    await unfavoriteCast(user.id, castId);
    setFavorites(favorites.filter((c) => c.id !== castId));
  };

  const handleAvatarClick = (castId: number) => {
    navigate(`/cast/${castId}`);
  };

  if (loading) {
    return <div className="text-white">ローディング...</div>;
  }

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
        <div key={profile.id} className="bg-primary rounded-lg shadow p-3 border border-secondary mb-2">
          <div className="flex space-x-4 items-center">
            <div className="w-16 h-16">
              <img
                src={getFirstAvatarUrl(profile.avatar)}
                alt={profile.nickname}
                className="w-full h-full object-cover rounded border border-secondary cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleAvatarClick(profile.id)}
              />
            </div>
            <div className="flex-1">
              <span className="font-medium text-white">{profile.nickname}</span>
            </div>
            <button
              className="ml-2 text-yellow-400 hover:text-yellow-600"
              onClick={() => handleUnfavorite(profile.id)}
              title="お気に入り解除"
            >
              <FiStar className="w-6 h-6" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FavoritesSection; 