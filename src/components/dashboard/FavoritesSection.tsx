import React from 'react';
import { FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useGuestFavorites, useUnfavoriteCast } from '../../hooks/useQueries';
import { CastProfile } from '../../services/api';
import Spinner from '../ui/Spinner';

import { getFirstAvatarUrl } from '../../utils/avatar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const FavoritesSection: React.FC<{ hideLoading?: boolean }> = ({ hideLoading = false }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { data: favoritesData, isLoading: loading } = useGuestFavorites(user?.id || 0);
  const unfavoriteCastMutation = useUnfavoriteCast();
  const favorites = favoritesData?.casts || [];

  const handleUnfavorite = async (castId: number) => {
    if (!user) return;
    try {
      await unfavoriteCastMutation.mutateAsync({ userId: user.id, castId });
    } catch (error) {
      console.error('Failed to unfavorite cast:', error);
    }
  };

  const handleAvatarClick = (castId: number) => {
    navigate(`/cast/${castId}`);
  };

  if (loading && !hideLoading) {
    return <Spinner />
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg ">
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
    <div className="bg-primary rounded-lg shadow p-4 mb-4">
      <h2 className="font-bold text-lg mb-2 mt-2 text-white">お気に入り</h2>
      {favorites.map((profile: CastProfile) => (
        <div key={profile.id} className="bg-white/10 rounded-lg shadow p-3 border border-secondary mb-2">
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
              className="ml-2 text-secondary hover:text-white"
              onClick={() => handleUnfavorite(profile.id)}
              title="お気に入り解除"
              style={{ backgroundColor: 'transparent'}}
            >
              <FiStar className="w-6 h-6 fill-secondary"/>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FavoritesSection; 