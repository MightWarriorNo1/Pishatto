/*eslint-disable */
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { getPaymentInfo, deletePaymentInfo } from '../../services/api';
import CardRegistrationForm from './CardRegistrationForm';
import Spinner from '../ui/Spinner';

interface CardManagementPageProps {
  onBack?: () => void;
  userType?: 'guest' | 'cast';
  userId?: number;
}

interface Card {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

const CardManagementPage: React.FC<CardManagementPageProps> = ({
  onBack,
  userType = 'guest',
  userId,
}) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [showCardForm, setShowCardForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = userId || user?.id;

  useEffect(() => {
    if (currentUserId) {
      loadCards();
    }
  }, [currentUserId]);

  const loadCards = async () => {
    if (!currentUserId) return;

    setLoading(true);
    setError(null);

    try {
      const paymentInfo = await getPaymentInfo(userType, currentUserId);
      if (paymentInfo?.success && Array.isArray(paymentInfo.cards)) {
        const mappedCards: Card[] = paymentInfo.cards
          .map((pm: any) => {
            const card = pm?.card || {};
            const id = pm?.id || card?.id;
            if (!id) {
              return null;
            }
            return {
              id,
              brand: card?.brand || pm?.brand || '',
              last4: card?.last4 || pm?.last4 || '',
              exp_month: card?.exp_month || pm?.exp_month || 0,
              exp_year: card?.exp_year || pm?.exp_year || 0,
            } as Card;
          })
          .filter(Boolean) as Card[];
        setCards(mappedCards);
      } else {
        setCards([]);
      }
    } catch (error) {
      console.error('Failed to load cards:', error);
      setError('カード情報の読み込みに失敗しました');
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardRegistered = () => {
    setShowCardForm(false);
    loadCards(); // Reload cards after registration
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!currentUserId) return;

    if (!window.confirm('このカードを削除しますか？')) {
      return;
    }

    try {
      await deletePaymentInfo(userType, currentUserId, cardId);
      await loadCards(); // Reload cards after deletion
    } catch (error) {
      console.error('Failed to delete card:', error);
      setError('カードの削除に失敗しました');
    }
  };

  const getCardBrandIcon = (brand: string) => {
    const b = (brand || '').toLowerCase();
    switch (b) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'jcb':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  if (showCardForm) {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <button
            onClick={() => setShowCardForm(false)}
            className="text-white hover:text-gray-300 ml-4 mt-4"
          >
            ← 戻る
          </button>
        </div>
        <CardRegistrationForm
          onSuccess={handleCardRegistered}
          onCancel={() => setShowCardForm(false)}
          userType={userType}
          userId={currentUserId}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-transparent p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">登録済みカード</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="text-white hover:text-gray-300"
          >
            ← 戻る
          </button>
        )}
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={loadCards}
            className="px-4 py-2 bg-secondary text-white rounded-lg"
          >
            再試行
          </button>
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            登録済みカードがありません
          </h3>
          <p className="text-gray-300 mb-6">
            カードを登録すると、次回からは再入力不要で決済できます。
          </p>
          <button
            onClick={() => setShowCardForm(true)}
            className="w-full px-6 py-3 bg-secondary text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            カードを登録する
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-secondary rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="text-2xl mr-3">
                  {getCardBrandIcon(card.brand)}
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {(card.brand || 'CARD').toUpperCase()} •••• {card.last4 || '----'}
                  </div>
                  <div className="text-gray-300 text-sm">
                    有効期限: {(card.exp_month ? String(card.exp_month).padStart(2, '0') : '--')}/{card.exp_year || '----'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteCard(card.id)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                削除
              </button>
            </div>
          ))}
          
          <button
            onClick={() => setShowCardForm(true)}
            className="w-full px-4 py-3 border border-secondary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            + カードを追加
          </button>
        </div>
      )}
    </div>
  );
};

export default CardManagementPage; 