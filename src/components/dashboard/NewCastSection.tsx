import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNewCasts } from '../../hooks/useQueries';
import Spinner from '../ui/Spinner';
import { useSearch } from '../../contexts/SearchContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Utility function to get the first available avatar from comma-separated string
const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
    if (!avatarString) {
        return '/assets/avatar/female.png';
    }
    
    // Split by comma and get the first non-empty avatar
    const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
    
    if (avatars.length === 0) {
        return '/assets/avatar/female.png';
    }
    
    return `${API_BASE_URL}/${avatars[0]}`;
};

// Utility function to get category-specific styles
const getCategoryStyles = (category: string): string => {
    switch (category) {
        case 'プレミアム':
            return 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-2 py-1 rounded-md shadow-lg w-fit';
        case 'VIP':
            return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-md shadow-lg w-fit';
        case 'ロイヤルVIP':
            return 'bg-gradient-to-r from-red-600 to-pink-600 text-white px-2 py-1 rounded-md shadow-lg w-fit';
        default:
            return 'bg-gray-600 text-white px-2 py-1 rounded-md shadow-lg w-fit';
    }
};

interface CastProfile {
  id: number;
  name?: string;
  nickname?: string;
  avatar?: string;
  birth_year?: number;
  location?: string;
  favorite_area?: string;
  isPremium?: boolean;
  category?: 'プレミアム' | 'VIP' | 'ロイヤルVIP';
}

interface NewCastSectionProps {
  hideLoading?: boolean;
}

const NewCastSection: React.FC<NewCastSectionProps> = ({ hideLoading = false }) => {
  const navigate = useNavigate();
  const { data: castProfiles = [], isLoading: loading } = useNewCasts();
  const { searchQuery, isSearchActive, filterResults } = useSearch();

  // Filter casts based on search query and filter results
  const filteredCasts = useMemo(() => {
    // If we have filter results, use them to filter the current section data
    if (isSearchActive && filterResults.length > 0) {
      const filterResultIds = new Set(filterResults.map((r: any) => r.id));
      return castProfiles.filter((profile: CastProfile) => filterResultIds.has(profile.id));
    }
    
    // If no filter results but search query exists, do text-based filtering
    if (isSearchActive && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return castProfiles.filter((profile: CastProfile) => {
        const nickname = (profile.nickname || '').toLowerCase();
        const name = (profile.name || '').toLowerCase();
        const location = (profile.location || '').toLowerCase();
        const favoriteArea = (profile.favorite_area || '').toLowerCase();
        
        return nickname.includes(query) || 
               name.includes(query) || 
               location.includes(query) || 
               favoriteArea.includes(query);
      });
    }
    
    // No search active, return all profiles
    return castProfiles;
  }, [castProfiles, searchQuery, isSearchActive, filterResults]);

  const handleCastClick = (castId: number) => {
    navigate(`/cast/${castId}`);
  };

  return (
    <div>
      <h2 className="font-bold text-lg mb-2 mt-2 text-white">新着キャスト</h2>
      <div className="bg-white/10 rounded-lg shadow p-4 mb-4 border border-secondary">
        
        {loading && !hideLoading ? (
          <Spinner />
        ) : filteredCasts.length === 0 ? (
          <div className="text-white">
            {isSearchActive && searchQuery.trim() 
              ? '一致するキャストはいません' 
              : '本日登録されたキャストはいません'
            }
          </div>
        ) : (
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
            {filteredCasts.map((profile: CastProfile) => (
              <div
                key={profile.id}
                className="bg-primary rounded-lg shadow relative cursor-pointer transition-transform hover:opacity-75 border border-secondary flex-shrink-0 w-[calc(20%-8px)] min-w-[100px] sm:min-w-[120px]"
                onClick={() => handleCastClick(profile.id)}
              >
                <div className="aspect-w-3 aspect-h-4 relative">
                  <img
                    src={getFirstAvatarUrl(profile.avatar)}
                    alt={profile.nickname || profile.name || ''}
                    className="w-full h-full object-cover rounded-lg border border-secondary"
                  />
                    {profile.category && (
                      <span className={`absolute top-0 left-0 text-xs h-min font-medium ${getCategoryStyles(profile.category)}`}>
                        {profile.category}
                      </span>
                    )}
                </div>
                <div className="p-1 sm:p-2">
                  <div className="flex flex-col gap-1 text-xs items-center">
                    <span className="text-white text-center leading-tight">{profile.nickname || profile.name || ''}</span>
                    <span className="text-white">{profile.birth_year ? new Date().getFullYear() - profile.birth_year + '歳' : ''}</span>
                    <span className="text-white text-center leading-tight">{profile.location || profile.favorite_area || ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewCastSection;
