import React, { useState, useRef, useEffect } from 'react';
import { Image, Camera, FolderClosed, Gift, ChevronLeft, X, Users, Calendar, Clock, Check } from 'lucide-react';
import { sendGroupMessage, getGroupMessages, fetchAllGifts, getGroupParticipants, updateReservation } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { useNotificationSettings } from '../../contexts/NotificationSettingsContext';
import { useGroupMessages } from '../../hooks/useRealtime';
import dayjs from 'dayjs';

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
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<any>(null);
    const [proposalMsgId, setProposalMsgId] = useState<number | null>(null);
    const [acceptedProposals, setAcceptedProposals] = useState<number[]>([]);
    const [proposalActionLoading, setProposalActionLoading] = useState(false);
    const [proposalActionError, setProposalActionError] = useState<string | null>(null);

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

    const handleGiftSelect = (gift: any) => {
        setSelectedGiftCategory(gift.id);
        setShowGiftModal(false);
        setInput(prev => prev + ` 🎁 ${gift.name}`);
    };

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

    return (
        <div className="min-h-screen flex flex-col">
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
                                        {message.image && (
                                            <img
                                                src={`${IMAGE_BASE_URL}/storage/${message.image}`}
                                                alt="attached"
                                                className="w-64 h-32 rounded mb-2"
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
                    
                    <button
                        onClick={() => setShowGiftModal(!showGiftModal)}
                        className="text-white p-2"
                    >
                        <Gift className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isNotificationEnabled('messages') ? "メッセージを入力..." : "メッセージ通知が無効です"}
                            className={`w-full px-3 py-2 rounded-full border border-secondary text-sm ${
                                isNotificationEnabled('messages') 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={sending || !isNotificationEnabled('messages')}
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
                        onClick={handleSend}
                        disabled={sending || (!input.trim() && !attachedFile && !showGiftModal) || !isNotificationEnabled('messages')}
                        className={`px-4 py-2 rounded-full text-sm disabled:opacity-50 ${
                            isNotificationEnabled('messages') 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-500 text-gray-300'
                        }`}
                    >
                        {sending ? '送信中...' : isNotificationEnabled('messages') ? '送信' : '送信 (無効)'}
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

                {/* Gift Modal */}
                {showGiftModal && (
                    <div className="mt-4 bg-secondary rounded-lg p-4">
                        <div className="flex space-x-2 mb-4">
                            {['standard', 'local', 'grade', 'mygift'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setGiftTab(tab as any)}
                                    className={`px-3 py-1 rounded text-sm ${
                                        giftTab === tab ? 'bg-blue-500 text-white' : 'text-gray-300'
                                    }`}
                                >
                                    {tab === 'standard' && '標準'}
                                    {tab === 'local' && 'ローカル'}
                                    {tab === 'grade' && 'グレード'}
                                    {tab === 'mygift' && 'マイギフト'}
                                </button>
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                            {gifts
                                .filter(gift => gift.category === giftTab)
                                .map(gift => (
                                    <button
                                        key={gift.id}
                                        onClick={() => handleGiftSelect(gift)}
                                        className="bg-primary rounded p-2 text-center"
                                    >
                                        <div className="text-2xl mb-1">{gift.emoji}</div>
                                        <div className="text-white text-xs">{gift.name}</div>
                                        <div className="text-yellow-400 text-xs">{gift.points}P</div>
                                    </button>
                                ))}
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
        </div>
    );
};

export default GroupChatScreen; 