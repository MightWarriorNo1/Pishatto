/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Calendar, Heart, ChevronLeft } from 'lucide-react';
import { getChatById, getReservationById, getGuestProfileById, getCastProfileById } from '../../../services/api';
import { useCast } from '../../../contexts/CastContext';
import { useNavigate } from 'react-router-dom';

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



const parsePeople = (val: string) => {
    const match = val.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
};
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
const calcPoints = (people: string, duration: string, castCategory?: string) => {
    const numPeople = parsePeople(people);
    const minutes = parseDuration(duration);
    const units = Math.ceil(minutes / 30);
    const basePoints = castCategory === 'VIP' ? 12000 : castCategory === 'ロイヤルVIP' ? 15000 : 9000;
    return basePoints * numPeople * units;
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
}> = ({ onBack, onProposalSend, chatId, groupInfo }) => {
    const navigate = useNavigate();
    const [date, setDate] = useState('');
    const [people, setPeople] = useState('1名');
    const [duration, setDuration] = useState('2時間');
    const [guestData, setGuestData] = useState<GuestData | null>(null);
    const [castCategory, setCastCategory] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const now = new Date();
    const jpDate = formatJPDate(now);
    const jpTime = formatTime(now);

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
                    // Parse details to extract number of people
                    if (reservation.details) {
                        let number = 0;
                        const matches = reservation.details.match(/(\d+)人/g);
                        const numbers = matches ? matches.map((match: string) => parseInt(match.replace('人', ''), 10)) : [];
                        for(let i = 0; i < numbers.length; i++) {
                            number+=numbers[i];
                        }
                        setPeople(`${number}人`);
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

                // Get cast profile to determine category for points calculation
                if (castId) {
                    try {
                        const castData = await getCastProfileById(castId);
                        setCastCategory(castData.cast?.category);
                    } catch (error) {
                        console.error('Failed to fetch cast profile:', error);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [chatId, groupInfo]);

    const totalPoints = calcPoints(people, duration, castCategory);

    const handleProposalSend = () => {
        if (onProposalSend) {
            onProposalSend({
                date,
                people,
                duration,
                totalPoints,
                extensionPoints: Math.round((castCategory === 'VIP' ? 12000 : castCategory === 'ロイヤルVIP' ? 15000 : 9000) * parsePeople(people) / 2), // 15min = half of 30min
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
                <div className="text-white text-lg">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary flex flex-col items-center pb-24">
            {/* Top Bar */}
            <div className="w-full max-w-md flex items-center justify-between px-4 py-3 border-b border-secondary bg-primary sticky top-0 z-10">
                
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-2 hover:text-secondary cursor-pointer">
                        <ChevronLeft className="text-white" size={24} />
                    </button>
                    {groupInfo?.isGroupChat ? (
                        // Group chat display
                        <>
                            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center mr-2">
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
                    ) : (
                        // Individual chat display
                        <>
                            <img 
                                src={guestData?.avatar ? `${API_BASE_URL}/${guestData.avatar}` : "/assets/avatar/1.jpg"} 
                                alt="avatar" 
                                className="w-9 h-9 rounded-full mr-2 border border-secondary cursor-pointer" 
                                onClick={() => {
                                    if (guestData?.id) {
                                        navigate(`/guest/${guestData.id}`);
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
            {/* Chat Area */}
            <div className="w-full max-w-md flex flex-col items-center px-4 py-6 bg-primary relative">
                <span className="text-xs text-white mb-4 text-center w-full">{jpDate}</span>
                <div className="flex items-center justify-center w-full mt-2">
                    {groupInfo?.isGroupChat ? (
                        // Group chat avatar
                        <span className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                            <span className="text-white text-lg font-bold">
                                {groupInfo.participants.length}
                            </span>
                        </span>
                    ) : (
                        // Individual chat avatar
                        <span className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                            <img 
                                src={guestData?.avatar ? `${API_BASE_URL}/${guestData.avatar}` : '/assets/avatar/avatar-2.png'} 
                                className="w-12 h-12 rounded-full object-cover" 
                                alt="avatar" 
                            />
                        </span>
                    )}
                </div>
                <span className="text-xs text-white mt-2">{jpTime}</span>
            </div>
            {/* Schedule Proposal Form */}
            <div className="w-full max-w-md bg-primary px-4 py-6 flex flex-col gap-3">
                <div className="text-lg font-bold text-white mb-1 font-l">日程</div>
                <div className="flex flex-row gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Calendar className="text-white" size={24} />
                    </div>
                    <input
                        type="datetime-local"
                        className="w-full border rounded-lg p-2 text-sm bg-primary text-white border-secondary"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                        <div className="text-lg font-bold text-white mb-1">キャスト人数</div>
                        <input
                            className="w-full border rounded-lg p-2 text-sm bg-primary text-white border-secondary"
                            value={people}
                            onChange={e => setPeople(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <div className="text-lg font-bold text-white mb-1">時間</div>
                        <input
                            className="w-full border rounded-lg p-2 text-sm bg-primary text-white border-secondary"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                        />
                    </div>
                </div>
                <div className="text-md text-white font-bold mt-2 mb-1">
                    9,000 (キャストP/30分) × {parsePeople(people)}名 × {Math.ceil(parseDuration(duration) / 60)}時間 <span className="float-right">{totalPoints.toLocaleString()}P</span>
                </div>
                <div className="text-md text-white mb-2 text-right w-full">※延長15分につきpが発生します</div>
                <div className="text-md  text-white flex justify-between text-center font-bold mb-2">実際に合流するまでポイントは消費されません</div>
                <div className="flex justify-center w-full mt-8">
                    <button
                        className="py-3 rounded-lg bg-secondary text-white font-bold text-base mt-2 w-3/4 hover:bg-red-700 transition-all duration-200"
                        onClick={handleProposalSend}
                    >
                        日程と人数を提案する
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageProposalPage; 