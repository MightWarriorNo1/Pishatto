import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Image, Send } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useNotificationSettings } from '../../../contexts/NotificationSettingsContext';
import { useCast } from '../../../contexts/CastContext';
import { getChatById, getChatMessages, sendMessage } from '../../../services/api';
import { useChatMessages } from '../../../hooks/useRealtime';
import Spinner from '../../ui/Spinner';

dayjs.extend(utc);
dayjs.extend(timezone);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
    if (!avatarString) return '/assets/avatar/avatar-1.png';
    const avatars = avatarString.split(',').map(a => a.trim()).filter(a => a.length > 0);
    if (avatars.length === 0) return '/assets/avatar/avatar-1.png';
    return `${API_BASE_URL}/${avatars[0]}`;
};

interface CastChatScreenProps {
    chatId: number;
    onBack: () => void;
}

const CastChatScreen: React.FC<CastChatScreenProps> = ({ chatId, onBack }) => {
    const { isNotificationEnabled } = useNotificationSettings();
    const { castId } = useCast() as any;
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [guestInfo, setGuestInfo] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const userTz = dayjs.tz.guess();
    const formatTime = (timestamp: string) => dayjs.utc(timestamp).tz(userTz).format('YYYY-MM-DD HH:mm');

    useEffect(() => {
        setFetching(true);
        setFetchError(null);
        const load = async () => {
            try {
                if (!chatId || !castId) return;
                const msgs = await getChatMessages(chatId, Number(castId), 'cast');
                setMessages(Array.isArray(msgs) ? msgs : []);
            } catch (e) {
                setFetchError('メッセージの取得に失敗しました');
            } finally {
                setFetching(false);
            }
        };
        load();
    }, [chatId, castId]);

    useEffect(() => {
        getChatById(chatId).then(chat => {
            if (chat && chat.guest) setGuestInfo(chat.guest);
        }).catch(() => setGuestInfo(null));
    }, [chatId]);

    useChatMessages(chatId, (message) => {
        setMessages(prev => {
            const filtered = prev.filter(m => m.id !== message.id);
            return [...filtered, message];
        });
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, fetching]);

    const handleSend = async () => {
        if (!input.trim() || sending || !castId) return;
        if (!isNotificationEnabled('messages')) return;
        setSending(true);
        try {
            const payload: any = { chat_id: chatId, sender_cast_id: Number(castId), message: input.trim() };
            const realMsg = await sendMessage(payload);
            setMessages(prev => [...prev, realMsg]);
            setInput('');
        } catch (e) {
            // noop minimal handling
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white min-h-screen flex flex-col relative">
            {/* Header */}
            <div className="fixed max-w-md mx-auto left-0 right-0 items-center flex px-4 py-3 border-b border-secondary bg-primary h-16">
                <button onClick={onBack} className="mr-2 hover:text-secondary cursor-pointer">
                    <ChevronLeft size={30} />
                </button>
                <img
                    src={guestInfo?.avatar ? getFirstAvatarUrl(guestInfo.avatar) : '/assets/avatar/avatar-1.png'}
                    alt="avatar"
                    className="w-8 h-8 rounded-full mr-2 border border-secondary"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/avatar/avatar-1.png'; }}
                />
                <div className="flex flex-col">
                    <span className="font-bold text-white text-base truncate">{guestInfo?.nickname || 'ゲスト'}</span>
                </div>
            </div>

            {/* Messages */}
            <div className="max-w-md mx-auto w-full flex-1 bg-gradient-to-br from-primary via-primary to-secondary overflow-y-auto px-4 py-4" style={{ marginTop: '4rem',minHeight: 0 }}>
                {fetching ? (
                    <Spinner />
                ) : fetchError ? (
                    <div className="text-center text-red-400 py-10">{fetchError}</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-white py-10">メッセージがありません</div>
                ) : (
                    messages.map((msg, idx) => {
                        const isFromCast = msg.sender_cast_id && !msg.sender_guest_id;
                        const isSent = isFromCast && castId && String(msg.sender_cast_id) === String(castId);
                        return (
                            <React.Fragment key={msg.id || idx}>
                                {msg.created_at && (
                                    <div className="flex justify-center my-2">
                                        <span className="text-xs text-gray-300 bg-black/20 px-3 py-1 rounded-full">
                                            {formatTime(msg.created_at)}
                                        </span>
                                    </div>
                                )}
                                <div className={isSent ? 'flex justify-end mb-4' : 'flex justify-start mb-4'}>
                                    <div className={`${isSent ? 'bg-secondary text-white' : 'bg-white text-black'} rounded-lg px-4 py-2`}>
                                        {msg.message}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-primary border-t border-secondary flex items-center px-4 py-2 z-20">
                <input
                    type="text"
                    className={`flex-1 px-4 py-2 rounded-full border border-secondary text-sm mr-2 ${isNotificationEnabled('messages') ? 'bg-primary text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                    placeholder={isNotificationEnabled('messages') ? 'メッセージを入力...' : 'メッセージ通知が無効です'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={async (e) => { if (e.key === 'Enter') await handleSend(); }}
                    disabled={!isNotificationEnabled('messages')}
                />
                <span className={`cursor-pointer ${isNotificationEnabled('messages') ? 'text-white' : 'text-gray-500'}`}>
                    <Image size={30} />
                </span>
                <button
                    onClick={handleSend}
                    disabled={sending || !input.trim() || !isNotificationEnabled('messages')}
                    className={`ml-2 px-6 py-2 rounded-full text-sm disabled:opacity-50 ${isNotificationEnabled('messages') ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-500 text-gray-300'}`}
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default CastChatScreen;


