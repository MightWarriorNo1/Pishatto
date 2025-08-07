import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { createReceipt, Receipt } from '../../services/api';
import ReceiptDisplay from './ReceiptDisplay';

const ReceiptTestPage: React.FC = () => {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const handleCreateTestReceipt = async () => {
    setLoading(true);
    setError(null);

    try {
      const newReceipt = await createReceipt({
        user_type: 'guest',
        user_id: 1,
        recipient_name: '株式会社じーん',
        amount: 108000,
        purpose: 'pishatto利用料',
      });

      setReceipt(newReceipt);
      setShowReceipt(true);
    } catch (err) {
      setError('領収書の作成に失敗しました');
      console.error('Receipt creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackFromReceipt = () => {
    setShowReceipt(false);
    setReceipt(null);
  };

  if (showReceipt && receipt) {
    return <ReceiptDisplay receipt={receipt} onBack={handleBackFromReceipt} />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-primary to-secondary">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-primary">
        <button onClick={() => window.history.back()} className="mr-2 text-white">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium flex-1 text-center text-white">領収書テスト</span>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        <div className="text-white">
          <h1 className="text-xl font-bold mb-4">領収書テスト</h1>
          <p className="mb-4">このページでは領収書の作成と表示機能をテストできます。</p>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
            <h2 className="font-bold mb-2">テストデータ</h2>
            <ul className="text-sm space-y-1">
              <li>受取人: 株式会社じーん</li>
              <li>金額: ¥108,000</li>
              <li>目的: pishatto利用料</li>
            </ul>
          </div>

          {error && (
            <div className="text-red-500 text-sm mb-4">{error}</div>
          )}

          <button
            onClick={handleCreateTestReceipt}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '領収書を作成中...' : 'テスト領収書を作成'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptTestPage; 