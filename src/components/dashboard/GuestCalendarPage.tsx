import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Heart, ChevronLeft, Clock, Users, Send, X } from 'lucide-react';
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

// Helper function to get minimum allowed time
const getMinTime = (selectedDate: string): string => {
    const today = new Date().toISOString().slice(0, 10);
    if (selectedDate === today) {
        const now = new Date();
        // Add 30 minutes buffer to current time
        now.setMinutes(now.getMinutes() + 30);
        return now.toTimeString().slice(0, 5);
    }
    return '00:00';
};

const calcPoints = (duration: string, castGradePoints: number) => {
    const minutes = parseDuration(duration);
    const units = Math.ceil(minutes / 30);
    return castGradePoints * units;
};

interface GuestCalendarPageProps {
    onBack: () => void;
    chatId: number;
}

const GuestCalendarPage: React.FC<GuestCalendarPageProps> = ({ onBack, chatId }) => {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const isSubmittingRef = useRef(false);
    const [reservationData, setReservationData] = useState<any>(null);
    const [castInfo, setCastInfo] = useState<any>(null);
    const [castGradePoints, setCastGradePoints] = useState<number>(9000); // Default to 9000 if not available
    
    // Form state
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedDuration, setSelectedDuration] = useState('2時間');
    const [numberOfCastMembers] = useState(1);

    // Modal state
    const [showDateTimeModal, setShowDateTimeModal] = useState(false);
    const [tempDate, setTempDate] = useState('');
    const [tempTime, setTempTime] = useState('');

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
                

                // Get reservation data if it exists (but don't set it as default)
                if (chat.reservation_id) {
                    const reservation = await getReservationById(chat.reservation_id);
                    if (reservation) {
                        setReservationData(reservation);
                        // Don't pre-fill form with existing reservation data
                        if (reservation.duration) {
                            const hours = typeof reservation.duration === 'number' 
                                ? reservation.duration 
                                : parseFloat(reservation.duration);
                            const label = Number.isInteger(hours) ? `${hours}時間` : `${hours.toFixed(1)}時間`;
                            setSelectedDuration(label);
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
                            setCastGradePoints(castProfile.cast.grade_points || 9000);
                        } else {
                            // Fallback to chat data if profile fetch fails
                            setCastInfo({
                                id: chat.cast_id,
                                nickname: chat.cast_nickname || 'キャスト',
                                avatar: chat.cast_avatar
                            });
                            setCastGradePoints(9000);
                        }
                    } catch (error) {
                        console.error('Error fetching cast profile:', error);
                        // Fallback to chat data if profile fetch fails
                        setCastInfo({
                            id: chat.cast_id,
                            nickname: chat.cast_nickname || 'キャスト',
                            avatar: chat.cast_avatar
                        });
                        setCastGradePoints(9000);
                    }
                }

                // Always set current date and time as default (30 minutes ahead)
                const now = new Date();
                const defaultDate = now.toISOString().slice(0, 10);
                // Add 30 minutes to current time
                const futureTime = new Date(now.getTime() + 30 * 60 * 1000);
                const defaultTime = formatTime(futureTime);
                console.log('Setting current time as default (30 mins ahead):', defaultDate, defaultTime);
                setSelectedDate(defaultDate);
                setSelectedTime(defaultTime);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [chatId]); // Removed selectedDate dependency to prevent infinite loops


    // const totalPoints = calcPoints(selectedDuration, castCategory);
    // const extensionPoints = Math.round((castCategory === 'VIP' ? 15000 : castCategory === 'ロイヤルVIP' ? 18000 : 12000) / 2);

    const totalPoints = calcPoints(selectedDuration, castGradePoints);
    const extensionPoints = Math.round(castGradePoints / 2);

    const handleResubmit = async () => {
        // Prevent multiple clicks
        if (sending || isSubmittingRef.current) {
            return;
        }
        
        if (!user || !selectedDate || !selectedTime || !selectedDuration) {
            return;
        }
        
        // Check if selected date/time is in the past
        const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
        const now = new Date();
        if (selectedDateTime <= now) {
            alert('過去の日時は選択できません。未来の日時を選択してください。');
            return;
        }

        setSending(true);
        isSubmittingRef.current = true;
        try {
            // Create proposal message
            const proposalData = {
                type: 'proposal',
                date: `${selectedDate}T${selectedTime}`,
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
            isSubmittingRef.current = false;
        }
    };

    const handleCancel = () => {
        onBack();
    };



    const openDateTimeModal = () => {
        // Always use current date and time when opening modal (30 minutes ahead)
        const now = new Date();
        const currentDate = now.toISOString().slice(0, 10);
        // Add 30 minutes to current time
        const futureTime = new Date(now.getTime() + 30 * 60 * 1000);
        const currentTime = formatTime(futureTime);
        
        console.log('Opening modal with current date/time (30 mins ahead):', currentDate, currentTime);
        setTempDate(currentDate);
        setTempTime(currentTime);
        setShowDateTimeModal(true);
    };

    const closeModal = () => {
        setShowDateTimeModal(false);
        // Reset temp values to prevent stale data
        setTempDate('');
        setTempTime('');
    };

    const handleConfirmSelection = () => {
        if (tempDate && tempTime) {
            const selectedDateTime = new Date(`${tempDate}T${tempTime}`);
            const now = new Date();
            
            // Check if selected date/time is in the past
            if (selectedDateTime <= now) {
                alert('過去の日時は選択できません。未来の日時を選択してください。');
                return;
            }
            
            // Additional validation for current date
            if (tempDate === new Date().toISOString().slice(0, 10)) {
                const currentTime = now.toTimeString().slice(0, 5);
                if (tempTime < currentTime) {
                    alert('今日の場合は、現在時刻より後の時間を選択してください。');
                    return;
                }
            }
            
            // Store date and time separately for proper formatting
            console.log('Setting selectedDate:', tempDate, 'selectedTime:', tempTime);
            setSelectedDate(tempDate);
            setSelectedTime(tempTime);
            
            // Force a re-render to see if the state updates
            setTimeout(() => {
                console.log('After state update - selectedDate:', tempDate, 'selectedTime:', tempTime);
            }, 100);
            
            closeModal();
        }
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
                    <button onClick={onBack} className="mr-2">
                        <ChevronLeft className="text-white  hover:text-secondary cursor-pointer" size={24} />
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
            <div className="w-full max-w-m  px-4 py-6 flex flex-col gap-4">
                <h2 className="text-xl font-bold text-white text-center mb-4">カレンダー詳細</h2>
                
                {/* Date Selection */}
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Calendar className="text-white" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-300 mb-2">日付・時間</div>
                        <button
                            onClick={openDateTimeModal}
                            className="w-full border rounded-lg p-2 text-sm bg-primary text-white border-secondary text-left hover:bg-primary/80 transition-colors"
                        >
                            {(() => {
                                const currentTime = `${formatJPDate(new Date())} ${formatTime(new Date())}`;
                                
                                if (selectedDate && selectedTime) {
                                    try {
                                        const date = new Date(selectedDate);
                                        if (isNaN(date.getTime())) {
                                            console.error('Invalid date:', selectedDate);
                                            return currentTime;
                                        }
                                        return `${formatJPDate(date)} ${selectedTime}`;
                                    } catch (error) {
                                        console.error('Error formatting date:', error);
                                        return currentTime;
                                    }
                                }
                                return `日付・時間を選択 (現在: ${currentTime})`;
                            })()}
                        </button>
                    </div>
                </div>

                {/* Number of Cast Members */}
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Users className="text-white" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-300 mb-2">キャスト人数</div>
                        <div className="text-white font-semibold">{numberOfCastMembers}名</div>
                        <div className="text-xs text-gray-400">固定で1名</div>
                    </div>
                </div>

                {/* Duration Selection */}
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Clock className="text-white" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-300 mb-2">時間</div>
                        <select
                            className="w-full border rounded-lg p-2 text-sm bg-primary text-white border-secondary min-w-0"
                            value={selectedDuration}
                            onChange={(e) => setSelectedDuration(e.target.value)}
                        >
                            {Array.from({ length: 47 }, (_, i) => 1 + i * 0.5).map((h) => {
                                const label = Number.isInteger(h) ? `${h}時間` : `${h.toFixed(1)}時間`;
                                return (
                                    <option key={label} value={label}>{label}</option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* Occurrence Point */}
                {/* <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">P</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-300">発生ポイント</div>
                        <div className="text-white font-semibold">{totalPoints.toLocaleString()}P</div>
                        <div className="text-xs text-gray-400">延長：{extensionPoints.toLocaleString()}P / 15分</div>
                    </div>
                </div> */}

                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">P</span>
                    </div>
                    <div className="flex-1 min-w-0">
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
                        disabled={sending || isSubmittingRef.current || !selectedDate || !selectedTime || !selectedDuration}
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

            {/* DateTime Selection Modal */}
            {showDateTimeModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all duration-200 scale-100 animate-in zoom-in-95">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Calendar className="text-primary" size={20} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">日付・時間を選択</h3>
                            </div>
                            <button
                                onClick={closeModal}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all duration-200"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6 pt-4">
                            <div className="space-y-5">
                                {/* Date Selection */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <Calendar size={16} className="text-primary" />
                                        日付
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            className="w-full border-2 border-gray-200 rounded-xl p-4 text-base text-transparent caret-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-gray-300"
                                            value={tempDate}
                                            onChange={(e) => setTempDate(e.target.value)}
                                            min={new Date().toISOString().slice(0, 10)}
                                        />
                                        <div className="pointer-events-none absolute inset-0 flex items-center px-4 text-base text-gray-900">
                                            {tempDate ? formatJPDate(new Date(tempDate)) : ''}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Time Selection */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <Clock size={16} className="text-primary" />
                                        時間
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full border-2 border-gray-200 rounded-xl p-4 text-base text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-gray-300"
                                        value={tempTime}
                                        onChange={(e) => setTempTime(e.target.value)}
                                        min={getMinTime(tempDate)}
                                        onBlur={(e) => {
                                            if (tempDate === new Date().toISOString().slice(0, 10)) {
                                                const selectedTime = e.target.value;
                                                const minAllowedTime = getMinTime(tempDate);
                                                if (selectedTime < minAllowedTime) {
                                                    setTempTime(minAllowedTime);
                                                }
                                            }
                                        }}
                                    />
                                </div>

                                {/* Preview */}
                                {tempDate && tempTime && (
                                    <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                                        <div className="text-sm text-gray-600 mb-1">選択された日時:</div>
                                        <div className="text-lg font-semibold text-primary">
                                            {formatJPDate(new Date(`${tempDate}T${tempTime}`))} {tempTime}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="flex gap-3 p-6 pt-0">
                            <button
                                onClick={closeModal}
                                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 border border-gray-200"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleConfirmSelection}
                                disabled={!tempDate || !tempTime}
                                className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary shadow-lg shadow-primary/25"
                            >
                                確認
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuestCalendarPage;
