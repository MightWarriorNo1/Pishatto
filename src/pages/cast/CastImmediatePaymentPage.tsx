/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { getCastImmediatePaymentData, processCastImmediatePayment, getCastProfileById, getCastPointsData } from '../../services/api';
import CardRegistrationForm from '../../components/payment/CardRegistrationForm';
import { useCast } from '../../contexts/CastContext';
import Spinner from '../../components/ui/Spinner';
import { getFirstAvatarUrl } from '../../utils/avatar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
interface ImmediatePaymentData {
    total_points: number;
    immediate_points: number;
    fee: number;
    amount: number;
    fee_rate: number;
    cast_grade: string;
}

interface CastProfile {
    id: number;
    nickname: string;
    avatar?: string;
    points?: number;
    grade?: string;
    stripe_customer_id?: string;
}

interface CastPointsData {
    monthly_total_points: number;
    gift_points: number;
    transfer_points: number;
    copat_back_rate: number;
    total_reservations: number;
    completed_reservations: number;
}

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const CastImmediatePaymentPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [paymentData, setPaymentData] = useState<ImmediatePaymentData | null>(null);
    const [castProfile, setCastProfile] = useState<CastProfile | null>(null);
    const [castPointsData, setCastPointsData] = useState<CastPointsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCardForm, setShowCardForm] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Get cast ID from authenticated context
    const { castId } = useCast() as any;

    useEffect(() => {
        if (castId) {
            fetchAllData();
        } else {
            setError('Cast ID not found');
            setLoading(false);
        }
    }, [castId]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [paymentDataResult, profileResult, pointsDataResult] = await Promise.all([
                getCastImmediatePaymentData(castId),
                getCastProfileById(castId),
                getCastPointsData(castId)
            ]);

            setPaymentData(paymentDataResult);
            setCastProfile(profileResult.cast);
            setCastPointsData(pointsDataResult);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyPayment = async () => {
        if (!castProfile) return;

        // Check if cast has registered payment method
        if (castProfile.stripe_customer_id) {
            // Cast has registered card, process immediate payment directly
            if (!paymentData || paymentData.immediate_points <= 0) {
                setError('即時支払いに利用できるポイントはありません。');
                return;
            }

            try {
                setProcessingPayment(true);
                setError(null);

                await processCastImmediatePayment(castId, {
                    amount: paymentData.immediate_points,
                    payment_method: castProfile.stripe_customer_id // Use existing customer ID
                });

                setPaymentSuccess(true);

                // Refresh payment data
                setTimeout(() => {
                    fetchAllData();
                    setPaymentSuccess(false);
                }, 2000);

            } catch (err: any) {
                setError(err.response?.data?.message || 'Payment processing failed');
            } finally {
                setProcessingPayment(false);
            }
        } else {
            // Cast doesn't have registered card, show card registration form
            setShowCardForm(true);
        }
    };

    const handleCardRegistered = async (token?: string) => {
        if (!paymentData || !token) return;

        try {
            setProcessingPayment(true);
            setError(null);

            // Process immediate payment with the new payment method
            await processCastImmediatePayment(castId, {
                amount: paymentData.immediate_points,
                payment_method: token
            });

            setPaymentSuccess(true);
            setShowCardForm(false);

            // Refresh payment data to get updated profile with stripe_customer_id
            setTimeout(() => {
                fetchAllData();
                setPaymentSuccess(false);
            }, 2000);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Payment processing failed');
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleCardCancel = () => {
        setShowCardForm(false);
        setError(null);
    };

    if (showCardForm) {
        return (
            <div className='bg-gradient-to-b from-primary via-primary to-secondary min-h-screen pb-24'>
                <div className="fixed max-w-md mx-auto left-0 right-0 top-0 z-50 flex items-center px-4 pt-4 pb-4 border-b border-secondary bg-primary shadow-lg">
                    <button className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer transition-colors duration-200" onClick={handleCardCancel}>
                        <ChevronLeft />
                    </button>
                    <span className="flex-1 text-center text-base font-bold text-white">カード登録</span>
                </div>
                <div className="px-4 py-6 mt-20 animate-fade-in">
                    <CardRegistrationForm
                        onSuccess={handleCardRegistered}
                        onCancel={handleCardCancel}
                        userType="cast"
                        userId={castId}
                    />
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className='max-w-md bg-gradient-to-b from-primary via-primary to-secondary min-h-screen pb-24 flex items-center justify-center'>
                <Spinner size='lg' />
            </div>
        );
    }

    if (error) {
        return (
            <div className='max-w-md bg-gradient-to-b from-primary via-primary to-secondary min-h-screen pb-24'>
                <div className="fixed max-w-md mx-auto left-0 right-0 top-0 z-50 flex items-center px-4 pt-4 pb-4 border-b border-secondary bg-primary shadow-lg">
                    <button className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer transition-colors duration-200" onClick={onBack}>
                        <ChevronLeft />
                    </button>
                    <span className="flex-1 text-center text-base font-bold text-white">すぐ入金</span>
                </div>
                <div className="px-4 py-6 mt-20 animate-fade-in">
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6">
                        <div className="text-red-400 text-center font-medium">{error}</div>
                    </div>
                    <button
                        onClick={fetchAllData}
                        className="w-full bg-secondary text-white font-bold py-4 rounded-lg text-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                        再試行
                    </button>
                </div>
            </div>
        );
    }

    if (!paymentData || !castProfile) {
        return (
            <div className='max-w-md bg-gradient-to-b from-primary via-primary to-secondary min-h-screen pb-24'>
                <div className="fixed max-w-md mx-auto left-0 right-0 top-0 z-50 flex items-center px-4 pt-4 pb-4 border-b border-secondary bg-primary shadow-lg">
                    <button className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer transition-colors duration-200" onClick={onBack}>
                        <ChevronLeft />
                    </button>
                    <span className="flex-1 text-center text-base font-bold text-white">すぐ入金</span>
                </div>
                <div className="px-4 py-6 mt-20 animate-fade-in">
                    <div className="bg-white/10 border border-secondary rounded-lg p-6 text-center">
                        <div className="text-white text-lg font-medium">データが見つかりません</div>
                        <div className="text-gray-300 text-sm mt-2">しばらく時間をおいてから再度お試しください</div>
                    </div>
                </div>
            </div>
        );
    }

    const getGradeText = (grade: string) => {
        switch (grade) {
            case 'platinum': return 'プラチナキャスト 手数料5%→0%';
            case 'gold': return 'ゴールドキャスト 手数料5%→2%';
            case 'silver': return 'シルバーキャスト 手数料5%→4%';
            default: return 'ブロンズキャスト 手数料5%';
        }
    };

    return (
        <div className='bg-gradient-to-b from-primary via-primary to-secondary min-h-screen pb-24 overflow-y-auto scrollbar-hidden'>
            {/* Top bar */}
            <div className="fixed max-w-md mx-auto left-0 right-0 top-0 z-50 flex items-center justify-between px-4 pt-4 pb-4 border-b border-secondary bg-primary shadow-lg">
                <button className="text-2xl text-white hover:text-secondary cursor-pointer transition-colors duration-200" onClick={onBack}>
                    <ChevronLeft />
                </button>
                <span className="absolute left-1/2 transform -translate-x-1/2 text-base font-bold text-white">すぐ入金</span>
                <div className="w-8"></div>
            </div>

            {/* Main section */}
            <div className="px-4 py-6 mt-20 animate-fade-in">
                {paymentSuccess && (
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-center mb-6 shadow-lg animate-fade-in">
                        <p className="text-white font-medium">🎉 すぐ入金申請が完了しました！</p>
                    </div>
                )}

                {/* Cast Profile Section */}
                <div className="bg-white/10 rounded-xl shadow-lg p-6 mb-6 border border-secondary/50 backdrop-blur-sm">
                    <div className="flex items-center mb-4">
                        {castProfile.avatar && (
                            <img
                                src={getFirstAvatarUrl(castProfile.avatar)}
                                alt={castProfile.nickname}
                                className="w-14 h-14 rounded-full mr-4 border-2 border-secondary object-cover"
                            />
                        )}
                        <div className="flex-1">
                            <div className="text-white font-bold text-xl">{castProfile.nickname}</div>
                            <div className="text-gray-300 text-sm">キャストID: {castProfile.id}</div>
                        </div>
                        <div className="text-right">
                            {castProfile.stripe_customer_id ? (
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-full px-3 py-1.5 font-medium shadow-sm">
                                    カード登録済み
                                </div>
                            ) : (
                                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs rounded-full px-3 py-1.5 font-medium shadow-sm">
                                    カード未登録
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-300 text-sm mb-2">現在のポイント</div>
                        <div className="text-4xl font-bold text-white mb-2">{castProfile.points?.toLocaleString() || 0} P</div>
                    </div>
                </div>

                {/* Monthly Points Section */}
                <div className="bg-white/10 rounded-xl shadow-lg p-6 mb-6 border border-secondary/50 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="text-gray-300 text-sm mb-2">今月の獲得ポイント</div>
                        <div className="text-3xl font-bold text-white mb-3">{Number(castPointsData?.monthly_total_points ?? 0).toLocaleString('ja-JP')} P</div>
                        {castPointsData && (
                            <div className="bg-white/10 rounded-lg p-3">
                                <div className="text-xs text-gray-300">
                                    完了予約: <span className="text-white font-medium">{Number(castPointsData?.completed_reservations ?? 0).toLocaleString('ja-JP')}</span>/{Number(castPointsData?.total_reservations ?? 0).toLocaleString('ja-JP')}
                                </div>
                                <div className="text-xs text-gray-300 mt-1">
                                    コパトバック率: <span className="text-white font-medium">{castPointsData.copat_back_rate}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Details Section */}
                <div className="bg-white/10 rounded-xl shadow-lg p-6 mb-6 border border-secondary/50 backdrop-blur-sm">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-white text-sm">すぐ入金対象ポイント <span className="text-gray-400">*1</span></span>
                            <span className="text-xl font-bold text-white">{paymentData.immediate_points.toLocaleString()} P</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-white text-sm">振り込み手数料 <span className="text-gray-400">*2 ({paymentData.fee_rate}%)</span></span>
                            <span className="text-xl font-bold text-white">{paymentData.fee.toLocaleString()}円</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-white text-lg font-medium">振込金額</span>
                            <span className="text-2xl font-bold text-white">{paymentData.amount.toLocaleString()}円</span>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="bg-white/10 rounded-xl shadow-lg p-6 mb-6 border border-secondary/50 backdrop-blur-sm">
                    <div className="space-y-3">
                        <div className="text-xs text-gray-300 leading-relaxed">
                            <span className="text-white font-medium">*1</span> 当月の獲得ポイントの50%分のみ、すぐ入金対象ポイントとなります。
                        </div>
                        <div className="text-xs text-gray-300 leading-relaxed">
                            <span className="text-white font-medium">*2</span> 通常振込(未締め・翌月20日振込)の場合、手数料654円のみ。インボイス番号未登録の場合、別途手数料が発生します。
                        </div>
                        <div className="pt-2">
                            <span className="bg-gradient-to-r from-secondary to-red-600 text-white text-xs rounded-full px-3 py-2 font-medium shadow-sm">
                                {getGradeText(paymentData.cast_grade)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                {castProfile.points && castProfile.points > 0 && (
                    <button
                        className={`w-full bg-gradient-to-r from-secondary to-red-600 text-white font-bold py-4 rounded-xl text-lg mb-6 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${processingPayment ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}`}
                        onClick={handleApplyPayment}
                        disabled={processingPayment}
                    >
                        {processingPayment ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                処理中...
                            </div>
                        ) : (
                            castProfile.stripe_customer_id ? 'すぐ入金申請' : '銀行口座登録'
                        )}
                    </button>
                )}

                {/* Terms Section */}
                <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                    <div className="text-xs text-gray-300 leading-relaxed">
                        <div className="font-medium text-white mb-2">すぐ入金申請について (2021年3月1日より改訂)</div>
                        すぐ入金申請をした時に所持しているポイントのうち、当月の獲得ポイントの50%分のみ【すぐ入金】対象となり、前月の獲得ポイント・残りの獲得ポイント50%は全て当月定期振込分となります。
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CastImmediatePaymentPage; 