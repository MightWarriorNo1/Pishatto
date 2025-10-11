import React, { useEffect, useState } from 'react';
import { getPaymentHistory } from '../../services/api';
import { ChevronLeft } from 'lucide-react';
import Spinner from '../ui/Spinner';

interface PaymentData {
  id: number;
  user_id: number;
  user_type: 'guest' | 'cast';
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: 'card' | 'convenience_store' | 'bank_transfer' | 'linepay' | 'other';
  description?: string;
  created_at: string;
  paid_at?: string;
  failed_at?: string;
  refunded_at?: string;
}

interface PaymentHistoryProps {
  onBack?: () => void;
  userType?: 'guest' | 'cast';
  userId?: number;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ onBack, userType = 'guest', userId }) => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    getPaymentHistory(userType, userId)
      .then(setPayments)
      .catch(() => setError('支払い履歴の取得に失敗しました'))
      .finally(() => setLoading(false));
  }, [userType, userId]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '処理中';
      case 'paid': return '完了';
      case 'failed': return '失敗';
      case 'refunded': return '返金済み';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'refunded': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case 'card': return 'クレジットカード';
      case 'convenience_store': return 'コンビニ決済';
      case 'bank_transfer': return '銀行振込';
      case 'linepay': return 'LINE Pay';
      case 'other': return 'その他';
      default: return '不明';
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gradient-br-to from-primary via-primary to-secondary pb-8">
      <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
        {onBack && (
          <button onClick={onBack} className="mr-2 text-2xl text-white hover:text-secondary transition-colors cursor-pointer">
            <ChevronLeft />
          </button>
        )}
        <span className="text-lg font-bold flex-1 text-center text-white">支払い履歴</span>
      </div>
      <div className="p-4">
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="text-red-400 text-center">{error}</div>
        ) : payments.length === 0 ? (
          <div className="text-white text-center">支払い履歴がありません</div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white rounded shadow p-4 flex flex-col">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-primary">¥{payment.amount.toLocaleString()}</span>
                  <span className={`text-xs font-bold ${getStatusColor(payment.status)}`}>
                    {getStatusText(payment.status)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  決済方法: {getPaymentMethodText(payment.payment_method)}
                </div>
                {payment.description && (
                  <div className="text-xs text-gray-600 mb-1">{payment.description}</div>
                )}
                <div className="text-xs text-gray-500">
                  {payment.created_at ? new Date(payment.created_at).toLocaleString('ja-JP').replace(/\//g, '-') : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory; 