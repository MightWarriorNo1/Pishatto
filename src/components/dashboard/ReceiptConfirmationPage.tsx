/*eslint-disable */
import React, { useState } from 'react';
import { ChevronLeft, Share2, Eye, ExternalLink } from 'lucide-react';
import { createReceipt,  Receipt } from '../../services/api';

interface ReceiptConfirmationPageProps {
  onBack: () => void;
  receiptData: {
    recipientName: string;
    memo: string;
    emailAddress: string;
  };
  transactionData?: {
    amount: number;
    type: string;
    description?: string;
    created_at: string;
  };
}

const ReceiptConfirmationPage: React.FC<ReceiptConfirmationPageProps> = ({ 
  onBack, 
  receiptData,
  transactionData 
}) => {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareableUrl, setShareableUrl] = useState<string>('');

  const handleCreateReceipt = async () => {
    if (!transactionData) {
      setError('取引データが見つかりません');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newReceipt = await createReceipt({
        user_type: 'guest', // This should be dynamic based on user type
        user_id: 1, // This should be the actual user ID
        recipient_name: receiptData.recipientName,
        amount: transactionData.amount,
        purpose: receiptData.memo || 'pishatto利用料',
      });

      setReceipt(newReceipt);
      
      // Generate shareable URL for the receipt
      const baseUrl = window.location.origin;
      const receiptUrl = `${baseUrl}/receipt/${newReceipt.receipt_number}-${Math.random().toString(36).slice(2,10)}_${Math.random().toString(36).slice(2,10)}`;
      setShareableUrl(receiptUrl);
    } catch (err) {
      setError('領収書の作成に失敗しました');
      console.error('Receipt creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-primary to-secondary">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-primary">
        <button onClick={onBack} className="mr-2 text-white hover:text-secondary cursor-pointer">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium flex-1 text-center text-white">全受信</span>
      </div>

      {/* Reply-to Address */}
      <div className="px-4 py-2 bg-primary">
        <div className="text-sm text-white text-center">返信先: no-reply@pishatto.today</div>
      </div>

      {/* Email Content */}
      <div className="px-4 py-6 space-y-4">
        {/* Subject */}
        <div className="font-bold text-lg text-white">
          【pishatto】領収書を発行しました
        </div>

        {/* Recipient */}
        <div className="text-white">
          {receiptData.recipientName}様
        </div>

        {/* Greeting */}
        <div className="text-white leading-relaxed">
          先日はpishattoをご利用いただきありがとうござい<br />
          ました。
        </div>

        {/* Receipt Confirmation */}
        <div className="text-white">
          領収書が発行されました。
        </div>

        {/* Receipt Link */}
        <div className="py-2">
          {error && (
            <div className="text-red-500 text-sm mb-2">{error}</div>
          )}
          <button
            onClick={handleCreateReceipt}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {loading ? '領収書を作成中...' : '領収書を発行'}
          </button>
          
          {/* Share and Display Options */}
          {shareableUrl && (
            <div className="space-y-2">
              <div className="text-xs text-white opacity-80 mb-2">
                領収書のURLを共有するか、直接アクセスできます
              </div>
              
              {/* Share Button */}
              {/* <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: '領収書',
                      text: 'pishattoの領収書です',
                      url: shareableUrl
                    });
                  } else {
                    // Fallback: copy to clipboard
                    navigator.clipboard.writeText(shareableUrl);
                    alert('URLをクリップボードにコピーしました');
                  }
                }}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                URLを共有
              </button> */}

              {/* Open Receipt Button */}
              <a
                href={shareableUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                領収書を表示
              </a>
              
              {/* Direct URL Display */}
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <div className="text-xs text-white opacity-80 mb-1">共有用URL:</div>
                <a href={shareableUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-200 underline break-all">{shareableUrl}</a>
              </div>
            </div>
          )}
        </div>

        {/* Closing */}
        <div className="text-white">
          またのご利用心よりお待ちしております。
        </div>
      </div>

      {/* Promotional Section */}
      <div className="px-4 py-6 border-t border-gray-200">
        <div className="text-center text-sm text-white mb-3">
          \\\ pishattoの楽しみ方 ///
        </div>
        <div className="space-y-1 text-sm text-white">
          <div>面談済みキャストと確実に会える!</div>
          <div>使えば使うほど好みのキャストを最適マッチング!</div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptConfirmationPage; 