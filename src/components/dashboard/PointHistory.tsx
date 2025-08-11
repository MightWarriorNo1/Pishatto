import React, { useEffect, useState } from 'react';
import { getPointTransactions } from '../../services/api';
import { ChevronLeft } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import ReceiptIssuancePage from './ReceiptIssuancePage';
import { getFirstAvatarUrl } from '../../utils/avatar';

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

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    getPointTransactions(userType, userId)
      .then((response) => {
        if (response.success) {
          setTransactions(response.transactions || []);
        } else {
          setError(response.error || 'ポイント履歴の取得に失敗しました');
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
        return 'オートチャージ';
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
    // Here you would typically call an API to issue the receipt
    console.log('Issuing receipt:', {
      transaction: selectedTransaction,
      receiptData
    });
    
    // For now, just show an alert and go back
    alert('領収書が発行されました。メールをご確認ください。');
    handleReceiptBack();
  };

  // Show receipt issuance page if active
  if (showReceiptPage && selectedTransaction) {
    return (
      <ReceiptIssuancePage
        onBack={handleReceiptBack}
        onIssue={handleReceiptIssue}
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
          <div className="text-white text-center">ローディング...</div>
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
                      // For other transactions, show with + or - based on amount
                      return `${transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString()}P`;
                    })()}
                  </div>
                </div>
                
                
                {(transaction.type==='pending' || transaction.type==='gift') && (
                  <div className="py-3 text-center border-b border-white">
                    <button 
                      className="text-white text-sm"
                      onClick={() => handleReceiptClick(transaction)}
                    >
                      領収書を発行する
                    </button>
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