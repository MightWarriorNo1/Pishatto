import React, { useState } from 'react';
import CardManagementPage from './CardManagementPage';
import PayJPPaymentForm from './PayJPPaymentForm';

const CardRegistrationTestPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'management' | 'payment'>('management');
  const [testAmount] = useState(1000);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">カード登録・決済テスト</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('management')}
              className={`px-4 py-2 rounded-lg ${
                currentView === 'management'
                  ? 'bg-secondary text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              カード管理
            </button>
            <button
              onClick={() => setCurrentView('payment')}
              className={`px-4 py-2 rounded-lg ${
                currentView === 'payment'
                  ? 'bg-secondary text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              決済テスト
            </button>
          </div>
        </div>

        {currentView === 'management' ? (
          <CardManagementPage
            userType="guest"
            userId={1} // Test user ID
          />
        ) : (
          <PayJPPaymentForm
            amount={testAmount}
            userType="guest"
            userId={1} // Test user ID
            onSuccess={(payment) => {
              alert(`決済成功: ${payment.id}`);
            }}
            onError={(error) => {
              alert(`決済エラー: ${error}`);
            }}
            onCancel={() => {
              alert('決済キャンセル');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CardRegistrationTestPage; 