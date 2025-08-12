import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCastList } from '../../services/api';
import Spinner from '../ui/Spinner';

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

const NewCastSection: React.FC = () => {
  const navigate = useNavigate();
  const [castProfiles, setCastProfiles] = useState<CastProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCastList({}).then((data: any) => {
      // Get the 5 most recently created casts
      const recentCasts = data.casts
        ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5) || [];
      setCastProfiles(recentCasts);
      setLoading(false);
    }).catch((error) => {
      console.error('Failed to fetch new cast profiles:', error);
      setLoading(false);
    });
  }, []);

  const handleCastClick = (castId: number) => {
    navigate(`/cast/${castId}`);
  };

  return (
    <div>
      <h2 className="font-bold text-lg mb-2 text-white">新着キャスト</h2>
      <div className="bg-white/10 rounded-lg shadow p-4 mb-4 border border-secondary">
        
        {loading ? (
          <Spinner />
        ) : castProfiles.length === 0 ? (
          <div className="text-white">本日登録されたキャストはいません</div>
        ) : (
          <div className="flex gap-3 overflow-x-auto">
            {castProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-primary rounded-lg shadow relative cursor-pointer transition-transform hover:opacity-75 border border-secondary min-w-[120px] max-w-[120px] flex-shrink-0"
                onClick={() => handleCastClick(profile.id)}
              >
                <div className="aspect-w-3 aspect-h-4 relative">
                  <img
                    src={getFirstAvatarUrl(profile.avatar)}
                    alt={profile.nickname || profile.name || ''}
                    className="w-full h-full object-cover rounded-lg border border-secondary"
                  />
                  {profile.category && (
                    <div className='absolute top-2 left-2 rounded text-xs font-medium text-white'>
                      {profile.category}
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <div className="flex flex-col gap-1 text-xs items-center">
                    <span className="text-white">{profile.nickname || profile.name || ''}</span>
                    <span className="text-white">{profile.birth_year ? new Date().getFullYear() - profile.birth_year + '歳' : ''}</span>
                    <span className="text-white">{profile.location || profile.favorite_area || ''}</span>
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