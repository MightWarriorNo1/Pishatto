import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Receipt } from '../../services/api';

interface ReceiptDisplayProps {
  receipt: Receipt;
  onBack: () => void;
}

const ReceiptDisplay: React.FC<ReceiptDisplayProps> = ({ receipt, onBack }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '年').replace(/\//g, '月') + '日';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-primary to-secondary">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-primary">
        <button onClick={onBack} className="mr-2 text-white">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium flex-1 text-center text-white">領収書</span>
      </div>

      {/* Receipt Content */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
          {/* Receipt Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">領収書</h1>
            <div className="text-right text-sm text-gray-600">
              <div>No. {receipt.receipt_number}</div>
              <div>{formatDate(receipt.issued_at)}</div>
            </div>
          </div>

          {/* Recipient */}
          <div className="mb-6">
            <div className="text-lg text-gray-800 mb-2">{receipt.recipient_name} 様</div>
            <div className="border-b border-gray-300 h-8"></div>
          </div>

          {/* Total Amount */}
          <div className="text-center mb-6">
            <div className="border-2 border-gray-800 p-4 mx-4">
              <div className="text-3xl font-bold text-gray-800">
                ¥{formatCurrency(receipt.total_amount)}-
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div className="text-center mb-6">
            <div className="text-sm text-gray-700">
              但し {receipt.purpose} として
            </div>
          </div>

          {/* Confirmation */}
          <div className="text-center mb-8">
            <div className="text-sm text-gray-700">
              上記正に、領収致しました。
            </div>
          </div>

          {/* Breakdown and Company Info */}
          <div className="flex justify-between">
            {/* Left Section - Breakdown */}
            <div className="flex-1">
              <div className="border border-dashed border-gray-400 p-2 mb-3 text-center">
                <div className="text-xs text-gray-600">電子領収書につき印紙不要</div>
              </div>
              <div className="text-xs text-gray-700">
                <div className="font-bold mb-1">内訳</div>
                <div>税抜き金額 ¥{formatCurrency(receipt.amount)}-</div>
                <div>消費税額 ¥{formatCurrency(receipt.tax_amount)}-</div>
                <div>消費税率 {receipt.tax_rate}%</div>
              </div>
            </div>

            {/* Right Section - Company Info */}
            <div className="flex-1 text-right">
              <div className="text-xs text-gray-700">
                <div className="font-bold mb-1">{receipt.company_name}</div>
                <div>〒106-0032</div>
                <div>東京都港区六本木4丁目8-7</div>
                <div>六本木三河台ビル</div>
                <div>{receipt.company_phone}</div>
                <div>{receipt.registration_number}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDisplay; 