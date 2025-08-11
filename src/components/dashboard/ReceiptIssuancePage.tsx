import React, { useState } from 'react';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import ReceiptConfirmationPage from './ReceiptConfirmationPage';

interface ReceiptIssuancePageProps {
  onBack: () => void;
  onIssue: (receiptData: ReceiptData) => void;
  transactionData?: {
    amount: number;
    type: string;
    description?: string;
    created_at: string;
  };
}

interface ReceiptData {
  recipientName: string;
  memo: string;
  emailAddress: string;
}

const ReceiptIssuancePage: React.FC<ReceiptIssuancePageProps> = ({ 
  onBack, 
  onIssue, 
  transactionData 
}) => {
  const [recipientName, setRecipientName] = useState('株式会社テストて');
  const [memo, setMemo] = useState('pishatto利用料');
  const [emailAddress, setEmailAddress] = useState('test.jp');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleIssue = () => {
    // onIssue({
    //   recipientName,
    //   memo,
    //   emailAddress
    // });
    setShowConfirmation(true);
  };

  const handleBackFromConfirmation = () => {
    setShowConfirmation(false);
  };

  // Show confirmation page if receipt has been issued
  if (showConfirmation) {
    return (
      <ReceiptConfirmationPage
        onBack={handleBackFromConfirmation}
        receiptData={{
          recipientName,
          memo,
          emailAddress
        }}
        transactionData={transactionData}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-primary to-secondary pb-8">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
        <button onClick={onBack} className="mr-2 text-white hover:text-secondary cursor-pointer">
          <ChevronLeft size={24} />
        </button>
        <span className="text-lg font-medium flex-1 text-center text-white">領収書を発行する</span>
        <button 
          onClick={handleIssue}
          className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:text-secondary"
        >
          発行
        </button>
      </div>

      {/* Input Fields Section */}
      <div className="p-4 space-y-6">
        {/* Recipient Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            宛名
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="株式会社テストて"
          />
        </div>

        {/* Memo/Description */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            但し書き
          </label>
          <div className="relative">
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="pishatto利用料"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border border-gray-400 rounded-sm flex items-center justify-center">
                <ChevronDown size={12} className="text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            メールアドレス
          </label>
          <input
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="test@example.com"
          />
        </div>

        {/* Transaction Info (if available) */}
        {transactionData && (
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">取引情報</div>
            <div className="text-sm text-gray-800">
              <div>金額: {Math.abs(transactionData.amount).toLocaleString()}P</div>
              <div>種類: {transactionData.type}</div>
              {transactionData.description && (
                <div>説明: {transactionData.description}</div>
              )}
              <div>日時: {new Date(transactionData.created_at).toLocaleString('ja-JP')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Explanatory Text Section */}
      <div className="px-4">
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="text-sm text-gray-700 space-y-2">
            <div>領収書はポイント利用毎に発行ができます。</div>
            <div>メールアドレスを入力すると領収書のリンクが届きます。</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptIssuancePage; 