/* eslint-disable */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Camera, FolderClosed, Gift, ChevronLeft, X, Send, Calendar } from 'lucide-react';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { sendMessage, getChatMessages, fetchAllGifts, getChatById, getGuestReservations } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { useNotificationSettings } from '../../contexts/NotificationSettingsContext';
import { useChatMessages } from '../../hooks/useRealtime';
import dayjs from 'dayjs';
import Spinner from '../ui/Spinner';
import GuestCalendarPage from './GuestCalendarPage';
import SessionTimer from '../ui/SessionTimer';
import { useSessionManagement } from '../../hooks/useSessionManagement';

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
    const [proposalMessage, setProposalMessage] = useState<any>(null);
    const [proposalActionLoading, setProposalActionLoading] = useState(false);
    const [proposalActionError, setProposalActionError] = useState<string | null>(null);
    const [acceptedProposals, setAcceptedProposals] = useState<number[]>([]);
    const [reservationId, setReservationId] = useState<number | null>(null);
    const [guestReservations, setGuestReservations] = useState<any[]>([]);
    const [castInfo, setCastInfo] = useState<any>(null);
    const [castLoading, setCastLoading] = useState(true);
    const [selectedGift, setSelectedGift] = useState<any>(null);
    const [showGiftDetailModal, setShowGiftDetailModal] = useState(false);

    const [showCalendarPage, setShowCalendarPage] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    
    // Matching confirmation state

    
    // Session management
    const {
        sessionState,
        isLoading: sessionLoading,
        error: sessionError,
        acceptProposal: sessionAcceptProposal,
    } = useSessionManagement({
        reservationId,
        chatId,
        onSessionStart: () => {
            console.log('Session started');
        },
        onSessionEnd: () => {
            console.log('Session ended');
        },
        onReservationUpdate: (reservation) => {
            if (reservation) {
                setReservationId(reservation.id);
                // Update guest reservations if needed
                if (reservation.guest_id === user?.id) {
                    setGuestReservations(prev => {
                        const existing = prev.find(r => r.id === reservation.id);
                        if (existing) {
                            return prev.map(r => r.id === reservation.id ? reservation : r);
                        } else {
                            return [...prev, reservation];
                        }
                    });
                }
            }
        }
    });
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
            if (!chatId || isNaN(Number(chatId))) {
                setMessages([]);
                setFetching(false);
                return;
            }
            
            if (!isUserLoaded) {
                setMessages([]);
                setFetching(false);
                return;
            }
            try {
                const msgs = await getChatMessages(chatId, user.id, 'guest');
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

    // Periodically refresh guest reservations so proposal acceptance reflects promptly
    useEffect(() => {
        if (!user?.id) return;
        const interval = setInterval(() => {
            getGuestReservations(user.id).then(setGuestReservations).catch(() => {});
        }, 15000);
        return () => clearInterval(interval);
    }, [user?.id]);

    // More frequent refresh when there are proposals to ensure real-time updates
    useEffect(() => {
        if (!user?.id) return;
        
        // Check if there are any proposal messages
        const hasProposals = messages.some(msg => {
            try {
                const parsed = typeof msg.message === 'string' ? JSON.parse(msg.message) : null;
                return parsed && parsed.type === 'proposal';
            } catch (e) {
                return false;
            }
        });

        if (hasProposals) {
            const interval = setInterval(() => {
                getGuestReservations(user.id).then(setGuestReservations).catch(() => {});
            }, 3000); // Check every 3 seconds when proposals exist for faster updates
            return () => clearInterval(interval);
        }
    }, [user?.id, messages]);

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

        // Check if this message might be related to proposal updates
        let shouldRefreshReservations = false;
        try {
            const parsed = typeof message.message === 'string' ? JSON.parse(message.message) : null;
            if (parsed && parsed.type === 'proposal') {
                shouldRefreshReservations = true;
            }
            // Also check for system messages about proposal acceptance
            if (message.message && typeof message.message === 'string') {
                if (message.message.includes('承認') || message.message.includes('accepted') || 
                    message.message.includes('承認済み') || message.message.includes('accepted')) {
                    shouldRefreshReservations = true;
                }
            }
        } catch (e) {
            // Not a proposal message
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

        // If this message is related to proposals, refresh guest reservations
        if (shouldRefreshReservations && user?.id) {
            // Immediate refresh for proposal updates
            getGuestReservations(user.id).then(setGuestReservations).catch(() => {});
            
            // Additional refresh after a short delay to ensure backend updates are reflected
            setTimeout(() => {
                getGuestReservations(user.id).then(setGuestReservations).catch(() => {});
            }, 1000);
        }
    });

    // Matching messages are now handled by backend through group chats
    // No need for frontend simulation

    useEffect(() => {
        fetchAllGifts().then(setGifts);
    }, []);

    // Auto scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, fetching]);

    // Ensure messages are displayed from old to new
    const sortedMessages = useMemo(() => {
        return [...(messages || [])].sort((a, b) => {
            const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
            return aTime - bTime;
        });
    }, [messages]);

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
                    setSendError(`ポイントが不足しています。必要: ${Number(e.response.data.required_points).toLocaleString()}P、所持: ${Number(e.response.data.available_points).toLocaleString()}P`);
                } else {
                    setSendError('メッセージの送信に失敗しました');
                }
            } finally {
                setSending(false);
            }
        }
    };

    // Show calendar page if requested
    if (showCalendarPage) {
        return <GuestCalendarPage chatId={chatId} onBack={() => setShowCalendarPage(false)} />;
    }

    return (
        <div className="bg-gradient-to-b from-primary via-primary to-secondary min-h-screen flex flex-col relative">
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
            {/* Session Timer - Only show if there's an active reservation */}
            {/* {reservationId && (
                <div className="fixed max-w-md mx-auto left-0 right-0 top-16 z-20 px-4 pt-2 bg-primary">
                    <SessionTimer
                        isActive={sessionState.isActive}
                        elapsedTime={sessionState.elapsedTime}
                        isLoading={sessionLoading}
                        className="w-full"
                    />
                </div>
            )} */}
            
            {/* Chat history (scrollable, between header and input) */}
            <div
                className="flex-1 overflow-y-auto px-4 pt-16 pb-12"
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
                    (sortedMessages || []).map((msg, idx) => {
                        // Date separator
                        const currentDate = msg.created_at ? dayjs(msg.created_at).format('YYYY-MM-DD') : '';
                        const prev = (sortedMessages || [])[idx - 1];
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
                            // Check if proposal is accepted by multiple methods:
                            // 1. Local accepted proposals state (immediate UI feedback)
                            // 2. Matching reservation in guestReservations
                            // 3. Current reservationId if it matches the proposal
                            const isAccepted = acceptedProposals.includes(msg.id) || 
                                guestReservations.some(res => {
                                    const proposalDate = dayjs(proposal?.date);
                                    const reservationDate = dayjs(res.scheduled_at);
                                    return res.guest_id === user?.id && reservationDate.isSame(proposalDate, 'day');
                                }) ||
                                (reservationId && proposal.reservationId === reservationId);
                            
                            // Determine proposal alignment based on sender
                            const isProposalFromGuest = msg.sender_guest_id && !msg.sender_cast_id;
                            const proposalPosition = isProposalFromGuest ? 'justify-end' : 'justify-start';
                            const alignment = isProposalFromGuest ? 'items-end' : 'items-start';
                            
                            return (
                                <React.Fragment key={msg.id || `p-${idx}`}>
                                    {(idx === 0 || currentDate !== prevDate) && (
                                        <div className="flex justify-center my-2">
                                            <span className="text-xs text-gray-300 bg-black/20 px-3 py-1 rounded-full">
                                                {formatTime(msg.created_at)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex ${proposalPosition} mb-4`}>
                                        <div className={`flex flex-col ${alignment} max-w-[80%]`}>
                                            <div 
                                                className={`bg-orange-600 text-white rounded-lg px-4 py-3 text-sm shadow-md relative w-full ${isAccepted ? 'opacity-50 cursor-default' : 'cursor-pointer hover:bg-orange-600'}`}
                                                onClick={!isAccepted ? () => {
                                                    setSelectedProposal(proposal);
                                                    setProposalMsgId(msg.id);
                                                    setProposalMessage(msg);
                                                    setShowProposalModal(true);
                                                } : undefined}
                                            >
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
                                    </div>
                                    {/* {isAccepted && (
                                        <div className="mt-3 w-full max-w-[100%]">
                                            <SessionTimer
                                                isActive={sessionState.isActive}
                                                elapsedTime={sessionState.elapsedTime}
                                                isLoading={sessionLoading}
                                            />
                                        </div>
                                    )} */}
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
                                        {(() => {
                                            const giftObj = msg.gift_id ? (msg.gift || (Array.isArray(gifts) ? gifts.find((g: any) => g.id === msg.gift_id) : null)) : null;
                                            if (!giftObj) return null;
                                            return (
                                                <div className="flex items-center mb-1">
                                                    <span className="text-3xl mr-2">
                                                        {giftObj.icon || '🎁'}
                                                    </span>
                                                    <span className="font-bold">{giftObj.name || 'ギフト'}</span>
                                                    <span className="ml-2 text-xs text-primary font-bold">{typeof giftObj.points === 'number' ? giftObj.points.toLocaleString() : Number(giftObj.points || 0).toLocaleString()}P</span>
                                                    {msg.isOptimistic && (
                                                        <span className="ml-2 text-xs text-yellow-300">送信中...</span>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                        {(() => {
                                            if (!msg.image) return null;
                                            if (typeof msg.image !== 'string') return null;
                                            const isAbsolute = msg.image.startsWith('http') || msg.image.startsWith('data:') || msg.image.startsWith('blob:');
                                            const src = isAbsolute ? msg.image : `${IMAGE_BASE_URL}/storage/${msg.image}`;
                                            return (
                                                <img
                                                    src={src}
                                                    alt="sent"
                                                    className="max-w-full max-h-40 rounded mb-2 cursor-zoom-in"
                                                    onClick={() => setLightboxUrl(src)}
                                                />
                                            );
                                        })()}
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
                <div className="flex items-center w-full relative gap-2 flex-wrap" ref={inputBarRef}>
                    <button 
                        className={`${
                            isNotificationEnabled('messages') ? 'text-white' : 'text-gray-500'
                        } flex-shrink-0`} 
                        onClick={() => setShowCalendarPage(true)}
                        disabled={!isNotificationEnabled('messages')}
                    >
                        <Calendar size={30} />
                    </button>
                    <input
                        type="text"
                        className={`flex-1 min-w-0 px-4 py-2 rounded-full border border-secondary text-sm ${
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
                        className={`cursor-pointer flex-shrink-0 ${
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
                        className={`${
                            user && user.points && user.points > 0 && isNotificationEnabled('messages') 
                                ? 'text-white' 
                                : 'text-gray-500'
                        } flex-shrink-0`} 
                        onClick={() => setShowGiftModal(true)}
                        disabled={!user || !user.points || user.points <= 0 || !isNotificationEnabled('messages')}
                    >
                        <Gift size={30} />
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={sending || (!input.trim() && !attachedFile) || !isNotificationEnabled('messages')}
                        className={`flex-shrink-0 px-6 py-2 rounded-full text-sm disabled:opacity-50 ${
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
            {/* Gift modal (match Group chat style) */}
            {showGiftModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-60">
                    <div className="fixed left-0 right-0 bottom-0 bg-primary rounded-t-2xl shadow-lg p-6 flex flex-col items-center border-t border-secondary w-full max-w-md mx-auto animate-slide-up">
                        <h2 className="font-bold text-lg mb-2 text-white">ギフトを選択</h2>
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
                                    <span className="text-3xl mb-1">{gift.icon}</span>
                                    <span className="text-xs">{gift.name || gift.label}</span>
                                    <span className="text-xs text-yellow-300 font-bold">{Number(gift.points).toLocaleString()}P</span>
                                </button>
                                );
                            })}
                        </div>
                        <button className="text-white mt-2 hover:text-red-700 transition-all duration-200 font-medium" onClick={() => setShowGiftModal(false)}>閉じる</button>
                    </div>
                </div>
            )}

            {showGiftDetailModal && selectedGift && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-primary rounded-2xl shadow-lg p-6 flex flex-col items-center min-w-[320px] max-w-[90vw]">
                        <h2 className="font-bold text-lg mb-4 text-white">ギフト詳細</h2>
                        <div className="flex flex-col items-center mb-4">
                            <span className="text-5xl mb-2">{selectedGift.icon}</span>
                            <span className="text-lg font-bold text-white mb-1">{selectedGift.name || selectedGift.label}</span>
                            <span className="text-yellow-300 font-bold mb-2">{Number(selectedGift.points).toLocaleString()}P</span>
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
                                    try {
                                        const payload: any = {
                                            chat_id: chatId,
                                            sender_guest_id: user.id,
                                            gift_id: selectedGift.id,
                                            message: input.trim() || ''
                                        };
                                        const sent = await sendMessage(payload);
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

            {/* Proposal Modal */}
            {showProposalModal && selectedProposal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center min-w-[320px] max-w-[90vw]">
                        <h2 className="font-bold text-lg mb-4 text-black">予約提案の確認</h2>
                        <div className="mb-4 text-black">
                            <div>日程：{selectedProposal.date ? new Date(selectedProposal.date).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '未設定'}～</div>
                            <div>人数：{selectedProposal.people?.replace(/名$/, '') || '未設定'}人</div>
                            <div>時間：{selectedProposal.duration || '未設定'}</div>
                            <div>消費ポイント：{selectedProposal.totalPoints?.toLocaleString() || '0'}P</div>
                            <div>（延長：{selectedProposal.extensionPoints?.toLocaleString() || '0'}P / 15分）</div>
                        </div>
                        {proposalActionError && <div className="text-red-500 mb-2">{proposalActionError}</div>}
                        <div className="flex gap-4 w-full flex-col sm:flex-row">
                            <button
                                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded font-bold disabled:opacity-50"
                                disabled={proposalActionLoading}
                                onClick={async () => {
                                    if (!selectedProposal || !user?.id || !selectedProposal.date) {
                                        setProposalActionError('Missing required data for proposal acceptance');
                                        return;
                                    }

                                    try {
                                        setProposalActionLoading(true);
                                        setProposalActionError(null);

                                        // Prepare proposal data for acceptance
                                        const duration = parseInt(selectedProposal.duration?.toString() || '0', 10);
                                        if (isNaN(duration) || duration <= 0) {
                                            setProposalActionError('Invalid duration for proposal acceptance');
                                            return;
                                        }

                                        const proposalData = {
                                            guest_id: user.id,
                                            cast_id: proposalMessage?.sender_cast_id,
                                            date: selectedProposal.date,
                                            duration: duration,
                                            reservation_id: reservationId || selectedProposal.reservationId
                                        };

                                        // Accept the proposal using session management
                                        const newReservation = await sessionAcceptProposal(proposalData);

                                        // Update local reservation ID if a new one was created
                                        if (newReservation && newReservation.id) {
                                            setReservationId(newReservation.id);
                                        }

                                        // Add to local accepted proposals for immediate UI feedback
                                        if (proposalMsgId) {
                                            setAcceptedProposals(prev => [...prev, proposalMsgId]);
                                        }

                                        // The onReservationUpdate callback in useSessionManagement will automatically
                                        // update both reservationId and guestReservations, so no manual refresh needed here

                                        // Close modal and reset state
                                        setShowProposalModal(false);
                                        setSelectedProposal(null);
                                        setProposalMsgId(null);
                                        setProposalMessage(null);
                                    } catch (e: any) {
                                        console.error('Error accepting proposal:', e);
                                        setProposalActionError('提案の承認に失敗しました');
                                    } finally {
                                        setProposalActionLoading(false);
                                    }
                                }}
                            >
                                {proposalActionLoading ? '処理中...' : '承認'}
                            </button>
                            <button
                                className="w-full sm:w-auto px-4 py-2 bg-gray-400 text-white rounded font-bold"
                                onClick={() => {
                                    setShowProposalModal(false);
                                    setSelectedProposal(null);
                                    setProposalMsgId(null);
                                    setProposalMessage(null);
                                }}
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

export default ChatScreen;