/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { X, CreditCard, Plus, CheckCircle2 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { getPaymentInfo, purchasePoints } from '../../services/api';
import StripePaymentForm from '../payment/PayJPPaymentForm';
import CardRegistrationForm from '../payment/CardRegistrationForm';
import Spinner from '../ui/Spinner';

interface InsufficientPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPoints: number;
  onPointsPurchased: () => void;
}

const InsufficientPointsModal: React.FC<InsufficientPointsModalProps> = ({
  isOpen,
  onClose,
  requiredPoints,
  onPointsPurchased
}) => {
  const { user, refreshUser } = useUser();
  const [hasRegisteredCard, setHasRegisteredCard] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCardRegistration, setShowCardRegistration] = useState(false);
  const [showPointPurchase, setShowPointPurchase] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate required amount in yen (1 point = 1.2 yen)
  const YEN_PER_POINT = 1.2;
  const requiredYen = Math.max(100, Math.ceil(requiredPoints * YEN_PER_POINT)); // Minimum 100 yen for Stripe

  useEffect(() => {
    if (isOpen && user?.id) {
      checkRegisteredCards();
    }
  }, [isOpen, user?.id]);

  const checkRegisteredCards = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    
    try {
      const paymentInfo = await getPaymentInfo('guest', user.id);
      setHasRegisteredCard(!!paymentInfo?.card_count);
    } catch (error: any) {
      console.error('Failed to check registered cards:', error);
      setHasRegisteredCard(false);
      const backendError = error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail;
      setError(backendError || 'カード情報の確認に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleAutomaticPayment = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Calculate yen amount (1 point = 1.2 yen)
      const YEN_PER_POINT = 1.2;
      const yenAmount = Math.max(100, Math.ceil(requiredPoints * YEN_PER_POINT)); // Minimum 100 yen for Stripe

      const result = await purchasePoints(
        user.id,
        'guest',
        yenAmount
      );

      if (result.success) {
        setPurchaseSuccess(true);
        await refreshUser();
        setTimeout(() => {
          onPointsPurchased();
          onClose();
        }, 2000);
      } else {
        if (result.error?.includes('カード情報が必要')) {
          setShowCardRegistration(true);
        } else {
          setError(result.error || 'ポイント購入に失敗しました。');
        }
      }
    } catch (error: any) {
      console.error('Point purchase failed:', error);
      const backendError = error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail;
      setError(backendError || 'ポイント購入中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleCardRegistered = () => {
    setShowCardRegistration(false);
    setHasRegisteredCard(true);
    // Automatically try automatic payment after card registration
    setTimeout(() => {
      handleAutomaticPayment();
    }, 500);
  };

  const handlePointPurchaseSuccess = () => {
    setShowPointPurchase(false);
    setPurchaseSuccess(true);
    refreshUser();
    setTimeout(() => {
      onPointsPurchased();
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    if (loading) return;
    setError(null);
    setShowCardRegistration(false);
    setShowPointPurchase(false);
    setPurchaseSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-primary via-primary to-secondary rounded-2xl p-6 w-full max-w-md mx-4 relative shadow-xl border border-secondary">
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-3 right-3 text-white/80 hover:text-white text-2xl disabled:opacity-50"
          aria-label="閉じる"
        >
          ×
        </button>

        {purchaseSuccess ? (
          <div className="text-center py-8">
            <CheckCircle2 className="text-green-400 w-16 h-16 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-2">ポイント購入完了！</h3>
            <p className="text-gray-300">
              {requiredPoints.toLocaleString()}ポイントが追加されました
            </p>
          </div>
        ) : showCardRegistration ? (
          <div>
            <h2 className="text-xl font-bold text-white mb-6 text-center">
              カード情報を登録
            </h2>
            <CardRegistrationForm
              onSuccess={handleCardRegistered}
              onCancel={() => setShowCardRegistration(false)}
              userType="guest"
              userId={user?.id}
            />
          </div>
        ) : showPointPurchase ? (
          <div>
            <h2 className="text-xl font-bold text-white mb-6 text-center">
              ポイント購入
            </h2>
            <StripePaymentForm
              amount={requiredPoints}
              onSuccess={handlePointPurchaseSuccess}
              onCancel={() => setShowPointPurchase(false)}
              onError={(error) => setError(error)}
              userType="guest"
              userId={user?.id}
            />
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-white mb-2">
                ポイントが不足しています
              </h2>
              <p className="text-gray-300 text-sm">
                予約に必要なポイント: <span className="text-yellow-400 font-bold">{requiredPoints.toLocaleString()}P</span>
              </p>
              <p className="text-gray-300 text-sm">
                現在のポイント: <span className="text-red-400 font-bold">{user?.points?.toLocaleString() || 0}P</span>
              </p>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Spinner />
                <p className="text-white mt-4">確認中...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <div className="mb-4">
                  <div className="text-red-400 text-sm font-medium mb-2">エラーが発生しました</div>
                  <p className="text-red-300 text-sm break-words">{error}</p>
                </div>
                <button
                  onClick={checkRegisteredCards}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  再試行
                </button>
              </div>
            ) : hasRegisteredCard ? (
              <div className="space-y-4">
                <div className="text-center">
                  <CreditCard className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    登録済みカードで購入
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    登録済みのカードから自動で{requiredYen.toLocaleString()}円を決済し、{requiredPoints.toLocaleString()}ポイントを購入します。
                  </p>
                </div>
                <button
                  onClick={handleAutomaticPayment}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      <span className="ml-2">処理中...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      自動でポイント購入
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowPointPurchase(true)}
                  className="w-full py-3 border border-gray-400 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  他の方法で購入
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <CreditCard className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    カード情報を登録して購入
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    まずカード情報を登録してから、{requiredPoints.toLocaleString()}ポイントを購入します。
                  </p>
                </div>
                <button
                  onClick={() => setShowCardRegistration(true)}
                  className="w-full py-3 bg-secondary text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  カードを登録して購入
                </button>
                <button
                  onClick={() => setShowPointPurchase(true)}
                  className="w-full py-3 border border-gray-400 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  他の方法で購入
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsufficientPointsModal;
