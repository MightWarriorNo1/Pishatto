/* eslint-disable */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, Calendar, Image, Search, Filter, Camera, FolderClosed, Send } from 'lucide-react';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useNavigate } from 'react-router-dom';
import MessageProposalPage from './MessageProposalPage';
import { useCast } from '../../../contexts/CastContext';
import { useChatMessages as useRealtimeChatMessages } from '../../../hooks/useRealtime';
import { 
  useCastChats, 
  useChatMessages, 
  useChatById, 
  useGuestReservations, 
  useSendMessage 
} from '../../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/react-query';
import ConciergeChat from '../../ConciergeChat';
import dayjs from 'dayjs';
import CastConciergeDetailPage from './CastConciergeDetailPage';
import CastGroupChatScreen from './CastGroupChatScreen';
import Spinner from '../../ui/Spinner';

const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

dayjs.extend(utc);
dayjs.extend(timezone);

const userTz=dayjs.tz.guess();
const buildAvatarUrl = (path?: string) => {
    if (!path) return '/assets/avatar/1.jpg';
    if (path.startsWith('http')) return path;
    return `${APP_BASE_URL}/${path}`;
};
interface Message {
    id: string;
    avatar: string;
    name: string;
    lastMessage: string;
    timestamp: Date;
    unread: boolean;
    guestAge?: string; // This now stores birth year from backend
    is_group_chat?: boolean;
    group_id?: number;
    group_name?: string;
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
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileSelectInputRef = useRef<HTMLInputElement>(null);
    const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const IMAGE_BASE_URL = APP_BASE_URL.replace(/\/api$/, '');
    const [showFile, setShowFile] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Camera functionality
    const [showCamera, setShowCamera] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // New: ref for input bar and popover for click outside
    const inputBarRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const { castId } = useCast() as any;
    const queryClient = useQueryClient();

    // React Query hooks
    const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useChatMessages(Number(message.id), castId);
    const { data: chatInfo } = useChatById(Number(message.id));
    const { data: guestReservations = [] } = useGuestReservations(chatInfo?.guest_id || 0);
    const sendMessageMutation = useSendMessage();
    
    // Real-time updates using the existing hook
    useRealtimeChatMessages(Number(message.id), (msg: any) => {
        // Invalidate React Query cache to trigger refetch
        // This ensures real-time updates are reflected in the UI
        queryClient.invalidateQueries({ 
            queryKey: queryKeys.cast.chatMessages(Number(message.id), castId) 
        });
    });

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

    // Ensure freshest data when opening a chat
    useEffect(() => {
        // Force a refetch on mount or when switching chats
        refetchMessages?.();
    }, [refetchMessages, message.id]);

    // Auto scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Ensure messages are displayed from old to new
    const sortedMessages = useMemo(() => {
        return [...(messages || [])].sort((a: any, b: any) => {
            const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
            return aTime - bTime;
        });
    }, [messages]);

    // Close popovers/modals with Escape
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowFile(false);
                setShowCamera(false);
                setLightboxUrl(null);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // Real-time updates are handled by React Query automatically

    const formatTime = (timestamp: string) => {
    
        return dayjs.utc(timestamp).tz(userTz).format('YYYY-MM-DD HH:mm');
    };

