import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRanking } from '../../hooks/useQueries';
import getFirstAvatarUrl from '../../utils/avatar';
import Spinner from '../ui/Spinner';

// use shared utility getFirstAvatarUrl

interface RankingProfile {
  id: number;
  name: string;
  avatar?: string;
  points: number;
  gift_count?: number;
  reservation_count?: number;
  category?: 'プレミアム' | 'VIP' | 'ロイヤルVIP';
}

interface RankingSectionProps {
  onSeeRanking?: () => void;
}

const RankingSection: React.FC<RankingSectionProps> = ({ onSeeRanking }) => {
  const navigate = useNavigate();
  const { data: rankingData, isLoading: loading } = useRanking({
    userType: 'cast',
    timePeriod: 'yesterday',
    category: 'gift',
    area: '全国'
  });
  const rankings = rankingData?.data || [];

  const handleCastClick = (castId: number) => {
    navigate(`/cast/${castId}`);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">昨日のランキングTOP10</h2>
        <button className="text-sm text-white" onClick={onSeeRanking}>ランキングを見る＞</button>
      </div>
      {loading ? (
        <Spinner />
      ) : rankings.length === 0 ? (
        <div className="text-white">ランキングデータがありません</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {rankings.slice(0, 3).map((profile: any, index: number) => (
            <div 
              key={profile.id} 
              className="bg-primary rounded-lg shadow p-3 border border-secondary cursor-pointer"
              onClick={() => handleCastClick(profile.id)}
            >
              <div className="relative">
                <img
                  src={profile.avatar ? getFirstAvatarUrl(profile.avatar) : '/assets/avatar/female.png'}
                  alt={profile.name}
                  className="w-full h-32 object-cover rounded border border-secondary"
                />
                <div className="absolute top-2 left-2 bg-secondary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              <div className="mt-2">
                <div className="font-medium text-white">{profile.name}</div>
                <div className="text-xs text-white mt-1">
                  {profile.points}ポイント
                  {profile.gift_count && ` (${profile.gift_count}件)`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RankingSection; 