import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Camera, FolderClosed, Gift, ChevronLeft, X, Send } from 'lucide-react';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { sendMessage, getChatMessages, fetchAllGifts, updateReservation, getChatById, getGuestReservations } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { useNotificationSettings } from '../../contexts/NotificationSettingsContext';
import { useChatMessages } from '../../hooks/useRealtime';
import dayjs from 'dayjs';
import Spinner from '../ui/Spinner';

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

dayjs.extend(utc);
dayjs.extend(timezone);

const userTz=dayjs.tz.guess();
interface ChatScreenProps {
    chatId: number;
    onBack: () => void;
}

// Add Proposal type for clarity
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




const ChatScreen: React.FC<ChatScreenProps> = ({ chatId, onBack }) => {
    const { user, refreshUser } = useUser();
    const navigate = useNavigate();
    
    // Debug user state
    useEffect(() => {
        console.log('User state changed:', { user, userId: user?.id, chatId, userLoaded: !!user });
    }, [user, chatId]);
    
    // Check if user is fully loaded
    const isUserLoaded = user && typeof user.id === 'number';
    const { isNotificationEnabled } = useNotificationSettings();
    const [showGift, setShowGift] = useState(false);
    const [showFile, setShowFile] = useState(false);
    const [input, setInput] = useState('');
    const [giftTab, setGiftTab] = useState<'standard' | 'local' | 'grade' | 'mygift'>('mygift');
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileSelectInputRef = useRef<HTMLInputElement>(null);
    const [sending, setSending] = useState(false);
    const [localMessages] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [sendError, setSendError] = useState<string | null>(null);
    const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const IMAGE_BASE_URL = APP_BASE_URL.replace(/\/api$/, '');
    const [gifts, setGifts] = useState<any[]>([]);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [selectedGiftCategory, setSelectedGiftCategory] = useState('standard');
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<any>(null);
    const [proposalMsgId, setProposalMsgId] = useState<number | null>(null);
    const [proposalActionLoading, setProposalActionLoading] = useState(false);
    const [proposalActionError, setProposalActionError] = useState<string | null>(null);
    const [acceptedProposals, setAcceptedProposals] = useState<number[]>([]);
    const [reservationId, setReservationId] = useState<number | null>(null);
    const [guestReservations, setGuestReservations] = useState<any[]>([]);
    const [castInfo, setCastInfo] = useState<any>(null);
    const [castLoading, setCastLoading] = useState(true);
    const [selectedGift, setSelectedGift] = useState<any>(null);
    const [showGiftDetailModal, setShowGiftDetailModal] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Camera functionality
    const [showCamera, setShowCamera] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    /*eslint-disable*/
    useEffect(() => {
        setFetching(true);
        setFetchError(null);
        const fetchMessages = async () => {
            console.log('Fetching messages:', { chatId, userId: user?.id, user });
            if (!chatId || isNaN(Number(chatId))) {
                console.log('Invalid chatId, skipping fetch');
                setMessages([]);
                setFetching(false);
                return;
            }
            
            if (!isUserLoaded) {
                console.log('User not fully loaded yet, skipping fetch');
                setMessages([]);
                setFetching(false);
                return;
            }
            try {
                console.log('Making API call to getChatMessages with:', { chatId, userId: user.id, userType: 'guest' });
                const msgs = await getChatMessages(chatId, user.id, 'guest');
                console.log('Messages fetched:', msgs);
                setMessages(Array.isArray(msgs) ? msgs : []);
                setFetchError(null);
            } catch (e: any) {
                console.error('Error fetching messages:', e);
                if (e.response) {
                    console.error('API Error response:', e.response.data);
                    setFetchError(`メッセージの取得に失敗しました: ${e.response.status} ${e.response.statusText}`);
                } else if (e.request) {
                    console.error('Network error:', e.request);
                    setFetchError('ネットワークエラーが発生しました');
                } else {
                    console.error('Other error:', e.message);
                    setFetchError('メッセージの取得に失敗しました');
                }
            } finally {
                setFetching(false);
            }
        };
        fetchMessages();
    }, [chatId, user, isUserLoaded]);

    useEffect(() => {
        // Fetch reservation_id and cast information for this chat
        setCastLoading(true);
        getChatById(chatId).then(chat => {
            console.log('Chat info fetched:', chat);
            if (chat && chat.reservation_id) setReservationId(chat.reservation_id);
            if (chat && chat.cast) setCastInfo(chat.cast);
        }).catch((error: any) => {
            console.error('Error fetching chat info:', error);
            setCastInfo(null);
        }).finally(() => {
            setCastLoading(false);
        });
    }, [chatId]);

    useEffect(() => {
        if (!user?.id) return;
        getGuestReservations(user.id).then(setGuestReservations).catch(() => setGuestReservations([]));
    }, [user?.id]);

    // Set up real-time listener for chat messages
    useChatMessages(chatId, (message) => {
        // Only process real-time messages if initial fetch is complete and user is loaded
        if (fetching || !isUserLoaded) return;
        
        // Attach full gift object if missing
        if (message.gift_id && !message.gift && Array.isArray(gifts)) {
            const foundGift = gifts.find(g => g.id === message.gift_id);
            if (foundGift) {
                message.gift = foundGift;
            }
        }
        setMessages((prev) => {
            // Remove optimistic message if real one matches (by image or message and sender information)
            // Also check for duplicate messages by ID to prevent duplicates
            const filtered = prev.filter(m => {
                // Remove optimistic messages that match the real message
                if (m.id && m.id.toString().startsWith('optimistic-') &&
                    ((m.image && message.image && m.image === imagePreview) ||
                        (m.message && message.message && m.message === message.message)) &&
                    // Check both sender_guest_id and sender_cast_id for proper matching
                    ((m.sender_guest_id && message.sender_guest_id && m.sender_guest_id === message.sender_guest_id) ||
                     (m.sender_cast_id && message.sender_cast_id && m.sender_cast_id === message.sender_cast_id))) {
                    return false;
                }
                // Remove duplicate messages by ID
                if (m.id === message.id) {
                    return false;
                }
                return true;
            });
            return [...filtered, message];
        });
    });

    useEffect(() => {
        fetchAllGifts().then(setGifts);
    }, []);

    // Auto scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, fetching]);

    // New: ref for input bar and popover for click outside
    const inputBarRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close popover when clicking outside input bar or popover
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showFile &&
                inputBarRef.current &&
                popoverRef.current &&
                !inputBarRef.current.contains(event.target as Node) &&
                !popoverRef.current.contains(event.target as Node)
            ) {
                setShowFile(false);
            }
        };
        if (showFile) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFile]);

    // Close popovers/modals with Escape
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowFile(false);
                setShowGift(false);
                setShowGiftModal(false);
                setShowGiftDetailModal(false);
                setShowCamera(false);
                setShowProposalModal(false);
                setLightboxUrl(null);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);


    const handleImageButtonClick = () => {
        setShowFile((prev) => !prev);
    };

    const formatTime = (timestamp: string) => {
        return dayjs.utc(timestamp).tz(userTz).format('YYYY-MM-DD HH:mm');
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

    const handleSend = async () => {
        if ((input.trim() || attachedFile) && !sending && user) {
            // Check if message notifications are enabled
            const isMessageNotificationEnabled = isNotificationEnabled('messages');
            
            if (!isMessageNotificationEnabled) {
                setSendError('メッセージ通知が無効になっています。設定で有効にしてください。');
                return;
            }

            setSending(true);
            setSendError(null);
            
            // Create optimistic message
            const optimisticId = `optimistic-${Date.now()}`;
            const optimisticMessage = {
                id: optimisticId,
                chat_id: chatId,
                sender_guest_id: user.id,
                message: input.trim(),
                image: imagePreview,
                created_at: new Date().toISOString(),
                guest: user,
                isOptimistic: true
            };
            
            // Add optimistic message immediately
            setMessages(prev => [...prev, optimisticMessage]);
            
            // Clear input immediately
            const messageText = input.trim();
            const imageFile = attachedFile;
            setInput('');
            setAttachedFile(null);
            setImagePreview(null);
            
            try {
                const payload: any = {
                    chat_id: chatId,
                    sender_guest_id: user.id,
                };
                if (messageText) payload.message = messageText;
                if (imageFile) payload.image = imageFile;

                // Send to backend
                const realMsg = await sendMessage(payload);

                // Replace optimistic message with real one
                setMessages(prev => prev.map(m => m.id === optimisticId ? realMsg : m));
            } catch (e: any) {
                // Remove optimistic message on error
                setMessages(prev => prev.filter(m => m.id !== optimisticId));
                
                if (e.response?.data?.error === 'Insufficient points to send this gift') {
                    setSendError(`ポイントが不足しています。必要: ${e.response.data.required_points}P、所持: ${e.response.data.available_points}P`);
                } else {
                    setSendError('メッセージの送信に失敗しました');
                }
            } finally {
                setSending(false);
            }
        }
    };

    return (
        <div className="bg-gradient-to-br from-primary via-primary to-secondary min-h-screen flex flex-col relative">
            {/* Top bar (fixed) */}
            <div className="fixed max-w-md mx-auto left-0 right-0 items-center flex px-4 py-3 border-b border-secondary bg-primary h-16">
                <button onClick={onBack} className="mr-2 hover:text-secondary cursor-pointer">
                    <ChevronLeft size={30} />
                </button>
                <img
                    src={castInfo?.avatar ? getFirstAvatarUrl(castInfo.avatar) : '/assets/avatar/female.png'}
                    alt="avatar"
                    className="w-8 h-8 rounded-full mr-2 border border-secondary cursor-pointer"
                    onClick={() => {
                        navigate(`/cast/${castInfo.id}`);
                    }}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/avatar/female.png';
                    }}
                />
                <div className="flex flex-col">
                    {castLoading ? (
                        <span className="font-bold text-white text-base truncate">読み込み中...</span>
                    ) : (
                        <>
                            <span className="font-bold text-white text-base truncate">{castInfo?.nickname || 'キャスト'}</span>
                            <div className="flex items-center gap-2">
                                {castInfo?.birth_year && (
                                    <span className="text-xs text-gray-300">
                                        {new Date().getFullYear() - castInfo.birth_year}歳
                                    </span>
                                )}
                                {castInfo?.height && (
                                    <span className="text-xs text-gray-300">
                                        {castInfo.height}cm
                                    </span>
                                )}
                                {castInfo?.residence && (
                                    <span className="text-xs text-gray-300">
                                        {castInfo.residence}
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            {/* Chat history (scrollable, between header and input) */}
            <div
                className="flex-1 overflow-y-auto px-4 py-4"
                style={{
                    marginTop: '4rem', // header height (h-16 = 4rem)
                    marginBottom: '5.5rem', // input bar height (py-2 + px-4 + border + input height)
                    minHeight: 0,
                }}
            >
                {fetching ? (
                    <div className="flex justify-center items-center h-40">
                        <Spinner /> 
                    </div>
                ) : fetchError ? (
                    <div className="text-center text-red-400 py-10">{fetchError}</div>
                ) : !chatId || isNaN(Number(chatId)) ? (
                    <div className="text-center text-white py-10">チャットが選択されていません</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-white py-10">メッセージがありません</div>
                ) : (
                    (messages || []).map((msg, idx) => {
                        // Date separator
                        const currentDate = msg.created_at ? dayjs(msg.created_at).format('YYYY-MM-DD') : '';
                        const prev = (messages || [])[idx - 1];
                        const prevDate = prev && prev.created_at ? dayjs(prev.created_at).format('YYYY-MM-DD') : '';
                        const isSentByGuest = user && String(msg.sender_guest_id) === String(user.id);
                        const isFromCast = msg.sender_cast_id && !msg.sender_guest_id;
                        const isSent = isSentByGuest && !isFromCast;
                        
                        
                        const senderAvatar = msg.guest?.avatar || msg.cast?.avatar || '/assets/avatar/female.png';
                        const senderName = msg.guest?.nickname || msg.cast?.nickname || 'ゲスト/キャスト';
                        let proposal: Proposal | null = null;
                        try {
                            const parsed = typeof msg.message === 'string' ? JSON.parse(msg.message) : null;
                            if (parsed && parsed.type === 'proposal') proposal = parsed;
                        } catch (e) { }
                        if (proposal) {
                            // Check if proposal is accepted by matching guest_id and scheduled_at
                            const isAccepted = guestReservations.some(res =>
                                res.guest_id === user?.id &&
                                dayjs(res.scheduled_at).isSame(proposal?.date)
                            ) || acceptedProposals.includes(msg.id);
                            return (
                                <React.Fragment key={msg.id || `p-${idx}`}>
                                    {(idx === 0 || currentDate !== prevDate) && (
                                        <div className="flex justify-center my-2">
                                            <span className="text-xs text-gray-300 bg-black/20 px-3 py-1 rounded-full">
                                                {formatTime(msg.created_at)}
                                            </span>
                                        </div>
                                    )}
                                    <div
                                        className={`flex justify-start mb-4${isAccepted ? '' : ' cursor-pointer'}`}
                                        onClick={isAccepted ? undefined : () => { setShowProposalModal(true); setSelectedProposal(proposal); setProposalMsgId(msg.id); }}
                                        style={isAccepted ? { opacity: 0.6, pointerEvents: 'none' } : {}}
                                    >
                                        <div className="bg-orange-600 text-white rounded-lg px-4 py-3 max-w-[80%] text-sm shadow-md relative">
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
                                </React.Fragment>
                            );
                        }
                        return (
                            <React.Fragment key={msg.id || idx}>
                                {(idx === 0 || currentDate !== prevDate) && (
                                    <div className="flex justify-center my-2">
                                        <span className="text-xs text-gray-300 bg-black/20 px-3 py-1 rounded-full">
                                            {formatTime(msg.created_at)}
                                        </span>
                                    </div>
                                )}
                            <div className={isSent ? 'flex justify-end mb-4' : 'flex justify-start mb-4'}>
                                {!isSent && (
                                    <img
                                        src={senderAvatar ? getFirstAvatarUrl(senderAvatar) : '/assets/avatar/female.png'}
                                        alt="avatar"
                                        className="w-8 h-8 rounded-full mr-2 border border-secondary mt-1"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/assets/avatar/female.png';
                                        }}
                                    />
                                )}
                                <div>
                                    {!isSent && (
                                        <div className="text-xs text-gray-400 mb-1 flex items-center">
                                            <span>{senderName}</span>
                                        </div>
                                    )}
                                    <div className={`${isSent ? 'bg-secondary text-white' : 'bg-white text-black'} rounded-lg px-4 py-2 ${!isSent && msg.cast ? 'border-l-4 border-blue-500' : ''} ${msg.isOptimistic ? 'opacity-70' : ''}`}>
                                        {msg.gift_id && msg.gift && (
                                            <div className="flex items-center mb-1">
                                                <span className="text-3xl mr-2">
                                                    {msg.gift.icon || '🎁'}
                                                </span>
                                                <span className="font-bold">{msg.gift.name || 'ギフト'}</span>
                                                <span className="ml-2 text-xs text-primary font-bold">{typeof msg.gift.points === 'number' ? msg.gift.points : 0}P</span>
                                                {msg.isOptimistic && (
                                                    <span className="ml-2 text-xs text-yellow-300">送信中...</span>
                                                )}
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
                                                className="max-w-full max-h-40 rounded mb-2 cursor-zoom-in"
                                                onClick={() => setLightboxUrl(
                                                    msg.image.startsWith('http') ? msg.image : `${IMAGE_BASE_URL}/storage/${msg.image}`
                                                )}
                                            />
                                        )}
                                        {msg.message}
                                        {msg.isOptimistic && !msg.gift_id && (
                                            <div className="text-xs text-yellow-300 mt-1">送信中...</div>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 text-right">
                                        {/* {msg.created_at ? dayjs(msg.created_at).format('YYYY.MM.DD HH:mm:ss') : ''} */}
                                        {formatTime(msg.created_at)}
                                    </div>
                                </div>
                            </div>
                            </React.Fragment>
                        );
                    })
                )}
                {localMessages.map((msg, idx) => (
                    <div key={idx} className="flex items-end justify-end mb-4">
                        <div className="bg-secondary text-white rounded-lg px-4 py-2 max-w-[80%]">
                            {msg.message}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            {/* Input bar (always fixed at bottom) */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-primary border-t border-secondary flex flex-col px-4 py-2 z-20">
                {sendError && <div className="text-red-400 text-xs mb-1">{sendError}</div>}
                {/* Image preview */}
                {imagePreview && (
                    <div className="flex items-center mt-2 p-2 bg-gray-800 rounded-lg">
                        <img src={imagePreview} alt="preview" className="h-20 w-20 object-cover rounded border border-gray-300" />
                        <div className="ml-3 flex-1">
                            <div className="text-white text-sm font-medium">画像が選択されました</div>
                            <div className="text-gray-400 text-xs">{attachedFile?.name || 'photo.jpg'}</div>
                        </div>
                        <button
                            type="button"
                            className="ml-2 text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                            onClick={() => { 
                                setAttachedFile(null); 
                                setImagePreview(null); 
                                if (fileInputRef.current) fileInputRef.current.value = '';
                                if (fileSelectInputRef.current) fileSelectInputRef.current.value = '';
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}
                <div className="flex items-center w-full relative" ref={inputBarRef}>
                    <input
                        type="text"
                        className={`flex-1 px-4 py-2 rounded-full border border-secondary text-sm mr-2 ${
                            isNotificationEnabled('messages') 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                        placeholder={isNotificationEnabled('messages') ? "メッセージを入力..." : "メッセージ通知が無効です"}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                                await handleSend();
                            }
                        }}
                        disabled={!isNotificationEnabled('messages')}
                    />
                    <span 
                        className={`cursor-pointer ${
                            isNotificationEnabled('messages') ? 'text-white' : 'text-gray-500'
                        }`} 
                        onClick={isNotificationEnabled('messages') ? handleImageButtonClick : undefined}
                    >
                        <Image size={30} />
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                        disabled={!isNotificationEnabled('messages')}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileSelectInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                        disabled={!isNotificationEnabled('messages')}
                    />
                    <button 
                        className={`ml-2 ${
                            user && user.points && user.points > 0 && isNotificationEnabled('messages') 
                                ? 'text-white' 
                                : 'text-gray-500'
                        }`} 
                        onClick={() => setShowGiftModal(true)}
                        disabled={!user || !user.points || user.points <= 0 || !isNotificationEnabled('messages')}
                    >
                        <Gift size={30} />
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={sending || (!input.trim() && !attachedFile) || !isNotificationEnabled('messages')}
                        className={`ml-2 px-6 py-2 rounded-full text-sm disabled:opacity-50 ${
                            isNotificationEnabled('messages') ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-500 text-gray-300'
                        }`}
                    >
                        {sending ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                            </div>
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                    {/* Popover absolutely inside input bar */}
                    {showFile && (
                        <div
                            ref={popoverRef}
                            className="absolute bottom-full mb-2 right-0 w-80 bg-primary rounded-xl shadow-lg border border-secondary z-50 animate-fade-in"
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
                </div>
            </div>
            {/* Gift window (fixed below input bar, does not move input bar) */}
            {showGift && (
                <div className="fixed left-0 right-0 bottom-14 max-w-md mx-auto bg-primary rounded-lg border border-secondary shadow-lg p-0 overflow-hidden animate-fade-in z-10 h-80">
                    <div className="flex flex-col items-center relative h-full">
                        <div className="flex w-full border-b border-secondary">
                            <button className={`flex-1 py-3 font-bold ${giftTab === 'standard' ? 'text-white border-b-2 border-secondary' : 'text-white'}`} onClick={() => setGiftTab('standard')}>定番</button>
                            <button className={`flex-1 py-3 font-bold ${giftTab === 'local' ? 'text-white border-b-2 border-secondary' : 'text-white'}`} onClick={() => setGiftTab('local')}>ご当地</button>
                            <button className={`flex-1 py-3 font-bold ${giftTab === 'grade' ? 'text-white border-b-2 border-secondary' : 'text-white'}`} onClick={() => setGiftTab('grade')}>グレード</button>
                            <button className={`flex-1 py-3 font-bold ${giftTab === 'mygift' ? 'text-white border-b-2 border-secondary' : 'text-white'}`} onClick={() => setGiftTab('mygift')}>Myギフト</button>
                        </div>
                        <div className="py-4 text-center flex-1 flex flex-col justify-center w-full">
                            <div className="grid grid-cols-4 gap-4 px-4">
                                {gifts.map(gift => {
                                    const hasEnoughPoints = user && user.points && user.points >= gift.points;
                                    return (
                                    <button
                                        key={gift.id}
                                        className={`flex flex-col items-center justify-center rounded-lg p-2 transition ${
                                            hasEnoughPoints 
                                                ? 'bg-secondary text-white hover:bg-red-700' 
                                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        }`}
                                                                            onClick={async () => {
                                        if (!user || !hasEnoughPoints) return;
                                        
                                        // Check if message notifications are enabled
                                        const isMessageNotificationEnabled = isNotificationEnabled('messages');
                                        
                                        if (!isMessageNotificationEnabled) {
                                            setSendError('メッセージ通知が無効になっています。設定で有効にしてください。');
                                            return;
                                        }
                                        
                                        setShowGift(false);
                                        setSending(true);
                                        setSendError(null);
                                        
                                        // Create optimistic gift message
                                        const optimisticId = `optimistic-gift-${Date.now()}`;
                                        const optimisticGiftMessage = {
                                            id: optimisticId,
                                            chat_id: chatId,
                                            sender_guest_id: user.id,
                                            gift_id: gift.id,
                                            gift: {
                                                id: gift.id,
                                                name: gift.name || gift.label,
                                                icon: gift.icon,
                                                points: gift.points
                                            },
                                            created_at: new Date().toISOString(),
                                            guest: user,
                                            isOptimistic: true
                                        };
                                        
                                        // Add optimistic gift message immediately
                                        setMessages((prev) => [...prev, optimisticGiftMessage]);
                                        
                                        try {
                                            const sent = await sendMessage({
                                                chat_id: chatId,
                                                sender_guest_id: user.id,
                                                gift_id: gift.id,
                                            });
                                            // Ensure the sent message has the gift details
                                            if (sent && !sent.gift && gift) {
                                                sent.gift = {
                                                    id: gift.id,
                                                    name: gift.name || gift.label,
                                                    icon: gift.icon,
                                                    points: gift.points
                                                };
                                            }
                                            // Replace optimistic message with real one
                                            setMessages((prev) => prev.map(m => m.id === optimisticId ? sent : m));
                                            // Refresh user points after sending gift
                                            refreshUser();
                                        } catch (e: any) {
                                            // Remove optimistic message on error
                                            setMessages((prev) => prev.filter(m => m.id !== optimisticId));
                                            
                                            if (e.response?.data?.error === 'Insufficient points to send this gift') {
                                                setSendError(`ポイントが不足しています。必要: ${e.response.data.required_points}P、所持: ${e.response.data.available_points}P`);
                                            } else {
                                                setSendError('ギフトの送信に失敗しました');
                                            }
                                        } finally {
                                            setSending(false);
                                        }
                                    }}
                                    >
                                        <span className="text-3xl mb-1">
                                            {gift.icon}
                                        </span>
                                        <span className="text-xs">{gift.label}</span>
                                    </button>
                                    );
                                })}
                            </div>
                        </div>
                        <button className="absolute top-2 right-2 text-white text-2xl" onClick={() => setShowGift(false)}>
                            <X size={30} />
                        </button>
                    </div>
                </div>
            )}
            {showGiftModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-60">
                    <div className="fixed left-0 right-0 bottom-0 bg-primary rounded-t-2xl shadow-lg p-6 flex flex-col items-center border-t border-secondary w-full max-w-md mx-auto animate-slide-up">
                        <h2 className="font-bold text-lg mb-4 text-white">ギフトを選択</h2>
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
            {showProposalModal && selectedProposal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center min-w-[320px] max-w-[90vw]">
                        <h2 className="font-bold text-lg mb-4 text-black">予約変更の提案</h2>
                        <div className="mb-4 text-black">
                            <div>日程：{selectedProposal.date ? new Date(selectedProposal.date).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}～</div>
                            <div>人数：{selectedProposal.people?.replace(/名$/, '')}人</div>
                            <div>時間：{selectedProposal.duration}</div>
                            <div>消費ポイント：{selectedProposal.totalPoints?.toLocaleString()}P</div>
                            <div>（延長：{selectedProposal.extensionPoints?.toLocaleString()}P / 15分）</div>
                        </div>
                        {proposalActionError && <div className="text-red-500 mb-2">{proposalActionError}</div>}
                        <div className="flex gap-4">
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded font-bold disabled:opacity-50"
                                disabled={proposalActionLoading}
                                onClick={async () => {
                                    setProposalActionLoading(true);
                                    setProposalActionError(null);
                                    try {
                                        if (!reservationId) throw new Error('予約IDが見つかりません');
                                        await updateReservation(reservationId, {
                                            scheduled_at: selectedProposal.date,
                                            duration: selectedProposal.duration ? parseInt(selectedProposal.duration as string, 10) : undefined,
                                        });
                                        
                                        if (user?.id && selectedProposal.date) {
                                            setGuestReservations(prev => [
                                                ...prev,
                                                {
                                                    guest_id: user.id,
                                                    scheduled_at: selectedProposal.date,
                                                    // Add other required fields if needed
                                                }
                                            ]);
                                        }
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
                            >承認</button>
                            <button
                                className="px-4 py-2 bg-gray-400 text-white rounded font-bold"
                                onClick={() => { setShowProposalModal(false); setSelectedProposal(null); setProposalMsgId(null); }}
                            >拒否</button>
                        </div>
                    </div>
                </div>
            )}
            {showGiftDetailModal && selectedGift && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-primary rounded-2xl shadow-lg p-6 flex flex-col items-center min-w-[320px] max-w-[90vw]">
                        <h2 className="font-bold text-lg mb-4 text-white">ギフト詳細</h2>
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
                                    if (!user || (user.points ?? 0) < selectedGift.points) return;
                                    setSending(true);
                                    setSendError(null);
                                    
                                    // Create optimistic gift message
                                    const optimisticId = `optimistic-gift-detail-${Date.now()}`;
                                    const optimisticGiftMessage = {
                                        id: optimisticId,
                                        chat_id: chatId,
                                        sender_guest_id: user.id,
                                        gift_id: selectedGift.id,
                                        gift: {
                                            id: selectedGift.id,
                                            name: selectedGift.name || selectedGift.label,
                                            icon: selectedGift.icon,
                                            points: selectedGift.points,
                                            description: selectedGift.description
                                        },
                                        created_at: new Date().toISOString(),
                                        guest: user,
                                        isOptimistic: true
                                    };
                                    
                                    // Add optimistic gift message immediately
                                    setMessages((prev) => [...prev, optimisticGiftMessage]);
                                    
                                    try {
                                        const payload: any = {
                                            chat_id: chatId,
                                            sender_guest_id: user.id,
                                            gift_id: selectedGift.id,
                                        };
                                        const sent = await sendMessage(payload);
                                        // Ensure the sent message has the full gift details
                                        let giftObj = sent.gift;
                                        if (!giftObj) {
                                            giftObj = gifts.find(g => g.id === selectedGift.id) || selectedGift;
                                            sent.gift = {
                                                id: giftObj.id,
                                                name: giftObj.name || giftObj.label,
                                                icon: giftObj.icon,
                                                points: giftObj.points,
                                                description: giftObj.description
                                            };
                                        }
                                        // Replace optimistic message with real one
                                        setMessages((prev) => prev.map(m => m.id === optimisticId ? sent : m));
                                        refreshUser();
                                        setShowGiftDetailModal(false);
                                        setSelectedGift(null);
                                    } catch (e: any) {
                                        // Remove optimistic message on error
                                        setMessages((prev) => prev.filter(m => m.id !== optimisticId));
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
            {/* Attach Popover */}
            {/* This section is removed as the popover is now absolutely positioned */}

            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
                    <div className="bg-primary p-6 rounded-lg flex flex-col items-center max-w-sm w-full mx-4">
                        <h3 className="text-white text-lg font-bold mb-4">カメラ</h3>
                        <div className="relative">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-64 h-64 rounded-md bg-black object-cover"
                            />
                            {cameraError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-md">
                                    <div className="text-red-400 text-center p-4">
                                        <div className="text-sm mb-2">カメラエラー</div>
                                        <div className="text-xs">{cameraError}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {cameraError && (
                            <div className="text-red-400 mt-2 text-center text-sm">{cameraError}</div>
                        )}
                        <div className="flex mt-4 space-x-4">
                            <button
                                onClick={handleTakePhoto}
                                className="bg-secondary text-white px-6 py-2 rounded-md font-bold disabled:opacity-50"
                                disabled={!!cameraError}
                            >
                                撮影
                            </button>
                            <button
                                onClick={handleCloseCamera}
                                className="bg-gray-400 text-white px-6 py-2 rounded-md font-bold"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Image Lightbox */}
            {lightboxUrl && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
                    onClick={() => setLightboxUrl(null)}
                >
                    <img src={lightboxUrl} alt="preview" className="max-w-[90vw] max-h-[90vh] rounded shadow-lg" />
                </div>
            )}
        </div>
    );
};

export default ChatScreen; 
