import React, { useState, useEffect } from 'react';
import { ChevronLeft, CreditCard, IdCard } from 'lucide-react';
import PaymentInfoRegisterPage from './PaymentInfoRegisterPage';
import IdentityVerificationScreen from './IdentityVerificationScreen';
import { useUser } from '../../contexts/UserContext';
import { getPaymentInfo } from '../../services/api';

const StepRequirementScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { user } = useUser();
    const [showPaymentInfoRegister, setShowPaymentInfoRegister] = useState(false);
    const [showIdentityVerification, setShowIdentityVerification] = useState(false);
    const [hasRegisteredCard, setHasRegisteredCard] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            checkRegisteredCards();
        } else {
            setLoading(false);
        }
    }, [user?.id]);

    const checkRegisteredCards = async () => {
        if (!user?.id) return;

        try {
            const paymentInfo = await getPaymentInfo('guest', user.id);
            console.log('paymentInfo', paymentInfo);
            setHasRegisteredCard(!!paymentInfo?.card_count);
        } catch (error) {
            console.error('Failed to check registered cards:', error);
            setHasRegisteredCard(false);
        } finally {
            setLoading(false);
        }
    };

    if (showPaymentInfoRegister) return <PaymentInfoRegisterPage onBack={() => setShowPaymentInfoRegister(false)} />;
    if (showIdentityVerification) return <IdentityVerificationScreen onBack={() => setShowIdentityVerification(false)} />;
    
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
            {/* Top bar */}
            <div className="flex items-center px-4 pt-6 pb-2 border-b border-secondary">
                <button className="mr-2 text-2xl text-white cursor-pointer" onClick={onBack}   >
                    <ChevronLeft />
                </button>
                <span className="flex-1 text-center text-base font-bold -ml-8 text-white">ご利用になる前に</span>
            </div>
            {/* Main title */}
            <div className="px-4 mt-2">
                <div className="text-2xl font-bold mb-1 text-white">3つのステップを完了してください</div>
                <div className="text-white text-sm mb-4">すべてのステップが完了すると、pishattoをご利用いただけます。</div>
            </div>
            {/* Step 1: Phone verification (completed) */}
            <div className="mx-4 rounded-xl overflow-hidden mb-4">
                <div className="relative bg-primary h-32 flex items-center justify-center">
                    {/* Phone icon placeholder */}
                    <svg width="60" height="60" fill="none" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="3" fill="#fff" stroke="#bbb" strokeWidth="2" /><rect x="9" y="18" width="6" height="2" rx="1" fill="#bbb" /></svg>
                    <div className="absolute inset-0 bg-primary bg-opacity-40 flex flex-col items-center justify-center">
                        <div className="text-white text-base font-bold">電話番号認証</div>
                        <div className="text-white text-lg font-bold flex items-center mt-1">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff" /><path d="M7 13l3 3 7-7" stroke="#FF0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <span className="ml-2">認証済み</span>
                        </div>
                    </div>
                </div>
                <div className="bg-transparent text-center text-white font-bold py-2">認証する</div>
            </div>
            {/* Step 2: Credit card registration */}
            <div className="mx-4 rounded-xl overflow-hidden mb-4">
                <div className="relative bg-primary h-32 flex items-center justify-center">
                    {/* Card icon */}
                    <CreditCard size={40} className="text-white" />
                    <div className="absolute inset-0 bg-primary bg-opacity-40 flex flex-col items-center justify-center">
                        <div className="text-white text-base font-bold">クレジットカード登録</div>
                        <div className="text-white text-lg font-bold flex items-center mt-1">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff" /><path d="M7 13l3 3 7-7" stroke="#FF0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <span className="ml-2">{hasRegisteredCard ? '登録済み' : '未登録'}</span>
                        </div>
                    </div>
                </div>
                {!hasRegisteredCard && (
                    <div className="bg-secondary hover:bg-pink-400 border-t-0 rounded-b-xl text-center text-white font-bold py-2 cursor-pointer border border-secondary" onClick={() => setShowPaymentInfoRegister(true)}>登録する</div>
                )}
            </div>

            {/* Step 3: Identity verification */}
            <div className="mx-4 rounded-xl overflow-hidden mb-4 bg-primary flex items-center cursor-pointer border border-secondary">
                <div className="flex items-center flex-1 p-4">
                    {/* ID icon */}
                    <IdCard size={40} className="text-white" />
                    <div className="ml-4">
                        <div className="text-xs text-white font-bold mb-1">ステップ③</div>
                        <div className="text-base font-bold text-white">本人認証</div>
                        <div className="text-xs text-white">(18歳以上の確認のため)</div>
                    </div>
                </div>
            </div>
            <div className="mx-4 bg-secondary hover:bg-pink-400 border-t-0 rounded-b-xl text-center text-white font-bold py-2 -mt-4 cursor-pointer border border-secondary" onClick={() => setShowIdentityVerification(true)}>登録する</div>
        </div>
    );
};

export default StepRequirementScreen; 