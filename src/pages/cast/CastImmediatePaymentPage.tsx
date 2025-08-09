/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { getCastImmediatePaymentData, processCastImmediatePayment, getCastProfileById, getCastPointsData } from '../../services/api';
import CardRegistrationForm from '../../components/payment/CardRegistrationForm';
import { useCast } from '../../contexts/CastContext';

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
    payjp_customer_id?: string;
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
        if (castProfile.payjp_customer_id) {
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
                    payjp_token: castProfile.payjp_customer_id // Use existing customer ID
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

            // Process immediate payment with the new card token
            await processCastImmediatePayment(castId, {
                amount: paymentData.immediate_points,
                payjp_token: token
            });

            setPaymentSuccess(true);
            setShowCardForm(false);

            // Refresh payment data to get updated profile with payjp_customer_id
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
            <div className='max-w-md bg-gradient-to-br from-primary via-primary to-secondary min-h-screen pb-24'>
                <div className="flex items-center px-4 pt-4 pb-2 border-b border-secondary bg-primary">
                    <button className="mr-2 text-2xl text-white" onClick={handleCardCancel}>
                        <ChevronLeft />
                    </button>
                    <span className="flex-1 text-center text-base font-bold text-white">カード登録</span>
                </div>
                <div className="px-4 py-6 mt-16">
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
            <div className='max-w-md bg-gradient-to-br from-primary via-primary to-secondary min-h-screen pb-24'>
                <div className="flex items-center px-4 pt-4 pb-2 border-b border-secondary bg-primary">
                    <button className="mr-2 text-2xl text-white" onClick={onBack}>
                        <ChevronLeft />
                    </button>
                    <span className="flex-1 text-center text-base font-bold text-white">すぐ入金</span>
                </div>
                <div className="px-4 py-6">
                    <div className="text-white text-center">読み込み中...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='max-w-md bg-gradient-to-br from-primary via-primary to-secondary min-h-screen pb-24'>
                <div className="flex items-center px-4 pt-4 pb-2 border-b border-secondary bg-primary">
                    <button className="mr-2 text-2xl text-white" onClick={onBack}>
                        <ChevronLeft />
                    </button>
                    <span className="flex-1 text-center text-base font-bold text-white">すぐ入金</span>
                </div>
                <div className="px-4 py-6">
                    <div className="text-red-400 text-center mb-4">{error}</div>
                    <button
                        onClick={fetchAllData}
                        className="w-full bg-secondary text-white font-bold py-3 rounded-lg text-lg hover:bg-red-700 transition"
                    >
                        再試行
                    </button>
                </div>
            </div>
        );
    }

    if (!paymentData || !castProfile) {
        return (
            <div className='max-w-md bg-gradient-to-br from-primary via-primary to-secondary min-h-screen pb-24'>
                <div className="flex items-center px-4 pt-4 pb-2 border-b border-secondary bg-primary">
                    <button className="mr-2 text-2xl text-white" onClick={onBack}>
                        <ChevronLeft />
                    </button>
                    <span className="flex-1 text-center text-base font-bold text-white">すぐ入金</span>
                </div>
                <div className="px-4 py-6">
                    <div className="text-white text-center">データが見つかりません</div>
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
        <div className='max-w-md bg-gradient-to-br from-primary via-primary to-secondary min-h-screen pb-24'>
            {/* Top bar */}
            <div className="fixed top-0 z-50 flex items-center px-4 pt-4 pb-2 border-b border-secondary bg-primary">
                <button className="mr-2 text-2xl text-white hover:text-secondary" onClick={onBack}>
                    <ChevronLeft />
                </button>
                <span className="flex-1 text-center text-base font-bold text-white">すぐ入金</span>
            </div>

            {/* Main section */}
            <div className="px-4 py-6 mt-16">
                {paymentSuccess && (
                    <div className="bg-green-600 rounded-lg p-3 text-center mb-4">
                        <p className="text-white text-sm">すぐ入金申請が完了しました！</p>
                    </div>
                )}

                {/* Cast Profile Section */}
                <div className="bg-primary rounded-lg shadow-sm p-4 mb-4 border border-secondary">
                    <div className="flex items-center mb-3">
                        {castProfile.avatar && (
                            <img
                                src={`${API_BASE_URL}/${castProfile.avatar.split(',')[0].trim()}`}
                                alt={castProfile.nickname}
                                className="w-12 h-12 rounded-full mr-3"
                            />
                        )}
                        <div className="flex-1">
                            <div className="text-white font-bold text-lg">{castProfile.nickname}</div>
                            <div className="text-gray-300 text-sm">キャストID: {castProfile.id}</div>
                        </div>
                        <div className="text-right">
                            {castProfile.payjp_customer_id ? (
                                <div className="bg-green-600 text-white text-xs rounded px-2 py-1">
                                    カード登録済み
                                </div>
                            ) : (
                                <div className="bg-yellow-600 text-white text-xs rounded px-2 py-1">
                                    カード未登録
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-xs text-white mb-1">現在のポイント</div>
                    <div className="text-3xl font-bold text-center mb-2 text-white">{castProfile.points?.toLocaleString() || 0} P</div>
                </div>

                {/* Monthly Points Section */}
                <div className="bg-primary rounded-lg shadow-sm p-4 mb-4 border border-secondary">
                    <div className="text-xs text-white mb-1">今月の獲得ポイント</div>
                    <div className="text-2xl font-bold text-center mb-2 text-white">{castPointsData?.monthly_total_points?.toLocaleString() || 0} P</div>
                    {castPointsData && (
                        <div className="text-xs text-gray-300 text-center">
                            完了予約: {castPointsData.completed_reservations}/{castPointsData.total_reservations}
                            (コパトバック率: {castPointsData.copat_back_rate}%)
                        </div>
                    )}
                </div>

                <div className="bg-primary rounded-lg shadow-sm p-4 mb-4 border border-secondary">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-white">すぐ入金対象ポイント <span className="text-xs text-white">*1</span></span>
                        <span className="text-lg font-bold text-white">{paymentData.immediate_points.toLocaleString()} P</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-white">振り込み手数料 <span className="text-xs text-white">*2 ({paymentData.fee_rate}%)</span></span>
                        <span className="text-lg font-bold text-white">{paymentData.fee.toLocaleString()}円</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-white">振込金額</span>
                        <span className="text-lg font-bold text-white">{paymentData.amount.toLocaleString()}円</span>
                    </div>
                </div>

                <div className="bg-primary rounded-lg shadow-sm p-4 mb-4 border border-secondary">
                    <div className="text-xs text-white mb-2">*1 当月の獲得ポイントの50%分のみ、すぐ入金対象ポイントとなります。</div>
                    <div className="text-xs text-white mb-2">*2 通常振込(未締め・翌月20日振込)の場合、手数料654円のみ。インボイス番号未登録の場合、別途手数料が発生します。</div>
                    <div className="flex gap-2 mb-2">
                        <span className="bg-secondary text-white text-xs rounded px-2 py-1">{getGradeText(paymentData.cast_grade)}</span>
                    </div>
                </div>

                {castProfile.points && castProfile.points > 0 && (
                    <button
                        className={`w-full bg-secondary text-white font-bold py-3 rounded-lg text-lg mb-4 hover:bg-red-700 transition ${processingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleApplyPayment}
                        disabled={processingPayment}
                    >
                        {processingPayment ? '処理中...' :
                            castProfile.payjp_customer_id ? 'すぐ入金申請' : 'カード登録して申請'}
                    </button>
                )}

                <div className="text-xs text-white mb-2">
                    すぐ入金申請について (2021年3月1日より改訂)<br />
                    すぐ入金申請をした時に所持しているポイントのうち、当月の獲得ポイントの50%分のみ【すぐ入金】対象となり、前月の獲得ポイント・残りの獲得ポイント50%は全て当月定期振込分となります。
                </div>
            </div>
        </div>
    );
};

export default CastImmediatePaymentPage; 