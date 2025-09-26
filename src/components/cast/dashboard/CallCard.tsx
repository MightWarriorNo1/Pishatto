import React from 'react';
import { Clock3, UserRound } from "lucide-react";
import { Reservation } from '../../../services/api';

interface CallCardProps {
    location: string;
    time: string;
    duration:number,
    type: string;
    people: number;
    points: string;
    extra?: string;
    closed?: boolean;
    greyedOut?: boolean;
    started_at?: string;
    ended_at?: string;
    points_earned?: number;
    scheduled_at?: string;
    onStart?: () => void;
    onStop?: () => void;
    isOwnReservation?: boolean;
    reservationId?: number;
    onReservationUpdate?: (data: Partial<Reservation>) => void;
    statusText?: string;
}

const CallCard: React.FC<CallCardProps> = ({ location, duration, time, type, people, points, extra, closed, greyedOut, started_at, ended_at, points_earned, scheduled_at, onStart, onStop, isOwnReservation, reservationId, onReservationUpdate, statusText }) => {
    const [currentTime, setCurrentTime] = React.useState<Date>(new Date());
    const [finished] = React.useState(false);
    const [exceededAt] = React.useState<number | null>(null);
    const [localPoints] = React.useState<number | undefined>(points_earned);
    const [successMsg] = React.useState<string | null>(null);
    const [errorMsg] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (finished || (started_at && ended_at)) return;
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, [finished, started_at, ended_at]);
    // Use scheduled_at and duration for planned times
    const scheduled = scheduled_at ? new Date(scheduled_at) : undefined;
    const plannedEnd = (scheduled && duration) ? new Date(scheduled.getTime() + duration * 60 * 60 * 1000) : undefined;
    const started = started_at ? new Date(started_at) : undefined;
    const ended = ended_at ? new Date(ended_at) : undefined;

    // Timer states
    const now = currentTime;
    let state: 'before' | 'during' | 'after' = 'before';
    
    // If both started_at and ended_at are present, the reservation is finished
    if (started && ended) {
        state = 'after';
    } else if (started && !ended) {
        // Reservation is in progress
        if (now >= started) state = 'during';
    } else if (plannedEnd && now > plannedEnd && !ended) {
        // Past planned end time but not ended
        state = 'during';
    }

    // Time calculations
    const format = (d: Date) => d.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const diff = (a: Date, b: Date) => {
        let ms = Math.abs(a.getTime() - b.getTime());
        let h = Math.floor(ms / 3600000);
        let m = Math.floor((ms % 3600000) / 60000);
        let s = Math.floor((ms % 60000) / 1000);
        return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    };

    // Render
    if (closed) {
        return (
            <div className=" bg-primary border border-secondary rounded-xl p-3 items-center justify-center opacity-60 shadow-sm">
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span className="bg-secondary border border-secondary text-white px-3 py-1 rounded text-sm font-bold rotate-[-8deg] shadow">募集を締め切りました</span>
                </div>
            </div>
        );
    }
    return (
        <div className={`border border-secondary rounded-xl shadow-sm p-3 flex flex-col min-h-[160px] relative ${greyedOut ? 'bg-gray-700 opacity-60' : 'bg-primary'}`}>
            {statusText && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-70 rounded-xl">
                    <span className="bg-secondary border border-secondary text-white px-3 py-1 rounded text-sm font-bold shadow">{statusText}</span>
                </div>
            )}
            {successMsg && <div className="text-green-400 font-bold">{successMsg}</div>}
            {errorMsg && <div className="text-red-400 font-bold">{errorMsg}</div>}
            <div className="text-xs text-white font-bold mb-1 mt-2">{location} {time}</div>
            <div className="flex items-center mb-1 space-x-1">
                <span className="bg-secondary text-white text-xs px-2 py-0.5 rounded font-bold">{type}</span>
            </div>
            <div className="flex items-center text-xs text-white mb-1">
                <span className="flex items-center mr-2">
                    <Clock3 />{duration}時間</span>
                <span className="flex items-center mr-2"><UserRound /> {people}名</span>
            </div>
            <div className="text-xs text-white mb-1">獲得予定ポイント</div>
            <div className="text-lg font-bold text-white mb-1">{points}</div>
            {/* Timer states */}
            {(() => {
                if (state === 'before' && scheduled && plannedEnd) {
                    return <>
                        {/* <div><b>現在時刻:</b> {format(now)}</div> */}
                        <div className="text-xs">予約開始: {format(scheduled)}</div>
                        <div className="text-xs">予約終了: {format(plannedEnd)}</div>
                        <div className="font-mono text-blue-400 text-sm">開始まで: {diff(scheduled, now)}</div>
                    </>;
                }
                if (state === 'during' && scheduled && plannedEnd) {
                    return <>
                        {/* <div><b>予約開始:</b> {format(scheduled)}</div> */}
                        <div className="text-xs">予約終了: {format(plannedEnd)}</div>
                        <div className="text-xs">現在時刻: {format(now)}</div>
                        <div className="flex items-center justify-between">
                            <div className="font-mono text-green-400 text-sm">経過: {diff(now, scheduled)}</div>
                        </div>
                        {/* Show exceeded time warning for pishatto calls */}
                        {type === 'Pishatto' && now > plannedEnd && (
                            <div className="text-xs text-red-400 font-bold">
                                時間超過中 - 追加料金が発生しています
                            </div>
                        )}
                    </>;
                }
                if (state === 'after' && scheduled && plannedEnd) {
                    return <>P
                        <div className="text-xs">予約開始: {format(scheduled)}</div>
                        <div className="text-xs">予約終了: {format(plannedEnd)}</div>
                        {ended && <div className="text-xs">終了時刻: {format(ended)}</div>}
                        {exceededAt && <div className="font-mono text-red-400 text-sm">超過: {diff(new Date(exceededAt + plannedEnd.getTime()), plannedEnd)}</div>}
                        {typeof localPoints === 'number' && <div className="text-sm">獲得ポイント: <span className="font-bold">{localPoints}P</span></div>}
                    </>;
                }
                return null;
            })()}
        </div>
    );
};

export default CallCard; 