    const handleImageButtonClick = () => {
        setShowFile((prev) => !prev);
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

    const handleAvatarClick = () => {
        if (chatInfo?.guest_id) {
            navigate(`/guest/${chatInfo.guest_id}`);
        }
    };

    if (messageProposal) return <MessageProposalPage 
        chatId={Number(message.id)}
        onBack={() => setMessageProposal(false)}
        onProposalSend={async (proposal) => {
            try {
                // use castId from component scope
                if (!castId) return;
                const payload: any = {
                    chat_id: Number(message.id),
                    sender_cast_id: castId,
                    message: JSON.stringify({ type: 'proposal', ...proposal }),
                };
                await sendMessageMutation.mutateAsync(payload);
            } finally {
                setMessageProposal(false);
            }
        }}
    />;

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-secondary relative pb-24">
            {/* Header (fixed) */}  
            <div className="fixed max-w-md mx-auto left-0 right-0 h-16 flex items-center px-4 py-3 border-b border-secondary bg-primary">
                <button onClick={onBack} className="mr-2 text-white hover:text-secondary cursor-pointer">
                    <ChevronLeft size={24} />
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
                className="overflow-y-auto px-4 pt-4 scrollbar-hidden"
                style={{
                    marginTop: '4rem', // header height (h-16 = 4rem)
                    marginBottom: '5.5rem', // input area height
                    height: 'calc(100vh - 6.5rem)', // viewport height minus header and input heights
                }}
            >
                {(sortedMessages || []).map((msg: any, idx: number) => {
                    // Date separator
                    const currentDate = msg.created_at ? dayjs(msg.created_at).format('YYYY-MM-DD') : '';
                    const prev = (sortedMessages || [])[idx - 1];
                    const prevDate = prev && prev.created_at ? dayjs(prev.created_at).format('YYYY-MM-DD') : '';
                    let proposal: Proposal | null = null;
                    try {
                        const parsed = typeof msg.message === 'string' ? JSON.parse(msg.message) : null;
                        if (parsed && parsed.type === 'proposal') proposal = parsed;
                    } catch (e) {}
                    if (proposal) {
                        // Check if proposal is accepted by matching guest_id and scheduled_at
                        const isAccepted = guestReservations.some((res: any) =>
                            res.guest_id === chatInfo?.guest_id &&
                            dayjs(res.scheduled_at).isSame(proposal?.date)
                        );
                        return (
                            <React.Fragment key={msg.id || `p-${idx}`}>
                                {(idx === 0 || currentDate !== prevDate) && (
                                    <div className="flex justify-center my-2">
                                        <span className="text-xs text-gray-300 bg-black/20 px-3 py-1 rounded-full">
                                            {/* {msg.created_at ? dayjs(msg.created_at).format('YYYY年M月D日 ddd') : ''} */}
                                            {formatTime(msg.created_at)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-end mb-4">
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
                            </React.Fragment>
                        );
                    }
                    const isSentByCast = castId && String(msg.sender_cast_id) === String(castId);
                    const isFromGuest = msg.sender_guest_id && !msg.sender_cast_id;
                    const isSent = isSentByCast && !isFromGuest;
                    const senderAvatar = msg?.guest?.avatar || msg?.cast?.avatar;
                    const senderName = msg?.guest?.nickname || msg?.cast?.nickname || 'ゲスト/キャスト';
                    
                    
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
                                    src={buildAvatarUrl(senderAvatar)}
                                    alt="avatar"
                                    className="w-8 h-8 rounded-full mr-2 border border-secondary mt-1"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/assets/avatar/1.jpg';
                                    }}
                                />
                            )}
                            <div className="flex flex-col">
                                {!isSent && (
                                    <div className="text-xs text-gray-400 mb-1 flex items-center">
                                        <span>{senderName}</span>
                                    </div>
                                )}
                                <div className={`${isSent ? 'w-full bg-secondary text-white rounded-lg px-4 py-2' : 'w-full bg-white text-black rounded-lg px-4 py-2'} ${msg.isOptimistic ? 'opacity-70' : ''}`}>
                                    {/* Gift display */}
                                    {msg.gift_id && msg.gift && (
                                        <div className="flex items-center mb-1">
                                            <span className="text-3xl mr-2">
                                                {msg.gift.icon}
                                            </span>
                                            <span className="font-bold">{msg.gift.name}</span>
                                            <span className="ml-2 text-xs text-primary font-bold">{msg.gift.points}P</span>
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
                                <div className={`text-xs text-gray-400 mt-1 ${isSent ? 'text-right' : 'text-left'}`}>
                                    {/* {msg.created_at ? dayjs(msg.created_at).format('YYYY.MM.DD HH:mm:ss') : ''} */}
                                    {formatTime(msg.created_at)}
                                </div>
                            </div>
                        </div>
                        </React.Fragment>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input bar (always fixed at bottom) */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-primary border-t border-secondary flex flex-col px-4 py-2 z-20">
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
                        className="flex-1 px-4 py-2 rounded-full border border-secondary text-sm mr-2 bg-primary text-white"
                        placeholder="メッセージを入力..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter' && (newMessage.trim() || attachedFile) && !sendMessageMutation.isPending) {
                                try {
                                    if (!castId) return;
                                    
                                    // Store values before clearing
                                    const messageText = newMessage.trim();
                                    const imageFile = attachedFile;
                                    
                                    // Clear input immediately for optimistic UI
                                    setNewMessage('');
                                    setAttachedFile(null);
                                    setImagePreview(null);
                                    
                                    const payload: any = {
                                        chat_id: Number(message.id),
                                        sender_cast_id: castId,
                                    };
                                    if (messageText) payload.message = messageText;
                                    if (imageFile) payload.image = imageFile;

                                    await sendMessageMutation.mutateAsync(payload);
                                } catch (error) {
                                    console.error('Failed to send message:', error);
                                }
                            }
                        }}
                    />
                    
                    <span className="text-white ml-2 cursor-pointer" onClick={handleImageButtonClick}>
                        <Image size={30} />
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileSelectInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                    <span className="text-white ml-2 cursor-pointer" onClick={() => setMessageProposal(true)}>
                        <Calendar size={30}/>
                    </span>
                    <button
                        onClick={async () => {
                            if ((newMessage.trim() || attachedFile) && !sendMessageMutation.isPending) {
                                try {
                                    if (!castId) return;
                                    
                                    // Store values before clearing
                                    const messageText = newMessage.trim();
                                    const imageFile = attachedFile;
                                    
                                    // Clear input immediately for optimistic UI
                                    setNewMessage('');
                                    setAttachedFile(null);
                                    setImagePreview(null);
                                    
                                    const payload: any = {
                                        chat_id: Number(message.id),
                                        sender_cast_id: castId,
                                    };
                                    if (messageText) payload.message = messageText;
                                    if (imageFile) payload.image = imageFile;

                                    await sendMessageMutation.mutateAsync(payload);
                                } catch (error) {
                                    console.error('Failed to send message:', error);
                                }
                            }
                        }}
                        disabled={(!newMessage.trim() && !attachedFile) || sendMessageMutation.isPending}
                        className={`ml-2 px-6 py-2 rounded-full text-sm font-medium disabled:opacity-50 transition-colors ${
                            (newMessage.trim() || attachedFile) && !sendMessageMutation.isPending
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-blue-500 text-gray-300 cursor-not-allowed'
                        }`}
                    >
                        {sendMessageMutation.isPending ? (
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
        </div >
    );
};

interface MessagePageProps {
    setIsMessageDetailOpen?: (open: boolean) => void;
    onConciergeStateChange?: (isShown: boolean) => void;
}

const MessagePage: React.FC<MessagePageProps> = ({ setIsMessageDetailOpen, onConciergeStateChange }) => {
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [filterNickname, setFilterNickname] = useState('');
    const [filterAge, setFilterAge] = useState('');
    const [showConcierge, setShowConcierge] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const { castId } = useCast() as any;

    // React Query hooks
    const { data: chats = [], isLoading: loading } = useCastChats(castId);

    useEffect(() => {
        if (setIsMessageDetailOpen) setIsMessageDetailOpen(!!selectedMessage);
    }, [selectedMessage, setIsMessageDetailOpen]);

    // Listen for external request to open a specific chat by ID
    useEffect(() => {
        const handler = (e: any) => {
            const chatId = e?.detail?.chatId;
            if (!chatId) return;
            const target = (chats || []).find((c: any) => c.id === chatId);
            if (target) {
                const mapped: Message = {
                    id: target.id,
                    avatar: buildAvatarUrl(target.avatar),
                    name: target.name,
                    lastMessage: target.last_message || '',
                    timestamp: target.updated_at ? new Date(target.updated_at) : new Date(),
                    unread: false,
                    guestAge: target.guest_age,
                    is_group_chat: Boolean(target.group_id),
                    group_id: target.group_id,
                    group_name: target.group_name,
                } as any;
                setSelectedMessage(mapped);
            }
        };
        window.addEventListener('open-cast-chat', handler as any);
        return () => window.removeEventListener('open-cast-chat', handler as any);
    }, [castId, chats]);

    // Notify parent when concierge state changes
    useEffect(() => {
        onConciergeStateChange?.(showConcierge);
    }, [showConcierge, onConciergeStateChange]);

    // Map chat data to Message interface
    const messages = (chats || []).map((chat: any) => ({
        id: chat.id,
        avatar: buildAvatarUrl(chat.avatar),
        name: chat.guest_nickname || `ゲスト ${chat.guest_id}`,
        lastMessage: chat.last_message || '',
        timestamp: chat.updated_at ? new Date(chat.updated_at) : new Date(),
        unread: !!chat.unread,
        guestAge: chat.guest_age || '', // Backend returns 'guest_age' but it contains birth year
        is_group_chat: !!chat.is_group_chat,
        group_id: chat.group_id,
        group_name: chat.group_name,
    }));

    // Filter messages based on nickname and age
    const filteredMessages = messages.filter((message: Message) => {
        const nicknameMatch = !filterNickname || 
            message.name.toLowerCase().includes(filterNickname.toLowerCase());
        
        // Calculate age from birth year if available
        let guestAge = null;
        if (message.guestAge) {
            const currentYear = new Date().getFullYear();
            guestAge = currentYear - Number(message.guestAge);
        }
        
        const ageMatch = !filterAge || 
            (guestAge && guestAge.toString().includes(filterAge));
        
        return nicknameMatch && ageMatch;
    });

    if (selectedMessage) {
        // If it's a group chat, show CastGroupChatScreen
        if (selectedMessage.is_group_chat && selectedMessage.group_id) {
            return (
                <CastGroupChatScreen
                    groupId={selectedMessage.group_id}
                    onBack={() => setSelectedMessage(null)}
                />
            );
        }
        // Otherwise show regular MessageDetail
        return <MessageDetail message={selectedMessage} onBack={() => setSelectedMessage(null)} />;
    }
    if (showConcierge) {
        return <CastConciergeDetailPage onBack={() => setShowConcierge(false)} />;
    }
    
    return (
        <div className="max-w-md min-h-screen bg-gradient-to-b from-primary via-primary to-secondary pb-20">
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
            <div className="px-4 mt-32">
                
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    <div className="divide-y divide-secondary">
                        <ConciergeChat 
                            onClick={() => setShowConcierge(true)}
                        />
                        
                        
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
                            filteredMessages.map((message: Message) => (
                                <div
                                    key={message.id}
                                    className="flex items-center p-3 cursor-pointer bg-white/10 hover:bg-secondary/10 border border-secondary"
                                    onClick={() => {
                                        setSelectedMessage(message);
                                    }}
                                >
                                    <img src={message.avatar} alt={message.name} className="w-12 h-12 rounded-full mr-4" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center">
                                                <span className="font-bold text-white text-base mr-2">
                                                    {message.is_group_chat ? message.group_name || 'Group Chat' : message.name}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
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
