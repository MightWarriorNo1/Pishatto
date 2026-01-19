
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { useAllCasts } from '../../hooks/useQueries';
import getFirstAvatarUrl from '../../utils/avatar';
import Spinner from '../ui/Spinner';
import { useSearch } from '../../contexts/SearchContext';
import { useUser } from '../../contexts/UserContext';

interface CastProfile {
  id: number;
  nickname: string;
  avatar?: string;
  average_rating?: number;
  feedback_count?: number;
  grade_points?: number;
  category?: 'プレミアム' | 'VIP' | 'ロイヤルVIP';
  created_at?: string;
}

interface BestSatisfactionSectionProps {
  hideLoading?: boolean;
}

const BestSatisfactionSection: React.FC<BestSatisfactionSectionProps> = ({ hideLoading = false }) => {
  const navigate = useNavigate();
  const { data: castsData, isLoading: loading } = useAllCasts();
  const { searchQuery, isSearchActive, filterResults } = useSearch();
  const { user } = useUser();

  // Filter casts based on search query and filter results
  const filteredCasts = React.useMemo(() => {
    const casts = castsData?.casts || [];
    let filtered: CastProfile[] = [];
    
    // If we have filter results, use them to filter the current section data
    if (isSearchActive && filterResults.length > 0) {
      const filterResultIds = new Set(filterResults.map((r: any) => r.id));
      filtered = casts.filter((cast: CastProfile) => filterResultIds.has(cast.id));
    }
    // If no filter results but search query exists, do text-based filtering
    else if (isSearchActive && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = casts.filter((cast: CastProfile) => {
        const nickname = (cast.nickname || '').toLowerCase();
        return nickname.includes(query);
      });
    }
    // No search active, return all casts
    else {
      filtered = [...casts];
    }
    
    // Sort by registration order (oldest first) using created_at
    return filtered.sort((a: CastProfile, b: CastProfile) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateA - dateB;
    });
  }, [castsData, searchQuery, isSearchActive, filterResults]);

  const handleCastClick = (castId: number) => {
    navigate(`/cast/${castId}`);
  };

  return (
    <div className="bg-white/10 rounded-lg shadow p-4 mb-8 border border-secondary">
      <h2 className="font-bold text-lg mb-2 text-white">{user?.nickname}におすすめの一覧</h2>
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
        <div className="grid grid-cols-2 gap-3">
          {filteredCasts.map((cast: CastProfile) => (
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
                    className="w-full h-24 object-cover rounded-lg border border-secondary"
                  />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white text-sm">{cast.nickname}</span>
                  {cast.average_rating !== undefined && (
                    <div className="flex items-center text-white">
                      <FiStar className="w-3 h-3" />
                      <span className="ml-1 text-xs">{cast.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="text-white text-xs mt-1">
                  {cast.feedback_count !== undefined && (
                    <div>レビュー {cast.feedback_count}件</div>
                  )}
                  {cast.grade_points !== undefined && (
                    <div className="mt-1">
                      {Number(cast.grade_points).toLocaleString()}P/30分
                    </div>
                  )}
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