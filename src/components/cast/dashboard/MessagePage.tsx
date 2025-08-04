import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Calendar, Image, Search, Filter} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MessageProposalPage from './MessageProposalPage';
import { sendMessage, getChatMessages,getChatById, getGuestReservations } from '../../../services/api';
import { getCastChats } from '../../../services/api';
import { useChatMessages } from '../../../hooks/useRealtime';
import dayjs from 'dayjs';

const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
interface Message {
    id: string;
    avatar: string;
    name: string;
    lastMessage: string;
    timestamp: Date;
    unread: boolean;
    guestAge?: string; // This now stores birth year from backend
}

interface MessageDetailProps {
    message: Message;
    onBack: () => void;
}
interface Proposal {
    type: string;
    date?: string;
    people?: string;
    duration?: string | number;
    totalPoints?: number;
    extensionPoints?: number;
    reservationId?: number;
    [key: string]: any;
  }

const MessageDetail: React.FC<MessageDetailProps> = ({ message, onBack }) => {
    const navigate = useNavigate();
    const [messageProposal, setMessageProposal] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const IMAGE_BASE_URL = APP_BASE_URL.replace(/\/api$/, '');
    const [guestId, setGuestId] = useState<number | null>(null);
    const [guestReservations, setGuestReservations] = useState<any[]>([]);
    useEffect(() => {
        const fetchMessages = async () => {
            const castIdStr = localStorage.getItem('castId');
            const castId = castIdStr ? Number(castIdStr) : null;
            if (!castId) return;
            const msgs = await getChatMessages(Number(message.id), castId, 'cast');
            setMessages(Array.isArray(msgs) ? msgs : []);
        };
        fetchMessages();
        // Fetch guest_id for this chat
        getChatById(Number(message.id)).then(chat => {
            if (chat && chat.guest_id) setGuestId(chat.guest_id);
        });
    }, [message.id]);

    // Fetch guest reservations only when guestId is available
    useEffect(() => {
        if (guestId == null) return;
        getGuestReservations(guestId).then(setGuestReservations).catch(() => setGuestReservations([]));
    }, [guestId]);

    // Real-time updates
    useChatMessages(message.id, (msg) => {
        setMessages((prev) => {
            // Remove optimistic message if real one matches (by image or message and sender_cast_id)
            // Also check for duplicate messages by ID to prevent duplicates
            const filtered = prev.filter(m => {
                // Remove optimistic messages that match the real message
                if (m.id && m.id.toString().startsWith('optimistic-') &&
                    ((m.image && msg.image && m.image === msg.image) ||
                     (m.message && msg.message && m.message === msg.message)) &&
                    String(m.sender_cast_id) === String(msg.sender_cast_id)) {
                    return false;
                }
                // Remove duplicate messages by ID
                if (m.id === msg.id) {
                    return false;
                }
                return true;
            });
            return [...filtered, msg];
        });
    });

    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachedFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarClick = () => {
        if (guestId) {
            navigate(`/guest/${guestId}`);
        }
    };

    if (messageProposal) return <MessageProposalPage 
        chatId={Number(message.id)}
        onBack={() => setMessageProposal(false)}
        onProposalSend={async (proposal) => {
            setSending(true);
            try {
                const castIdStr = localStorage.getItem('castId');
                const castId = castIdStr ? Number(castIdStr) : null;
                if (!castId) return;
                const payload: any = {
                    chat_id: Number(message.id),
                    sender_cast_id: castId,
                    message: JSON.stringify({ type: 'proposal', ...proposal }),
                };
                const sent = await sendMessage(payload);
                setMessages((prev) => [...prev, sent]);
            } finally {
                setSending(false);
                setMessageProposal(false);
            }
        }}
    />;

    return (
        <div className="max-w-md min-h-screen bg-gradient-to-br from-primary via-primary to-secondary relative">
            {/* Header (fixed) */}  
            <div className="fixed h-16 flex items-center px-4 py-3 border-b border-secondary bg-primary">
                <button onClick={onBack} className="mr-2">
                    <ChevronLeft className="text-white" size={24} />
                </button>
                <div className="flex items-center">
                    <img 
                        src={`${message.avatar}`} 
                        alt={message.name} 
                        className="w-8 h-8 rounded-full mr-2 cursor-pointer hover:opacity-80 transition-opacity" 
                        onClick={handleAvatarClick}
                    />
                    <span className="text-lg font-bold text-white">{message.name}</span>
                </div>
            </div>

            {/* Messages area (scrollable between header and input) */}
            <div
                className="overflow-y-auto px-4 py-4"
                style={{
                    marginTop: '4rem', // header height (h-16 = 4rem)
                    marginBottom: '5.5rem', // input area height
                    minHeight: 0,
                }}
            >
                {(messages || []).map((msg, idx) => {
                    let proposal: Proposal | null = null;
                    try {
                        const parsed = typeof msg.message === 'string' ? JSON.parse(msg.message) : null;
                        if (parsed && parsed.type === 'proposal') proposal = parsed;
                    } catch (e) {}
                    if (proposal) {
                        // Check if proposal is accepted by matching guest_id and scheduled_at
                        const isAccepted = guestReservations.some(res =>
                            res.guest_id === guestId &&
                            dayjs(res.scheduled_at).isSame(proposal?.date)
                        );
                        return (
                            <div key={msg.id || idx} className="flex justify-end mb-4">
                                <div className={`bg-orange-500 text-white rounded-lg px-4 py-3 max-w-[80%] text-sm shadow-md relative ${isAccepted ? 'opacity-50' : ''}`}>
                                    <div>日程：{proposal.date ? new Date(proposal.date).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}～</div>
                                    <div>人数：{proposal.people?.replace(/名$/, '')}人</div>
                                    <div>時間：{proposal.duration}</div>
                                    <div>消費ポイント：{proposal.totalPoints?.toLocaleString()}P</div>
                                    <div>（延長：{proposal.extensionPoints?.toLocaleString()}P / 15分）</div>
                                    {isAccepted && (
                                        <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">承認済み</span>
                                    )}
                                </div>
                            </div>
                        );
                    }
                    const castIdStr = localStorage.getItem('castId');
                    const castId = castIdStr ? Number(castIdStr) : null;
                    const isSent = String(msg.sender_cast_id) === String(castId);
                    return (
                        <div key={msg.id || idx} className={isSent ? 'flex justify-end mb-4' : 'flex justify-start mb-4'}>
                            <div className="flex flex-col">
                                <div className={isSent ? 'w-full bg-secondary text-white rounded-lg px-4 py-2' : 'w-full bg-white text-black rounded-lg px-4 py-2'}>
                                    {/* Gift display */}
                                    {msg.gift_id && msg.gift && (
                                        <div className="flex items-center mb-1">
                                            <span className="text-3xl mr-2">
                                                {msg.gift.icon}
                                            </span>
                                            <span className="font-bold">{msg.gift.name}</span>
                                            <span className="ml-2 text-xs text-primary font-bold">{msg.gift.points}P</span>
                                        </div>
                                    )}
                                    {msg.image && (
                                        <img
                                            src={
                                                msg.image.startsWith('http')
                                                    ? msg.image
                                                    : `${IMAGE_BASE_URL}/storage/${msg.image}`
                                            }
                                            alt="sent"
                                            className="max-w-full max-h-40 rounded mb-2"
                                        />
                                    )}
                                    {msg.message}
                                </div>
                                <div className={`text-xs text-gray-400 mt-1 ${isSent ? 'text-right' : 'text-left'}`}>
                                    {msg.created_at ? dayjs(msg.created_at).format('YYYY.MM.DD HH:mm:ss') : ''}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input area (fixed at bottom) */}
            <div className="fixed bottom-0 w-full max-w-md flex flex-col px-4 py-2 border-t border-secondary bg-primary" style={{height: '5.5rem'}}>
                <div className="flex items-center mb-2">
                    <input
                        className="flex-1 border-none outline-none text-lg bg-primary text-white placeholder-red-400"
                        placeholder="メッセージを入力..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter' && (newMessage.trim() || attachedFile) && !sending) {
                                setSending(true);
                                try {
                                    const castIdStr = localStorage.getItem('castId');
                                    const castId = castIdStr ? Number(castIdStr) : null;
                                    if (!castId) return;
                                    const payload: any = {
                                        chat_id: Number(message.id),
                                        sender_cast_id: castId,
                                    };
                                    if (newMessage.trim()) payload.message = newMessage.trim();
                                    if (attachedFile) payload.image = attachedFile;

                                    // Optimistically add the message (text or image)
                                    const optimisticId = `optimistic-${Date.now()}`;
                                    // setMessages(prev => [...prev, optimisticMsg]);

                                    // Send to backend
                                    const realMsg = await sendMessage(payload);

                                    // Replace optimistic message with real one
                                    setMessages(prev => prev.map(m => m.id === optimisticId ? realMsg : m));

                                    setNewMessage('');
                                    setAttachedFile(null);
                                    setImagePreview(null);
                                } finally {
                                    setSending(false);
                                }
                            }
                        }}
                    />
                    <span className="text-white ml-2 cursor-pointer" onClick={handleImageButtonClick}>
                        <Image size={30}/>
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                    <span className="text-white ml-2 cursor-pointer" onClick={() => setMessageProposal(true)}>
                        <Calendar size={30}/>
                    </span>
                </div>
                {/* Image preview */}
                {imagePreview && (
                    <div className="flex items-center mt-2">
                        <img src={imagePreview} alt="preview" className="h-20 rounded border border-gray-300" />
                        <button
                            type="button"
                            className="ml-2 text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center"
                            onClick={() => { setAttachedFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
};

interface MessagePageProps {
    setIsMessageDetailOpen?: (open: boolean) => void;
}

const MessagePage: React.FC<MessagePageProps> = ({ setIsMessageDetailOpen }) => {
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterNickname, setFilterNickname] = useState('');
    const [filterAge, setFilterAge] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (setIsMessageDetailOpen) setIsMessageDetailOpen(!!selectedMessage);
    }, [selectedMessage, setIsMessageDetailOpen]);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const castIdStr = localStorage.getItem('castId');
                const castId = castIdStr ? Number(castIdStr) : null;
                if (!castId) {
                    setMessages([]);
                    setLoading(false);
                    return;
                }
                const chats = await getCastChats(castId);
                console.log('Raw chats data from backend:', chats);
                // Map chat data to Message interface
                const mapped = (chats || []).map((chat: any) => ({
                    id: chat.id,
                    avatar: `${APP_BASE_URL}/${chat.avatar}` || '/assets/avatar/1.jpg',
                    name: chat.guest_nickname || `ゲスト ${chat.guest_id}`,
                    lastMessage: chat.last_message || '',
                    timestamp: chat.updated_at ? new Date(chat.updated_at) : new Date(),
                    unread: !!chat.unread,
                    guestAge: chat.guest_age || '', // Backend returns 'guest_age' but it contains birth year
                }));
                setMessages(mapped);
            } catch (err) {
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, []);

    // Filter messages based on nickname and age
    const filteredMessages = messages.filter(message => {
        const nicknameMatch = !filterNickname || 
            message.name.toLowerCase().includes(filterNickname.toLowerCase());
        
        // Calculate age from birth year if available
        let guestAge = null;
        if (message.guestAge) {
            const currentYear = new Date().getFullYear();
            guestAge = currentYear - Number(message.guestAge);
            console.log(`Guest: ${message.name}, Birth Year: ${message.guestAge}, Calculated Age: ${guestAge}`);
        }
        
        const ageMatch = !filterAge || 
            (guestAge && guestAge.toString().includes(filterAge));
        
        return nicknameMatch && ageMatch;
    });

    if (selectedMessage) {
        return <MessageDetail message={selectedMessage} onBack={() => setSelectedMessage(null)} />;
    }

    return (
        <div className="max-w-md min-h-screen bg-gradient-to-br from-primary via-primary to-secondary pb-20">
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-primary z-20 border-b border-secondary">
                <h1 className="text-lg font-bold text-center py-3 text-white">メッセージ</h1>
            </div>

            {/* Filter Bar - Fixed under header */}
            <div className="fixed top-16 left-0 right-0 max-w-md mx-auto bg-primary z-10 border-b border-secondary">
                <div className="flex items-center px-4 py-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="ニックネームで検索..."
                            value={filterNickname}
                            onChange={(e) => setFilterNickname(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-secondary text-white rounded-lg border-none outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                        />
                        {filterNickname && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                    {filteredMessages.length}/{messages.length}
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`ml-2 p-2 rounded-lg transition-colors ${
                            showFilters || filterAge ? 'bg-secondary text-white' : 'bg-secondary/50 text-gray-400'
                        }`}
                        title="フィルター"
                    >
                        <Filter size={20} />
                    </button>
                </div>
                
                {/* Age Filter - Expandable */}
                {showFilters && (
                    <div className="px-4 pb-2">
                        <div className="flex items-center">
                            <input
                                type="text"
                                 placeholder="年齢で検索 (例: 20, 30)"
                                value={filterAge}
                                onChange={(e) => setFilterAge(e.target.value)}
                                className="flex-1 px-3 py-2 bg-secondary text-white rounded-lg border-none outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                            />
                            {(filterNickname || filterAge) && (
                                <button
                                    onClick={() => {
                                        setFilterNickname('');
                                        setFilterAge('');
                                    }}
                                    className="ml-2 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                                    title="フィルターをクリア"
                                >
                                    クリア
                                </button>
                            )}
                        </div>
                        {filterAge && (
                            <div className="mt-2 text-xs text-gray-400">
                                年齢フィルター: {filterAge} ({filteredMessages.length}件)
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content with top margin to account for fixed header and filter bar */}
            <div className="pt-32">
                {loading ? (
                    <div className="text-center text-white py-10">ローディング...</div>
                ) : (
                    <div className="divide-y divide-secondary">
                        {/* Show total count when no filters */}
                        {!filterNickname && !filterAge && messages.length > 0 && (
                            <div className="px-4 py-2 text-xs text-gray-400 text-center">
                                全{messages.length}件のメッセージ
                            </div>
                        )}
                        
                        {filteredMessages.length === 0 ? (
                            <div className="text-center text-gray-400 py-10">
                                {messages.length === 0 ? 'メッセージがありません' : '検索結果がありません'}
                                {(filterNickname || filterAge) && (
                                    <div className="mt-2 text-sm">
                                        フィルターを変更してください
                                    </div>
                                )}
                            </div>
                        ) : (
                            filteredMessages.map((message) => (
                                <div
                                    key={message.id}
                                    className="flex items-center p-4 cursor-pointer hover:bg-secondary/10"
                                    onClick={() => {
                                        setSelectedMessage(message);
                                        setMessages(prevMsgs => prevMsgs.map(m => m.id === message.id ? { ...m, unread: false } : m));
                                    }}
                                >
                                    <img src={message.avatar} alt={message.name} className="w-12 h-12 rounded-full mr-4" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-white">{message.name}</span>
                                            <span className="text-xs text-gray-400">
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            {/* <p className="text-sm text-gray-300 truncate">{message.lastMessage}</p> */}
                                            {message.unread && (
                                                <span className="ml-2 bg-secondary text-white text-xs font-bold rounded-full px-2 py-0.5">
                                                    NEW
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagePage;
