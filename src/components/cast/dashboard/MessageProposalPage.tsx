/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Calendar, Heart, ChevronLeft, Clock, Users, Send, X } from 'lucide-react';
import { getChatById, getReservationById, getGuestProfileById, getCastProfileById } from '../../../services/api';
import { useCast } from '../../../contexts/CastContext';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../ui/Spinner';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

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

const calcPoints = (duration: string, castGradePoints: number) => {
    const minutes = parseDuration(duration);
    const units = Math.ceil(minutes / 30);
    return castGradePoints * units;
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

interface GuestData {
    id: number;
    nickname: string;
    avatar?: string;
}

interface GroupInfo {
    id: number;
    name: string;
    participants: any[];
    isGroupChat: boolean;
}

const MessageProposalPage: React.FC<{ 
    onBack: () => void; 
    onProposalSend?: (proposal: any) => void;
    chatId: number;
    groupInfo?: GroupInfo;
    openedByGuest?: boolean; // New prop to determine who opened the page
}> = ({ onBack, onProposalSend, chatId, groupInfo, openedByGuest = false }) => {
    const navigate = useNavigate();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('2時間');
    const [guestData, setGuestData] = useState<GuestData | null>(null);
    const [castData, setCastData] = useState<any>(null);
    const [castGradePoints, setCastGradePoints] = useState<number>(9000); // Default to 9000 if not available
    const [loading, setLoading] = useState(true);
    
    // Modal state
    const [showDateTimeModal, setShowDateTimeModal] = useState(false);
    const [tempDate, setTempDate] = useState('');
    const [tempTime, setTempTime] = useState('');

    const { castId } = useCast() as any;

    // Fetch chat, reservation, and guest data only if not a group chat
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // If it's a group chat, we don't need to fetch individual guest data
                if (groupInfo?.isGroupChat) {
                    setLoading(false);
                    return;
                }

                // Get chat data to find reservation_id
                const chat = await getChatById(chatId);
                if (!chat || !chat.reservation_id) {
                    console.error('No reservation found for this chat');
                    return;
                }

                // Get reservation data
                const reservation = await getReservationById(chat.reservation_id);
                if (reservation) {
                                            // Parse details to extract number of people (for display only)
                        if (reservation.details) {
                            let number = 0;
                            const matches = reservation.details.match(/(\d+)人/g);
                            const numbers = matches ? matches.map((match: string) => parseInt(match.replace('人', ''), 10)) : [];
                            for(let i = 0; i < numbers.length; i++) {
                                number+=numbers[i];
                            }
                            // Note: Number of people is fixed at 1, so we don't need to store this
                        }
                    
                    // Set duration based on reservation
                    if (reservation.duration) {
                        const hours = Math.floor(reservation.duration);
                        setDuration(`${hours}時間`);
                    }
                }

                // Get guest data
                if (chat.guest_id) {
                    const guest = await getGuestProfileById(chat.guest_id);
                    if (guest) {
                        setGuestData({
                            id: guest.id,
                            nickname: guest.nickname,
                            avatar: guest.avatar
                        });
                    }
                }

                // Get cast profile to determine grade points for points calculation
                if (castId) {
                    try {
                        const castProfile = await getCastProfileById(castId);
                        setCastGradePoints(castProfile.cast?.grade_points || 9000);
                        
                        // If opened by guest, store cast data for display
                        if (openedByGuest) {
                            setCastData(castProfile.cast);
                        }
                    } catch (error) {
                        console.error('Failed to fetch cast profile:', error);
                    }
                }

                // If opened by guest and we don't have cast data yet, try to get it from chat info
                if (openedByGuest && !castData && chat.cast_id) {
                    try {
                        const castProfile = await getCastProfileById(chat.cast_id);
                        if (castProfile?.cast) {
                            setCastData(castProfile.cast);
                        }
                    } catch (error) {
                        console.error('Failed to fetch cast profile for guest view:', error);
                    }
                }

                // Set current date and time as default
                const now = new Date();
                const defaultDate = now.toISOString().slice(0, 10);
                const defaultTime = formatTime(now);
                setDate(defaultDate);
                setTime(defaultTime);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [chatId, groupInfo]);

    const totalPoints = calcPoints(duration, castGradePoints);
    const extensionPoints = Math.round(castGradePoints / 2);

    const handleProposalSend = () => {
        if (onProposalSend) {
            onProposalSend({
                date: `${date}T${time}`,
                people: '1名', // Fixed at 1 person
                duration,
                totalPoints,
                extensionPoints,
            });
        }
    };

    const openDateTimeModal = () => {
        setTempDate(date);
        setTempTime(time);
        setShowDateTimeModal(true);
    };

    const closeModal = () => {
        setShowDateTimeModal(false);
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
            
            setDate(tempDate);
            setTime(tempTime);
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
    const displayDate = date ? formatJPDate(new Date(date)) : formatJPDate(new Date());
    const displayTime = time || formatTime(new Date());

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary via-primary/50 to-secondary flex flex-col items-center pb-24">
            {/* Top Bar */}
            <div className="w-full max-w-md flex items-center justify-between px-4 py-3 border-b border-secondary bg-primary sticky top-0 z-10">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-2 hover:text-secondary cursor-pointer">
                        <ChevronLeft className="text-white" size={24} />
                    </button>
                    {groupInfo?.isGroupChat ? (
                        // Group chat display
                        <>
                            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center mr-2">
                                <span className="text-white text-sm font-bold">
                                    {groupInfo.participants.length}
                                </span>
                            </div>
                            <span className="font-semibold text-lg flex flex-row text-white">
                                {groupInfo.name}
                                <span className="text-white ml-1">
                                    <Heart />
                                </span>
                            </span>
                        </>
                    ) : openedByGuest ? (
                        // When opened by guest, show cast information
                        <>
                            <img 
                                src={castData?.avatar ? `${API_BASE_URL}/${castData.avatar}` : "/assets/avatar/1.jpg"} 
                                alt="avatar" 
                                className="w-9 h-9 rounded-full mr-2 border border-secondary cursor-pointer" 
                                onClick={() => {
                                    if (castData?.id) {
                                        try {
                                            navigate(`/cast/${castData.id}`);
                                        } catch (error) {
                                            console.error('Failed to navigate to cast profile:', error);
                                        }
                                    }
                                }}
                            />
                            <span className="font-semibold text-lg flex flex-row text-white">
                                {castData?.nickname || 'キャスト'} 
                                <span className="text-white">
                                    <Heart />
                                </span>
                            </span>
                        </>
                    ) : (
                        // When opened by cast, show guest information
                        <>
                            <img 
                                src={guestData?.avatar ? `${API_BASE_URL}/${guestData.avatar}` : "/assets/avatar/1.jpg"} 
                                alt="avatar" 
                                className="w-9 h-9 rounded-full mr-2 border border-secondary cursor-pointer" 
                                onClick={() => {
                                    if (guestData?.id) {
                                        try {
                                            navigate(`/guest/${guestData.id}`);
                                        } catch (error) {
                                            console.error('Failed to navigate to guest profile:', error);
                                        }
                                    }
                                }}
                            />
                            <span className="font-semibold text-lg flex flex-row text-white">
                                {guestData?.nickname || 'ゲスト'} 
                                <span className="text-white">
                                    <Heart />
                                </span>
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Calendar Information Display */}
            <div className="w-full max-w-md flex flex-col items-center px-4 py-6 relative">
                <span className="text-xs text-white mb-4 text-center w-full">{displayDate}</span>
                <div className="flex items-center justify-center w-full mt-2">
                    {groupInfo?.isGroupChat ? (
                        // Group chat avatar
                        <span className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                            <span className="text-white text-lg font-bold">
                                {groupInfo.participants.length}
                            </span>
                        </span>
                    ) : openedByGuest ? (
                        // When opened by guest, show cast avatar
                        <span className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                            {castData?.avatar ? (
                                <img 
                                    src={`${API_BASE_URL}/${castData.avatar}`}
                                    className="w-12 h-12 rounded-full object-cover" 
                                    alt="avatar" 
                                />
                            ) : (
                                <span className="text-white text-lg font-bold">C</span>
                            )}
                        </span>
                    ) : (
                        // When opened by cast, show guest avatar
                        <span className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                            {guestData?.avatar ? (
                                <img 
                                    src={`${API_BASE_URL}/${guestData.avatar}`}
                                    className="w-12 h-12 rounded-full object-cover" 
                                    alt="avatar" 
                                />
                            ) : (
                                <span className="text-white text-lg font-bold">G</span>
                            )}
                        </span>
                    )}
                </div>
                <span className="text-xs text-white mt-2">{displayTime}</span>
            </div>

            {/* Calendar Details Form */}
            <div className="w-full max-w-md px-4 py-6 flex flex-col gap-4">
                <h2 className="text-xl font-bold text-white text-center mb-4">日程提案詳細</h2>
                
                {/* Date and Time Selection */}
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
                            {date && time ? `${formatJPDate(new Date(date))} ${time}` : '日付・時間を選択'}
                        </button>
                    </div>
                </div>

                {/* Number of People */}
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Users className="text-white" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-300 mb-2">人数</div>
                        <div className="text-white font-semibold">1名</div>
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
                            className="w-full border rounded-lg p-2 text-sm bg-primary text-white border-secondary"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
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

                {/* Points Information */}
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">P</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-300 mb-2">発生ポイント</div>
                        <div className="text-white font-semibold">{totalPoints.toLocaleString()}P</div>
                        <div className="text-xs text-gray-400">
                            {castGradePoints.toLocaleString()}P/30分 × {Math.ceil(parseDuration(duration) / 30)}単位
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            延長：{extensionPoints.toLocaleString()}P / 15分
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="mt-4 p-4 bg-secondary/20 rounded-lg border border-secondary/30">
                    <div className="text-sm text-gray-300 mb-2">※延長15分につきポイントが発生します</div>
                    <div className="text-sm text-gray-300">※実際に合流するまでポイントは消費されません</div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center w-full mt-6">
                    <button
                        className="py-3 px-6 rounded-lg bg-secondary text-white font-bold text-base hover:bg-red-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleProposalSend}
                        disabled={!date || !time || !duration}
                    >
                        <Send size={16} />
                        日程と人数を提案する
                    </button>
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
                                    <input
                                        type="date"
                                        className="w-full border-2 border-gray-200 rounded-xl p-4 text-base text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-gray-300"
                                        value={tempDate}
                                        onChange={(e) => setTempDate(e.target.value)}
                                        min={new Date().toISOString().slice(0, 10)}
                                    />
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

export default MessageProposalPage; 