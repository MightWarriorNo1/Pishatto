import React, { useEffect, useState } from 'react';
import { getPaymentInfo, registerPaymentInfo } from '../../services/api';

interface PaymentInfoRegisterPageProps {
  onBack?: () => void;
  userType?: 'guest' | 'cast';
  userId?: number;
}

const PaymentInfoRegisterPage: React.FC<PaymentInfoRegisterPageProps> = ({ onBack, userType = 'guest', userId }) => {
  const [paymentInfo, setPaymentInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    getPaymentInfo(userType, userId)
      .then((info) => setPaymentInfo(info || ''))
      .catch(() => setError('支払い情報の取得に失敗しました'))
      .finally(() => setLoading(false));
  }, [userType, userId]);

  const handleSave = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await registerPaymentInfo(userId, userType, paymentInfo);
      setSuccess('支払い情報を保存しました');
    } catch {
      setError('支払い情報の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
      <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
        {onBack && (
          <button onClick={onBack} className="mr-2 text-2xl text-white">&#60;</button>
        )}
        <span className="text-lg font-bold flex-1 text-center text-white">支払い情報登録</span>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="text-white text-center">ローディング...</div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-white font-bold mb-2">支払い情報（カード番号や銀行情報など）</label>
              <input
                className="w-full px-4 py-2 rounded border border-secondary bg-primary text-white"
                value={paymentInfo}
                onChange={e => setPaymentInfo(e.target.value)}
                placeholder="例: 1234-5678-9012-3456"
              />
            </div>
            <button
              className="w-full bg-secondary text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition mb-4"
              onClick={handleSave}
              disabled={loading}
            >
              保存する
            </button>
            {error && <div className="text-red-400 text-center mb-2">{error}</div>}
            {success && <div className="text-green-400 text-center mb-2">{success}</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentInfoRegisterPage; 