import React, { useState } from 'react';
import { purchasePoints } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const amounts = [1000, 3000, 5000, 10000];

const PointPurchasePage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user } = useUser();
  const [selectedAmount, setSelectedAmount] = useState<number>(amounts[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setPaymentLink(null);
    setStatus(null);
    try {
      const res = await purchasePoints(user.id, 'guest', selectedAmount);
      if (res.payment_link) {
        setPaymentLink(res.payment_link);
        setStatus('支払いリンクが生成されました。リンクをクリックして決済を完了してください。');
      } else {
        setStatus('決済が完了しました。');
      }
    } catch (e) {
      setError('ポイント購入に失敗しました');
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
        <span className="text-lg font-bold flex-1 text-center text-white">ポイント購入</span>
      </div>
      <div className="p-6">
        <h2 className="font-bold text-xl mb-4 text-white">購入ポイントを選択</h2>
        <div className="flex gap-3 mb-6">
          {amounts.map(amount => (
            <button
              key={amount}
              className={`px-6 py-3 rounded-lg border font-bold text-lg ${selectedAmount === amount ? 'bg-secondary text-white border-secondary' : 'bg-primary text-white border-secondary hover:bg-secondary'}`}
              onClick={() => setSelectedAmount(amount)}
            >
              {amount.toLocaleString()}P
            </button>
          ))}
        </div>
        <button
          className="w-full bg-secondary text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition mb-4"
          onClick={handlePurchase}
          disabled={loading}
        >
          {loading ? '購入中...' : '購入する'}
        </button>
        {error && <div className="text-red-400 text-center mb-2">{error}</div>}
        {status && <div className="text-white text-center mb-2">{status}</div>}
        {paymentLink && (
          <div className="text-center mt-4">
            <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-bold">支払いリンクを開く</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointPurchasePage; 