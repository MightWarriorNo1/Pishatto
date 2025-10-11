import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronDown, Mail, User, FileText, Send } from 'lucide-react';
import ReceiptConfirmationPage from './ReceiptConfirmationPage';

interface ReceiptIssuancePageProps {
  onBack: () => void;
  onIssue: (receiptData: ReceiptData) => void;
  onIssued: (issuedAt: string) => void;
  userType: 'guest' | 'cast';
  userId: number;
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
  onIssued,
  userType,
  userId,
  transactionData 
}) => {
  const [recipientName, setRecipientName] = useState('株式会社テストて');
  const [memo, setMemo] = useState('サービス利用料');
  const [emailAddress, setEmailAddress] = useState('test.jp');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMemoDropdownOpen, setIsMemoDropdownOpen] = useState(false);
  const memoOptions = ['サービス利用料', '施術代', '接待・交際料'];
  const memoDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (memoDropdownRef.current && !memoDropdownRef.current.contains(event.target as Node)) {
        setIsMemoDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleIssue = async () => {
    if (!recipientName.trim() || !memo.trim() || !emailAddress.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSubmitting(false);
    
    setShowConfirmation(true);
  };

  const handleBackFromConfirmation = () => {
    setShowConfirmation(false);
  };

  const isFormValid = recipientName.trim() && memo.trim() && emailAddress.trim();

  // Show confirmation page if receipt has been issued
  if (showConfirmation) {
    return (
      <ReceiptConfirmationPage
        onBack={handleBackFromConfirmation}
        onIssued={onIssued}
        userType={userType}
        userId={userId}
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
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-secondary">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-primary via-primary so-secondary backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={onBack} 
              className="mr-3 p-2 text-white hover:text-secondary rounded-full transition-all duration-200"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="text-xl font-semibold text-white flex-1 text-center">領収書を発行する</span>
            <button 
              onClick={handleIssue}
              disabled={!isFormValid || isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {isSubmitting ? '処理中...' : '発行'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Form Card */}
        <div className="bg-white/10 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Recipient Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-white">
                <User size={16} className="text-blue-600" />
                宛名
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  placeholder="株式会社テストて"
                />
                {recipientName.trim() && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
            </div>

            {/* Memo/Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-white">
                <FileText size={16} className="text-indigo-600" />
                但し書き
              </label>
              <div className="relative" ref={memoDropdownRef}>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all duration-200 pr-12"
                  placeholder="サービス利用料"
                />
                <button
                  type="button"
                  onClick={() => setIsMemoDropdownOpen((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={isMemoDropdownOpen}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <ChevronDown size={16} />
                </button>
                {isMemoDropdownOpen && (
                  <div className="absolute w-full z-20 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg">
                    <ul className="py-1" role="listbox" aria-label="但し書きを選択">
                      {memoOptions.map((option) => (
                        <li key={option}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={memo === option}
                            onClick={() => {
                              setMemo(option);
                              setIsMemoDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            {option}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {memo.trim() && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-white">
                <Mail size={16} className="text-purple-600" />
                メールアドレス
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  placeholder="test@example.com"
                />
                {emailAddress.trim() && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Info Card */}
        {transactionData && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm font-medium opacity-90">取引情報</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="opacity-80">金額:</span>
                  <span className="font-semibold text-lg">{Math.abs(transactionData.amount).toLocaleString()}P</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-80">種類:</span>
                  <span className="font-medium">{transactionData.type}</span>
                </div>
                {transactionData.description && (
                  <div className="flex justify-between items-center">
                    <span className="opacity-80">説明:</span>
                    <span className="font-medium">{transactionData.description}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="opacity-80">日時:</span>
                  <span className="font-medium">{new Date(transactionData.created_at).toLocaleString('ja-JP').replace(/\//g, '-')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Explanatory Text Card */}
        <div className="bg-white/10 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="text-sm text-white space-y-3 leading-relaxed">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>領収書はポイント利用毎に発行ができます。</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>メールアドレスを入力すると領収書のリンクが届きます。</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptIssuancePage; 