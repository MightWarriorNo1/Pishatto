import React, { useEffect, useState } from 'react';
import { getGuestReservations, Reservation, updateReservation, completeReservation } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { ChevronLeft, Clock, MapPin, Users, Calendar, Award, MessageCircle } from 'lucide-react';
import { useReservationUpdates } from '../../hooks/useRealtime';
import dayjs from 'dayjs';
import FeedbackModal from '../feedback/FeedbackModal';

const MyOrderPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useUser();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            getGuestReservations(user.id)
                .then(setReservations)
                .finally(() => setLoading(false));
        }
    }, [user]);

    // Real-time reservation updates
    useReservationUpdates(user?.id ?? '', (reservation) => {
        setReservations((prev) => {
            const exists = prev.find(r => r.id === reservation.id);
            if (exists) {
                return prev.map(r => r.id === reservation.id ? reservation : r);
            } else {
                return [reservation, ...prev];
            }
        });
    });

    console.log(reservations);

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format('MM/DD (ddd) HH:mm');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-secondary">
            {/* Enhanced Top bar */}
            <div className="fixed top-0 max-w-md mx-auto left-0 right-0 z-50 bg-primary backdrop-blur-md shadow-sm">
                <div className="max-w-md mx-auto flex items-center px-4 py-4">
                    <button 
                        onClick={onBack} 
                        className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-white hover:text-secondary"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-white">マイ予約</h1>
                        <p className="text-sm text-white">{user?.nickname || ''}さんの予約一覧</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto px-4 pb-24 pt-24">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">読み込み中...</span>
                    </div>
                ) : reservations.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">予約がありません</h3>
                        <p className="text-gray-500">新しい予約を作成してください</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reservations.map((r, index) => {
                            const startedAt = r.scheduled_at ? dayjs(r.scheduled_at) : null;
                            const endedAt = (r.scheduled_at && r.duration)
                                ? dayjs(r.scheduled_at).add(Number(r.duration), 'hour')
                                : null;

                            return (
                                <div 
                                    key={r.id} 
                                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Clock className="w-5 h-5 text-white" />
                                                <span className="text-white font-semibold">
                                                    {formatDate(r.scheduled_at || '')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-4">
                                        {/* Location */}
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm text-gray-500">場所</p>
                                                <p className="text-gray-900 font-medium">{r.location}</p>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex items-start space-x-3">
                                            <Users className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm text-gray-500">詳細</p>
                                                <p className="text-gray-900 font-medium">{r.details}</p>
                                            </div>
                                        </div>

                                        {/* Time Info */}
                                        {startedAt && (
                                            <div className="flex items-start space-x-3">
                                                <Calendar className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                                <div className="space-y-1">
                                                    <p className="text-sm text-gray-500">予約時間</p>
                                                    <p className="text-gray-900 font-medium">
                                                        {startedAt.format('MM/DD (ddd) HH:mm')} - {endedAt?.format('HH:mm')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Timer Component */}
                                        <div className="border-t border-gray-100 pt-4">
                                            <ReservationTimer
                                                started_at={r.started_at}
                                                ended_at={r.ended_at}
                                                points_earned={r.points_earned}
                                                reservationId={r.id}
                                                scheduled_at={r.scheduled_at}
                                                duration={r.duration}
                                                userId={user?.id}
                                                 selected_casts={r.selected_casts}
                                                onReservationUpdate={data => setReservations(prev => prev.map(rr => rr.id === r.id ? { ...rr, ...data } : rr))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrderPage;

// Enhanced Timer component
const ReservationTimer: React.FC<{ 
    started_at?: string; 
    ended_at?: string; 
    points_earned?: number; 
    reservationId?: number; 
    scheduled_at?: string; 
    duration?: number; 
    onReservationUpdate?: (data: Partial<Reservation>) => void; 
    userId?: number,
    selected_casts?: any[]
}> = ({ started_at, ended_at, points_earned, reservationId, scheduled_at, duration, onReservationUpdate, userId, selected_casts }) => {
    const [currentTime, setCurrentTime] = React.useState<Date>(new Date());
    const [finished, setFinished] = React.useState(false);
    const [exceededAt, setExceededAt] = React.useState<number | null>(null);
    const [localPoints, setLocalPoints] = React.useState<number | undefined>(points_earned);
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
    const [isExiting, setIsExiting] = React.useState(false);

    React.useEffect(() => {
        if (finished) return;
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, [finished]);

    // Use scheduled_at and duration for planned times
    const scheduled = scheduled_at ? new Date(scheduled_at) : undefined;
    const plannedEnd = (scheduled && duration) ? new Date(scheduled.getTime() + duration * 60 * 60 * 1000) : undefined;
    const started = started_at ? new Date(started_at) : undefined;
    const ended = ended_at ? new Date(ended_at) : undefined;

    // Timer states
    const now = currentTime;
    let state: 'before' | 'during' | 'after' = 'before';

    if (ended) {
        state = 'after';
    } else if (started || (scheduled && now >= scheduled)) {
        state = 'during';
    } else if (scheduled && now < scheduled) {
        state = 'before';
    }

    // Time calculations
    const format = (d: Date) => d.toLocaleString('ja-JP', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    
    const diff = (a: Date, b: Date) => {
        let ms = Math.abs(a.getTime() - b.getTime());
        let h = Math.floor(ms / 3600000);
        let m = Math.floor((ms % 3600000) / 60000);
        let s = Math.floor((ms % 60000) / 1000);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatForMySQL = (date: Date) => {
        return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    };

    const handleExit = async () => {
        setIsExiting(true);
        const end = new Date();
        setFinished(true);
        if (plannedEnd && end > plannedEnd) {
            setExceededAt(end.getTime() - plannedEnd.getTime());
        }
        if (reservationId) {
            const startToUse = started_at || scheduled_at || new Date().toISOString();
            try {
                // First update the timing to ensure accurate calculation
                await updateReservation(reservationId, {
                    started_at: formatForMySQL(new Date(startToUse)),
                    ended_at: formatForMySQL(end),
                });

                // Then complete the reservation to process point settlement
                const completion = await completeReservation(reservationId, {});
                const updated = completion?.reservation || {};
                setLocalPoints(updated.points_earned);
                setSuccessMsg('予約が正常に終了しました');
                setErrorMsg(null);
                if (onReservationUpdate) onReservationUpdate({ 
                    started_at: formatForMySQL(new Date(startToUse)), 
                    ended_at: formatForMySQL(end), 
                    points_earned: updated.points_earned 
                });
                setShowFeedbackModal(true);
            } catch (e: any) {
                setErrorMsg(e?.response?.data?.message || 'サーバーエラーが発生しました');
                setSuccessMsg(null);
            }
        }
        setIsExiting(false);
    };

    return (
        <div className="space-y-4">
            {/* Status Messages */}
            {successMsg && (
                <div className="items-center bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-800 font-medium text-sm">{successMsg}</span>
                    </div>
                </div>
            )}
            {errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-red-800 font-medium text-sm">{errorMsg}</span>
                    </div>
                </div>
            )}

            {/* Timer Display */}
            <div className="bg-gray-50 rounded-xl p-4">
                {state === 'before' && scheduled && plannedEnd && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">開始まで</span>
                            <span className="text-lg font-mono text-blue-600 font-bold">
                                {diff(scheduled, now)}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500">
                            {format(scheduled)} 開始予定
                        </div>
                    </div>
                )}

                {state === 'during' && scheduled && plannedEnd && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">経過時間</span>
                            <span className="text-lg font-mono text-green-600 font-bold">
                                {diff(now, scheduled)}
                            </span>
                        </div>
                        <button 
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                                isExiting 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-red-500 hover:bg-red-600 active:scale-95'
                            }`}
                            onClick={handleExit}
                            disabled={isExiting}
                        >
                            {isExiting ? '終了中...' : '予約を終了'}
                        </button>
                    </div>
                )}

                {state === 'after' && scheduled && plannedEnd && (
                    <div className="space-y-3">
                        {ended && (
                            <div className="text-xs text-gray-500">
                                終了時刻: {format(ended)}
                            </div>
                        )}
                        {exceededAt && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-yellow-600" />
                                    <span className="text-yellow-800 text-sm">
                                        超過時間: {diff(new Date(exceededAt + plannedEnd.getTime()), plannedEnd)}
                                    </span>
                                </div>
                            </div>
                        )}
                        {typeof localPoints === 'number' && (
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4">
                                <div className="flex items-center space-x-2">
                                    <Award className="w-5 h-5 text-white" />
                                    <span className="text-white font-bold">
                                        獲得ポイント: {localPoints}P
                                    </span>
                                </div>
                            </div>
                        )}
                        <button 
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                            onClick={() => setShowFeedbackModal(true)}
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>フィードバックを送信</span>
                        </button>
                    </div>
                )}
            </div>

            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                reservationId={reservationId || 0}
                { ...(() => {
                    const castsRaw = Array.isArray(selected_casts) ? selected_casts : [];
                    const normalized = castsRaw.map((c: any) => {
                        // Accept {id, nickname, avatar} or plain number id
                        if (typeof c === 'number') return { id: c };
                        if (c && typeof c === 'object') {
                            return { id: c.id ?? c.cast_id ?? c.user_id, nickname: c.nickname ?? c.name, avatar: c.avatar };
                        }
                        return null;
                    }).filter(Boolean) as { id: number; nickname?: string; avatar?: string }[];
                    if (normalized.length > 1) {
                        return { casts: normalized };
                    } else if (normalized.length === 1) {
                        return { castId: normalized[0].id };
                    } else {
                        return {};
                    }
                })() }
                guestId={userId || 0}
                onSuccess={() => setShowFeedbackModal(false)}
            />
        </div>
    );
}; 