/*eslint-disable */
import React, { useState , useEffect } from 'react';
import { ChevronLeft, CreditCard } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { getPaymentInfo, deletePaymentInfo } from '../../services/api';
import Spinner from '../ui/Spinner';
import PaymentInfoRegisterPage from './PaymentInfoRegisterPage';

interface PaymentInfoSimplePageProps {
    onBack: () => void;
}

interface Card {
    id: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
}

const PaymentInfoSimplePage: React.FC<PaymentInfoSimplePageProps> = ({ onBack }) => {
    const { user } = useUser();
    const [paymentInfo, setPaymentInfo] = useState<any>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showCardRegistration, setShowCardRegistration] = useState<boolean>(false);

    const getPaymentInfoData = async () => {
        setIsLoading(true);
        try {
            const paymentInfo = await getPaymentInfo('guest', user?.id || 0);
            console.log("PAYMENT INFO", paymentInfo);
            console.log("Card count:", paymentInfo?.card_count);
            console.log("Has registered cards:", paymentInfo?.has_registered_cards);
            console.log("Success:", paymentInfo?.success);
            setPaymentInfo(paymentInfo);
            
            // Extract cards from payment info
            if (paymentInfo?.success && Array.isArray(paymentInfo.cards)) {
                const mappedCards: Card[] = paymentInfo.cards
                    .map((pm: any) => {
                        const card = pm?.card || {};
                        const id = pm?.id || card?.id;
                        if (!id) {
                            return null;
                        }
                        return {
                            id,
                            brand: card?.brand || pm?.brand || '',
                            last4: card?.last4 || pm?.last4 || '',
                            exp_month: card?.exp_month || pm?.exp_month || 0,
                            exp_year: card?.exp_year || pm?.exp_year || 0,
                        } as Card;
                    })
                    .filter(Boolean) as Card[];
                setCards(mappedCards);
            } else {
                setCards([]);
            }
        } catch (error) {
            console.error("Error fetching payment info:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            getPaymentInfoData();
        }
    }, [user?.id]);

    const handleCardRegistered = () => {
        setShowCardRegistration(false);
        // Refresh payment info after card registration
        getPaymentInfoData();
    };

    const handleDeleteCard = async (cardId: string) => {
        if (!user?.id) return;

        if (!window.confirm('このカードを削除しますか？')) {
            return;
        }

        try {
            const response = await deletePaymentInfo('guest', user.id, cardId);
            
            // Check if the response indicates active reservations
            if (response && !response.success && response.active_reservations) {
                const reservationList = response.active_reservations
                    .map((r: any) => `予約ID: ${r.id} (${r.status})`)
                    .join('\n');
                
                alert(`カードを削除できません。\n\n${response.error}\n\nアクティブな予約:\n${reservationList}`);
                return;
            }
            
            await getPaymentInfoData(); // Reload cards after deletion
        } catch (error: any) {
            console.error('Failed to delete card:', error);
            
            // Check if it's an active reservations error
            if (error.response?.data?.active_reservations) {
                const reservationList = error.response.data.active_reservations
                    .map((r: any) => `予約ID: ${r.id} (${r.status})`)
                    .join('\n');
                
                alert(`カードを削除できません。\n\n${error.response.data.error}\n\nアクティブな予約:\n${reservationList}`);
            } else {
                alert('カードの削除に失敗しました');
            }
        }
    };

    const getCardBrandIcon = (brand: string) => {
        const b = (brand || '').toLowerCase();
        switch (b) {
            case 'visa':
                return '💳';
            case 'mastercard':
                return '💳';
            case 'jcb':
                return '💳';
            case 'amex':
                return '💳';
            default:
                return '💳';
        }
    };

    // Show card registration page if user wants to register a card
    if (showCardRegistration) {
        return (
            <PaymentInfoRegisterPage
                onBack={() => setShowCardRegistration(false)}
                onCardRegistered={handleCardRegistered}
                userType="guest"
                userId={user?.id}
            />
        );
    }

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-br-to from-primary via-primary to-secondary relative">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
                <button onClick={onBack} className="mr-2 text-2xl text-white hover:text-secondary transition-colors cursor-pointer">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center text-white">お支払い情報</span>
            </div>
            {/* Add payment info section */}
            <div className="bg-primary border-b border-secondary">
                <div className="text-white text-center font-bold px-4 py-4 border-b border-secondary">
                    {isLoading ? (
                        <Spinner />
                    ) : (
                        paymentInfo?.card_count > 0 ? "支払い情報は既に登録されています。" : "お支払い情報を登録する"
                    )}
                </div>
            </div>
            {/* Content based on card registration status */}
            {!isLoading && (!paymentInfo || !paymentInfo.card_count || paymentInfo.card_count === 0) ? (
                <div className="px-4 py-8 text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                            <CreditCard className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">カードが登録されていません</h3>
                        <p className="text-sm text-white/80 mb-6">
                            お支払いをスムーズに行うために、カード情報を登録してください。
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCardRegistration(true)}
                        className="w-full bg-secondary text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-secondary/80 transition-colors"
                    >
                        カードを登録する
                    </button>
                </div>
            ) : (
                <div className="px-4 py-4">
                    {/* Display registered cards */}
                    {cards.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white mb-4">登録済みカード</h3>
                            <div className="space-y-3">
                                {cards.map((card) => (
                                    <div
                                        key={card.id}
                                        className="bg-secondary rounded-lg p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center">
                                            <div className="text-2xl mr-3">
                                                {getCardBrandIcon(card.brand)}
                                            </div>
                                            <div>
                                                <div className="text-white font-semibold">
                                                    {(card.brand || 'CARD').toUpperCase()} •••• {card.last4 || '----'}
                                                </div>
                                                <div className="text-gray-300 text-sm">
                                                    有効期限: {(card.exp_month ? String(card.exp_month).padStart(2, '0') : '--')}/{card.exp_year || '----'}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCard(card.id)}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            削除
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <button
                                onClick={() => setShowCardRegistration(true)}
                                className="w-full mt-4 px-4 py-3 border border-secondary text-white rounded-lg hover:bg-secondary transition-colors"
                            >
                                + カードを追加
                            </button>
                        </div>
                    )}
                    
                    {/* Information text */}
                    <div className="text-xs text-white">
                        ※上記でご選択いただいているカードで決済エラーとなる場合、自動的に他に登録いただいているカードで決済が行われる仕様となっております。<br />
                        カード情報を削除する際は、削除したいカードを左へスワイプしていただければ幸いです。<br /><br />
                        ※カードに名義の記載がない場合は、ご本人様の氏名を入力してください。
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentInfoSimplePage; 