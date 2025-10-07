/*eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { registerCard } from '../../services/api';
import StripeService from '../../services/stripe';

interface CardRegistrationFormProps {
  onSuccess?: (paymentMethod?: string) => void;
  onCancel?: () => void;
  userType?: 'guest' | 'cast';
  userId?: number;
}

// Simple global instance
let stripeInstance: any = null;

const CardRegistrationForm: React.FC<CardRegistrationFormProps> = ({
  onSuccess,
  onCancel,
  userType = 'guest',
  userId,
}) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const cardElement = useRef<any>(null);
  const cardContainer = useRef<HTMLDivElement>(null);

  const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_...';

  useEffect(() => {
    const init = async () => {
      // Load script if needed
      if (!(window as any).Stripe) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        await new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      // Create Stripe instance only once
      if (!stripeInstance) {
        stripeInstance = (window as any).Stripe(STRIPE_PUBLIC_KEY);
      }

      // Create card element
      const elements = stripeInstance.elements();
      cardElement.current = elements.create('card', {
        hidePostalCode: true,
        style: {
          base: { fontSize: '16px', color: '#ffffff', backgroundColor: 'transparent' },
          invalid: { color: '#fa755a' }
        }
      });

      cardElement.current.mount('#card-element');
      setReady(true);
    };

    init();

    return () => {
      if (cardElement.current?.destroy) {
        cardElement.current.destroy();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentUserId = userId || user?.id;
    if (!currentUserId || !ready) return;

    setLoading(true);
    setError(null);

    try {
      const { paymentMethod, error } = await stripeInstance.createPaymentMethod({
        type: 'card',
        card: cardElement.current,
      });
      
      if (error) {
        setError(error.message);
        return;
      }

      try {
        const response = await registerCard(currentUserId, userType, paymentMethod.id);
        if (response.success) {
          setSuccess('カード情報を安全に登録しました');
          setTimeout(() => onSuccess?.(paymentMethod.id), 1500);
        } else {
          setError(response.error || 'カード登録中にエラーが発生しました');
        }
      } catch (apiError: any) {
        if (apiError.response?.status === 500) {
          setError('サーバーエラーが発生しました。データベースの設定を確認してください。');
        } else {
          setError(apiError.response?.data?.error || apiError.message || 'カード登録中にエラーが発生しました');
        }
      }
    } catch (error: any) {
      setError(error.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-6 text-center">カード情報登録</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white text-sm font-bold mb-2">カード情報</label>
          <div
            id="card-element"
            ref={cardContainer}
            className="w-full px-3 py-2 min-h-8 border rounded-lg bg-primary text-white border-secondary"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        {success && (
          <div className="bg-green-600 rounded-lg p-3 text-center">
            <p className="text-white text-sm">
              {success}
            </p>
          </div>
        )}

        <div className="text-xs text-gray-400 text-center">
          <p>🔒 お客様のカード情報は安全に暗号化されて処理されます</p>
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-secondary text-white rounded-lg"
              disabled={loading}
            >
              キャンセル
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !ready}
            className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? '登録中...' : 'カードを登録'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CardRegistrationForm;
