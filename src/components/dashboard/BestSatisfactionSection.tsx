
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { fetchRanking } from '../../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface RankingProfile {
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

const BestSatisfactionSection: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<RankingProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Get current month's ranking for casts by gifts (top 2 for best satisfaction)
    fetchRanking({
      userType: 'cast',
      timePeriod: 'current',
      category: 'gift',
      area: '全国'
    }).then((data) => {
      const rankingData = data.data || [];
      // Transform ranking data to satisfaction format with mock ratings
      const satisfactionData = rankingData.slice(0, 2).map((cast: any, index: number) => ({
        id: cast.id,
        name: cast.name,
        avatar: cast.avatar,
        points: cast.points,
        gift_count: cast.gift_count || 0,
        // Mock rating based on position (4.8-4.9 range for top 2)
        rating: 4.9 - (index * 0.1),
        // Mock price (18000-20000 range)
        price: 18000 + (index * 2000),
        duration: 30
      }));
      setProfiles(satisfactionData);
      setLoading(false);
    }).catch((error) => {
      console.error('Failed to fetch best satisfaction data:', error);
      setLoading(false);
    });
  }, []);

  const handleCastClick = (castId: number) => {
    navigate(`/cast/${castId}`);
  };

  return (
    <div className="bg-primary rounded-lg shadow p-4 mb-4 border border-secondary">
      <h2 className="font-bold text-lg mb-2 text-white">最高満足度</h2>
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
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-white">{profile.name}</span>
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

export default BestSatisfactionSection; 