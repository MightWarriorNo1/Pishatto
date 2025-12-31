import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { getPointTransactions } from '../../services/api';
import { useCast } from '../../contexts/CastContext';
import Spinner from '../../components/ui/Spinner';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api"; 

interface PointTransaction {
    id: number;
    guest_id?: number;
    cast_id?: number;
    type: string;
    amount: number;
    reservation_id?: number;
    description: string;
    gift_type?: string;
    created_at: string;
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
    reservation?: {
        id: number;
        duration?: number;
    };
}

const CastActivityRecordPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { castId, loading: castLoading } = useCast();

    useEffect(() => {
        const fetchTransactions = async () => {
            if (castLoading) return;
            if (!castId) {
                setError('Cast ID not found');
                setLoading(false);
                return;
            }

            try {
                setError(null);
                setLoading(true);
                const response = await getPointTransactions('cast', castId);
                if (response.success) {
                    // Filter out pending transactions as they are internal system records
                    const filteredTransactions = response.transactions.filter(
                        (transaction: PointTransaction) => transaction.type !== 'pending'
                    );
                    setTransactions(filteredTransactions);
                } else {
                    setError('Failed to fetch transactions');
                }
            } catch (err) {
                setError('Error fetching transaction data');
                console.error('Error fetching transactions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [castId, castLoading]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/\//g, '-');
    };

    const getTransactionDescription = (transaction: PointTransaction) => {
        if (transaction.type === 'transfer') {
            return transaction.description || '予約完了';
        } else if (transaction.type === 'exceeded_pending') {
            // Show detailed breakdown for extension earnings
            if (transaction.description && transaction.description.includes('フリーコール延長時間料金')) {
                return transaction.description;
            }
            return '延長時間料金';
        } else if (transaction.type === 'gift') {
            return 'ギフト受け取り';
        } else if (transaction.type === 'payout') {
            return '振込';
        } else if (transaction.type === 'purchase') {
            return 'ポイント購入';
        } else {
            return transaction.description || 'その他';
        }
    };

    const getTransactionAvatar = (transaction: PointTransaction) => {
        if (transaction.guest?.avatar) {
            return transaction.guest.avatar;
        } else if (transaction.cast?.avatar) {
            // Handle multiple avatars - get the first one
            const avatars = transaction.cast.avatar.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
            return avatars.length > 0 ? avatars[0] : '';
        }
        return '';
    };

    if (loading) {
        return (
            <div className='max-w-md bg-gradient-to-b from-primary via-primary to-secondary min-h-screen flex items-center justify-center' style={{ paddingBottom: 'max(12rem, calc(12rem + env(safe-area-inset-bottom)))' }}>
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className='max-w-md bg-gradient-to-b from-primary via-primary to-secondary min-h-screen overflow-y-auto scrollbar-hidden' style={{ paddingBottom: 'max(12rem, calc(12rem + env(safe-area-inset-bottom)))' }}>
                <div className="fixed top-0 z-50 flex items-center px-4 pt-4 pb-2 border-b border-secondary bg-primary">
                    <button
                        className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer"
                        onClick={onBack}
                    >
                        <ChevronLeft />
                    </button>
                    <span className="text-lg font-bold flex-1 text-center text-white">売上履歴一覧</span>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="text-white">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-gradient-to-b from-primary  via-primary to-secondary min-h-screen overflow-y-auto scrollbar-hidden' style={{ paddingBottom: 'max(12rem, calc(12rem + env(safe-area-inset-bottom)))' }}>
            {/* Top bar */}
            <div className="fixed max-w-md mx-auto top-0 left-0 right-0  z-50 flex items-center px-4 pt-4 pb-2 border-b border-secondary bg-primary">
                <button
                    className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer"
                    onClick={onBack}
                >
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center text-white">売上履歴一覧</span>
            </div>
            {/* List */}
            <div className="divide-y divide-red-600 mt-16">
                {transactions.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-white">取引履歴がありません</div>
                    </div>
                ) : (
                    transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center px-4 py-3 bg-primary">
                            {getTransactionAvatar(transaction) ? (
                                <img 
                                    src={`${API_BASE_URL}/${getTransactionAvatar(transaction)}`} 
                                    alt="avatar" 
                                    className="w-10 h-10 rounded-full object-cover mr-3 border border-secondary" 
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-secondary mr-3" />
                            )}
                            <div className="flex-1">
                                <div className="text-xs text-white">{formatDate(transaction.created_at)}</div>
                                <div className="text-base text-white">{getTransactionDescription(transaction)}</div>
                            </div>
                            <div className={`text-lg font-bold ml-2 ${transaction.amount >= 0 ? 'text-white' : 'text-white'}`}>
                                {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString()}P
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* 明細書リンク */}
            {/* <div className="px-4 py-4 text-center text-white font-bold border-b border-secondary cursor-pointer">支払い明細書を確認する</div> */}
        </div>
    );
};

export default CastActivityRecordPage; 