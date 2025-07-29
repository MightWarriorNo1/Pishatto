import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { getPaymentInfo } from '../../services/api';

const OnboardingStepsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useUser();
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
            setHasRegisteredCard(!!paymentInfo?.has_registered_cards);
        } catch (error) {
            console.error('Failed to check registered cards:', error);
            setHasRegisteredCard(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b border-secondary bg-primary">
                <button onClick={onBack} className="mr-2 text-2xl text-white">&#60;</button>
                <span className="text-base font-bold flex-1 text-center text-white">ご利用になる前に</span>
            </div>
            {/* Heading */}
            <div className="px-4 pt-6">
                <div className="text-2xl font-bold mb-2 text-white">3つのステップを完了してください</div>
                <div className="text-white text-sm mb-4">すべてのステップが完了すると、pishattoをご利用いただけます。</div>
            </div>
            {/* Step 1: Phone verification (completed) */}
            <div className="relative bg-gray-400 bg-opacity-60 rounded-xl mx-4 mb-4 overflow-hidden">
                <div className="flex items-center px-6 py-8">
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="4" fill="#fff" /><rect x="8" y="18" width="8" height="2" rx="1" fill="#e5e7eb" /></svg>
                    <div className="ml-4">
                        <div className="text-lg font-bold text-white">電話番号認証</div>
                    </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary bg-opacity-40 rounded-xl">
                    <div className="text-white text-lg font-bold mb-2">電話番号認証</div>
                    <div className="text-white text-xl font-bold flex items-center gap-2 mb-2">
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff" /><path d="M7 13l3 3 7-7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        認証済み
                    </div>
                    <div className="text-orange-400 font-bold">認証する</div>
                </div>
            </div>
            {/* Step 2: Credit card registration */}
            <div className="relative bg-primary rounded-xl mx-4 mb-4 overflow-hidden border border-secondary">
                <div className="flex items-center px-6 py-6">
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="3" fill="#e5e7eb" /><rect x="2" y="10" width="20" height="2" fill="#fff" /><rect x="6" y="14" width="4" height="2" rx="1" fill="#fff" /></svg>
                    <div className="ml-4">
                        <div className="text-xs text-white font-bold mb-1">ステップ②</div>
                        <div className="text-lg font-bold text-white">クレジットカード登録</div>
                    </div>
                </div>
                {hasRegisteredCard && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary bg-opacity-40 rounded-xl">
                        <div className="text-white text-lg font-bold mb-2">クレジットカード登録</div>
                        <div className="text-white text-xl font-bold flex items-center gap-2 mb-2">
                            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff" /><path d="M7 13l3 3 7-7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            登録済み
                        </div>
                    </div>
                )}
                {!hasRegisteredCard && (
                    <div className="border-t border-secondary px-6 py-3 text-orange-400 font-bold cursor-pointer">登録する</div>
                )}
            </div>
            {/* Step 3: Identity verification */}
            <div className="bg-primary rounded-xl mx-4 mb-4 overflow-hidden border border-secondary">
                <div className="flex items-center px-6 py-6">
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#e5e7eb" /><rect x="8" y="10" width="8" height="6" rx="2" fill="#fff" /><rect x="10" y="8" width="4" height="2" rx="1" fill="#fff" /></svg>
                    <div className="ml-4">
                        <div className="text-xs text-white font-bold mb-1">ステップ③</div>
                        <div className="text-lg font-bold text-white">本人認証</div>
                        <div className="text-xs text-gray-500">(18歳以上の確認のため)</div>
                    </div>
                </div>
                <div className="border-t border-secondary px-6 py-3 text-orange-400 font-bold cursor-pointer">登録する</div>
            </div>
        </div>
    );
};

export default OnboardingStepsPage; 