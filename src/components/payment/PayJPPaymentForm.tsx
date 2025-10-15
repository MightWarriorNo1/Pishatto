/*eslint-disable */
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import StripeService, { CardData, PaymentData } from '../../services/stripe';
import { purchasePoints, getPaymentInfo } from '../../services/api';
import CardRegistrationForm from './CardRegistrationForm';
import { ChevronLeft } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  onSuccess?: (payment: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  userType?: 'guest' | 'cast';
  userId?: number;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  onSuccess,
  onError,
  onCancel,
  userType = 'guest',
  userId,
}) => {
  const { user } = useUser();
  const YEN_PER_POINT = 1.2;
  const yenAmount = Math.round(amount * YEN_PER_POINT);
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    cvc: '',
    exp_month: 1,
    exp_year: new Date().getFullYear(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasRegisteredCard, setHasRegisteredCard] = useState<boolean | null>(null);
  const [showCardRegistration, setShowCardRegistration] = useState(false);
  const [useRegisteredCard, setUseRegisteredCard] = useState(false);

  const currentUserId = userId || user?.id;

  useEffect(() => {
    if (currentUserId) {
      checkRegisteredCards();
    }
  }, [currentUserId]);

  const checkRegisteredCards = async () => {
    if (!currentUserId) return;

    try {
      const paymentInfo = await getPaymentInfo(userType, currentUserId);
      setHasRegisteredCard(!!paymentInfo?.card_count);
    } catch (error) {
      console.error('Failed to check registered cards:', error);
      setHasRegisteredCard(false);
    }
  };

  const handlePaymentWithRegisteredCard = async () => {
    if (!user) {
      onError?.('ユーザー情報が見つかりません');
      return;
    }

    setLoading(true);

    try {
      const paymentResult = await purchasePoints(
        user.id,
        userType,
        yenAmount,
        undefined, // No token needed when using registered card
        'card'
      );

      if (paymentResult.success) {
        onSuccess?.(paymentResult.payment);
      } else {
        onError?.(paymentResult.error || '決済処理中にエラーが発生しました');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      const backendError = error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail;
      onError?.(backendError || error.message || '決済処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const validateCard = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Card number validation
    if (!cardData.number || cardData.number.length < 13 || cardData.number.length > 19) {
      newErrors.number = '有効なカード番号を入力してください';
    }

    // CVC validation
    if (!cardData.cvc || cardData.cvc.length < 3 || cardData.cvc.length > 4) {
      newErrors.cvc = '有効なCVCを入力してください';
    }

    // Expiry validation
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (cardData.exp_year < currentYear || 
        (cardData.exp_year === currentYear && cardData.exp_month < currentMonth)) {
      newErrors.exp_month = '有効期限が切れています';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onError?.('ユーザー情報が見つかりません');
      return;
    }

    if (!validateCard()) {
      return;
    }

    setLoading(true);

    try {
      // Create payment method
      const tokenResult = await StripeService.createPaymentMethod(cardData);
      
      if (!tokenResult.success) {
        onError?.(tokenResult.error || 'カード情報の処理中にエラーが発生しました');
        return;
      }

      // Process payment using direct payment intent approach
      const paymentResult = await StripeService.processPaymentDirect(
        tokenResult.payment_method!,
        yenAmount,
        'jpy',
        user.id,
        userType
      );

      if (paymentResult.success) {
        onSuccess?.(paymentResult.payment);
      } else {
        onError?.(paymentResult.error || '決済処理中にエラーが発生しました');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      const backendError = error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail;
      onError?.(backendError || error.message || '決済処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CardData, value: string | number) => {
    setCardData(prev => ({ 
      ...prev, 
      [field]: field === 'exp_month' || field === 'exp_year' ? Number(value) : value 
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardRegistered = () => {
    setShowCardRegistration(false);
    setHasRegisteredCard(true);
  };

  // Show card registration form if no cards are registered
  if (showCardRegistration) {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <button
            onClick={() => setShowCardRegistration(false)}
            className="text-white hover:text-gray-300 mr-2"
          >
            <ChevronLeft className="text-white hover:text-secondary cursor-pointer" />
          </button>
          <h2 className="text-xl font-bold text-white">カード登録</h2>
        </div>
        <CardRegistrationForm
          onSuccess={handleCardRegistered}
          onCancel={() => setShowCardRegistration(false)}
          userType={userType}
          userId={currentUserId}
        />
      </div>
    );
  }

  // Show card registration prompt if no cards are registered
  if (hasRegisteredCard === false) {
    return (
      <div className="max-w-md mx-auto p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          {amount.toLocaleString()}ポイント購入
        </h2>
        
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            カード情報が必要です
          </h3>
          <p className="text-gray-300 mb-6">
            決済を完了するために、カード情報を登録してください。
            登録したカードは安全に保存され、次回からは再入力不要です。
          </p>
          
          <button
            onClick={() => setShowCardRegistration(true)}
            className="w-full px-6 py-3 bg-secondary text-white rounded-lg font-bold hover:bg-red-700 transition-colors mb-4"
          >
            カードを登録する
          </button>
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full px-6 py-3 border border-secondary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show loading while checking for registered cards
  if (hasRegisteredCard === null) {
    return (
      <div className="max-w-md mx-auto p-6 rounded-lg">
        <div className="text-center py-8">
          <div className="text-white">読み込み中...</div>
        </div>
      </div>
    );
  }

  // Show payment options when user has registered cards and hasn't chosen to use new card
  if (hasRegisteredCard === true && !useRegisteredCard) {
    return (
      <div className="max-w-md mx-auto p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          {amount.toLocaleString()}ポイント購入
        </h2>
        
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            決済方法を選択
          </h3>
          <p className="text-gray-300 mb-6">
            登録済みのカードを使用するか、新しいカード情報を入力してください。
          </p>
          
          <button
            onClick={handlePaymentWithRegisteredCard}
            disabled={loading}
            className="w-full px-6 py-3 bg-secondary text-white rounded-lg font-bold hover:bg-red-700 transition-colors mb-4 disabled:opacity-50"
          >
            {loading ? '処理中...' : '登録済みカードで決済'}
          </button>
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show card input form when user chooses to use new card or has no registered cards
  if (useRegisteredCard || !hasRegisteredCard) {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-b from-primary via-primary to-secondary p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          {amount.toLocaleString()}ポイント購入
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              カード番号
            </label>
            <input
              type="text"
              value={cardData.number}
              onChange={(e) => handleInputChange('number', formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              className={`w-full px-3 py-2 border rounded-lg bg-primary text-white border-secondary focus:outline-none focus:border-white ${
                errors.number ? 'border-red-500' : ''
              }`}
              maxLength={19}
            />
            {errors.number && (
              <p className="text-red-400 text-xs mt-1">{errors.number}</p>
            )}
          </div>

          {/* Expiry and CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-bold mb-2">
                有効期限
              </label>
              <div className="flex gap-2">
                <select
                  value={cardData.exp_month}
                  onChange={(e) => handleInputChange('exp_month', parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 border rounded-lg bg-primary text-white border-secondary focus:outline-none focus:border-white"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {month.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  value={cardData.exp_year}
                  onChange={(e) => handleInputChange('exp_year', parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 border rounded-lg bg-primary text-white border-secondary focus:outline-none focus:border-white"
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              {errors.exp_month && (
                <p className="text-red-400 text-xs mt-1">{errors.exp_month}</p>
              )}
            </div>

            <div>
              <label className="block text-white text-sm font-bold mb-2">
                CVC
              </label>
              <input
                type="text"
                value={cardData.cvc}
                onChange={(e) => handleInputChange('cvc', e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                className={`w-full px-3 py-2 border rounded-lg bg-primary text-white border-secondary focus:outline-none focus:border-white ${
                  errors.cvc ? 'border-red-500' : ''
                }`}
                maxLength={4}
              />
              {errors.cvc && (
                <p className="text-red-400 text-xs mt-1">{errors.cvc}</p>
              )}
            </div>
          </div>

          {/* Amount Display */}
          <div className="bg-secondary rounded-lg p-4 text-center">
            <p className="text-white text-sm">支払い金額</p>
            <p className="text-white text-2xl font-bold">¥{yenAmount.toLocaleString()}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-secondary text-white rounded-lg hover:bg-secondary transition-colors"
                disabled={loading}
              >
                キャンセル
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '処理中...' : '決済する'}
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          <p>🔒 お客様のカード情報は安全に暗号化されて処理されます</p>
          <p>決済はPAY.JPによって安全に処理されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-b from-primary via-primary to-secondary p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-6 text-center">
        {amount.toLocaleString()}ポイント購入
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-white text-sm font-bold mb-2">
            カード番号
          </label>
          <input
            type="text"
            value={cardData.number}
            onChange={(e) => handleInputChange('number', formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            className={`w-full px-3 py-2 border rounded-lg bg-primary text-white border-secondary focus:outline-none focus:border-white ${
              errors.number ? 'border-red-500' : ''
            }`}
            maxLength={19}
          />
          {errors.number && (
            <p className="text-red-400 text-xs mt-1">{errors.number}</p>
          )}
        </div>

        {/* Expiry and CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              有効期限
            </label>
            <div className="flex gap-2">
              <select
                value={cardData.exp_month}
                onChange={(e) => handleInputChange('exp_month', parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border rounded-lg bg-primary text-white border-secondary focus:outline-none focus:border-white"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {month.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <select
                value={cardData.exp_year}
                onChange={(e) => handleInputChange('exp_year', parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border rounded-lg bg-primary text-white border-secondary focus:outline-none focus:border-white"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            {errors.exp_month && (
              <p className="text-red-400 text-xs mt-1">{errors.exp_month}</p>
            )}
          </div>

          <div>
            <label className="block text-white text-sm font-bold mb-2">
              CVC
            </label>
            <input
              type="text"
              value={cardData.cvc}
              onChange={(e) => handleInputChange('cvc', e.target.value.replace(/\D/g, ''))}
              placeholder="123"
              className={`w-full px-3 py-2 border rounded-lg bg-primary text-white border-secondary focus:outline-none focus:border-white ${
                errors.cvc ? 'border-red-500' : ''
              }`}
              maxLength={4}
            />
            {errors.cvc && (
              <p className="text-red-400 text-xs mt-1">{errors.cvc}</p>
            )}
          </div>
        </div>

        {/* Amount Display */}
        <div className="bg-secondary rounded-lg p-4 text-center">
          <p className="text-white text-sm">支払い金額</p>
          <p className="text-white text-2xl font-bold">¥{yenAmount.toLocaleString()}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-secondary text-white rounded-lg hover:bg-secondary transition-colors"
              disabled={loading}
            >
              キャンセル
            </button>
          )}
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '処理中...' : '決済する'}
          </button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        <p>🔒 お客様のカード情報は安全に暗号化されて処理されます</p>
        <p>決済はStripeによって安全に処理されます</p>
      </div>
    </div>
  );
};

export default StripePaymentForm; 