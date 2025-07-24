import React, { useEffect, useState } from 'react';
import { getGuestReservations, Reservation } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { ChevronLeft } from 'lucide-react';
import { useReservationUpdates } from '../../hooks/useRealtime';

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
            {reservations.map(r => (
                <div key={r.id} className="bg-white rounded shadow p-4 m-4">
                    <div className='text-primary'><b>日時:</b> {r.scheduled_at}</div>
                    <div className='text-primary'><b>場所:</b> {r.location}</div>
                    <div className='text-primary'><b>人数/詳細:</b> {r.details}</div>
                </div>
            ))}
        </div>
    );
};

export default MyOrderPage; 