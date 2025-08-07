
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { getTopSatisfactionCasts } from '../../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface SatisfactionCast {
  id: number;
  nickname: string;
  avatar?: string;
  average_rating: number;
  feedback_count: number;
  grade_points: number;
}

const BestSatisfactionSection: React.FC = () => {
  const navigate = useNavigate();
  const [casts, setCasts] = useState<SatisfactionCast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Get top 5 casts with highest average feedback ratings
    getTopSatisfactionCasts().then((data: SatisfactionCast[]) => {
      // Transform data to include mock price and duration
      const satisfactionData = data.map((cast: SatisfactionCast) => ({
        ...cast,
      }));
      setCasts(satisfactionData);
      setLoading(false);
    }).catch((error: any) => {
      console.error('Failed to fetch best satisfaction data:', error);
      setLoading(false);
    });
  }, []);

  const handleCastClick = (castId: number) => {
    navigate(`/cast/${castId}`);
  };

  return (
    <div className="bg-white/10 rounded-lg shadow p-4 mb-4 border border-secondary">
      <h2 className="font-bold text-lg mb-2 text-white">最高満足度</h2>
      {loading ? (
        <div className="text-white">ローディング...</div>
      ) : casts.length === 0 ? (
        <div className="text-white">データがありません</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto">
          {casts.map((cast: SatisfactionCast) => (
            <div 
              key={cast.id} 
              className="bg-primary rounded-lg shadow p-3 border border-secondary cursor-pointer min-w-[120px] max-w-[120px] flex-shrink-0"
              onClick={() => handleCastClick(cast.id)}
            >
              <div className="flex space-x-3">
                <div className="w-full">
                  <img
                    src={cast.avatar ? `${API_BASE_URL}/${cast.avatar}` : '/assets/avatar/female.png'}
                    alt={cast.nickname}
                    className="w-full h-24 object-cover rounded-lg border border-secondary"
                  />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-white">{cast.nickname}</span>
                  <div className="flex items-center text-white">
                    <FiStar className="w-3 h-3" />
                    <span className="ml-1 text-xs">{cast.average_rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-white text-xs mt-1">
                  <div>レビュー {cast.feedback_count}件</div>
                  <div className="mt-1">
                    {cast.grade_points}円/30分
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