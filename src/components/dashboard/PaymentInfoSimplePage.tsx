/*eslint-disable */
import React, { useState , useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { getPaymentInfo } from '../../services/api';

interface PaymentInfoSimplePageProps {
    onBack: () => void;
}

const PaymentInfoSimplePage: React.FC<PaymentInfoSimplePageProps> = ({ onBack }) => {
    const { user } = useUser();
    const [paymentInfo, setPaymentInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getPaymentInfoData = async () => {
        setIsLoading(true);
        try {
            const paymentInfo = await getPaymentInfo('guest', user?.id || 0);
            console.log("PAYMENT INFO", paymentInfo);
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

    console.log("PAYMENT INFO", paymentInfo);

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-br-to from-primary via-primary to-secondary relative">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
                <button onClick={onBack} className="mr-2 text-2xl text-white hover:text-secondary transition-colors">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center text-white">お支払い情報</span>
            </div>
            {/* Add payment info section */}
            <div className="bg-primary border-b border-secondary">
                <div className="text-white text-center font-bold px-4 py-4 border-b border-secondary">
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            読み込み中...
                        </div>
                    ) : (
                        paymentInfo?.card_count > 0 ? "支払い情報は既に登録されています。" : "お支払い情報を登録する"
                    )}
                </div>
            </div>
            {/* Explanatory text */}
            <div className="px-4 py-4 text-xs text-white">
                ※上記でご選択いただいているカードで決済エラーとなる場合、自動的に他に登録いただいているカードで決済が行われる仕様となっております。<br />
                カード情報を削除する際は、削除したいカードを左へスワイプしていただければ幸いです。<br /><br />
                ※カードに名義の記載がない場合は、ご本人様の氏名を入力してください。
            </div>
        </div>
    );
};

export default PaymentInfoSimplePage; 