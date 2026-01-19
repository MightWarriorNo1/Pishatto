import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { getPointTransactions } from '../../services/api';
import { useCast } from '../../contexts/CastContext';
import Spinner from '../../components/ui/Spinner';
import { formatDuration } from '../../utils/formatters';

interface PointTransaction {
  id: number;
  guest_id?: number;
  cast_id?: number;
  type: 'buy' | 'transfer' | 'convert' | 'gift' | 'pending';
  amount: number;
  reservation_id?: number;
  description?: string;
  gift_type?: string;
  created_at: string;
  guest?: {
    id: number;
    nickname: string;
    avatar?: string;
  };
  cast?: {
    id: number;
    nickname: string;
    avatar?: string;
  };
  reservation?: {
    id: number;
    scheduled_at: string;
    duration?: number;
  };
}

const CastPointHistoryPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { castId, loading: castLoading } = useCast();
  
  console.log('CastPointHistoryPage render - castId:', castId);

  useEffect(() => {
    console.log('CastPointHistoryPage useEffect - castId:', castId);
    if (castLoading) return;
    // Wait for context; then validate
    if (!castId) {
      console.log('No cast ID available');
      setError('キャストIDが見つかりません');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    console.log('Using castId:', castId);
    getPointTransactions('cast', castId)
      .then((response) => {
        console.log('Point transactions response:', response);
        if (response.success) {
          setTransactions(response.transactions || []);
        } else {
          setError(response.error || 'ポイント履歴の取得に失敗しました');
        }
      })
      .catch((error) => {
        console.error('Point transactions error:', error);
        setError('ポイント履歴の取得に失敗しました');
      })
      .finally(() => setLoading(false));
  }, [castId, castLoading]);

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'buy': return '購入';
      case 'transfer': return '送金';
      case 'convert': return '変換';
      case 'gift': return 'ギフト';
      case 'pending': return '保留中';
      default: return type;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'buy': return 'text-green-400';
      case 'transfer': return 'text-blue-400';
      case 'convert': return 'text-yellow-400';
      case 'gift': return 'text-purple-400';
      case 'pending': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy': return '💰';
      case 'transfer': return '💸';
      case 'convert': return '🔄';
      case 'gift': return '🎁';
      case 'pending': return '⏳';
      default: return '💳';
    }
  };

  const getTransactionDescription = (transaction: PointTransaction) => {
    if (transaction.description) {
      return transaction.description;
    }

    switch (transaction.type) {
      case 'buy':
        return 'ポイント購入';
      case 'transfer':
        return 'ポイント送金';
      case 'convert':
        return 'ポイント変換';
      case 'gift':
        return transaction.gift_type ? `${transaction.gift_type}ギフト` : 'ギフト';
      case 'pending':
        return '予約保留中';
      default:
        return 'ポイント取引';
    }
  };

  return (
    <div className="max-w-md min-h-screen bg-gradient-to-b from-primary via-primary to-secondary overflow-y-auto scrollbar-hidden" style={{ paddingBottom: 'max(12rem, calc(12rem + env(safe-area-inset-bottom)))' }}>
      {/* Top bar */}
      <div className="flex items-center px-4 py-3 border-b border-secondary bg-gradient-to-b from-primary via-primary to-secondary">
        <button className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer" onClick={onBack}>
          <ChevronLeft />
        </button>
        <span className="text-lg font-bold flex-1 text-center text-white">ポイント履歴</span>
      </div>
      
      {/* Loading state */}
      {loading && (
        <Spinner />
      )}
      
      {/* Error state */}
      {error && (
        <div className="text-red-400 text-center py-8">{error}</div>
      )}
      
      {/* Empty state */}
      {!loading && !error && transactions.length === 0 && (
        <div className="text-white text-center py-8">ポイント履歴がありません</div>
      )}
      
      {/* Point transaction history list */}
      {!loading && !error && transactions.length > 0 && (
        <div className="divide-y divide-red-600 bg-primary">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center px-4 py-3 bg-primary">
              <div className="w-10 h-10 rounded-full bg-secondary mr-3 flex items-center justify-center">
                <span className="text-white text-xl">{getTransactionIcon(transaction.type)}</span>
              </div>
              <div className="flex-1">
                <div className="text-xs text-white">
                  {transaction.created_at ? new Date(transaction.created_at).toLocaleString('ja-JP').replace(/\//g, '-') : ''}
                </div>
                <div className="text-base text-white truncate">
                  {getTransactionDescription(transaction)}
                </div>
                <div className={`text-xs ${getTransactionTypeColor(transaction.type)}`}>
                  {getTransactionTypeText(transaction.type)}
                </div>
                {transaction.reservation && (
                  <div className="text-xs text-gray-400">
                    予約: {new Date(transaction.reservation.scheduled_at).toLocaleDateString('ja-JP').replace(/\//g, '-')}
                    {transaction.reservation.duration && ` (${formatDuration(transaction.reservation.duration)})`}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end ml-2">
                <div className={`font-bold text-lg ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString()}P
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Summary section */}
      {/* {!loading && !error && transactions.length > 0 && (
        <div className="bg-primary px-4 py-3 text-center text-sm text-white border-b border-secondary">
          ポイント明細書を確認する
        </div>
      )} */}
    </div>
  );
};

export default CastPointHistoryPage; 