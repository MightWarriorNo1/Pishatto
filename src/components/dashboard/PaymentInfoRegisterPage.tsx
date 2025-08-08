import React, { useEffect, useState } from 'react';
import CardManagementPage from '../payment/CardManagementPage';
import CardRegistrationForm from '../payment/CardRegistrationForm';
import { getPaymentInfo } from '../../services/api';
import {ChevronLeft} from 'lucide-react';

interface PaymentInfoRegisterPageProps {
  onBack?: () => void;
  onCardRegistered?: () => void;
  userType?: 'guest' | 'cast';
  userId?: number;
}

const PaymentInfoRegisterPage: React.FC<PaymentInfoRegisterPageProps> = ({ onBack, onCardRegistered, userType = 'guest', userId }) => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setShowCardForm(true); // Show card registration form if no userId
      return;
    }
    setLoading(true);
    setError(null);
    getPaymentInfo(userType, userId)
      .then((info) => {
        if (info) {
          setShowCardForm(false);
        } else {
          setShowCardForm(true);
        }
      })
      .catch(() => setError('支払い情報の取得に失敗しました'))
      .finally(() => setLoading(false));
  }, [userType, userId]);

  const handleCardRegistered = () => {
    // Notify parent that card was registered successfully
    if (onCardRegistered) {
      onCardRegistered();
    }
    // Go back to the steps requirement screen after successful card registration
    if (onBack) {
      onBack();
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-primary via-primary to-secondary pb-8">
        <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
          {onBack && (
            <button onClick={onBack} className="mr-2 text-2xl text-white">&#60;</button>
          )}
          <span className="text-lg font-bold flex-1 text-center text-white">支払い情報登録</span>
        </div>
        <div className="p-4">
          <div className="text-white text-center">ローディング...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
        <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
          {onBack && (
            <button onClick={onBack} className="mr-2 text-2xl text-white">&#60;</button>
          )}
          <span className="text-lg font-bold flex-1 text-center text-white">支払い情報登録</span>
        </div>
        <div className="p-4">
          <div className="text-red-400 text-center mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-secondary text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  // If payment info exists, show card management page
  if (!showCardForm) {
    return (
      <CardManagementPage
        onBack={onBack}
        userType={userType}
        userId={userId}
      />
    );
  }

  // If no payment info, show card registration form
  return (
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-primary via-primary to-secondary pb-8">
      <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
        {onBack && (
          <button onClick={onBack} className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer">
            <ChevronLeft />
          </button>
        )}
        <span className="text-lg font-bold flex-1 text-center text-white">支払い情報登録</span>
      </div>
      <div className="p-4">
        <CardRegistrationForm
          onSuccess={handleCardRegistered}
          onCancel={onBack}
          userType={userType}
          userId={userId}
        />
      </div>
    </div>
  );
};

export default PaymentInfoRegisterPage; 