import React, { useEffect, useState } from 'react';
import { getGuestReservations, Reservation, updateReservation } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { ChevronLeft } from 'lucide-react';
import { useReservationUpdates } from '../../hooks/useRealtime';
import dayjs from 'dayjs';
import FeedbackModal from '../feedback/FeedbackModal';

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
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br bg-primary via-primary to-secondary pb-24">
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
                            userId={user?.id}
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
const ReservationTimer: React.FC<{ started_at?: string; ended_at?: string; points_earned?: number; reservationId?: number; scheduled_at?: string; duration?: number; onReservationUpdate?: (data: Partial<Reservation>) => void; userId?: number }> = ({ started_at, ended_at, points_earned, reservationId, scheduled_at, duration, onReservationUpdate, userId }) => {
    const [currentTime, setCurrentTime] = React.useState<Date>(new Date());
    const [finished, setFinished] = React.useState(false);
    const [exceededAt, setExceededAt] = React.useState<number | null>(null);
    const [localPoints, setLocalPoints] = React.useState<number | undefined>(points_earned);
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);

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
                    <button 
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold transition-colors mt-2"
                        onClick={() => setShowFeedbackModal(true)}
                    >
                        フィードバックを送信
                    </button>
                </>
            )}
            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                reservationId={reservationId || 0}
                castId={1} // This should be passed from the reservation data
                guestId={userId || 0}
                onSuccess={() => setShowFeedbackModal(false)}
            />
        </div>
    );
}; 