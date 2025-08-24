
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { useTopSatisfactionCasts } from '../../hooks/useQueries';
import getFirstAvatarUrl from '../../utils/avatar';
import Spinner from '../ui/Spinner';
import { useSearch } from '../../contexts/SearchContext';

interface SatisfactionCast {
  id: number;
  nickname: string;
  avatar?: string;
  average_rating: number;
  feedback_count: number;
  grade_points: number;
  category?: 'プレミアム' | 'VIP' | 'ロイヤルVIP';
}

interface BestSatisfactionSectionProps {
  hideLoading?: boolean;
}

const BestSatisfactionSection: React.FC<BestSatisfactionSectionProps> = ({ hideLoading = false }) => {
  const navigate = useNavigate();
  const { data: casts = [], isLoading: loading } = useTopSatisfactionCasts();
  const { searchQuery, isSearchActive, filterResults } = useSearch();

  // Filter casts based on search query and filter results
  const filteredCasts = React.useMemo(() => {
    // If we have filter results, use them to filter the current section data
    if (isSearchActive && filterResults.length > 0) {
      const filterResultIds = new Set(filterResults.map((r: any) => r.id));
      return casts.filter((cast: SatisfactionCast) => filterResultIds.has(cast.id));
    }
    
    // If no filter results but search query exists, do text-based filtering
    if (isSearchActive && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return casts.filter((cast: SatisfactionCast) => {
        const nickname = cast.nickname.toLowerCase();
        return nickname.includes(query);
      });
    }
    
    // No search active, return all casts
    return casts;
  }, [casts, searchQuery, isSearchActive, filterResults]);

  const handleCastClick = (castId: number) => {
    navigate(`/cast/${castId}`);
  };

  return (
    <div className="bg-white/10 rounded-lg shadow p-4 mb-4 border border-secondary">
      <h2 className="font-bold text-lg mb-2 text-white">最高満足度</h2>
      {loading && !hideLoading ? (
        <Spinner />
      ) : filteredCasts.length === 0 ? (
        <div className="text-white">
          {isSearchActive && searchQuery.trim() 
            ? '一致するキャストはいません' 
            : 'データがありません'
          }
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto">
          {filteredCasts.map((cast: SatisfactionCast) => (
            <div 
              key={cast.id} 
              className="bg-primary rounded-lg shadow p-3 border border-secondary cursor-pointer min-w-[120px] max-w-[120px] flex-shrink-0"
              onClick={() => handleCastClick(cast.id)}
            >
              <div className="flex space-x-3">
                <div className="w-full">
                  <img
                    src={cast.avatar ? getFirstAvatarUrl(cast.avatar) : '/assets/avatar/female.png'}
                    alt={cast.nickname}
                    className="w-full h-24 object-cover rounded-lg border border-secondary"
                  />
                </div>
              </div>
              <div className="mt-2">
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
                    {Number(cast.grade_points).toLocaleString()}P/30分
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