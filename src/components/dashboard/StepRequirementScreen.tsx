/*eslint-disable */
import React, { useState, useEffect } from 'react';
import { ChevronLeft, CreditCard, IdCard, RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import PaymentInfoRegisterPage from './PaymentInfoRegisterPage';
import IdentityVerificationScreen from './IdentityVerificationScreen';
import { useUser } from '../../contexts/UserContext';
import { getGuestProfileById, getPaymentInfo } from '../../services/api';

const StepRequirementScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useUser();
    const [showPaymentInfoRegister, setShowPaymentInfoRegister] = useState(false);
    const [showIdentityVerification, setShowIdentityVerification] = useState(false);
    const [hasRegisteredCard, setHasRegisteredCard] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const checkRegisteredCards = async () => {
        setLoading(true);
        setFetchError(null);
        if (!user?.id) return;

        try {
            const paymentInfo = await getPaymentInfo('guest', user.id);
            setHasRegisteredCard(!!paymentInfo?.card_count);
        } catch (error) {
            console.error('Failed to check registered cards:', error);
            setHasRegisteredCard(false);
            setFetchError('カード登録状況の取得に失敗しました。ネットワークをご確認のうえ、再試行してください。');
        } finally {
            setLoading(false);
        }
    };

    const getIdentityVerificationStatus = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await getGuestProfileById(user.id);
            setVerificationStatus(res.identity_verification_completed);
        } catch (error) {
            console.error('Failed to fetch verification status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            checkRegisteredCards();
        } else {
            setLoading(false);
        }
    }, [user?.id]);

    // Refresh card status when component becomes visible again
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && user?.id) {
                checkRegisteredCards();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const handlePaymentInfoBack = () => {
        setShowPaymentInfoRegister(false);
        // Refresh card status when returning from payment info registration
        if (user?.id) {
            checkRegisteredCards();
        }
    };

    if (showPaymentInfoRegister) return <PaymentInfoRegisterPage 
        onBack={handlePaymentInfoBack} 
        onCardRegistered={() => {
            // Immediately update the card status when registration is successful
            setHasRegisteredCard(true);
        }}
        userType="guest"
        userId={user?.id}
    />;
    if (showIdentityVerification) return <IdentityVerificationScreen onBack={() => setShowIdentityVerification(false)} />;


    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-primary via-primary to-secondary pb-8">
            {/* Top bar */}
            <div className="flex flex-row justify-between items-center px-4 pt-4 pb-4 border-b border-secondary">
                <button onClick={onBack} className="mr-2 text-2xl text-white cursor-pointer hover:text-secondary" aria-label="戻る">
                    <ChevronLeft />
                </button>
                <div className="flex-1 text-center text-base font-bold text-white">ご利用になる前に</div>
                <button
                    onClick={checkRegisteredCards}
                    className="ml-2 inline-flex items-center gap-1 text-white/90 hover:text-white transition"
                    aria-label="更新"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                    <span className="text-sm">更新</span>
                </button>
            </div>
            {/* Main title */}
            <div className="px-4 mt-2">
                <div className="text-2xl font-bold mb-1 text-white">3つのステップを完了してください</div>
                <div className="text-white text-sm mb-4">すべてのステップが完了すると、pishattoをご利用いただけます。</div>
                {/* Progress */}
                {(() => {
                    const isCardDone = !!hasRegisteredCard;
                    const isIdentityDone = user?.identity_verification_completed === 'success';
                    const completedCount = (1) + (isCardDone ? 1 : 0) + (isIdentityDone ? 1 : 0);
                    const progressPercent = Math.round((completedCount / 3) * 100);
                    return (
                        <div className="mb-4" aria-live="polite">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-white text-xs">進捗</span>
                                <span className="text-white text-xs font-semibold">{completedCount}/3 完了（{progressPercent}%）</span>
                            </div>
                            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-secondary transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    );
                })()}
                {/* Error banner */}
                {fetchError && (
                    <div className="mt-3 rounded-lg border border-red-300/60 bg-red-500/20 text-white p-3 flex items-start gap-3" role="alert">
                        <XCircle className="mt-0.5" size={18} />
                        <div className="flex-1 text-sm">{fetchError}</div>
                        <button
                            onClick={checkRegisteredCards}
                            className="text-sm font-semibold underline underline-offset-2 hover:opacity-90"
                        >再試行</button>
                    </div>
                )}
            </div>
            {/* Step 1: Phone verification (completed) */}
            <div className="mx-4 rounded-xl overflow-hidden mb-4">
                <div className="relative bg-white/10 h-32 flex items-center justify-center">
                    {/* Phone icon placeholder */}
                    <svg width="60" height="60" fill="none" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="3" fill="#fff" stroke="#bbb" strokeWidth="2" /><rect x="9" y="18" width="6" height="2" rx="1" fill="#bbb" /></svg>
                    <div className="absolute inset-0 bg-primary bg-opacity-40 flex flex-col items-center justify-center">
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 text-primary text-xs font-bold inline-flex items-center gap-1">
                            <CheckCircle2 size={14} /> 完了
                        </div>
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
                <div className="relative bg-white/10 h-32 flex items-center justify-center">
                    {/* Card icon */}
                    <CreditCard size={40} className="text-white" />
                    <div className="absolute inset-0 bg-primary bg-opacity-40 flex flex-col items-center justify-center">
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 text-primary text-xs font-bold inline-flex items-center gap-1">
                            {loading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" /> 確認中
                                </>
                            ) : hasRegisteredCard ? (
                                <>
                                    <CheckCircle2 size={14} /> 完了
                                </>
                            ) : (
                                <>
                                    <XCircle size={14} /> 未完了
                                </>
                            )}
                        </div>
                        <div className="text-white text-base font-bold">クレジットカード登録</div>
                        <div className="text-white text-lg font-bold flex items-center mt-1">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff" /><path d="M7 13l3 3 7-7" stroke="#FF0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <span className="ml-2">
                                {loading ? (
                                    <span className="inline-flex items-center gap-1 text-gray-100"><Loader2 size={16} className="animate-spin" /> 確認中...</span>
                                ) : hasRegisteredCard ? '登録済み' : '未登録'}
                            </span>
                        </div>
                    </div>
                </div>
                {!loading && !hasRegisteredCard && (
                    <div
                        className="bg-secondary hover:bg-pink-400 border-t-0 rounded-b-xl text-center text-white font-bold py-2 cursor-pointer border border-secondary"
                        onClick={() => setShowPaymentInfoRegister(true)}
                        role="button"
                        aria-label="クレジットカードを登録する"
                    >登録する</div>
                )}
            </div>

            {/* Step 3: Identity verification */}
            <div className="mx-4 rounded-xl overflow-hidden mb-4">
                <div className="relative bg-white/10 h-32 flex items-center justify-center">
                    {/* ID icon */}
                    <IdCard size={40} className="text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary bg-opacity-40 flex flex-col items-center justify-center">
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 text-primary text-xs font-bold inline-flex items-center gap-1">
                            {loading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" /> 確認中
                                </>
                            ) : user?.identity_verification_completed === 'success' ? (
                                <>
                                    <CheckCircle2 size={14} /> 完了
                                </>
                            ) : (
                                <>
                                    <XCircle size={14} /> 未完了
                                </>
                            )}
                        </div>
                        <div className="text-white text-base font-bold">本人認証</div>
                        <div className="text-white text-lg font-bold flex items-center mt-1">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff" /><path d="M7 13l3 3 7-7" stroke="#FF0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <span className="ml-2">
                                {loading ? (
                                    <span className="inline-flex items-center gap-1 text-gray-100"><Loader2 size={16} className="animate-spin" /> 確認中...</span>
                                ) : user?.identity_verification_completed === 'success' ? '認証済み' : '未認証'}
                            </span>
                        </div>
                    </div>
                </div>
                {!loading && user?.identity_verification_completed !== 'success' && (
                    <div
                        className="bg-secondary hover:bg-pink-400 border-t-0 rounded-b-xl text-center text-white font-bold py-2 cursor-pointer border border-secondary"
                        onClick={() => setShowIdentityVerification(true)}
                        role="button"
                        aria-label="本人認証を開始する"
                    >認証する</div>
                )}
            </div>
        </div>
    );
};

export default StepRequirementScreen; 