import React, { useEffect, useState } from 'react';
import { getPointHistory } from '../../services/api';
import { ChevronLeft } from 'lucide-react';

interface PointHistoryProps {
  onBack?: () => void;
  userType?: 'guest' | 'cast';
  userId?: number;
}

const PointHistory: React.FC<PointHistoryProps> = ({ onBack, userType = 'guest', userId }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    getPointHistory(userType, userId)
      .then(setHistory)
      .catch(() => setError('履歴の取得に失敗しました'))
      .finally(() => setLoading(false));
  }, [userType, userId]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
      <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
        {onBack && (
          <button onClick={onBack} className="mr-2 text-2xl text-white">
            <ChevronLeft />
          </button>
        )}
        <span className="text-lg font-bold flex-1 text-center text-white">ポイント履歴</span>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="text-white text-center">ローディング...</div>
        ) : error ? (
          <div className="text-red-400 text-center">{error}</div>
        ) : history.length === 0 ? (
          <div className="text-white text-center">履歴がありません</div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded shadow p-4 flex flex-col">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-primary">{item.amount.toLocaleString()}P</span>
                  <span className={`text-xs font-bold ${item.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>{item.status === 'completed' ? '完了' : '未完了'}</span>
                </div>
                <div className="text-xs text-gray-500">{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PointHistory; 