import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Image, Send } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useNotificationSettings } from '../../../contexts/NotificationSettingsContext';
import { useCast } from '../../../contexts/CastContext';
import { getChatById, getChatMessages, sendMessage, getReservationById } from '../../../services/api';
import { useChatMessages } from '../../../hooks/useRealtime';
import Spinner from '../../ui/Spinner';
import SessionTimer from '../../ui/SessionTimer';
import { useSessionManagement } from '../../../hooks/useSessionManagement';

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
    const [reservationId, setReservationId] = useState<number | null>(null);
    const [reservationData, setReservationData] = useState<any>(null);
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<any>(null);
    const [proposalMsgId, setProposalMsgId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const userTz = dayjs.tz.guess();
    const formatTime = (timestamp: string) => dayjs.utc(timestamp).tz(userTz).format('YYYY-MM-DD HH:mm');

    // Session management
    const {
        sessionState,
        isLoading: sessionLoading,
        error: sessionError,
        formatElapsedTime,
        handleMeet,
        handleDissolve,
        acceptProposal: sessionAcceptProposal,
        resetSession
    } = useSessionManagement({
        reservationId,
        chatId,
        onSessionStart: () => {
            console.log('Cast session started');
        },
        onSessionEnd: () => {
            console.log('Cast session ended');
        },
        onReservationUpdate: (reservation) => {
            if (reservation) {
                setReservationId(reservation.id);
                setReservationData(reservation);
            }
        }
    });

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
            if (chat && chat.reservation_id) {
                setReservationId(chat.reservation_id);
                // Fetch reservation details
                getReservationById(chat.reservation_id).then(reservation => {
                    setReservationData(reservation);
                }).catch(() => setReservationData(null));
            }
        }).catch(() => setGuestInfo(null));
    }, [chatId]);

    useChatMessages(chatId, (message) => {
        setMessages(prev => {
            const filtered = prev.filter(m => m.id !== message.id);
            return [...filtered, message];
        });
    });

    // Ensure messages are displayed from old to new
    const sortedMessages = React.useMemo(() => {
        return [...(messages || [])].sort((a, b) => {
            const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
            return aTime - bTime;
        });
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [sortedMessages, fetching]);

    const handleSend = async () => {
        if (!input.trim() || sending || !castId) return;
        if (!isNotificationEnabled('messages')) return;
        setSending(true);
        try {
            const payload: any = { chat_id: chatId, sender_cast_id: Number(castId), message: input.trim() };
            const realMsg = await sendMessage(payload);
            setMessages(prev => [...prev, realMsg]);
            setInput('');
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = '40px';
            }
        } catch (e) {
            // noop minimal handling
        } finally {
            setSending(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = '40px';
            const scrollHeight = textareaRef.current.scrollHeight;
            const maxHeight = 120; // max-h-[120px] = 120px
            textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
        }
    };

    return (
        <div className="bg-white min-h-screen flex flex-col relative">
            {/* Header */}
            <div className="fixed max-w-md mx-auto left-0 right-0 items-center flex px-4 py-3 border-b border-secondary bg-primary h-16">
                <button onClick={onBack} className="mr-2 text-white hover:text-secondary cursor-pointer">
                    <ChevronLeft size={30} />
                </button>
                <img
                    src={guestInfo?.avatar ? getFirstAvatarUrl(guestInfo.avatar) : '/assets/avatar/1.jpg'}
                    alt="avatar"
                    className="w-8 h-8 rounded-full mr-2 border border-secondary"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/avatar/1.jpg'; }}
                />
                <div className="flex flex-col">
                    <span className="font-bold text-white text-base truncate">{guestInfo?.nickname || 'ゲスト'}</span>
                </div>
            </div>

            {/* Session Timer - Only show if there's an active reservation */}
            {reservationId && (
                <div className="fixed max-w-md mx-auto left-0 right-0 top-16 z-20 px-4 py-2 bg-primary border-b border-secondary">
                    <SessionTimer
                        isActive={sessionState.isActive}
                        elapsedTime={sessionState.elapsedTime}
                        onMeet={handleMeet}
                        onDissolve={handleDissolve}
                        isLoading={sessionLoading}
                        className="w-full"
                    />
                </div>
            )}
            
            {/* Messages */}
            <div className="max-w-md mx-auto w-full flex-1 bg-gradient-to-b from-primary via-primary to-secondary overflow-y-auto px-4 py-4" style={{ marginTop: reservationId ? '16rem' : '4rem', minHeight: 0 }}>
                {fetching ? (
                    <Spinner />
                ) : fetchError ? (
                    <div className="text-center text-red-400 py-10">{fetchError}</div>
                ) : sortedMessages.length === 0 ? (
                    <div className="text-center text-white py-10">メッセージがありません</div>
                ) : (
                    sortedMessages.map((msg, idx) => {
                        const isFromCast = msg.sender_cast_id && !msg.sender_guest_id;
                        const isSent = isFromCast && castId && String(msg.sender_cast_id) === String(castId);
                        
                        // Check if message is a proposal
                        let proposal: any = null;
                        let isProposalMessage = false;
                        try {
                            if (typeof msg.message === 'string') {
                                const parsed = JSON.parse(msg.message);
                                if (parsed && parsed.type === 'proposal') {
                                    proposal = parsed;
                                    isProposalMessage = true;
                                }
                            }
                        } catch (e) { 
                            // Not a JSON message or parsing failed
                        }
                        
                        if (isProposalMessage && proposal) {
                            // This is a proposal - always display on left side for cast
                            const isAccepted = reservationData && reservationData.scheduled_at === proposal.date;
                            
                            return (
                                <React.Fragment key={msg.id || idx}>
                                    {msg.created_at && (
                                        <div className="flex justify-center my-2">
                                            <span className="text-xs text-gray-300 bg-black/20 px-3 py-1 rounded-full">
                                                {formatTime(msg.created_at)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-start mb-4">{/* Force proposals to left side for cast */}
                                        <div 
                                            className={`bg-orange-600 text-white rounded-lg px-4 py-3 max-w-[80%] text-sm shadow-md relative ${isAccepted ? 'opacity-60' : 'cursor-pointer hover:bg-orange-700'}`}
                                            onClick={!isAccepted ? () => {
                                                setSelectedProposal(proposal);
                                                setProposalMsgId(msg.id);
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
                                </React.Fragment>
                            );
                        }
                        
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

            {/* Proposal Modal */}
            {showProposalModal && selectedProposal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center min-w-[320px] max-w-[90vw]">
                        <h2 className="font-bold text-lg mb-4 text-black">予約提案の確認</h2>
                        <div className="mb-4 text-black">
                            <div>日程：{selectedProposal.date ? new Date(selectedProposal.date).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}～</div>
                            <div>人数：{selectedProposal.people?.replace(/名$/, '')}人</div>
                            <div>時間：{selectedProposal.duration}</div>
                            <div>消費ポイント：{selectedProposal.totalPoints?.toLocaleString()}P</div>
                            <div>（延長：{selectedProposal.extensionPoints?.toLocaleString()}P / 15分）</div>
                        </div>
                        {sessionError && <div className="text-red-500 mb-2">{sessionError}</div>}
                        <div className="flex gap-4">
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded font-bold disabled:opacity-50"
                                disabled={sessionLoading}
                                onClick={async () => {
                                    try {
                                        const proposalData = {
                                            date: selectedProposal.date,
                                            duration: selectedProposal.duration ? parseInt(selectedProposal.duration as string, 10) : 120,
                                            totalPoints: selectedProposal.totalPoints,
                                            guestId: selectedProposal.guestId,
                                            castId: castId
                                        };
                                        await sessionAcceptProposal(proposalData);
                                        setShowProposalModal(false);
                                        setSelectedProposal(null);
                                        setProposalMsgId(null);
                                    } catch (error) {
                                        console.error('Failed to accept proposal:', error);
                                    }
                                }}
                            >承認</button>
                            <button
                                className="px-4 py-2 bg-gray-400 text-white rounded font-bold"
                                onClick={() => { 
                                    setShowProposalModal(false); 
                                    setSelectedProposal(null); 
                                    setProposalMsgId(null); 
                                }}
                            >キャンセル</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-primary border-t border-secondary flex items-center px-3 py-2 z-20">
                <textarea
                    ref={textareaRef}
                    className={`flex-1 px-3 py-2 rounded-lg border border-secondary text-base mr-2 resize-none min-h-[40px] max-h-[120px] ${isNotificationEnabled('messages') ? 'bg-primary text-white placeholder-gray-300' : 'bg-gray-600 text-gray-400 cursor-not-allowed placeholder-gray-500'}`}
                    placeholder={isNotificationEnabled('messages') ? 'メッセージを入力...' : 'メッセージ通知が無効です'}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={async (e) => { 
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            await handleSend();
                        }
                    }}
                    disabled={!isNotificationEnabled('messages')}
                    style={{ fontSize: '16px', height: '40px' }}
                    rows={1}
                />
                <div className="flex flex-col gap-1">
                    <span className={`cursor-pointer ${isNotificationEnabled('messages') ? 'text-white hover:text-secondary' : 'text-gray-500'}`}>
                        <Image size={20} />
                    </span>
                    <button
                        onClick={handleSend}
                        disabled={sending || !input.trim() || !isNotificationEnabled('messages')}
                        className={`px-3 py-1 rounded-lg text-xs disabled:opacity-50 ${isNotificationEnabled('messages') ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-500 text-gray-300'}`}
                    >
                        <Send className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CastChatScreen;


