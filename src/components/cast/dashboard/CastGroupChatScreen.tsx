import React, { useState, useRef, useEffect } from 'react';
import { Image, Camera, FolderClosed, Gift, ChevronLeft, X, Users, Calendar } from 'lucide-react';
import { sendGroupMessage, getGroupMessages, fetchAllGifts, getGroupParticipants } from '../../../services/api';
import { useUser } from '../../../contexts/UserContext';
import { useGroupMessages } from '../../../hooks/useRealtime';
import dayjs from 'dayjs';
import MessageProposalPage from './MessageProposalPage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Utility function to get the first available avatar from comma-separated string
const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
    if (!avatarString) {
        return '/assets/avatar/female.png';
    }
    
    // Split by comma and get the first non-empty avatar
    const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
    
    if (avatars.length === 0) {
        return '/assets/avatar/female.png';
    }
    
    return `${API_BASE_URL}/${avatars[0]}`;
};

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

interface CastGroupChatScreenProps {
    groupId: number;
    groupName?: string;
    onBack: () => void;
}

const CastGroupChatScreen: React.FC<CastGroupChatScreenProps> = ({ groupId, onBack }) => {
    const { user, refreshUser } = useUser();
    const [showFile, setShowFile] = useState(false);
    const [input, setInput] = useState('');
    const [messageProposal, setMessageProposal] = useState(false);
    const attachBtnRef = useRef<HTMLButtonElement>(null);
    const [giftTab, setGiftTab] = useState<'standard' | 'local' | 'grade' | 'mygift'>('mygift');
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [sendError, setSendError] = useState<string | null>(null);
    const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const IMAGE_BASE_URL = APP_BASE_URL.replace(/\/api$/, '');
    const [gifts, setGifts] = useState<any[]>([]);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [selectedGiftCategory, setSelectedGiftCategory] = useState('standard');
    const [participants, setParticipants] = useState<any[]>([]);
    const [groupInfo, setGroupInfo] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch messages on component mount
    useEffect(() => {
        setFetching(true);
        setFetchError(null);
        const fetchMessages = async () => {
            if (!groupId || isNaN(Number(groupId)) || !user || typeof user.id !== 'number') {
                setMessages([]);
                setFetching(false);
                return;
            }
            try {
                const userId = localStorage.getItem("castId");
                const response = await getGroupMessages(groupId, 'cast', userId ? parseInt(userId) : user.id);
                setMessages(Array.isArray(response.messages) ? response.messages : []);
                setGroupInfo(response.group);
                setFetchError(null);
            } catch (e) {
                setFetchError('メッセージの取得に失敗しました');
            } finally {
                setFetching(false);
            }
        };
        fetchMessages();
    }, [groupId, user]);

    // Fetch participants
    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await getGroupParticipants(groupId);
                setParticipants(response.participants || []);
            } catch (e) {
                console.error('Failed to fetch participants:', e);
            }
        };
        fetchParticipants();
    }, [groupId]);

    // Fetch gifts
    useEffect(() => {
        const fetchGifts = async () => {
            try {
                const giftsData = await fetchAllGifts();
                setGifts(Array.isArray(giftsData) ? giftsData : []);
            } catch (e) {
                console.error('Failed to fetch gifts:', e);
            }
        };
        fetchGifts();
    }, []);

    // Real-time group messages
    useGroupMessages(groupId, (message) => {
        setMessages(prev => [...prev, message]);
    });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() && !attachedFile && !showGiftModal) return;
        if (!user) return;

        setSending(true);
        setSendError(null);

        try {
            const messageData: any = {
                group_id: groupId,
                message: input.trim(),
                sender_cast_id: user.id, // Cast users send as cast
            };

            // Handle file upload
            if (attachedFile) {
                messageData.image = attachedFile;
            }

            // Handle gift
            if (showGiftModal && selectedGiftCategory) {
                const selectedGift = gifts.find(gift => gift.id === selectedGiftCategory);
                if (selectedGift) {
                    messageData.gift_id = selectedGift.id;
                }
            }

            await sendGroupMessage(messageData);

            // Clear input and reset states
            setInput('');
            setAttachedFile(null);
            setImagePreview(null);
            setShowGiftModal(false);
            setShowFile(false);

            // Refresh user points if gift was sent
            if (messageData.gift_id) {
                refreshUser();
            }

        } catch (error: any) {
            setSendError(error.response?.data?.message || 'メッセージの送信に失敗しました');
        } finally {
            setSending(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // const handleGiftSelect = (gift: any) => {
    //     setSelectedGiftCategory(gift.id);
    //     setShowGiftModal(false);
    //     setInput(prev => prev + ` 🎁 ${gift.name}`);
    // };

    const formatTime = (timestamp: string) => {
        return dayjs(timestamp).format('HH:mm');
    };

    const formatDate = (timestamp: string) => {
        const date = dayjs(timestamp);
        const today = dayjs();
        
        if (date.isSame(today, 'day')) {
            return '今日';
        } else if (date.isSame(today.subtract(1, 'day'), 'day')) {
            return '昨日';
        } else {
            return date.format('MM/DD');
        }
    };

    const getSenderName = (message: any) => {
        if (message.guest) {
            return message.guest.nickname || 'ゲスト';
        }
        if (message.cast) {
            return message.cast.nickname || 'キャスト';
        }
        return 'Unknown';
    };

    const getSenderAvatar = (message: any) => {
        if (message.guest) {
            return getFirstAvatarUrl(message.guest.avatar);
        }
        if (message.cast) {
            return getFirstAvatarUrl(message.cast.avatar);
        }
        return '/assets/avatar/female.png';
    };

    if (fetching) {
        return (
            <div className="bg-primary min-h-screen flex items-center justify-center">
                <div className="text-white">読み込み中...</div>
            </div>
        );
    }

    if (messageProposal) {
        return (
            <MessageProposalPage
                chatId={groupId}
                groupInfo={{
                    id: groupId,
                    name: groupInfo?.name || `グループ ${groupId}`,
                    participants: participants,
                    isGroupChat: true
                }}
                onBack={() => setMessageProposal(false)}
                onProposalSend={async (proposal) => {
                    setSending(true);
                    try {
                        const messageData: any = {
                            group_id: groupId,
                            sender_cast_id: user?.id,
                            message: JSON.stringify({ type: 'proposal', ...proposal }),
                        };
                        await sendGroupMessage(messageData);
                    } finally {
                        setSending(false);
                        setMessageProposal(false);
                    }
                }}
            />
        );
    }

    return (
        <div className=" min-h-screen flex flex-col">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-secondary bg-primary sticky top-0 z-10">
                <button onClick={onBack} className="text-white hover:text-secondary">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center">
                    <Users className="w-5 h-5 text-white mr-2" />
                    <span className="text-white font-bold">
                        {groupInfo?.name || `グループ ${groupId}`}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">
                        ({participants.length}人)
                    </span>
                </div>
                <div className="w-6 h-6" />
            </div>

            {/* Messages - Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4" style={{ height: 'calc(100vh - 140px)' }}>
                {fetchError && (
                    <div className="text-red-500 text-center py-4">{fetchError}</div>
                )}
                
                {messages.map((message, index) => {
                    // Improved message ownership determination for cast group chat
                    // Check if message is from the current cast
                    const isOwnMessage = 
                        user && (
                            message.sender_cast_id === user.id ||
                            (message.cast && message.cast.id === user.id)
                        );
                    
                    const showDate = index === 0 || 
                        !dayjs(message.created_at).isSame(dayjs(messages[index - 1]?.created_at), 'day');

                    // Handle proposal messages
                    let proposal: Proposal | null = null;
                    try {
                        const parsed = typeof message.message === 'string' ? JSON.parse(message.message) : null;
                        if (parsed && parsed.type === 'proposal') proposal = parsed;
                    } catch (e) {}
                    
                    if (proposal) {
                        return (
                            <div key={message.id}>
                                {showDate && (
                                    <div className="text-center text-gray-400 text-sm py-2">
                                        {formatDate(message.created_at)}
                                    </div>
                                )}
                                
                                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                                        {!isOwnMessage && (
                                            <div className="flex items-center mb-1">
                                                <img
                                                    src={getSenderAvatar(message)}
                                                    alt="avatar"
                                                    className="w-6 h-6 rounded-full mr-2"
                                                />
                                                <span className="text-white text-xs">
                                                    {getSenderName(message)}
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className={`bg-orange-500 text-white rounded-lg px-4 py-3 max-w-[80%] text-sm shadow-md relative`}>
                                            <div>日程：{proposal.date ? new Date(proposal.date).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}～</div>
                                            <div>人数：{proposal.people?.replace(/名$/, '')}人</div>
                                            <div>時間：{proposal.duration}</div>
                                            <div>消費ポイント：{proposal.totalPoints?.toLocaleString()}P</div>
                                            <div>（延長：{proposal.extensionPoints?.toLocaleString()}P / 15分）</div>
                                        </div>
                                        
                                        <div className={`text-xs mt-1 ${
                                            isOwnMessage ? 'text-blue-100' : 'text-gray-300'
                                        }`}>
                                            {formatTime(message.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={message.id}>
                            {showDate && (
                                <div className="text-center text-gray-400 text-sm py-2">
                                    {formatDate(message.created_at)}
                                </div>
                            )}
                            
                            <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                                    {!isOwnMessage && (
                                        <div className="flex items-center mb-1">
                                            <img
                                                src={getSenderAvatar(message)}
                                                alt="avatar"
                                                className="w-6 h-6 rounded-full mr-2"
                                            />
                                            <span className="text-white text-xs">
                                                {getSenderName(message)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className={`rounded-lg px-3 py-2 ${
                                        isOwnMessage 
                                            ? 'bg-secondary text-white' 
                                            : 'bg-white text-primary'
                                    }`}>
                                        {message.image && (
                                            <img
                                                src={`${IMAGE_BASE_URL}/storage/${message.image}`}
                                                alt="attached"
                                                className="w-64 h-32 object-cover rounded mb-2"
                                            />
                                        )}
                                        
                                        {message.gift && (
                                            <div className="bg-yellow-500 text-black rounded p-2 mb-2">
                                                🎁 {message.gift.name}
                                            </div>
                                        )}
                                        
                                        {message.message && (
                                            <div className="whitespace-pre-wrap">{message.message}</div>
                                        )}
                                        
                                        
                                    </div>
                                    <div className={`text-xs mt-1 ${
                                        isOwnMessage ? 'text-blue-100' : 'text-gray-300'
                                    }`}>
                                        {formatTime(message.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Fixed Input Area */}
            <div className="border-t border-secondary p-4 bg-primary sticky bottom-0 z-10">
                {sendError && (
                    <div className="text-red-500 text-sm mb-2">{sendError}</div>
                )}
                
                <div className="flex items-center space-x-2">
                    <button
                        ref={attachBtnRef}
                        onClick={() => setShowFile(!showFile)}
                        className="text-white p-2"
                    >
                        <FolderClosed className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="メッセージを入力..."
                            className="w-full px-3 py-2 rounded-full border border-secondary bg-primary text-white text-sm"
                            disabled={sending}
                        />
                        
                        {imagePreview && (
                            <div className="absolute -top-20 left-0">
                                <img
                                    src={imagePreview}
                                    alt="preview"
                                    className="w-16 h-16 object-cover rounded"
                                />
                                <button
                                    onClick={() => {
                                        setAttachedFile(null);
                                        setImagePreview(null);
                                    }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <button
                        onClick={() => setMessageProposal(true)}
                        className="text-white p-2"
                    >
                        <Calendar className="w-5 h-5" />
                    </button>
                    
                    <button
                        onClick={handleSend}
                        disabled={sending || (!input.trim() && !attachedFile && !showGiftModal)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm disabled:opacity-50"
                    >
                        {sending ? '送信中...' : '送信'}
                    </button>
                </div>

                {/* File Upload */}
                {showFile && (
                    <div className="mt-2 flex space-x-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center space-x-2 bg-secondary text-white px-3 py-2 rounded text-sm"
                        >
                            <Image className="w-4 h-4" />
                            <span>画像</span>
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center space-x-2 bg-secondary text-white px-3 py-2 rounded text-sm"
                        >
                            <Camera className="w-4 h-4" />
                            <span>カメラ</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CastGroupChatScreen; 