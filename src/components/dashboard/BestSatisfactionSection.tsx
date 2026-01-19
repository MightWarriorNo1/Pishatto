
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
        <div className="grid grid-cols-2 gap-4">
          {filteredCasts.map((cast: CastProfile) => (
            <div 
              key={cast.id} 
              className="group relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border border-white/20 hover:border-secondary/50 overflow-hidden"
              onClick={() => handleCastClick(cast.id)}
            >
              {/* Avatar with gradient overlay */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={cast.avatar ? getFirstAvatarUrl(cast.avatar) : '/assets/avatar/female.png'}
                  alt={cast.nickname}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/avatar/female.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-60" />
              </div>
              
              {/* Info section */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white truncate flex-1">
                    {cast.nickname}
                  </h3>
                  {cast.average_rating !== undefined && (
                    <div className="ml-2 bg-secondary/80 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <FiStar className="w-3 h-3 mr-1" />
                      {cast.average_rating.toFixed(1)}
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  {cast.feedback_count !== undefined && (
                    <div className="flex items-center text-xs text-gray-300">
                      <span className="mr-1">💬</span>
                      <span className="truncate">レビュー {cast.feedback_count}件</span>
                    </div>
                  )}
                  {cast.grade_points !== undefined && (
                    <div className="flex items-center text-xs text-gray-300">
                      <span className="mr-1">💰</span>
                      <span className="truncate">{Number(cast.grade_points).toLocaleString()}P/30分</span>
                    </div>
                  )}
                </div>
                
                {/* Hover indicator */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-secondary text-white text-xs px-3 py-1 rounded-full">
                    詳細を見る →
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