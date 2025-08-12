import React, { useEffect, useState } from 'react';
import { getReceipts } from '../../services/api';
import Spinner from '../ui/Spinner';

interface ReceiptListPageProps {
  onBack?: () => void;
  userType?: 'guest' | 'cast';
  userId?: number;
}

const ReceiptListPage: React.FC<ReceiptListPageProps> = ({ onBack, userType = 'guest', userId }) => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    getReceipts(userType, userId)
      .then(setReceipts)
      .catch(() => setError('領収書の取得に失敗しました'))
      .finally(() => setLoading(false));
  }, [userType, userId]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
      <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
        {onBack && (
          <button onClick={onBack} className="mr-2 text-2xl text-white">&#60;</button>
        )}
        <span className="text-lg font-bold flex-1 text-center text-white">領収書一覧</span>
      </div>
      <div className="p-4">
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="text-red-400 text-center">{error}</div>
        ) : receipts.length === 0 ? (
          <div className="text-white text-center">領収書がありません</div>
        ) : (
          <div className="space-y-4">
            {receipts.map((item) => (
              <div key={item.id} className="bg-white rounded shadow p-4 flex flex-col">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-primary">{item.amount ? item.amount.toLocaleString() : '-'}円</span>
                  <span className="text-xs text-gray-500">No.{item.receipt_number || item.id}</span>
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

export default ReceiptListPage; 