import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { registerCard } from '../../services/api';

interface CardRegistrationFormProps {
  onSuccess?: (token?: string) => void;
  onCancel?: () => void;
  userType?: 'guest' | 'cast';
  userId?: number;
}

// Simple global instance
let payjpInstance: any = null;

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

  const PAYJP_PUBLIC_KEY = process.env.REACT_APP_PAYJP_PUBLIC_KEY || 'pk_test_ccb8e3a59692761578d1b83b';

  useEffect(() => {
    const init = async () => {
      // Load script if needed
      if (!(window as any).Payjp) {
        const script = document.createElement('script');
        script.src = 'https://js.pay.jp/v2/pay.js';
        await new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      // Create PayJP instance only once
      if (!payjpInstance) {
        payjpInstance = (window as any).Payjp(PAYJP_PUBLIC_KEY);
      }

      // Create card element
      const elements = payjpInstance.elements();
      cardElement.current = elements.create('card', {
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
      const result = await payjpInstance.createToken(cardElement.current);
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      try {
        const response = await registerCard(currentUserId, userType, result.id);
        if (response.success) {
          setSuccess('カード情報を安全に登録しました');
          setTimeout(() => onSuccess?.(result.id), 1500);
        } else {
          setError(response.error || 'カード登録中にエラーが発生しました');
        }
      } catch (apiError: any) {
        console.error('API Error:', apiError);
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
    <div className="max-w-md mx-auto bg-primary p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-6 text-center">カード情報登録</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white text-sm font-bold mb-2">カード情報</label>
          <div
            id="card-element"
            ref={cardContainer}
            className="w-full px-3 py-2 border rounded-lg bg-primary text-white border-secondary"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        {success && (
          <div className="bg-green-600 rounded-lg p-3 text-center">
            <p className="text-white text-sm">{success}</p>
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
