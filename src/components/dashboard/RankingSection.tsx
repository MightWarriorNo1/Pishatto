import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRanking } from '../../hooks/useQueries';
import Spinner from '../ui/Spinner';
import { useSearch } from '../../contexts/SearchContext';

interface RankingSectionProps {
  onSeeRanking?: () => void;
  hideLoading?: boolean;
}

const RankingSection: React.FC<RankingSectionProps> = ({ onSeeRanking, hideLoading = false }) => {
  const navigate = useNavigate();
  const { data: rankingData, isLoading: loading } = useRanking({
    userType: 'cast',
    timePeriod: 'yesterday',
    category: 'gift',
    area: '全国'
  });
  const { searchQuery, isSearchActive, filterResults } = useSearch();

  // Filter rankings based on search query and filter results
  const filteredRankings = React.useMemo(() => {
    const rankings = rankingData?.data || [];
    
    // If we have filter results, use them to filter the current section data
    if (isSearchActive && filterResults.length > 0) {
      const filterResultIds = new Set(filterResults.map((r: any) => r.id));
      return rankings.filter((profile: any) => filterResultIds.has(profile.id));
    }
    
    // If no filter results but search query exists, do text-based filtering
    if (isSearchActive && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return rankings.filter((profile: any) => {
        const name = (profile.name || '').toLowerCase();
        return name.includes(query);
      });
    }
    
    // No search active, return all rankings
    return rankings;
  }, [rankingData?.data, searchQuery, isSearchActive, filterResults]);

  const handleCastClick = (castId: number) => {
    navigate(`/cast/${castId}`);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">昨日のランキングTOP10</h2>
        <button className="text-sm text-white" onClick={onSeeRanking}>ランキングを見る＞</button>
      </div>
      {loading && !hideLoading ? (
        <Spinner />
      ) : filteredRankings.length === 0 ? (
        <div className="text-white">
          {isSearchActive && searchQuery.trim() 
            ? '一致するキャストはいません' 
            : 'ランキングデータがありません'
          }
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredRankings.slice(0, 6).map((profile: any, index: number) => (
            <div
              key={profile.id}
              className="bg-primary rounded-lg shadow p-3 border border-secondary cursor-pointer relative"
              onClick={() => handleCastClick(profile.id)}
            >
              <img
                src={profile.avatar ? 
                  (Array.isArray(profile.avatar) && profile.avatar.length > 0 ? 
                    `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/${profile.avatar[0]}` : 
                    (typeof profile.avatar === 'string' && profile.avatar.includes(',') ? 
                      `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/${profile.avatar.split(',')[0].trim()}` :
                      `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/${profile.avatar}`
                    )
                  ) : 
                  '/assets/avatar/female.png'
                }
                alt={profile.name}
                className="w-full h-32 object-cover rounded-lg border border-secondary mb-2"
              />
              <div className="font-medium text-white text-sm truncate">{profile.name}</div>
              {/* <div className="text-xs text-white mt-1">{profile.points}ポイント {profile.gift_count && `(${profile.gift_count}件)`}</div> */}
              <div className="absolute top-2 left-2 bg-secondary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">{index + 1}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RankingSection; 