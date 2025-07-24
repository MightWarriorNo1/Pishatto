import React, { useEffect, useState } from 'react';
import { getCastVisitHistory } from '../../services/api';
import { useUser } from '../../contexts/UserContext';



const HistorySection: React.FC = () => {
  const { user } = useUser();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getCastVisitHistory(user.id).then((data) => {
        setHistory(data.history || []);
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <div className="space-y-4 p-4">
      {loading ? (
        <div className="text-white">ローディング...</div>
      ) : history.length === 0 ? (
        <div className="text-white">履歴がありません</div>
      ) : (
        history.map((item) => (
          <div key={item.id} className="bg-primary rounded-lg shadow p-4 border border-secondary">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 flex-shrink-0">
                <img
                  src={item.cast?.avatar || '/assets/avatar/female.png'}
                  alt={item.cast?.nickname || ''}
                  className="w-full h-full object-cover rounded border border-secondary"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white">{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</span>
                </div>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="font-medium text-white">👤 {item.cast?.nickname || ''}</span>
                </div>
                <button
                  className="w-full mt-3 flex items-center justify-center space-x-2 bg-secondary text-white py-2 rounded-lg"
                  onClick={() => (window.location.href = `/cast/${item.cast?.id}/message`)}
                >
                  <span>メッセージを送る</span>
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default HistorySection; 