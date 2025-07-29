import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCastList } from '../../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
interface CastProfile {
  id: number;
  name: string;
  age: number;
  location: string;
  isPremium: boolean;
  imageUrl: string;
  created_at?: string;
  avatar?: string;
  nickname?: string;
  birth_year?: number;
  favorite_area?: string;
}

const NewCastSection: React.FC = () => {
  const navigate = useNavigate();
  const [castProfiles, setCastProfiles] = useState<CastProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCastList({}).then((data) => {
      // Filter to only casts registered today
      const today = new Date().toISOString().slice(0, 10);
      const newCasts = (data.casts || []).filter((profile: CastProfile) => {
        if (!profile.created_at) return false;
        return profile.created_at.slice(0, 10) === today;
      });
      setCastProfiles(newCasts);
      setLoading(false);
    });
  }, []);

  const handleCastClick = (castId: number) => {
    navigate(`/cast/${castId}`);
  };

  return (
    <div>
      <h2 className="font-bold text-lg mb-2 text-white">新着キャスト</h2>
      <div className="bg-primary rounded-lg shadow p-4 mb-4 border border-secondary">
        
        {loading ? (
          <div className="text-white">ローディング...</div>
        ) : castProfiles.length === 0 ? (
          <div className="text-white">本日登録されたキャストはいません</div>
        ) : (
          <div className="flex gap-3 overflow-x-auto">
            {castProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-primary rounded-lg shadow relative cursor-pointer transition-transform hover:scale-105 border border-secondary min-w-[120px] max-w-[120px] flex-shrink-0"
                onClick={() => handleCastClick(profile.id)}
              >
                <div className="aspect-w-3 aspect-h-4 relative">
                  <img
                    src={profile.avatar ? `${API_BASE_URL}/${profile.avatar}` : '/assets/avatar/female.png'}
                    alt={profile.nickname || profile.name || ''}
                    className="w-full h-full object-cover rounded-lg border border-secondary"
                  />
                  {profile.isPremium && (
                    <div className="absolute top-[100px] h-[20px] w-[80%] bg-gradient-to-r from-red-600 to-red-400 text-white text-xs px-2 py-1 rounded">
                      プレミアム
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-white">{profile.nickname || profile.name || ''}</span>
                    <span className="text-white">{profile.age || profile.birth_year || '-'}歳</span>
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