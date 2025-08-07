import React, { useState, useEffect } from 'react';
import { X, Plus, Users } from 'lucide-react';
import { createChatGroup, getCastList } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

interface CreateChatGroupProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Cast {
  id: number;
  nickname: string;
  avatar?: string;
  location?: string;
}

const CreateChatGroup: React.FC<CreateChatGroupProps> = ({ onClose, onSuccess }) => {
  const { user } = useUser();
  const [groupName, setGroupName] = useState('');
  const [selectedCasts, setSelectedCasts] = useState<Cast[]>([]);
  const [availableCasts, setAvailableCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableCasts();
  }, []);

  const loadAvailableCasts = async () => {
    try {
      const response = await getCastList();
      setAvailableCasts(response.casts || []);
    } catch (error) {
      console.error('Failed to load casts:', error);
      setError('キャストの読み込みに失敗しました');
    }
  };

  const handleAddCast = (cast: Cast) => {
    if (!selectedCasts.find(c => c.id === cast.id)) {
      setSelectedCasts([...selectedCasts, cast]);
    }
  };

  const handleRemoveCast = (castId: number) => {
    setSelectedCasts(selectedCasts.filter(c => c.id !== castId));
  };

  const handleCreateGroup = async () => {
    if (!user) {
      setError('ユーザー情報が見つかりません');
      return;
    }

    if (!groupName.trim()) {
      setError('グループ名を入力してください');
      return;
    }

    if (selectedCasts.length === 0) {
      setError('少なくとも1人のキャストを選択してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createChatGroup({
        name: groupName.trim(),
        guest_id: user.id,
        cast_ids: selectedCasts.map(c => c.id),
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to create chat group:', error);
      setError(error.response?.data?.message || 'グループチャットの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const filteredCasts = availableCasts.filter(cast =>
    cast.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cast.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary border border-secondary rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold">グループチャット作成</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Group Name Input */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              グループ名
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="グループ名を入力"
              className="w-full px-3 py-2 bg-secondary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Selected Casts */}
          {selectedCasts.length > 0 && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                選択されたキャスト ({selectedCasts.length}人)
              </label>
              <div className="space-y-2">
                {selectedCasts.map((cast) => (
                  <div
                    key={cast.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded border border-gray-600"
                  >
                    <div className="flex items-center">
                      <img
                        src={cast.avatar || '/assets/avatar/default.png'}
                        alt={cast.nickname}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <span className="text-white">{cast.nickname}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveCast(cast.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cast Search */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              キャストを検索・追加
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="キャスト名または地域で検索"
              className="w-full px-3 py-2 bg-secondary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-3"
            />
            
            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredCasts.map((cast) => (
                <button
                  key={cast.id}
                  onClick={() => handleAddCast(cast)}
                  disabled={!!selectedCasts.find(c => c.id === cast.id)}
                  className={`w-full flex items-center p-3 rounded border transition-colors ${
                    selectedCasts.find(c => c.id === cast.id)
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-secondary border-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  <img
                    src={cast.avatar || '/assets/avatar/default.png'}
                    alt={cast.nickname}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{cast.nickname}</div>
                    {cast.location && (
                      <div className="text-xs text-gray-400">{cast.location}</div>
                    )}
                  </div>
                  {selectedCasts.find(c => c.id === cast.id) && (
                    <Plus size={16} className="text-blue-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateGroup}
            disabled={loading || selectedCasts.length === 0 || !groupName.trim()}
            className={`w-full py-3 px-4 rounded font-medium transition-colors ${
              loading || selectedCasts.length === 0 || !groupName.trim()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? '作成中...' : 'グループチャットを作成'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChatGroup; 