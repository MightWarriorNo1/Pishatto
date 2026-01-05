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
        // Check if authentication is required (3DS or on-session confirmation)
        if (
          paymentResult.requires_authentication &&
          paymentResult.client_secret &&
          paymentResult.payment_intent_id
        ) {
          // Load Stripe.js if not already loaded
          if (!(window as any).Stripe) {
            const script = document.createElement("script");
            script.src = "https://js.stripe.com/v3/";
            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }

          const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY || "";
          const stripe = (window as any).Stripe(STRIPE_PUBLIC_KEY);

          // Retrieve the payment intent to check its status
          const { error: retrieveError, paymentIntent } =
            await stripe.retrievePaymentIntent(paymentResult.client_secret);

          if (retrieveError) {
            console.error("Payment intent retrieval error:", retrieveError);
            onError?.(retrieveError.message || "支払い情報の取得に失敗しました。");
            setLoading(false);
            return;
          }

          // Check if payment requires action (redirect-based authentication)
          if (paymentIntent.status === "requires_action") {
            const nextAction = paymentIntent.next_action;

            if (nextAction && nextAction.type === "redirect_to_url") {
              // Store payment context in sessionStorage for return handling
              const paymentContext = {
                payment_intent_id: paymentResult.payment_intent_id,
                client_secret: paymentResult.client_secret,
                returnUrl: window.location.pathname + window.location.search,
              };

              sessionStorage.setItem("payment_intent_id", paymentResult.payment_intent_id);
              sessionStorage.setItem(
                "payment_context",
                JSON.stringify(paymentContext)
              );

              // Redirect to the bank's authentication page
              window.location.href = nextAction.redirect_to_url.url;
              return; // Will return after redirect
            }
          }

          // Try to confirm the payment intent (for modal-based authentication)
          const { error: confirmError, paymentIntent: confirmedIntent } =
            await stripe.confirmCardPayment(paymentResult.client_secret, {
              return_url: `${window.location.origin}/payment/return`,
            });

          if (confirmError) {
            // Check if error indicates redirect is needed
            if (
              confirmError.type === "card_error" &&
              confirmError.code === "authentication_required"
            ) {
              // Retrieve again to get redirect URL
              const { paymentIntent: retryIntent } =
                await stripe.retrievePaymentIntent(paymentResult.client_secret);
              if (
                retryIntent &&
                retryIntent.next_action &&
                retryIntent.next_action.type === "redirect_to_url"
              ) {
                // Store payment context
                const paymentContext = {
                  payment_intent_id: paymentResult.payment_intent_id,
                  client_secret: paymentResult.client_secret,
                  returnUrl: window.location.pathname + window.location.search,
                };

                sessionStorage.setItem("payment_intent_id", paymentResult.payment_intent_id);
                sessionStorage.setItem(
                  "payment_context",
                  JSON.stringify(paymentContext)
                );

                // Redirect to authentication page
                window.location.href = retryIntent.next_action.redirect_to_url.url;
                return;
              }
            }

            console.error("Stripe authentication error:", confirmError);
            onError?.(confirmError.message || "認証処理中にエラーが発生しました。");
            setLoading(false);
            return;
          }

          // Check payment intent status
          if (
            confirmedIntent &&
            (confirmedIntent.status === "requires_capture" ||
              confirmedIntent.status === "succeeded" ||
              confirmedIntent.status === "processing")
          ) {
            onSuccess?.(paymentResult.payment);
            setLoading(false);
            return;
          }
        } else {
          // No authentication required, proceed normally
          onSuccess?.(paymentResult.payment);
        }
      } else {
        onError?.(paymentResult.error || '決済処理中にエラーが発生しました');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      const backendError = error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail;
      
      // Check if the error indicates that on-session confirmation is required
      if (
        backendError?.includes("on-session action") ||
        backendError?.includes("requires an on-session")
      ) {
        // Check if backend returned payment intent details in error response
        const paymentIntentData = error.response?.data?.payment_intent;
        const clientSecret = error.response?.data?.client_secret || paymentIntentData?.client_secret;
        const paymentIntentId = error.response?.data?.payment_intent_id || paymentIntentData?.id;

        if (clientSecret && paymentIntentId) {
          // Backend returned payment intent details - automatically redirect to authentication
          try {
            // Load Stripe.js if not already loaded
            if (!(window as any).Stripe) {
              const script = document.createElement("script");
              script.src = "https://js.stripe.com/v3/";
              await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
              });
            }

            const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY || "";
            const stripe = (window as any).Stripe(STRIPE_PUBLIC_KEY);

            // Retrieve the payment intent to get redirect URL
            const { error: retrieveError, paymentIntent } =
              await stripe.retrievePaymentIntent(clientSecret);

            if (!retrieveError && paymentIntent) {
              // Check if payment requires redirect
              if (
                paymentIntent.status === "requires_action" &&
                paymentIntent.next_action &&
                paymentIntent.next_action.type === "redirect_to_url"
              ) {
                // Store payment context for return handling
                const paymentContext = {
                  payment_intent_id: paymentIntentId,
                  client_secret: clientSecret,
                  returnUrl: window.location.pathname + window.location.search,
                };

                sessionStorage.setItem("payment_intent_id", paymentIntentId);
                sessionStorage.setItem(
                  "payment_context",
                  JSON.stringify(paymentContext)
                );

                // Automatically redirect to authentication page (smooth, no error shown)
                window.location.href = paymentIntent.next_action.redirect_to_url.url;
                return; // Exit early - redirect is happening
              }
            }
          } catch (redirectError: any) {
            console.error("Failed to redirect for authentication:", redirectError);
            // If redirect fails, show error
            onError?.("認証ページへのリダイレクトに失敗しました。もう一度お試しください。");
          }
        } else {
          // Backend didn't return payment intent details
          // Try to create an on-session payment intent as fallback
          try {
            // This will create a new payment intent that can be confirmed on-session
            const onSessionResult = await purchasePoints(
              user.id,
              userType,
              yenAmount,
              undefined,
              'card'
            );

            if (
              onSessionResult.success &&
              onSessionResult.requires_authentication &&
              onSessionResult.client_secret &&
              onSessionResult.payment_intent_id
            ) {
              // Load Stripe.js and redirect
              if (!(window as any).Stripe) {
                const script = document.createElement("script");
                script.src = "https://js.stripe.com/v3/";
                await new Promise((resolve, reject) => {
                  script.onload = resolve;
                  script.onerror = reject;
                  document.head.appendChild(script);
                });
              }

              const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY || "";
              const stripe = (window as any).Stripe(STRIPE_PUBLIC_KEY);

              const { paymentIntent } = await stripe.retrievePaymentIntent(onSessionResult.client_secret);

              if (
                paymentIntent &&
                paymentIntent.status === "requires_action" &&
                paymentIntent.next_action &&
                paymentIntent.next_action.type === "redirect_to_url"
              ) {
                const paymentContext = {
                  payment_intent_id: onSessionResult.payment_intent_id,
                  client_secret: onSessionResult.client_secret,
                  returnUrl: window.location.pathname + window.location.search,
                };

                sessionStorage.setItem("payment_intent_id", onSessionResult.payment_intent_id);
                sessionStorage.setItem("payment_context", JSON.stringify(paymentContext));

                // Automatically redirect
                window.location.href = paymentIntent.next_action.redirect_to_url.url;
                return;
              }
            }
          } catch (fallbackError: any) {
            console.error("Fallback payment creation failed:", fallbackError);
            onError?.("認証が必要です。別の方法で決済を完了してください。");
          }
        }
      } else {
        onError?.(backendError || error.message || '決済処理中にエラーが発生しました');
      }
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