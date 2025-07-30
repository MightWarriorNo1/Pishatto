import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import PayJPPaymentForm from '../payment/PayJPPaymentForm';
import { ChevronLeft } from 'lucide-react';
import { getPaymentInfo } from '../../services/api';

const amounts = [ 3000, 5000, 10000];

const PointPurchasePage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();
  const [selectedAmount, setSelectedAmount] = useState<number>(amounts[0]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRegisteredCard, setHasRegisteredCard] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkRegisteredCards();
  }, [user?.id]);

  const handlePurchase = () => {
    if (!user) return;
    setShowPaymentForm(true);
    setError(null);
    setPaymentStatus(null);
  };

  const checkRegisteredCards = async () => {
    if (!user?.id) return;

    try {
        const paymentInfo = await getPaymentInfo('guest', user.id);
        setHasRegisteredCard(!!paymentInfo?.card_count);
    } catch (error) {
        console.error('Failed to check registered cards:', error);
        setHasRegisteredCard(false);
    } finally {
        setLoading(false);
    }
};

  const handlePaymentSuccess = (payment: any) => {
    setPaymentStatus('決済が完了しました！');
    setShowPaymentForm(false);
    // Refresh user data to update points
    refreshUser();
    
    // Navigate to profile page after successful purchase
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000); // Wait 2 seconds to show success message
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setShowPaymentForm(false);
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setError(null);
  };

  if (showPaymentForm) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
        <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
          <button onClick={handlePaymentCancel} className="mr-2 text-2xl text-white">
            <ChevronLeft />
          </button>
          <span className="text-lg font-bold flex-1 text-center text-white">決済</span>
        </div>
        <div className="p-6">
          <PayJPPaymentForm
            amount={selectedAmount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
            userType="guest"
            userId={user?.id}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
      <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
        {onBack && (
          <button onClick={onBack} className="mr-2 text-2xl text-white">
            <ChevronLeft />
          </button>
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
        >
          購入する
        </button>
        {error && <div className="text-red-400 text-center mb-2">{error}</div>}
        {paymentStatus && <div className="text-green-400 text-center mb-2">{paymentStatus}</div>}
      </div>
    </div>
  );
};

export default PointPurchasePage; 