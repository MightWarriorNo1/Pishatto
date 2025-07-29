import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { fetchRanking } from '../../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface SatisfactionProfile {
  id: number;
  name: string;
  avatar?: string;
  points: number;
  gift_count: number;
  // Mock rating and price for display purposes
  rating: number;
  price: number;
  duration: number;
}

const UserSatisfactionSection: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<SatisfactionProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Get current month's ranking for casts by gifts (as proxy for satisfaction)
    fetchRanking({
      userType: 'cast',
      timePeriod: 'current',
      category: 'gift',
      area: '全国'
    }).then((data) => {
      const rankingData = data.data || [];
      // Transform ranking data to satisfaction format with mock ratings
      const satisfactionData = rankingData.slice(0, 6).map((cast: any, index: number) => ({
        id: cast.id,
        name: cast.name,
        avatar: cast.avatar,
        points: cast.points,
        gift_count: cast.gift_count || 0,
        // Mock rating based on gift count (4.5-5.0 range)
        rating: Math.max(4.5, 5.0 - (index * 0.1)),
        // Mock price (15000-25000 range)
        price: 15000 + (index * 2000),
        duration: 30
      }));
      setProfiles(satisfactionData);
      setLoading(false);
    }).catch((error) => {
      console.error('Failed to fetch satisfaction data:', error);
      setLoading(false);
    });
  }, []);

  const handleCastClick = (castId: number) => {
    navigate(`/cast/${castId}`);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">ユーザー満足度の高いキャスト</h2>
        <button className="text-sm text-white">すべて見る＞</button>
      </div>
      {loading ? (
        <div className="text-white">ローディング...</div>
      ) : profiles.length === 0 ? (
        <div className="text-white">データがありません</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <div 
              key={profile.id} 
              className="bg-primary rounded-lg shadow p-3 border border-secondary cursor-pointer"
              onClick={() => handleCastClick(profile.id)}
            >
              <div className="flex space-x-3">
                <div className="w-full">
                  <img
                    src={profile.avatar ? `${API_BASE_URL}/${profile.avatar}` : '/assets/avatar/female.png'}
                    alt={profile.name}
                    className="w-full h-full object-cover rounded-lg border border-secondary"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white text-sm">{profile.name}</span>
                  <div className="flex items-center text-white">
                    <FiStar className="w-3 h-3" />
                    <span className="ml-1 text-xs">{profile.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-white text-xs mt-1">
                  <div>ギフト {profile.gift_count}件</div>
                  <div className="mt-1">
                    {profile.price.toLocaleString()}円 / {profile.duration}分
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSatisfactionSection;