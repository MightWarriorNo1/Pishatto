import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { getFootprints } from '../../services/api';

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

const FootprintsSection: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [footprints, setFootprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      setError(null);
      getFootprints(user.id)
        .then((data) => {
          // The backend now returns unique casts, so we can use the data directly
          setFootprints(data.history || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch footprints:', err);
          setError('足あとの取得に失敗しました');
          setLoading(false);
        });
    }
  }, [user]);

  const handleAvatarClick = (castId: number) => {
    navigate(`/cast/${castId}`);
  };

  if (loading) {
    return <div className="text-white">ローディング...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-primary rounded-lg border border-secondary">
        <h2 className="text-lg font-bold text-center mb-2 text-white">エラーが発生しました</h2>
        <p className="text-sm text-white text-center">{error}</p>
      </div>
    );
  }

  if (!footprints.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-primary rounded-lg border border-secondary">
        <h2 className="text-lg font-bold text-center mb-2 text-white">まだ誰もあなたのプロフィールを見ていません</h2>
        <p className="text-sm text-white text-center">キャストがあなたのプロフィールを訪れるとここに表示されます</p>
      </div>
    );
  }

  return (
    <div className="bg-primary rounded-lg shadow p-4 mb-4 border border-secondary">
      <h2 className="font-bold text-lg mb-2 text-white">足あと（あなたのプロフィールを見たキャスト）</h2>
      {footprints.map((item) => (
        <div key={item.id} className="bg-primary rounded-lg shadow p-3 border border-secondary mb-2">
          <div className="flex space-x-4 items-center">
            <div className="w-16 h-16">
              <img
                src={getFirstAvatarUrl(item.avatar)}
                alt={item.nickname || ''}
                className="w-full h-full object-cover rounded border border-secondary cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleAvatarClick(item.id)}
                onError={(e) => {
                  e.currentTarget.src = '/assets/avatar/female.png';
                }}
              />
            </div>
            <div className="flex-1">
              <span className="font-medium text-white">{item.nickname || ''}</span>
              <div className="text-xs text-white mt-1">{new Date(item.updated_at || item.created_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FootprintsSection; 