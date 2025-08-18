import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { useSatisfactionCasts } from '../../hooks/useQueries';
import getFirstAvatarUrl from '../../utils/avatar';
import Spinner from '../ui/Spinner';

interface SatisfactionCast {
  id: number;
  nickname: string;
  avatar?: string;
  average_rating: number;
  feedback_count: number;
  grade_points: number;
  category?: 'プレミアム' | 'VIP' | 'ロイヤルVIP';
}

interface UserSatisfactionSectionProps {
  onSeeAll?: () => void;
  hideLoading?: boolean;
}

const UserSatisfactionSection: React.FC<UserSatisfactionSectionProps> = ({ onSeeAll, hideLoading = false }) => {
  const navigate = useNavigate();
  const { data: casts = [], isLoading: loading } = useSatisfactionCasts();

  const handleCastClick = (castId: number) => {
    navigate(`/cast/${castId}`);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">ユーザー満足度の高いキャスト</h2>
        <button className="text-sm text-white" onClick={onSeeAll}>すべて見る＞</button>
      </div>
      {loading && !hideLoading ? (
        <Spinner />
      ) : casts.length === 0 ? (
        <div className="text-white">データがありません</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {casts.map((cast: SatisfactionCast) => (
            <div
              key={cast.id} 
              className="bg-primary rounded-lg shadow p-3 border border-secondary cursor-pointer"
              onClick={() => handleCastClick(cast.id)}
            >
              <div className="flex space-x-3">
                <div className="w-full">
                  <img
                    src={cast.avatar ? getFirstAvatarUrl(cast.avatar) : '/assets/avatar/female.png'}
                    alt={cast.nickname}
                    className="w-full h-48 object-cover rounded-lg border border-secondary"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white text-sm">{cast.nickname}</span>
                  <div className="flex items-center text-white">
                    <FiStar className="w-3 h-3" />
                    <span className="ml-1 text-xs">{cast.average_rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-white text-xs mt-1">
                  <div>レビュー {cast.feedback_count}件</div>
                  <div className="mt-1">
                    {cast.grade_points}P/30分
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