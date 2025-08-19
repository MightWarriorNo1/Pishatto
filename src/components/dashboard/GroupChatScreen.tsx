import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Image, Camera, FolderClosed, Gift, ChevronLeft, X, Users, Calendar, Clock, Check, Send } from 'lucide-react';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { sendGroupMessage, getGroupMessages, fetchAllGifts, getGroupParticipants, updateReservation } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { useNotificationSettings } from '../../contexts/NotificationSettingsContext';
import { useGroupMessages } from '../../hooks/useRealtime';
import dayjs from 'dayjs';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

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

dayjs.extend(utc);
dayjs.extend(timezone);

const userTz=dayjs.tz.guess();


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

interface GroupChatScreenProps {
    groupId: number;
    groupName?: string;
    onBack: () => void;
}

const GroupChatScreen: React.FC<GroupChatScreenProps> = ({ groupId, onBack }) => {
    const { user, refreshUser } = useUser();
    const { isNotificationEnabled } = useNotificationSettings();
    const [showFile, setShowFile] = useState(false);
    const [input, setInput] = useState('');
    const attachBtnRef = useRef<HTMLButtonElement>(null);
    const [selectedGift, setSelectedGift] = useState<any>(null);
    const [showGiftDetailModal, setShowGiftDetailModal] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [sendError, setSendError] = useState<string | null>(null);
    const [gifts, setGifts] = useState<any[]>([]);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [selectedGiftCategory, setSelectedGiftCategory] = useState('standard');
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<any>(null);
    const [proposalMsgId, setProposalMsgId] = useState<number | null>(null);
    const [proposalActionLoading, setProposalActionLoading] = useState(false);
    const [proposalActionError, setProposalActionError] = useState<string | null>(null);
    const [acceptedProposals, setAcceptedProposals] = useState<number[]>([]);
    const [participants, setParticipants] = useState<any[]>([]);
    const [groupInfo, setGroupInfo] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);
    // Mention and target cast for gifts
    const [mentionOpen, setMentionOpen] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [selectedCastTarget, setSelectedCastTarget] = useState<{ id: number; nickname: string } | null>(null);
    
    
    // Camera functionality
    const [showCamera, setShowCamera] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

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
                const response = await getGroupMessages(groupId, 'guest', user.id);
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
    const handleRealtimeMessage = useCallback((message: any) => {
        setMessages(prev => {
            const messageExists = prev.some(m => m.id === message.id);
            if (messageExists) return prev;
            return [...prev, message];
        });
    }, []);
    useGroupMessages(groupId, handleRealtimeMessage);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() && !attachedFile && !showGiftModal) return;
        if (!user) return;

        // Check if message notifications are enabled
        const isMessageNotificationEnabled = isNotificationEnabled('messages');
        
        if (!isMessageNotificationEnabled) {
            setSendError('メッセージ通知が無効になっています。設定で有効にしてください。');
            return;
        }

        setSending(true);
        setSendError(null);

        try {
            
            const messageData: any = {
                group_id: groupId,
                message: input.trim(),
            };

            // Add sender information based on user type (assuming guest for this component)
            messageData.sender_guest_id = user.id;

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
            
            // Send the message
            const response = await sendGroupMessage(messageData);
            
            // Immediately add the sent message returned from API (has real id)
            if (response) {
                setMessages(prev => {
                    const exists = prev.some(m => m.id === response.id);
                    return exists ? prev : [...prev, response];
                });
            } else {
                setTimeout(async () => {
                    try {
                        const response = await getGroupMessages(groupId, 'guest', user.id);
                        setMessages(Array.isArray(response.messages) ? response.messages : []);
                    } catch (e) {
                        console.error('Failed to refresh messages:', e);
                    }
                }, 1000);
            }

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


    const popoverRef = useRef<HTMLDivElement>(null);
    const fileSelectInputRef = useRef<HTMLInputElement>(null);

    // Camera functionality
    const handleOpenCamera = async () => {
        setCameraError('');
        setShowCamera(true);
        setShowFile(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (err: any) {
            setCameraError('カメラを利用できません。ブラウザの設定やアクセス権限を確認してください。');
        }
    };

    const handleTakePhoto = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        const width = video.videoWidth;
        const height = video.videoHeight;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, width, height);
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
                setAttachedFile(file);
                const reader = new FileReader();
                reader.onload = (ev) => setImagePreview(ev.target?.result as string);
                reader.readAsDataURL(file);
                setShowCamera(false);
                // Stop the stream
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((track) => track.stop());
                    streamRef.current = null;
                }
            }
        }, 'image/jpeg');
    };

    const handleCloseCamera = () => {
        setShowCamera(false);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    const formatTime = (timestamp: string) => {
        // Use mm for minutes, not MM (month)
        return dayjs.utc(timestamp).tz(userTz).format('YYYY-MM-DD HH:mm');
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

    return (
        <div className="min-h-screen flex flex-col">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-secondary bg-primary sticky top-0 z-10">
                <button onClick={onBack} className="text-white">
                    <ChevronLeft className="w-6 h-6 hover:text-secondary cursor-pointer" />
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
            </div>

            {/* Messages - Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4" style={{ height: 'calc(100vh - 140px)' }}>
                {fetchError && (
                    <div className="text-red-500 text-center py-4">{fetchError}</div>
                )}
                
                {messages.map((message, index) => {
                    const isOwnMessage = 
                        user && (
                            message.sender_guest_id === user.id ||
                            (message.guest && message.guest.id === user.id)
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
                        const isAccepted = acceptedProposals.includes(message.id);
                        return (
                            <div key={message.id}>
                                {showDate && (
                                    <div className="text-center text-gray-400 text-sm py-2">
                                        {formatDate(message.created_at)}
                                    </div>
                                )}
                                
                                <div 
                                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isAccepted ? '' : 'cursor-pointer'}`}
                                    onClick={isAccepted ? undefined : () => { 
                                        setShowProposalModal(true); 
                                        setSelectedProposal(proposal); 
                                        setProposalMsgId(message.id); 
                                    }}
                                    style={isAccepted ? { opacity: 0.6, pointerEvents: 'none' } : {}}
                                >
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
                                            {isAccepted && (
                                                <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">承認済み</span>
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
                                        {(() => {
                                            if (!message.image) return null;
                                            if (typeof message.image !== 'string') return null;
                                            const isAbsolute = message.image.startsWith('http') || message.image.startsWith('data:') || message.image.startsWith('blob:');
                                            const src = isAbsolute ? message.image : `${IMAGE_BASE_URL}/storage/${message.image}`;
                                            return (
                                                <img
                                                    src={src}
                                                    alt="attached"
                                                    className="w-64 h-32 rounded mb-2"
                                                />
                                            );
                                        })()}
                                        
                                        {message.gift && (
                                            <div className="bg-yellow-500 text-black rounded p-2 mb-2">
                                                🎁 {message.gift.name}
                                                <div className="text-xs mt-1 text-center">
                                                    {message.gift.points}P
                                                </div>
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
                    
                    <button
                        onClick={() => {
                            if (!selectedCastTarget) {
                                setSendError('まず @ で贈る相手（キャスト）を選択してください');
                                return;
                            }
                            setShowGiftModal(!showGiftModal);
                        }}
                        className="text-white p-2"
                    >
                        <Gift className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            ref={textInputRef}
                            value={input}
                            onChange={(e) => {
                                const val = e.target.value;
                                setInput(val);
                                const cursor = (e.target as HTMLInputElement).selectionStart ?? val.length;
                                const beforeCaret = val.slice(0, cursor);
                                const match = beforeCaret.match(/(^|\s)@(\S*)$/);
                                if (match) {
                                    setMentionOpen(true);
                                    setMentionQuery((match[2] || '').toLowerCase());
                                } else {
                                    setMentionOpen(false);
                                    setMentionQuery('');
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && isNotificationEnabled('messages')) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={isNotificationEnabled('messages') ? "メッセージを入力..." : "メッセージ通知が無効です"}
                            className={`w-full px-3 py-2 rounded-full border border-secondary text-sm ${
                                isNotificationEnabled('messages') 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={sending || !isNotificationEnabled('messages')}
                        />
                        
                        {/* Mention dropdown */}
                        {mentionOpen && participants.some((p) => p.type === 'cast') && (
                            <div className="absolute left-0 right-0 bottom-full mb-1 bg-white rounded-md shadow-lg max-h-48 overflow-y-auto z-20">
                                {participants
                                    .filter((p: any) => p.type === 'cast')
                                    .filter((p: any) => !mentionQuery || (p.nickname || '').toLowerCase().includes(mentionQuery))
                                    .map((cast: any) => (
                                        <button
                                            key={`mention-${cast.id}`}
                                            type="button"
                                            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center"
                                            onClick={() => {
                                                const replaced = input.replace(/(^|\s)@(\S*)$/, (_m, prefix) => `${prefix}@${cast.nickname} `);
                                                setInput(replaced.trimStart());
                                                setMentionOpen(false);
                                                setMentionQuery('');
                                                setSelectedCastTarget({ id: cast.id, nickname: cast.nickname });
                                                setTimeout(() => textInputRef.current?.focus(), 0);
                                            }}
                                        >
                                            <img src={getFirstAvatarUrl(cast.avatar)} alt="avatar" className="w-6 h-6 rounded-full mr-2" />
                                            <span className="text-gray-800">{cast.nickname}</span>
                                        </button>
                                    ))}
                                {participants.filter((p: any) => p.type === 'cast').filter((p: any) => !mentionQuery || (p.nickname || '').toLowerCase().includes(mentionQuery)).length === 0 && (
                                    <div className="px-3 py-2 text-sm text-gray-500">該当するキャストがいません</div>
                                )}
                            </div>
                        )}

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
                        onClick={handleSend}
                        disabled={sending || (!input.trim() && !attachedFile && !showGiftModal) || !isNotificationEnabled('messages')}
                        className={`px-4 py-2 rounded-full text-sm disabled:opacity-50 ${
                            isNotificationEnabled('messages') 
                                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                : 'bg-gray-500 text-gray-300'
                        }`}
                    >
                        {sending ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                <span>送信中...</span>
                            </div>
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Hidden file inputs for uploads */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                            setSendError('画像ファイルを選択してください');
                            e.target.value = '';
                            return;
                        }
                        setAttachedFile(file);
                        const reader = new FileReader();
                        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
                        reader.readAsDataURL(file);
                        setShowFile(false);
                    }}
                />
                <input
                    type="file"
                    accept="image/*"
                    ref={fileSelectInputRef}
                    className="hidden"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                            setSendError('画像ファイルを選択してください');
                            e.target.value = '';
                            return;
                        }
                        setAttachedFile(file);
                        const reader = new FileReader();
                        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
                        reader.readAsDataURL(file);
                        setShowFile(false);
                    }}
                />

                {showFile && (
                        <div
                            ref={popoverRef}
                            className="absolute bottom-full mb-1  w-80 bg-primary rounded-xl shadow-lg border border-secondary z-50 animate-fade-in"
                        >
                            <button
                                className="flex items-center justify-between w-full px-4 py-3 pt-6 hover:bg-secondary text-white text-base border-b border-secondary"
                                onClick={() => {
                                    setShowFile(false);
                                    fileInputRef.current?.click();
                                }}
                            >
                                <span>写真ライブラリ</span>
                                <Image />
                            </button>
                            <button 
                                className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary text-white text-base border-b border-secondary"
                                onClick={handleOpenCamera}
                            >
                                <span>写真またはビデオを撮る</span>
                                <Camera />
                            </button>
                            <button 
                                className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary text-white text-base"
                                onClick={() => {
                                    setShowFile(false);
                                    fileSelectInputRef.current?.click();
                                }}
                            >
                                <span>ファイルを選択</span>
                                <FolderClosed />
                            </button>
                        </div>
                    )}

                {showGiftModal && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-60">
                        <div className="fixed left-0 right-0 bottom-0 bg-primary rounded-t-2xl shadow-lg p-6 flex flex-col items-center border-t border-secondary w-full max-w-md mx-auto animate-slide-up">
                            <h2 className="font-bold text-lg mb-2 text-white">ギフトを選択</h2>
                            {selectedCastTarget && (
                                <div className="mb-2 text-white text-sm">宛先：<span className="font-bold">@{selectedCastTarget.nickname}</span></div>
                            )}
                            <div className="flex gap-2 mb-4">
                                {['standard', 'regional', 'grade', 'mygift'].map(cat => (
                                    <button
                                        key={cat}
                                        className={`px-3 py-1 rounded-full font-bold text-sm ${selectedGiftCategory === cat ? 'bg-secondary text-white' : 'bg-primary text-white border border-secondary'}`}
                                        onClick={() => setSelectedGiftCategory(cat)}
                                    >
                                        {cat === 'standard' ? '定番' : cat === 'regional' ? 'ご当地' : cat === 'grade' ? 'グレード' : 'Myギフト'}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                {gifts.filter(g => g.category === selectedGiftCategory).map(gift => {
                                    const hasEnoughPoints = user && user.points && user.points >= gift.points;
                                    return (
                                    <button
                                        key={gift.id}
                                        className={`flex flex-col items-center justify-center rounded-lg p-2 transition ${
                                            hasEnoughPoints 
                                                ? 'bg-secondary text-white hover:bg-red-700' 
                                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        }`}
                                        onClick={() => {
                                            if (!hasEnoughPoints) return;
                                            setSelectedGift(gift);
                                            setShowGiftDetailModal(true);
                                        }}
                                    >
                                        <span className="text-3xl mb-1">
                                            {gift.icon}
                                        </span>
                                        <span className="text-xs">{gift.name}</span>
                                        <span className="text-xs text-yellow-300 font-bold">{gift.points}P</span>
                                    </button>
                                    );
                                })}
                            </div>
                            <button className="text-white mt-2 hover:text-red-700 transition-all duration-200 font-medium" onClick={() => setShowGiftModal(false)}>閉じる</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Proposal Modal */}
            {showProposalModal && selectedProposal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">予約変更の提案</h3>
                                    <p className="text-sm text-gray-500">新しい日程と人数の提案です</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowProposalModal(false); setSelectedProposal(null); setProposalMsgId(null); }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Proposal Details */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 mb-6 shadow-lg">
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span className="font-medium">日程：</span>
                                    <span className="ml-2">
                                        {selectedProposal.date ? new Date(selectedProposal.date).toLocaleString('ja-JP', { 
                                            year: 'numeric', 
                                            month: '2-digit', 
                                            day: '2-digit', 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        }) : ''}～
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    <span className="font-medium">人数：</span>
                                    <span className="ml-2">{selectedProposal.people?.replace(/名$/, '')}人</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span className="font-medium">時間：</span>
                                    <span className="ml-2">{selectedProposal.duration}</span>
                                </div>
                                <div className="flex items-center">
                                    <Gift className="w-4 h-4 mr-2" />
                                    <span className="font-medium">消費ポイント：</span>
                                    <span className="ml-2">{selectedProposal.totalPoints?.toLocaleString()}P</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-orange-200 text-sm">（延長：{selectedProposal.extensionPoints?.toLocaleString()}P / 15分）</span>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {proposalActionError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                <div className="flex items-center">
                                    <X className="w-4 h-4 text-red-500 mr-2" />
                                    <span className="text-red-700 text-sm">{proposalActionError}</span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                disabled={proposalActionLoading}
                                onClick={async () => {
                                    setProposalActionLoading(true);
                                    setProposalActionError(null);
                                    try {
                                        // Get the group information to find the reservation ID
                                        const groupResponse = await getGroupParticipants(groupId);
                                        const reservationId = groupResponse.group?.reservation_id;
                                        
                                        if (!reservationId) {
                                            throw new Error('予約情報が見つかりません');
                                        }

                                        // Update the reservation with the proposal data
                                        await updateReservation(reservationId, {
                                            scheduled_at: selectedProposal.date ? new Date(selectedProposal.date).toISOString() : undefined,
                                            duration: selectedProposal.duration ? parseInt(selectedProposal.duration as string, 10) : undefined,
                                        });
                                        
                                        // Mark as accepted in local state
                                        if (proposalMsgId !== null && typeof proposalMsgId === 'number') {
                                            setAcceptedProposals(prev => prev.includes(proposalMsgId) ? prev : [...prev, proposalMsgId]);
                                        }
                                        
                                        setShowProposalModal(false);
                                        setSelectedProposal(null);
                                        setProposalMsgId(null);
                                    } catch (e: any) {
                                        setProposalActionError(e.message || '予約の更新に失敗しました');
                                    } finally {
                                        setProposalActionLoading(false);
                                    }
                                }}
                            >
                                {proposalActionLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        処理中...
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <Check className="w-4 h-4 mr-2" />
                                        承認
                                    </div>
                                )}
                            </button>
                            <button
                                className="flex-1 px-4 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-bold transition-colors"
                                onClick={() => { setShowProposalModal(false); setSelectedProposal(null); setProposalMsgId(null); }}
                            >
                                <div className="flex items-center justify-center">
                                    <X className="w-4 h-4 mr-2" />
                                    拒否
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showGiftDetailModal && selectedGift && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-primary rounded-2xl shadow-lg p-6 flex flex-col items-center min-w-[320px] max-w-[90vw]">
                        <h2 className="font-bold text-lg mb-4 text-white">ギフト詳細</h2>
                        {selectedCastTarget && (
                            <div className="text-white mb-2 text-sm">宛先：<span className="font-bold">@{selectedCastTarget.nickname}</span></div>
                        )}
                        <div className="flex flex-col items-center mb-4">
                            <span className="text-5xl mb-2">{selectedGift.icon}</span>
                            <span className="text-lg font-bold text-white mb-1">{selectedGift.name}</span>
                            <span className="text-yellow-300 font-bold mb-2">{selectedGift.points}P</span>
                            <span className="text-white text-sm whitespace-pre-line mb-2" style={{maxWidth: 320, textAlign: 'center'}}>{selectedGift.description || '説明はありません'}</span>
                        </div>
                        <div className="flex gap-4">
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded font-bold disabled:opacity-50"
                                disabled={sending || !user || (user.points ?? 0) < selectedGift.points}
                                onClick={async () => {
                                    if (!user || (user.points ?? 0) < selectedGift.points || !selectedCastTarget) return;
                                    setSending(true);
                                    setSendError(null);
                                    try {
                                        const payload: any = {
                                            group_id: groupId,
                                            sender_guest_id: user.id,
                                            gift_id: selectedGift.id,
                                            receiver_cast_id: selectedCastTarget.id,
                                            message: input.trim() || `@${selectedCastTarget.nickname}`,
                                        };
                                        const sent = await sendGroupMessage(payload);
                                        let giftObj = sent.gift;
                                        if (!giftObj) {
                                            giftObj = gifts.find((g: any) => g.id === selectedGift.id) || selectedGift;
                                            sent.gift = {
                                                id: giftObj.id,
                                                name: giftObj.name || giftObj.label,
                                                icon: giftObj.icon,
                                                points: giftObj.points,
                                                description: giftObj.description
                                            };
                                        }
                                        setMessages((prev) => [...prev, sent]);
                                        refreshUser();
                                        setShowGiftDetailModal(false);
                                        setSelectedGift(null);
                                        setShowGiftModal(false);
                                    } catch (e: any) {
                                        setSendError('ギフトの送信に失敗しました');
                                    } finally {
                                        setSending(false);
                                    }
                                }}
                            >
                                送信
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-400 text-white rounded font-bold"
                                onClick={() => { setShowGiftDetailModal(false); setSelectedGift(null); }}
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
                    <div className="bg-primary p-4 rounded-lg flex flex-col items-center min-w-[420px] max-w-[420px]">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-64 h-64 rounded-md bg-black"
                        />
                        {cameraError && (
                            <div className="text-red-400 mt-2 text-center">{cameraError}</div>
                        )}
                        <div className="flex mt-4 space-x-4">
                            <button
                                onClick={handleTakePhoto}
                                className="bg-secondary text-white px-4 py-2 rounded-md"
                                disabled={!!cameraError}
                            >
                                撮影
                            </button>
                            <button
                                onClick={handleCloseCamera}
                                className="bg-gray-400 text-white px-4 py-2 rounded-md"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupChatScreen; 