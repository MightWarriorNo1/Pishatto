/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import StripePaymentForm from '../payment/PayJPPaymentForm';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import { getPaymentInfo } from '../../services/api';
import Spinner from '../ui/Spinner';

// Offer points and their corresponding prices (1P = 1.2 JPY)
const amounts = [1000, 3000, 5000, 10000, 30000, 50000, 100000,200000,300000,400000,500000,1000000];
const YEN_PER_POINT = 1.2;
const prices = amounts.map(p => Math.round(p * YEN_PER_POINT));

const Skeleton = () => (
  <div className="animate-pulse bg-gray-200 h-20 rounded-2xl w-full mb-6" />
);


const PointPurchasePage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();
  const [selectedAmount, setSelectedAmount] = useState<number>(amounts[0]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRegisteredCard, setHasRegisteredCard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successAnim, setSuccessAnim] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customAmountError, setCustomAmountError] = useState<string | null>(null);

  useEffect(() => {
    checkRegisteredCards();
  }, [user?.id]);

  const handlePurchase = (amount: number) => {
    if (!user) return;
    setSelectedAmount(amount);
    setShowPaymentForm(true);
    setError(null);
    setPaymentStatus(null);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setCustomAmountError(null);
  };

  const handleCustomPurchase = () => {
    if (!user) return;
    
    const amount = parseInt(customAmount);
    if (!amount || amount <= 0) {
      setCustomAmountError('有効な金額を入力してください');
      return;
    }
    
    if (amount < 100) {
      setCustomAmountError('最低購入金額は100ポイントです');
      return;
    }
    
    if (amount > 10000000) {
      setCustomAmountError('最大購入金額は10,000,000ポイントです');
      return;
    }
    
    setSelectedAmount(amount);
    setShowPaymentForm(true);
    setError(null);
    setPaymentStatus(null);
    setCustomAmountError(null);
  };

  const checkRegisteredCards = async () => {
    if (!user?.id) return;
    try {
      const paymentInfo = await getPaymentInfo('guest', user.id);
      setHasRegisteredCard(!!paymentInfo?.card_count);
    } catch (error) {
      setHasRegisteredCard(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentStatus('決済が完了しました！');
    setShowPaymentForm(false);
    setSuccessAnim(true);
    refreshUser();
    setTimeout(() => {
      setSuccessAnim(false);
      navigate('/dashboard', { replace: true });
    }, 1800);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 animate-fade-in">
        <div className="max-w-md w-full min-h-screen  bg-gradient-to-b from-primary via-primary to-secondary rounded-2xl shadow-2xl animate-slide-up">
          <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary rounded-t-2xl">
            <button onClick={handlePaymentCancel} className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer" aria-label="戻る">
              <ChevronLeft />
            </button>
            <span className="text-lg font-bold flex-1 text-center text-white">決済</span>
          </div>
          <div className="p-6">
            <StripePaymentForm
              amount={selectedAmount}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
              userType="guest"
              userId={user?.id}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-primary to-secondary pb-8">
      {/* Fixed Header */}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-40">
        <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary rounded-b-2xl shadow-md">
          {onBack && (
            <button onClick={onBack} className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer" aria-label="戻る">
              <ChevronLeft />
            </button>
          )}
          <span className="text-xl font-extrabold flex-1 text-center text-white tracking-wide">ポイントを購入する</span>
        </div>
      </div>
      
      {/* Content with top padding to account for fixed header */}
      <div className="pt-20">
        {/* Points Card */}
        <div className="mx-4 mt-8 mb-6">
        {loading ? (
          <Skeleton />
        ) : (
          <div className="bg-gradient-to-r from-white via-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-200">
            <div className="flex items-center mb-2">
              <span className="text-gray-700 font-semibold mr-2 text-lg">所持ポイント</span>
              <span className="text-blue-400 text-xl">Ⓟ</span>
            </div>
            <div className="text-4xl font-extrabold text-primary mb-1 drop-shadow">{user?.points?.toLocaleString() ?? 0}P</div>
            <div className="text-xs text-gray-500">ポイントの有効期限は購入から180日です</div>
          </div>
        )}
      </div>
      
      {/* Custom Amount Input Section */}
      <div className="mx-4 mb-6">
        <div className="bg-white/10 rounded-xl shadow-md p-5 border border-gray-100">
          <div className="text-center mb-4">
            <span className="text-lg font-bold text-white">カスタム金額</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-1 text-black">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="ポイント数を入力"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                min="100"
              />
              {customAmountError && (
                <div className="text-red-400 text-sm mt-1">{customAmountError}</div>
              )}
            </div>
            <button
              onClick={handleCustomPurchase}
              disabled={!customAmount || loading}
              className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg text-lg shadow transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              購入
            </button>
          </div>
          {customAmount && !customAmountError && (
            <div className="text-center mt-3">
              <span className="text-white text-sm">
                金額: ￥{Math.round(parseInt(customAmount) * YEN_PER_POINT).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Point Options List */}
      <div className="px-4 pb-16">
        {loading ? (
            <Spinner />
        ) : (
          amounts.map((amount, idx) => (
            <div
              key={amount}
              className="flex items-center justify-between bg-white/10 rounded-xl shadow-md mb-5 px-5 py-4 border border-gray-100 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center">
                <span className="text-xl font-bold text-blue-400 mr-2">Ⓟ</span>
                <span className="text-xl font-bold text-white">{amount.toLocaleString()}ポイント</span>
              </div>
              <button
                className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-2 px-8 rounded-lg text-lg shadow transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-300"
                onClick={() => handlePurchase(amount)}
                aria-label={`購入する ${amount}ポイント`}
              >
                ￥{prices[idx].toLocaleString()}
              </button>
            </div>
          ))
        )}
        {error && <div className="text-red-400 text-center mb-2">{error}</div>}
        {paymentStatus && (
          <div className="flex flex-col items-center justify-center my-4 animate-fade-in">
            <CheckCircle2 className="text-green-400 w-12 h-12 mb-2 animate-bounce-in" />
            <div className="text-green-500 text-lg font-bold">{paymentStatus}</div>
          </div>
        )}
      </div>
      </div>
      {successAnim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="flex flex-col items-center bg-white rounded-2xl shadow-2xl px-10 py-8 animate-bounce-in">
            <CheckCircle2 className="text-green-400 w-20 h-20 mb-4 animate-bounce-in" />
            <div className="text-green-600 text-2xl font-bold mb-2">決済が完了しました！</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointPurchasePage;
