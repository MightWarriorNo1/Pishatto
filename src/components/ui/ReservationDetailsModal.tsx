import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, MapPin, CreditCard, MessageSquare } from 'lucide-react';
import { getReservationDetails } from '../../services/api';

interface ReservationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservationId: number | null;
    userType: 'guest' | 'cast';
}

interface ReservationDetails {
    id: number;
    type: string;
    status: string;
    scheduled_at: string;
    started_at?: string;
    ended_at?: string;
    duration: number;
    points_earned?: number;
    guest?: {
        id: number;
        nickname: string;
        avatar?: string;
    };
    cast?: {
        id: number;
        nickname: string;
        avatar?: string;
    };
    casts?: Array<{
        id: number;
        nickname: string;
        avatar?: string;
    }>;
    location?: string;
    notes?: string;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
    isOpen,
    onClose,
    reservationId,
    userType
}) => {
    const [reservation, setReservation] = useState<ReservationDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && reservationId) {
            fetchReservationDetails();
        }
    }, [isOpen, reservationId]);

    const fetchReservationDetails = async () => {
        if (!reservationId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const details = await getReservationDetails(reservationId);
            setReservation(details);
        } catch (err: any) {
            setError(err.message || '予約詳細の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return '待機中';
            case 'confirmed':
                return '確認済み';
            case 'active':
                return '進行中';
            case 'completed':
                return '完了';
            case 'cancelled':
                return 'キャンセル';
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-500';
            case 'confirmed':
                return 'text-blue-500';
            case 'active':
                return 'text-green-500';
            case 'completed':
                return 'text-gray-500';
            case 'cancelled':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'pishatto':
                return 'ピシャットコール';
            case 'free':
                return 'フリーコール';
            case 'proposal':
                return 'プロポーザル';
            default:
                return type;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-primary via-primary to-secondary rounded-lg max-w-md w-full md:w-[calc(100%-48px)] max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-secondary">
                    <h2 className="text-lg font-bold text-white">予約詳細</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-secondary"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-300 py-8">
                            <p>{error}</p>
                            <button
                                onClick={fetchReservationDetails}
                                className="mt-2 px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/80"
                            >
                                再試行
                            </button>
                        </div>
                    ) : reservation ? (
                        <div className="space-y-4">
                            {/* Basic Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-white" />
                                    <span className="font-medium text-white">予約ID:</span>
                                    <span className="text-white">#{reservation.id}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-white" />
                                    <span className="font-medium text-white">タイプ:</span>
                                    <span className="text-white">{getTypeText(reservation.type)}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(reservation.status).replace('text-', 'bg-')}`}></div>
                                    <span className="font-medium text-white">ステータス:</span>
                                    <span className={`font-medium ${getStatusColor(reservation.status)}`}>
                                        {getStatusText(reservation.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-white border-b border-secondary pb-1">スケジュール</h3>
                                
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-white" />
                                    <span className="font-medium text-white">予定時間:</span>
                                    <span className="text-white">{formatDateTime(reservation.scheduled_at)}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-white" />
                                    <span className="font-medium text-white">予定時間:</span>
                                    <span className="text-white">{reservation.duration}時間</span>
                                </div>

                                {reservation.started_at && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-white" />
                                        <span className="font-medium text-white">開始時間:</span>
                                        <span className="text-white">{formatDateTime(reservation.started_at)}</span>
                                    </div>
                                )}

                                {reservation.ended_at && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-white" />
                                        <span className="font-medium text-white">終了時間:</span>
                                        <span className="text-white">{formatDateTime(reservation.ended_at)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Participants */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-white border-b border-secondary pb-1">参加者</h3>
                                
                                {userType === 'guest' && reservation.cast && (
                                    <div className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-white" />
                                        <span className="font-medium text-white">キャスト:</span>
                                        <span className="text-white">{reservation.cast.nickname}</span>
                                    </div>
                                )}

                                {userType === 'cast' && reservation.guest && (
                                    <div className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-white" />
                                        <span className="font-medium text-white">ゲスト:</span>
                                        <span className="text-white">{reservation.guest.nickname}</span>
                                    </div>
                                )}

                                {reservation.casts && reservation.casts.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <User className="w-5 h-5 text-white" />
                                            <span className="font-medium text-white">キャスト ({reservation.casts.length}名):</span>
                                        </div>
                                        <div className="ml-7 space-y-1">
                                            {reservation.casts.map((cast, index) => (
                                                <div key={cast.id} className="text-white">
                                                    {index + 1}. {cast.nickname}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Additional Info */}
                            {(reservation.location || reservation.notes) && (
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-white border-b border-secondary pb-1">追加情報</h3>
                                    
                                    {reservation.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-white" />
                                            <span className="font-medium text-white">場所:</span>
                                            <span className="text-white">{reservation.location}</span>
                                        </div>
                                    )}

                                    {/* {reservation.notes && (
                                        <div className="space-y-1">
                                            <span className="font-medium text-white">メモ:</span>
                                            <p className="text-white text-sm bg-secondary/20 p-2 rounded">
                                                {reservation.notes}
                                            </p>
                                        </div>
                                    )} */}
                                </div>
                            )}

                            {/* Points (if applicable) */}
                            {reservation.points_earned && reservation.points_earned > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-white border-b border-secondary pb-1">ポイント</h3>
                                    
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-white" />
                                        <span className="font-medium text-white">獲得ポイント:</span>
                                        <span className="text-white">{reservation.points_earned}pt</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-white py-8">
                            予約情報が見つかりません
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReservationDetailsModal;
