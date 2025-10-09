import React, { useEffect, useState } from 'react';
import { getPointTransactions, getReceipts } from '../../services/api';
import { ChevronLeft } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import ReceiptIssuancePage from './ReceiptIssuancePage';
import { getFirstAvatarUrl } from '../../utils/avatar';
import Spinner from '../ui/Spinner';

interface PointTransactionData {
  id: number;
  guest_id?: number;
  cast_id?: number;
  type: 'buy' | 'transfer' | 'convert' | 'gift' | 'pending';
  amount: number;
  reservation_id?: number;
  description?: string;
  gift_type?: string;
  created_at: string;
  updated_at: string;
  guest?: {
    id: number;
    nickname: string;
    avatar?: string;
  };
  cast?: {
    id: number;
    nickname: string;
    avatar?: string;
  };
  receipt_issued_at?: string; // frontend-added field from receipts lookup
}

interface PointHistoryProps {
  onBack?: () => void;
  userType?: 'guest' | 'cast';
  userId?: number;
}

interface ReceiptData {
  recipientName: string;
  memo: string;
  emailAddress: string;
}

const PointHistory: React.FC<PointHistoryProps> = ({ onBack, userType = 'guest', userId }) => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<PointTransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReceiptPage, setShowReceiptPage] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<PointTransactionData | null>(null);
  const [issuedByTransactionKey, setIssuedByTransactionKey] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getPointTransactions(userType, userId),
      getReceipts(userType, userId)
    ])
      .then(([txResponse, receipts]) => {
        if (txResponse.success) {
          const txs: PointTransactionData[] = txResponse.transactions || [];
          // Build per-transaction key map (date + abs(amount)) => issued_at
          // date is derived from receipt.transaction_created_at (fallback: created_at)
          const map: Record<string, string> = {};
          (receipts || []).forEach((r: any) => {
            const txDateSrc: string | undefined = r.transaction_created_at || r.created_at;
            const issuedAt: string | undefined = r.issued_at;
            if (!txDateSrc || !issuedAt) return;
            const d = new Date(txDateSrc);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const da = String(d.getDate()).padStart(2, '0');
            const dateKey = `${y}-${m}-${da}`;
            const amountKey = String(Math.abs(Number(r.amount)));
            map[`${dateKey}-${amountKey}`] = issuedAt;
          });
          setIssuedByTransactionKey(map);
          setTransactions(txs);
        } else {
          setError(txResponse.error || 'ポイント履歴の取得に失敗しました');
        }
      })
      .catch(() => setError('ポイント履歴の取得に失敗しました'))
      .finally(() => setLoading(false));
  }, [userType, userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionType = (transaction: PointTransactionData) => {
    switch (transaction.type) {
      case 'buy':
        return 'ポイント購入';
      case 'transfer':
        return 'ポイント送付';
      case 'convert':
        return 'ポイント変換';
      case 'gift':
        return 'ギフト送付';
      default:
        return 'その他';
    }
  };

  const getTransactionIcon = (transaction: PointTransactionData) => {
    // Try to get avatar from guest or cast data
    let avatarUrl = '';
    
    if (transaction.guest?.avatar) {
      avatarUrl = getFirstAvatarUrl(transaction.guest.avatar);
    } else if (transaction.cast?.avatar) {
      avatarUrl = getFirstAvatarUrl(transaction.cast.avatar);
    }
    
    if (avatarUrl) {
      return (
        <img 
          src={avatarUrl} 
          alt="avatar" 
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            // Hide the image and show fallback icon if avatar fails to load
            const imgElement = e.currentTarget as HTMLImageElement;
            imgElement.style.display = 'none';
          }}
        />
      );
    }
    
    // Fallback to generic icon if no avatar available
    if (transaction.amount < 0) {
      return (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-gray-400"></div>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
      </div>
    );
  };

  const handleReceiptClick = (transaction: PointTransactionData) => {
    setSelectedTransaction(transaction);
    setShowReceiptPage(true);
  };

  const handleReceiptBack = () => {
    setShowReceiptPage(false);
    setSelectedTransaction(null);
  };

  const handleReceiptIssue = (receiptData: ReceiptData) => {
    // no-op here; issuance is handled in confirmation page
    handleReceiptBack();
  };

  // Show receipt issuance page if active
  if (showReceiptPage && selectedTransaction) {
    return (
      <ReceiptIssuancePage
        onBack={handleReceiptBack}
        onIssue={handleReceiptIssue}
        onIssued={(issuedAt) => {
          // Update issued map for this specific transaction (by date + abs(amount))
          const d = new Date(selectedTransaction.created_at);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const da = String(d.getDate()).padStart(2, '0');
          const dateKey = `${y}-${m}-${da}`;
          const amountKey = String(Math.abs(Number(selectedTransaction.amount)));
          const key = `${dateKey}-${amountKey}`;
          setIssuedByTransactionKey(prev => ({ ...prev, [key]: issuedAt }));
        }}
        userType={userType}
        userId={userId as number}
        transactionData={{
          amount: selectedTransaction.amount,
          type: getTransactionType(selectedTransaction),
          description: selectedTransaction.description,
          created_at: selectedTransaction.created_at
        }}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-primary to-secondary pb-20">
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-10">
        <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
          {onBack && (
            <button onClick={onBack} className="mr-2 text-white hover:text-secondary cursor-pointer">
              <ChevronLeft size={24} />
            </button>
          )}
          <span className="text-lg font-medium flex-1 text-center text-white">ポイント履歴・領収書</span>
        </div>
      </div>

      <div className="p-4 pt-20">
        {/* Current Points Section */}
        <div className="text-center mb-6">
          <div className="text-sm text-white mb-2">現在の所有ポイント</div>
          <div className="text-3xl font-bold text-white mb-2">
            {(user?.points || 0).toLocaleString()}P
          </div>  
          <div className="text-xs text-white space-y-1">
            <div>ポイントは3,000Pごとにオートチャージされます</div>
            <div>またポイントの有効期限は購入・取得から180日です</div>
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="text-white text-center">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="text-white text-center">ポイント履歴がありません</div>
        ) : (
          <div className="space-y-0">
            {transactions.map((transaction, index) => (
              <div key={transaction.id}>
                {/* Transaction Row */}
                <div className="flex items-center py-4 border-b border-gray-100">
                  {/* Avatar/Icon */}
                  <div className="mr-3">
                    {getTransactionIcon(transaction)}
                  </div>
                  
                  {/* Transaction Details */}
                  <div className="flex-1">
                    <div className="text-xs text-white mb-1">
                      {formatDate(transaction.created_at)}
                    </div>
                    <div className="text-sm text-white">
                      {getTransactionType(transaction)}
                    </div>
                    {transaction.description && (
                      <div className="text-xs text-gray-300 mt-1">
                        {transaction.description}
                      </div>
                    )}
                  </div>
                  
                  {/* Amount */}
                  <div className={`text-sm font-medium ${
                    transaction.amount < 0 ? 'text-white' : 'text-white'
                  }`}>
                    {(() => {
                      // For gift transactions, show as negative for the sender
                      if (transaction.type === 'gift' || transaction.type==='pending') {
                        return `-${Math.abs(transaction.amount).toLocaleString()}P`;
                      }
                      // For buy transactions, show points and Stripe cost
                      // if (transaction.type === 'buy') {
                      //   const stripeCost = Math.round(transaction.amount * 1.2 * 1.1); // Points * 1.2 (yen per point) * 1.1 (consumption tax)
                      //   return (
                      //     <div className="text-right">
                      //       <div className="text-white">
                      //         {`${transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString()}P`}
                      //       </div>
                      //       <div className="text-xs text-gray-300 mt-1">
                      //         {stripeCost.toLocaleString()}
                      //       </div>
                      //     </div>
                      //   );
                      // }
                      // For other transactions, show with + or - based on amount
                      return `${transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString()}P`;
                    })()}
                  </div>
                </div>
                
                
                {transaction.type === 'buy' && (
                  <div className="py-4 text-center border-b border-white bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg mx-2 mb-2">
                    {(() => {
                      // Compute tx key for this row
                      const d = new Date(transaction.created_at);
                      const y = d.getFullYear();
                      const m = String(d.getMonth() + 1).padStart(2, '0');
                      const da = String(d.getDate()).padStart(2, '0');
                      const dateKey = `${y}-${m}-${da}`;
                      const amountKey = String(Math.abs(Number(transaction.amount)));
                      const key = `${dateKey}-${amountKey}`;
                      const issuedAt = issuedByTransactionKey[key];
                      if (userType === 'guest' && issuedAt) {
                        const idate = new Date(issuedAt);
                        const issuedText = `${idate.getFullYear()}年${String(idate.getMonth()+1).padStart(2,'0')}月${String(idate.getDate()).padStart(2,'0')}日発行済`;
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-400 text-sm font-medium">領収書発行済み</span>
                            </div>
                            <div className="text-white text-xs opacity-80">{issuedText}</div>
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-blue-400 text-sm font-medium">領収書発行可能</span>
                          </div>
                          <button 
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 mx-auto"
                            onClick={() => handleReceiptClick(transaction)}
                            disabled={userType === 'guest' && Boolean(issuedByTransactionKey[key])}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            領収書を発行する
                          </button>
                          <div className="text-white text-xs opacity-70">
                            ポイント購入の領収書を発行できます
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PointHistory; 