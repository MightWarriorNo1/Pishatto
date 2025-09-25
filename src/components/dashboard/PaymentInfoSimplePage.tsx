/*eslint-disable */
import React, { useState , useEffect } from 'react';
import { ChevronLeft, CreditCard } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { getPaymentInfo } from '../../services/api';
import Spinner from '../ui/Spinner';
import PaymentInfoRegisterPage from './PaymentInfoRegisterPage';

interface PaymentInfoSimplePageProps {
    onBack: () => void;
}

const PaymentInfoSimplePage: React.FC<PaymentInfoSimplePageProps> = ({ onBack }) => {
    const { user } = useUser();
    const [paymentInfo, setPaymentInfo] = useState<any>(null);
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
                <div className="px-4 py-4 text-xs text-white">
                    ※上記でご選択いただいているカードで決済エラーとなる場合、自動的に他に登録いただいているカードで決済が行われる仕様となっております。<br />
                    カード情報を削除する際は、削除したいカードを左へスワイプしていただければ幸いです。<br /><br />
                    ※カードに名義の記載がない場合は、ご本人様の氏名を入力してください。
                </div>
            )}
        </div>
    );
};

export default PaymentInfoSimplePage; 