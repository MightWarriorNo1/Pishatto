import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Image, Camera, FolderClosed,  ChevronLeft, X, Users, Send } from 'lucide-react';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { sendGroupMessage, getGroupMessages, fetchAllGifts, getGroupParticipants, getReservationById, getCastProfile, createPointTransaction } from '../../../services/api';
import { useCast } from '../../../contexts/CastContext';
import { useUser } from '../../../contexts/UserContext';
import { useGroupMessages, useReservationUpdates } from '../../../hooks/useRealtime';
import { useSessionManagement } from '../../../hooks/useSessionManagement';
import dayjs from 'dayjs';
import Spinner from '../../ui/Spinner';
import SessionTimer from '../../ui/SessionTimer';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

dayjs.extend(utc);
dayjs.extend(timezone);

const userTz=dayjs.tz.guess();
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
    const { castId } = useCast();
    const [showFile, setShowFile] = useState(false);
    const [input, setInput] = useState('');
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
    const [selectedGiftCategory] = useState('standard');
    const [participants, setParticipants] = useState<any[]>([]);
    const [groupInfo, setGroupInfo] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const attachBtnRef = useRef<HTMLButtonElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    
    // Session management state
    const [reservationId, setReservationId] = useState<number | null>(null);
    const [reservationData, setReservationData] = useState<any>(null);
    const [dissolveButtonUsed, setDissolveButtonUsed] = useState(false);
    const [sessionSummary, setSessionSummary] = useState<{
        elapsedTime: number;
        castEarnings: Array<{
            castId: number;
            nickname: string;
            avatar: string;
            points: number;
            category: string;
        }>;
    } | null>(null);
    
    // Camera functionality
    const [showCamera, setShowCamera] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Session management
    const {
        sessionState,
        isLoading: sessionLoading,
        error: sessionError,
        formatElapsedTime,
        handleMeet,
        handleDissolve: originalHandleDissolve,
        acceptProposal: sessionAcceptProposal,
        resetSession,
        initializeSession
    } = useSessionManagement({
        reservationId,
        chatId: groupId, // Use groupId as chatId for session management
        castId,
        onSessionStart: () => {
            console.log('Cast group session started');
        },
        onSessionEnd: () => {
            console.log('Cast group session ended');
        },
        onReservationUpdate: (reservation) => {
            if (reservation) {
                setReservationId(reservation.id);
                setReservationData(reservation);
                // Re-initialize session state when reservation is updated
                initializeSession(reservation);
            }
        }
    });

    // Custom dissolve handler that calculates cast earnings
    const handleDissolve = async () => {
        if (!reservationData || !participants.length) return;
        
        try {
            // Mark dissolve button as used
            setDissolveButtonUsed(true);
            
            // Calculate elapsed time
            const startTime = reservationData.started_at ? new Date(reservationData.started_at) : new Date();
            const endTime = new Date();
            const elapsedTime = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

            console.log("ELAPS", elapsedTime);
            
            // Get cast participants and fetch their profiles for category information
            const castParticipants = participants.filter(p => p.type === 'cast');
            const castEarnings = [];
            
            console.log("CAST PARTICIPANTS", castParticipants);
            for (const cast of castParticipants) {
                try {
                    // Fetch cast profile to get category information
                    const castProfile = await getCastProfile(cast.id);
                    let categoryPoints = 12000; // Default プレミアム
                    let category = 'プレミアム';
                    
                    if (castProfile?.cast?.category) {
                        category = castProfile.cast.category;
                        switch (castProfile.cast.category) {
                            case 'ロイヤルVIP':
                                categoryPoints = 18000;
                                break;
                            case 'VIP':
                                categoryPoints = 15000;
                                break;
                            case 'プレミアム':
                            default:
                                categoryPoints = 12000;
                                break;
                        }
                    }
                    
                    // Calculate points: category_points * (elapsed_minutes / 30)
                    const elapsedMinutes = elapsedTime / 60;
                    const points = Math.floor(categoryPoints * elapsedMinutes / 30);
                    
                    console.log("POINTS", points);
                    castEarnings.push({
                        castId: cast.id,
                        nickname: cast.nickname || 'キャスト',
                        avatar: cast.avatar || '/assets/avatar/female.png',
                        points: Math.max(1, points), // Minimum 1 point
                        category: category
                    });
                    console.log("CASTE", castEarnings);
                } catch (castError) {
                    console.error(`Failed to fetch cast profile for cast ${cast.id}:`, castError);
                    // Use default values if cast profile fetch fails
                    const elapsedMinutes = elapsedTime / 60;
                    const points = Math.floor(12000 * elapsedMinutes / 30);
                    
                    castEarnings.push({
                        castId: cast.id,
                        nickname: cast.nickname || 'キャスト',
                        avatar: cast.avatar || '/assets/avatar/female.png',
                        points: Math.max(1, points),
                        category: 'プレミアム'
                    });
                }
            }
            
            // Create point transfer transactions per cast using computed earnings
            try {
                const guestIdForSettlement = reservationData.guest_id;
                const reservationIdForSettlement = reservationData.id;

                if (guestIdForSettlement && reservationIdForSettlement) {
                    const transfers = castEarnings
                        .filter(e => e.points && e.points > 0)
                        .map(e => createPointTransaction({
                            user_type: 'cast',
                            user_id: e.castId,
                            amount: e.points,
                            type: 'transfer',
                            reservation_id: reservationIdForSettlement,
                            description: `Free group call settlement - ${reservationIdForSettlement}`
                        }));

                    if (transfers.length > 0) {
                        await Promise.allSettled(transfers);
                    }
                }
            } catch (settleErr) {
                console.error('Failed to create transfer transactions for group settlement:', settleErr);
            }

            // Set session summary
            setSessionSummary({
                elapsedTime,
                castEarnings
            });
            
            // Call original dissolve handler
            await originalHandleDissolve();
            
        } catch (error) {
            console.error('Error in custom dissolve handler:', error);
            // Still call original handler even if calculation fails
            await originalHandleDissolve();
        }
    };

    // Real-time reservation updates
    useReservationUpdates(reservationId?.toString() || '', (reservation) => {
        console.log('Real-time reservation update received:', reservation);
        if (reservation) {
            setReservationData(reservation);
            initializeSession(reservation);
        }
    });

    // Fetch messages on component mount
    useEffect(() => {
        setFetching(true);
        setFetchError(null);
        
        const fetchMessages = async () => {
            if (!groupId || isNaN(Number(groupId))) {
                setFetchError('無効なグループIDです');
                setMessages([]);
                setFetching(false);
                return;
            }
            
            if (!castId && !user?.id) {
                setFetchError('ユーザーIDが見つかりません');
                setMessages([]);
                setFetching(false);
                return;
            }

            try {
                const userId = castId || user?.id;
                if (!userId) {
                    throw new Error('No valid user ID available');
                }
                const userType = castId ? 'cast' : 'guest';
                
                const response = await getGroupMessages(groupId, userType, userId);
                
                if (response && response.messages) {
                    setMessages(Array.isArray(response.messages) ? response.messages : []);
                } else {
                    setMessages([]);
                }
                
                if (response && response.group) {
                    setGroupInfo(response.group);
                }
                
                setFetchError(null);
            } catch (e: any) {
                setFetchError(`メッセージの取得に失敗しました: ${e.message || 'Unknown error'}`);
                setMessages([]);
            } finally {
                setFetching(false);
            }
        };
        
        fetchMessages();
    }, [groupId, castId, user?.id]);

    // Fetch participants and reservation info
    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await getGroupParticipants(groupId);
                setParticipants(response.participants || []);
                
                // Get reservation information from group
                if (response.group && response.group.reservation_id) {
                    console.log('Found reservation_id:', response.group.reservation_id);
                    setReservationId(response.group.reservation_id);
                    
                    // Fetch reservation details
                    try {
                        const reservation = await getReservationById(response.group.reservation_id);
                        console.log('Fetched reservation details:', reservation);
                        setReservationData(reservation);
                        // Initialize session state based on reservation data
                        initializeSession(reservation);
                    } catch (e) {
                        console.error('Failed to fetch reservation details:', e);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch participants:', e);
            }
        };
        fetchParticipants();
    }, [groupId]); // Removed initializeSession from dependencies to prevent infinite loops

    // Initialize session when reservation data changes
    useEffect(() => {
        if (reservationData) {
            console.log('Reservation data changed, initializing session:', reservationData);
            initializeSession(reservationData);
            
            // Check if session was already dissolved and set summary if available
            if (reservationData.ended_at && !sessionSummary) {
                const startTime = reservationData.started_at ? new Date(reservationData.started_at) : new Date();
                const endTime = new Date(reservationData.ended_at);
                const elapsedTime = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
                
                // Set dissolve button as used if session already ended
                setDissolveButtonUsed(true);
                
                // Calculate cast earnings for completed session
                const calculateCompletedSessionEarnings = async () => {
                    const castParticipants = participants.filter(p => p.type === 'cast');
                    const castEarnings = [];
                    
                    for (const cast of castParticipants) {
                        try {
                            const castProfile = await getCastProfile(cast.id);
                            let categoryPoints = 12000;
                            let category = 'プレミアム';
                            
                            if (castProfile?.cast?.category) {
                                category = castProfile.cast.category;
                                switch (castProfile.cast.category) {
                                    case 'ロイヤルVIP':
                                        categoryPoints = 18000;
                                        break;
                                    case 'VIP':
                                        categoryPoints = 15000;
                                        break;
                                    case 'プレミアム':
                                    default:
                                        categoryPoints = 12000;
                                        break;
                                }
                            }
                            
                            const elapsedMinutes = elapsedTime / 60;
                            const points = Math.floor(categoryPoints * elapsedMinutes / 30);
                            
                            castEarnings.push({
                                castId: cast.id,
                                nickname: cast.nickname || 'キャスト',
                                avatar: cast.avatar || '/assets/avatar/female.png',
                                points: Math.max(1, points),
                                category: category
                            });
                        } catch (castError) {
                            console.error(`Failed to fetch cast profile for cast ${cast.id}:`, castError);
                            const elapsedMinutes = elapsedTime / 60;
                            const points = Math.floor(12000 * elapsedMinutes / 30);
                            
                            castEarnings.push({
                                castId: cast.id,
                                nickname: cast.nickname || 'キャスト',
                                avatar: cast.avatar || '/assets/avatar/female.png',
                                points: Math.max(1, points),
                                category: 'プレミアム'
                            });
                        }
                    }
                    
                    setSessionSummary({
                        elapsedTime,
                        castEarnings
                    });
                };
                
                if (participants.length > 0) {
                    calculateCompletedSessionEarnings();
                }
            }
        }
    }, [reservationData, initializeSession, participants, sessionSummary]);

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
        console.log('CastGroupChatScreen: Received real-time message:', message);
        setMessages(prev => {
            const messageExists = prev.some(m => m.id === message.id);
            if (messageExists) return prev;
            return [...prev, message];
        });
    }, []);
    useGroupMessages(groupId, handleRealtimeMessage);

    // Debug WebSocket connection status
    useEffect(() => {
        const checkConnection = () => {
            const echo = (window as any).Echo;
            if (echo && echo.connector && echo.connector.pusher) {
                const state = echo.connector.pusher.connection.state;
                console.log('CastGroupChatScreen: WebSocket connection state:', state);
            }
        };
        
        checkConnection();
        const interval = setInterval(checkConnection, 5000); // Check every 5 seconds
        
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const popoverRef = useRef<HTMLDivElement>(null);
    const fileSelectInputRef = useRef<HTMLInputElement>(null);

    const handleSend = async () => {
        if (!input.trim() && !attachedFile && !showGiftModal) return;
        
        const userId = castId || user?.id;
        if (!userId) {
            setSendError('ユーザーIDが見つかりません');
            return;
        }

        setSending(true);
        setSendError(null);

        try {
            const messageData: any = {
                group_id: groupId,
                message: input.trim(),
                sender_cast_id: userId, // Use the correct user ID
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

            // Send the message
            const response = await sendGroupMessage(messageData);
            
            // Immediately add the sent message returned from API (has real id)
            if (response) {
                setMessages(prev => {
                    const exists = prev.some(m => m.id === response.id);
                    return exists ? prev : [...prev, response];
                });
            } else {
                // If no response, try to refresh messages after a short delay
                setTimeout(async () => {
                    try {
                        const userType = castId ? 'cast' : 'guest';
                        const response = await getGroupMessages(groupId, userType, userId);
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
            setSendError(`メッセージの送信に失敗しました: ${error.response?.data?.message || error.message || 'Unknown error'}`);
        } finally {
            setSending(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputEl = e.target;
        const file = inputEl.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setSendError('画像ファイルを選択してください');
            inputEl.value = '';
            return;
        }
        setAttachedFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setImagePreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
        // Allow selecting the same file again later
        inputEl.value = '';
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

    // const handleGiftSelect = (gift: any) => {
    //     setSelectedGiftCategory(gift.id);
    //     setShowGiftModal(false);
    //     setInput(prev => prev + ` 🎁 ${gift.name}`);
    // };

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
        return '管理者';
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
            <div className="bg-gradient-to-b from-primary via-primaru to-secondary min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    // Check if we have a valid user ID
    if (!castId && !user?.id) {
        return (
            <div className="bg-primary min-h-screen flex items-center justify-center">
                <div className="text-white text-center">
                    <div>ユーザーIDが見つかりません</div>
                    <div className="text-sm mt-2">ログインしてください</div>
                </div>
            </div>
        );
    }

    // Check if groupId is valid
    if (!groupId || isNaN(Number(groupId))) {
        return (
            <div className="bg-primary min-h-screen flex items-center justify-center">
                <div className="text-white text-center">
                    <div>無効なグループIDです</div>
                    <div className="text-sm mt-2">グループID: {groupId}</div>
                </div>
            </div>
        );
    }

    return (
        <div className=" min-h-screen flex flex-col">
            {/* Fixed Header */}
            <div className="flex max-w-md mx-auto w-full items-center justify-between px-4 py-3 border-b border-secondary bg-primary fixed top-0 left-0 right-0 z-20">
                <button onClick={onBack} className="text-white hover:text-secondary cursor-pointer">
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
                {/* <div className="flex space-x-2">
                    <button 
                        onClick={() => {
                            setFetching(true);
                            setFetchError(null);
                            // Re-trigger the useEffect by changing a dependency
                            setMessages([]);
                        }}
                        className="text-white hover:text-secondary text-sm"
                        disabled={fetching}
                    >
                        {fetching ? '更新中...' : '更新'}
                    </button>
                </div> */}
            </div>

            {/* Session Timer - Fixed below header when reservation is active */}
            {reservationId && (
                <div className="fixed max-w-md mx-auto left-0 right-0 top-16 z-20 px-4 py-2 bg-primary border-b border-secondary">
                    <SessionTimer
                        isActive={sessionState.isActive}
                        elapsedTime={sessionState.elapsedTime}
                        onMeet={handleMeet}
                        onDissolve={dissolveButtonUsed ? undefined : handleDissolve}
                        isLoading={sessionLoading}
                        className="w-full"
                        dissolveButtonUsed={dissolveButtonUsed}
                        sessionSummary={sessionSummary}
                    />
                </div>
            )}

            {/* Messages - Scrollable Area */}
            <div className="h-screen overflow-y-auto px-4 py-2 space-y-4 pb-28 relative scrollbar-hidden" style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                marginTop: reservationId ? (dissolveButtonUsed && sessionSummary ? '30rem' : '18rem') : '4rem'
            }}>
                {fetchError && (
                    <div className="text-red-500 text-center py-4">
                        <div>{fetchError}</div>
                        <button 
                            onClick={() => {
                                setFetching(true);
                                setFetchError(null);
                                setMessages([]);
                            }}
                            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                            再試行
                        </button>
                    </div>
                )}
                
                {!fetching && messages.length === 0 && !fetchError && (
                    <div className="text-gray-400 text-center py-8">
                        <div>メッセージがありません</div>
                        <div className="text-sm mt-2">最初のメッセージを送信してみましょう</div>
                    </div>
                )}
                

                
                {messages.map((message, index) => {
                    // Improved message ownership determination for cast group chat
                    // Check if message is from the current cast
                    const currentUserId = castId || user?.id;
                    const isOwnMessage = currentUserId && (
                        message.sender_cast_id === currentUserId ||
                        (message.cast && message.cast.id === currentUserId)
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

                    const messageElement = (
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
                                                className="w-64 h-32 object-cover rounded mb-2 cursor-pointer"
                                                onClick={() => setPreviewImageUrl(`${IMAGE_BASE_URL}/storage/${message.image}`)}
                                            />
                                        )}
                                        
                                        {message.gift && (
                                            <div className="bg-yellow-500 text-black rounded p-2 mb-2">
                                                <div className="flex items-center">
                                                    <span className="text-2xl mr-2">🎁</span>
                                                    <span className="font-bold">{message.gift.name}</span>
                                                </div>
                                                {/* {message.gift.description && (
                                                    <div className="text-xs mt-2 text-center text-gray-700">
                                                        {message.gift.description}
                                                    </div>
                                                )} */}
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

                    // Check if this is the admin message (matching confirmation)
                    const isAdminMessage = message.message && (
                        message.message.includes('マッチングが成立しました') && 
                        message.message.includes('ゲストと合流する直前に合流ボタンを必ず押下してください')
                    );

                    // Always render message; timer is fixed at top when active
                    return messageElement;
                })}
                <div ref={messagesEndRef} />

                {previewImageUrl && (
                    <div
                        className="absolute inset-0 z-30 bg-black bg-opacity-40 flex items-center justify-center"
                        onClick={() => setPreviewImageUrl(null)}
                    >
                        <div className="relative bg-primary rounded-lg shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
                            <img
                                src={previewImageUrl}
                                alt="preview"
                                className="w-[420px] h-[420px] object-contain rounded"
                            />
                            <button
                                className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center"
                                onClick={() => setPreviewImageUrl(null)}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed Input Area */}
            <div className="border-t border-secondary p-4 max-w-md mx-auto w-full bg-primary fixed bottom-0 left-0 right-0 z-20">
                {sendError && (
                    <div className="text-red-500 text-sm mb-2">{sendError}</div>
                )}
                {sessionError && (
                    <div className="text-red-500 text-sm mb-2">{sessionError}</div>
                )}
                
                <div className="flex items-center space-x-2">
                    {/* Show file button only when no text is input */}
                    {!input.trim() && (
                        <button
                            ref={attachBtnRef}
                            onClick={() => setShowFile(!showFile)}
                            className="text-white p-2"
                        >
                            <FolderClosed className="w-5 h-5" />
                        </button>
                    )}
                    
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                
                                // Auto-resize textarea
                                if (textareaRef.current) {
                                    textareaRef.current.style.height = '40px';
                                    const scrollHeight = textareaRef.current.scrollHeight;
                                    const maxHeight = 120; // max-h-[120px] = 120px
                                    textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="メッセージを入力..."
                            className="w-full px-3 py-2 rounded-lg border border-secondary bg-primary text-white text-base resize-none min-h-[40px] max-h-[120px] placeholder-gray-300"
                            disabled={sending}
                            style={{ fontSize: '16px', height: '40px' }}
                            rows={1}
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
                    
                    {/* Show send button only when text is input */}
                    {input.trim() && (
                        <button
                            onClick={handleSend}
                            disabled={sending}
                            className="p-3 rounded-lg text-xs disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600"
                        >
                            {sending ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                </div>
                            ) : (
                                <Send className="w-6 h-6" />
                            )}
                        </button>
                    )}
                </div>

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

                {/* Hidden inputs for image selection */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    aria-hidden="true"
                />
                <input
                    ref={fileSelectInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    aria-hidden="true"
                />
            </div>

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
            {/* Image preview overlay moved inside messages container */}
        </div>
    );
};

export default CastGroupChatScreen; 