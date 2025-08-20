import React, { useState, useEffect } from 'react';
import { Calendar, Heart, ChevronLeft, Clock, Users, Send } from 'lucide-react';
import { getChatById, getReservationById, sendMessage, getCastProfileById } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import Spinner from '../ui/Spinner';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Utility function to get the first available avatar from comma-separated string
const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
    if (!avatarString) {
        return '/assets/avatar/avatar-2.png';
    }
    
    // Split by comma and get the first non-empty avatar
    const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
    
    if (avatars.length === 0) {
        return '/assets/avatar/avatar-2.png';
    }
    
    // If it's already a full URL, return as is
    if (avatars[0].startsWith('http')) {
        return avatars[0];
    }
    
    // Construct the full URL using the API base URL
    return `${API_BASE_URL}/${avatars[0]}`;
};

function formatJPDate(date: Date) {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const w = days[date.getDay()];
    return `${y}年${m}月${d}日(${w})`;
}

function formatTime(date: Date) {
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${min}`;
}

const parseDuration = (val: string) => {
    // Handles "2時間", "1.5時間", "90分" etc.
    if (val.includes('時間')) {
        const match = val.match(/([\d.]+)時間/);
        if (match) return parseFloat(match[1]) * 60;
    }
    if (val.includes('分')) {
        const match = val.match(/([\d.]+)分/);
        if (match) return parseFloat(match[1]);
    }
    return 60; // default 1 hour
};

const calcPoints = (duration: string, castCategory?: string) => {
    const minutes = parseDuration(duration);
    const units = Math.ceil(minutes / 30);
    const basePoints = castCategory === 'VIP' ? 12000 : castCategory === 'ロイヤルVIP' ? 15000 : 9000;
    return basePoints * units;
};

interface GuestCalendarPageProps {
    onBack: () => void;
    chatId: number;
}

const GuestCalendarPage: React.FC<GuestCalendarPageProps> = ({ onBack, chatId }) => {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [reservationData, setReservationData] = useState<any>(null);
    const [chatData, setChatData] = useState<any>(null);
    const [castInfo, setCastInfo] = useState<any>(null);
    const [castCategory, setCastCategory] = useState<string>('一般');
    
    // Form state
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedDuration, setSelectedDuration] = useState('2時間');
    const [numberOfCastMembers] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Get chat data to find reservation_id
                const chat = await getChatById(chatId);
                if (!chat) {
                    console.error('Chat not found');
                    return;
                }
                setChatData(chat);

                // Get reservation data if it exists
                if (chat.reservation_id) {
                    const reservation = await getReservationById(chat.reservation_id);
                    if (reservation) {
                        setReservationData(reservation);
                        // Pre-fill form with existing reservation data
                        if (reservation.scheduled_at) {
                            const reservationDate = new Date(reservation.scheduled_at);
                            setSelectedDate(reservationDate.toISOString().slice(0, 16));
                            setSelectedTime(formatTime(reservationDate));
                        }
                        if (reservation.duration) {
                            const hours = Math.floor(reservation.duration);
                            setSelectedDuration(`${hours}時間`);
                        }
                    }
                }

                // Get cast info from chat and fetch complete profile
                if (chat.cast_id) {
                    try {
                        // Fetch complete cast profile information
                        const castProfile = await getCastProfileById(chat.cast_id);
                        if (castProfile?.cast) {
                            setCastInfo({
                                id: castProfile.cast.id,
                                nickname: castProfile.cast.nickname || 'キャスト',
                                avatar: castProfile.cast.avatar
                            });
                            
                            // Set cast category for points calculation
                            setCastCategory(castProfile.cast.category || '一般');
                        } else {
                            // Fallback to chat data if profile fetch fails
                            setCastInfo({
                                id: chat.cast_id,
                                nickname: chat.cast_nickname || 'キャスト',
                                avatar: chat.cast_avatar
                            });
                            setCastCategory('一般');
                        }
                    } catch (error) {
                        console.error('Error fetching cast profile:', error);
                        // Fallback to chat data if profile fetch fails
                        setCastInfo({
                            id: chat.cast_id,
                            nickname: chat.cast_nickname || 'キャスト',
                            avatar: chat.cast_avatar
                        });
                        setCastCategory('一般');
                    }
                }

                // Set default date and time if none selected
                if (!selectedDate) {
                    const now = new Date();
                    now.setMinutes(now.getMinutes() + 30); // 30 minutes from now
                    setSelectedDate(now.toISOString().slice(0, 16));
                    setSelectedTime(formatTime(now));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [chatId]);

    const totalPoints = calcPoints(selectedDuration, castCategory);
    const extensionPoints = Math.round((castCategory === 'VIP' ? 12000 : castCategory === 'ロイヤルVIP' ? 15000 : 9000) / 2);

    const handleResubmit = async () => {
        if (!user || !selectedDate || !selectedTime || !selectedDuration) {
            return;
        }

        setSending(true);
        try {
            // Create proposal message
            const proposalData = {
                type: 'proposal',
                date: selectedDate,
                people: `${numberOfCastMembers}名`,
                duration: selectedDuration,
                totalPoints,
                extensionPoints,
                reservationId: reservationData?.id,
                guestId: user.id
            };

            // Send proposal message
            await sendMessage({
                chat_id: chatId,
                sender_guest_id: user.id,
                message: JSON.stringify(proposalData)
            });

            // Close the calendar page and return to chat
            onBack();
        } catch (error) {
            console.error('Error sending proposal:', error);
        } finally {
            setSending(false);
        }
    };

    const handleCancel = () => {
        onBack();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-primary via-primary/50 to-secondary flex flex-col items-center justify-center">
                <Spinner />
            </div>
        );
    }

    // Format display values
    const displayDate = selectedDate ? formatJPDate(new Date(selectedDate)) : formatJPDate(new Date());
    const displayTime = selectedTime || formatTime(new Date());

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary via-primary/50 to-secondary flex flex-col items-center pb-24">
            {/* Top Bar */}
            <div className="w-full max-w-md flex items-center justify-between px-4 py-3 border-b border-secondary bg-primary sticky top-0 z-10">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-2 hover:text-secondary cursor-pointer">
                        <ChevronLeft className="text-white" size={24} />
                    </button>
                    <div className="flex items-center">
                        <img 
                            src={castInfo?.avatar ? getFirstAvatarUrl(castInfo.avatar) : "/assets/avatar/avatar-2.png"} 
                            alt="avatar" 
                            className="w-9 h-9 rounded-full mr-2 border border-secondary" 
                        />
                        <span className="font-semibold text-lg flex flex-row text-white">
                            {castInfo?.nickname || 'キャスト'} 
                            <span className="text-white ml-1">
                                <Heart />
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Calendar Information Display */}
            <div className="w-full max-w-md flex flex-col items-center px-4 py-6 relative">
                <span className="text-xs text-white mb-4 text-center w-full">{displayDate}</span>
                
                {/* Cast Avatar */}
                <div className="flex items-center justify-center w-full mt-2">
                    <span className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                        <img 
                            src={castInfo?.avatar ? getFirstAvatarUrl(castInfo.avatar) : '/assets/avatar/avatar-2.png'} 
                            className="w-12 h-12 rounded-full object-cover" 
                            alt="avatar" 
                        />
                    </span>
                </div>
                
                <span className="text-xs text-white mt-2">{displayTime}</span>
            </div>

            {/* Calendar Details Form */}
            <div className="w-full max-w-md  bg-primary px-4 py-6 flex flex-col gap-4">
                <h2 className="text-xl font-bold text-white text-center mb-4">カレンダー詳細</h2>
                
                {/* Date Selection */}
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Calendar className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-gray-300 mb-2">日付・時間</div>
                        <input
                            type="datetime-local"
                            className="w-full border rounded-lg p-2 text-sm bg-primary text-white border-secondary"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Number of Cast Members */}
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Users className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-gray-300 mb-2">キャスト人数</div>
                        <div className="text-white font-semibold">{numberOfCastMembers}名</div>
                        <div className="text-xs text-gray-400">固定で1名</div>
                    </div>
                </div>

                {/* Duration Selection */}
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Clock className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-gray-300 mb-2">時間</div>
                        <select
                            className="w-full border rounded-lg p-2 text-sm bg-primary text-white border-secondary"
                            value={selectedDuration}
                            onChange={(e) => setSelectedDuration(e.target.value)}
                        >
                            <option value="1時間">1時間</option>
                            <option value="1.5時間">1.5時間</option>
                            <option value="2時間">2時間</option>
                            <option value="2.5時間">2.5時間</option>
                            <option value="3時間">3時間</option>
                            <option value="3.5時間">3.5時間</option>
                            <option value="4時間">4時間</option>
                        </select>
                    </div>
                </div>

                {/* Occurrence Point */}
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white font-bold text-lg">P</span>
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-gray-300">発生ポイント</div>
                        <div className="text-white font-semibold">{totalPoints.toLocaleString()}P</div>
                        <div className="text-xs text-gray-400">延長：{extensionPoints.toLocaleString()}P / 15分</div>
                    </div>
                </div>

                {/* Additional Information */}
                {reservationData && (
                    <div className="mt-4 p-4 bg-secondary rounded-lg">
                        <h3 className="text-white font-semibold mb-2">現在の予約詳細</h3>
                        {reservationData.duration && (
                            <div className="text-sm text-gray-300 mb-1">
                                予約時間: {Math.floor(reservationData.duration)}時間
                            </div>
                        )}
                        {reservationData.details && (
                            <div className="text-sm text-gray-300">
                                詳細: {reservationData.details}
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleCancel}
                        className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition-all duration-200"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleResubmit}
                        disabled={sending || !selectedDate || !selectedTime || !selectedDuration}
                        className="flex-1 py-3 px-4 bg-secondary text-white rounded-lg font-bold hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {sending ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                送信中...
                            </>
                        ) : (
                            <>
                                <Send size={16} />
                                再提案
                            </>
                        )}
                    </button>
                </div>

                {/* Note */}
                <div className="text-center text-sm text-gray-400 mt-4">
                    提案を送信すると、キャスト側で確認・承認が必要です
                </div>
            </div>
        </div>
    );
};

export default GuestCalendarPage;
