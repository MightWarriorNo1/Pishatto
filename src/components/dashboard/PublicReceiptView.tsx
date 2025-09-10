import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getReceiptByNumber } from '../../services/api';
import { Receipt } from '../../services/api';
import Spinner from '../ui/Spinner';

const PublicReceiptView: React.FC = () => {
  const { receiptNumber } = useParams<{ receiptNumber: string }>();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!receiptNumber) {
        setError('領収書番号が指定されていません');
        setLoading(false);
        return;
      }

      try {
        // Extract the actual receipt number from the URL (remove the random part)
        const cleanReceiptNumber = receiptNumber.split('-')[0];
        const response = await getReceiptByNumber(cleanReceiptNumber);
        if (response && response.success && response.receipt) {
          setReceipt(response.receipt);
          setLoading(false);
        } else {
          setError('領収書が見つかりません');
        }
      } catch (err) {
        setError('領収書が見つかりません');
        console.error('Failed to fetch receipt:', err);
        setReceipt(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [receiptNumber]);

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

  const downloadAsPDF = () => {
    if (!receipt) return;

    // Create a new window with the receipt content for better Japanese support
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;

    const receiptContent = `
      <!DOCTYPE html>
      <html lang="ja">
        <head>
          <meta charset="utf-8">
          <title>領収書 - ${receipt.receipt_number}</title>
          <style>
            @page { margin: 20mm; size: A4 portrait; }
            body { 
              font-family: "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "MS PGothic", sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
            }
            .receipt { 
              max-width: 100%; 
              margin: 0 auto; 
              font-size: 12px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              position: relative;
            }
            .title { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 20px; 
            }
            .info { 
              position: absolute; 
              top: 0; 
              right: 0; 
              font-size: 12px; 
              color: #333; 
              text-align: right;
            }
            .recipient { 
              margin-bottom: 30px; 
              position: relative;
            }
            .recipient-name { 
              font-size: 16px; 
              margin-bottom: 10px; 
            }
            .recipient-line { 
              border-bottom: 1px solid #000; 
              height: 20px; 
            }
            .amount-section { 
              text-align: center; 
              margin: 30px 0; 
            }
            .amount-box { 
              border: 2px solid #000; 
              padding: 20px; 
              margin: 0 auto; 
              width: 200px; 
              text-align: center; 
            }
            .amount { 
              font-size: 20px; 
              font-weight: bold; 
            }
            .purpose { 
              text-align: center; 
              margin: 20px 0; 
              font-size: 14px;
            }
            .confirmation { 
              text-align: center; 
              margin: 30px 0; 
              font-size: 14px;
            }
            .bottom-section { 
              display: flex; 
              justify-content: space-between; 
              margin-top: 40px; 
              align-items: flex-end;
            }
            .breakdown { 
              flex: 1; 
              margin-right: 40px;
            }
            .company-info { 
              flex: 1; 
              text-align: right; 
            }
            .seal-box { 
              display: inline-flex; 
              align-items: center; 
              justify-content: center; 
              border: 3px solid #e53e3e; 
              border-radius: 50%; 
              color: #e53e3e; 
              width: 90px; 
              height: 90px; 
              text-align: center; 
              font-size: 12px; 
              font-weight: bold; 
              letter-spacing: 1px; 
            }
            .seal-small { 
              font-size: 10px; 
              line-height: 1.1; 
            }
            .seal-main { 
              font-size: 14px; 
              line-height: 1.1; 
            }
            .stamp { 
              border: 1px dashed #666; 
              padding: 8px; 
              text-align: center; 
              margin-bottom: 15px; 
              font-size: 10px;
              color: #666;
            }
            .breakdown-title { 
              font-weight: bold; 
              margin-bottom: 8px; 
              font-size: 12px;
            }
            .breakdown-item { 
              margin-bottom: 4px; 
              font-size: 11px;
            }
            .company-name { 
              font-weight: bold; 
              margin-bottom: 4px; 
              font-size: 12px;
            }
            .company-detail { 
              margin-bottom: 2px; 
              font-size: 11px;
            }
            @media print {
              body { margin: 0; }
              .receipt { max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="title">領収書</div>
              <div class="info">
                <div>No. ${receipt.receipt_number}</div>
                <div>${formatDate(receipt.issued_at)}</div>
              </div>
            </div>
            
            <div class="recipient">
              <div class="recipient-name">${receipt.recipient_name} 様</div>
              <div class="recipient-line"></div>
            </div>
            
            <div class="amount-section">
              <div class="amount-box">
                <div class="amount">¥${formatCurrency(receipt.total_amount)}</div>
              </div>
            </div>
            
            <div class="purpose">
              但し ${receipt.purpose} として
            </div>
            
            <div class="confirmation">
              上記正に、領収致しました。
            </div>
            
            <div class="bottom-section">
              <div class="breakdown">
                <div class="stamp">電子領収書につき印紙不要</div>
                <div class="breakdown-title">内訳</div>
                <div class="breakdown-item">税抜き金額 ¥${formatCurrency(receipt.amount)}</div>
                <div class="breakdown-item">消費税額 ¥${formatCurrency(receipt.tax_amount)}</div>
                <div class="breakdown-item">消費税率 ${receipt.tax_rate}%</div>
              </div>
              
              <div class="company-info">
                <div class="seal-box">
                  <div>
                    <div class="seal-small">株式会社</div>
                    <div class="seal-main">Pishatto</div>
                    <div class="seal-small">印</div>
                  </div>
                </div>
                <div class="company-name">株式会社Pishatto</div>
                <div class="company-detail">〒107-0052</div>
                <div class="company-detail">東京都港区六本木4丁目8-7</div>
                <div class="company-detail">六本木三河台ビル</div>
                
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
    
    // Wait for content to load then trigger print
    receiptWindow.onload = () => {
      // Small delay to ensure fonts are loaded
      setTimeout(() => {
        receiptWindow.print();
        // Close window after a delay to allow print dialog to appear
        setTimeout(() => {
          receiptWindow.close();
        }, 1000);
      }, 500);
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error || '領収書が見つかりません'}</div>
          <div className="text-gray-600">URLを確認してください</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full">
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
          <div className="border-2 border-gray-800 p-4 mx-8">
            <div className="text-3xl font-bold text-gray-800">
              ¥{formatCurrency(receipt.total_amount)}
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

                 {/* Breakdown and Company Info - Horizontal Layout */}
         <div className="flex justify-between items-end">
           {/* Left Section - Breakdown */}
           <div className="space-y-3">
             <div className="border border-dashed border-gray-400 p-3 text-center">
               <div className="text-sm text-gray-600">電子領収書につき印紙不要</div>
             </div>
             <div className="text-sm text-gray-700">
               <div className="font-bold mb-2">内訳</div>
               <div>税抜き金額 ¥{formatCurrency(receipt.amount)}</div>
               <div>消費税額 ¥{formatCurrency(receipt.tax_amount)}</div>
               <div>消費税率 {receipt.tax_rate}%</div>
             </div>
           </div>

           {/* Right Section - Company Info */}
           <div className="text-right space-y-2">
            <div className="mt-2 flex justify-end">
              <div className="inline-flex items-center justify-center border-2 border-red-600 rounded-full text-red-600 w-24 h-24 text-center font-bold leading-tight">
                <div>
                  <div className="text-[10px] leading-3">株式会社</div>
                  <div className="text-sm leading-3">Pishatto</div>
                  <div className="text-[10px] leading-3">印</div>
                </div>
              </div>
            </div>
             <div className="text-sm text-gray-700">
               <div className="font-bold">株式会社Pishatto</div>
               <div>〒107-0052</div>
               <div>東京都港区六本木4丁目8-7</div>
               <div>六本木三河台ビル</div>
             </div>
             
           </div>
         </div>

        {/* Download Button */}
        <div className="mt-8 text-center">
          <button
            onClick={downloadAsPDF}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            PDFダウンロード
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicReceiptView;
