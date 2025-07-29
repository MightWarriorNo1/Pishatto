import React, { useEffect, useState } from 'react';
import { getGuestReservations, Reservation, updateReservation } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { ChevronLeft } from 'lucide-react';
import { useReservationUpdates } from '../../hooks/useRealtime';
import dayjs from 'dayjs';
import Toast from '../../components/ui/Toast';

const MyOrderPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useUser();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    useEffect(() => {
        if (user) {
            getGuestReservations(user.id).then(setReservations);
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

    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
                <button onClick={onBack} className="mr-2 text-2xl text-white">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center text-white">マイ予約</span>
            </div>
            <h2 className="text-xl font-bold text-white p-4">{user?.nickname || ''}さんの予約一覧</h2>
            {reservations.length === 0 && <div className="text-primary px-4">予約はありません</div>}
            {reservations.map(r => {
                const startedAt = r.scheduled_at ? dayjs(r.scheduled_at) : null;
                const endedAt = (r.scheduled_at && r.duration)
                    ? dayjs(r.scheduled_at).add(Number(r.duration), 'hour')
                    : null;
                return (
                    <div key={r.id} className="bg-white rounded shadow p-4 m-4">
                        <div className='text-primary'><b>日時:</b> {r.scheduled_at}</div>
                        <div className='text-primary'><b>場所:</b> {r.location}</div>
                        <div className='text-primary'><b>人数/詳細:</b> {r.details}</div>
                        {startedAt && (
                            <div className='text-primary'><b>開始:</b> {startedAt.format('YYYY-MM-DD HH:mm')}</div>
                        )}
                        {endedAt && (
                            <div className='text-primary'><b>終了:</b> {endedAt.format('YYYY-MM-DD HH:mm')}</div>
                        )}
                        <ReservationTimer
                            started_at={r.started_at}
                            ended_at={r.ended_at}
                            points_earned={r.points_earned}
                            reservationId={r.id}
                            scheduled_at={r.scheduled_at}
                            duration={r.duration}
                            onReservationUpdate={data => setReservations(prev => prev.map(rr => rr.id === r.id ? { ...rr, ...data } : rr))}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default MyOrderPage;

// Timer component for guest-side display
const ReservationTimer: React.FC<{ started_at?: string; ended_at?: string; points_earned?: number; reservationId?: number; scheduled_at?: string; duration?: number; onReservationUpdate?: (data: Partial<Reservation>) => void }> = ({ started_at, ended_at, points_earned, reservationId, scheduled_at, duration, onReservationUpdate }) => {
    const [currentTime, setCurrentTime] = React.useState<Date>(new Date());
    const [finished, setFinished] = React.useState(false);
    const [exceededAt, setExceededAt] = React.useState<number | null>(null);
    const [localPoints, setLocalPoints] = React.useState<number | undefined>(points_earned);
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
    const [feedbackText, setFeedbackText] = React.useState('');
    const [feedbackRating, setFeedbackRating] = React.useState<number | null>(null);
    const [badges] = React.useState<any[]>([]);
    const [selectedBadgeId, setSelectedBadgeId] = React.useState<number | null>(null);
    const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

    React.useEffect(() => {
        if (finished) return;
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, [finished]);

    // React.useEffect(() => {
    //     if (showFeedbackModal) {
    //         fetchAllBadges().then(setBadges);
    //     }
    // }, [showFeedbackModal]);

    // Use scheduled_at and duration for planned times
    const scheduled = scheduled_at ? new Date(scheduled_at) : undefined;
    const plannedEnd = (scheduled && duration) ? new Date(scheduled.getTime() + duration * 60 * 60 * 1000) : undefined;
    const started = started_at ? new Date(started_at) : undefined;
    const ended = ended_at ? new Date(ended_at) : undefined;

    // Timer states
    const now = currentTime;
    let state: 'before' | 'during' | 'after' = 'before';

    // If reservation has ended, show after state
    if (ended) {
        state = 'after';
    }
    // If reservation has started (either manually started or within scheduled time), show during state
    else if (started || (scheduled && now >= scheduled)) {
        state = 'during';
    }
    // Otherwise show before state
    else if (scheduled && now < scheduled) {
        state = 'before';
    }

    // Time calculations
    const format = (d: Date) => d.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const diff = (a: Date, b: Date) => {
        let ms = Math.abs(a.getTime() - b.getTime());
        let h = Math.floor(ms / 3600000);
        let m = Math.floor((ms % 3600000) / 60000);
        let s = Math.floor((ms % 60000) / 1000);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Utility for MySQL datetime format
    const formatForMySQL = (date: Date) => {
        return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    };

    // Handler for exit button
    const handleExit = async () => {
        const end = new Date();
        setFinished(true);
        if (plannedEnd && end > plannedEnd) {
            setExceededAt(end.getTime() - plannedEnd.getTime());
        }
        if (reservationId) {
            const startToUse = started_at || scheduled_at || new Date().toISOString();
            try {
                const res = await updateReservation(reservationId, {
                    started_at: formatForMySQL(new Date(startToUse)),
                    ended_at: formatForMySQL(end),
                });
                setLocalPoints(res.points_earned);
                setSuccessMsg('予約が正常に終了しました');
                setErrorMsg(null);
                if (onReservationUpdate) onReservationUpdate({ started_at: formatForMySQL(new Date(startToUse)), ended_at: formatForMySQL(end), points_earned: res.points_earned });
                setShowFeedbackModal(true);
            } catch (e: any) {
                setErrorMsg(e?.response?.data?.message || 'サーバーエラーが発生しました');
                setSuccessMsg(null);
            }
        }
    };

    const handleSubmitFeedback = async () => {
        if (!reservationId) return;
        try {
            await updateReservation(reservationId, {
                feedback_text: feedbackText,
                feedback_rating: feedbackRating ?? undefined,
                // feedback_badge_id: selectedBadgeId ?? undefined,
            });
            setToast({ message: 'フィードバックを送信しました。ありがとうございました！', type: 'success' });
            setShowFeedbackModal(false);
        } catch (e: any) {
            setToast({ message: e?.response?.data?.message || 'フィードバック送信に失敗しました', type: 'error' });
        }
    };

    // Render
    return (
        <div className="text-primary text-lg mt-2 space-y-1">
            {successMsg && <div className="text-green-600 font-bold">{successMsg}</div>}
            {errorMsg && <div className="text-red-600 font-bold">{errorMsg}</div>}
            {state === 'before' && scheduled && plannedEnd && (
                <>
                    <div><b>現在時刻:</b> {format(now)}</div>
                    <div><b>予約開始:</b> {format(scheduled)}</div>
                    <div><b>予約終了:</b> {format(plannedEnd)}</div>
                    <div className="font-mono text-blue-600">開始まで: {diff(scheduled, now)}</div>
                </>
            )}
            {state === 'during' && scheduled && plannedEnd && (
                <>
                    <div><b>予約開始:</b> {format(scheduled)}</div>
                    <div><b>予約終了:</b> {format(plannedEnd)}</div>
                    <div><b>現在時刻:</b> {format(now)}</div>
                    <div className="flex items-center justify-between">
                        <div className="font-mono text-green-600">経過: {diff(now, scheduled)}</div>
                        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-bold transition-colors ml-4" onClick={handleExit}>終了</button>
                    </div>
                </>
            )}
            {state === 'after' && scheduled && plannedEnd && (
                <>
                    <div><b>予約開始:</b> {format(scheduled)}</div>
                    <div><b>予約終了:</b> {format(plannedEnd)}</div>
                    {ended && <div><b>終了時刻:</b> {format(ended)}</div>}
                    {exceededAt && <div className="font-mono text-red-600">超過: {diff(new Date(exceededAt + plannedEnd.getTime()), plannedEnd)}</div>}
                    {typeof localPoints === 'number' && <div><b>獲得ポイント:</b> <span className="font-bold">{localPoints}P</span></div>}
                </>
            )}
            {showFeedbackModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-secondary min-w-[320px] max-w-[90vw]">
                        <h2 className="font-bold text-lg mb-4 text-primary">フィードバックを送信</h2>
                        <textarea
                            className="w-full border border-secondary rounded p-2 mb-3 text-primary"
                            rows={3}
                            placeholder="キャストへの感想やフィードバックを入力してください"
                            value={feedbackText}
                            onChange={e => setFeedbackText(e.target.value)}
                        />
                        <div className="mb-3 w-full">
                            <div className="mb-1 text-primary font-bold">評価 (1-5):</div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(r => (
                                    <button
                                        key={r}
                                        className={`w-8 h-8 rounded-full border ${feedbackRating === r ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-primary'}`}
                                        onClick={() => setFeedbackRating(r)}
                                        type="button"
                                    >{r}</button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-3 w-full">
                            <div className="mb-1 text-primary font-bold">バッジを選択 (任意):</div>
                            <div className="flex flex-wrap gap-2">
                                {badges.map(badge => (
                                    <button
                                        key={badge.id}
                                        className={`px-3 py-1 rounded-full border ${selectedBadgeId === badge.id ? 'bg-pink-500 text-white' : 'bg-gray-200 text-primary'}`}
                                        onClick={() => setSelectedBadgeId(badge.id)}
                                        type="button"
                                    >{badge.icon ? <img src={badge.icon} alt={badge.name} className="inline w-5 h-5 mr-1" /> : null}{badge.name}</button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <button className="bg-secondary text-white px-4 py-2 rounded" onClick={() => setShowFeedbackModal(false)}>キャンセル</button>
                            <button className="bg-pink-500 text-white px-4 py-2 rounded font-bold" onClick={handleSubmitFeedback}>送信</button>
                        </div>
                    </div>
                </div>
            )}
            {toast && (
                <Toast show message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
}; 