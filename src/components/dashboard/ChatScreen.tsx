import React, { useState, useRef, useEffect } from 'react';
import { Image, Camera, FolderClosed, Gift, ChevronLeft, X } from 'lucide-react';
import { sendMessage, getChatMessages, fetchAllGifts, fetchRanking, updateReservation, getChatById, getGuestReservations } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { useChatMessages } from '../../hooks/useRealtime';
import dayjs from 'dayjs';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
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
    const [showGift, setShowGift] = useState(false);
    const [showFile, setShowFile] = useState(false);
    const [input, setInput] = useState('');
    const attachBtnRef = useRef<HTMLButtonElement>(null);
    const [attachPopoverStyle, setAttachPopoverStyle] = useState<React.CSSProperties>({});
    const [giftTab, setGiftTab] = useState<'standard' | 'local' | 'grade' | 'mygift'>('mygift');
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    /*eslint-disable*/
    useEffect(() => {
        setFetching(true);
        setFetchError(null);
        const fetchMessages = async () => {
            if (!chatId || isNaN(Number(chatId)) || !user || typeof user.id !== 'number') {
                setMessages([]);
                setFetching(false);
                return;
            }
            try {
                const msgs = await getChatMessages(chatId, user.id, 'guest');
                setMessages(Array.isArray(msgs) ? msgs : []);
                setFetchError(null);
            } catch (e) {
                setFetchError('メッセージの取得に失敗しました');
            } finally {
                setFetching(false);
            }
        };
        fetchMessages();
    }, [chatId]);

    useEffect(() => {
        // Fetch reservation_id for this chat
        getChatById(chatId).then(chat => {
            if (chat && chat.reservation_id) setReservationId(chat.reservation_id);
        });
    }, [chatId]);

    useEffect(() => {
        if (!user?.id) return;
        getGuestReservations(user.id).then(setGuestReservations).catch(() => setGuestReservations([]));
    }, [user?.id]);

    useChatMessages(chatId, (message) => {
        setMessages((prev) => {
            // Remove optimistic message if real one matches (by image or message and sender_guest_id)
            // Also check for duplicate messages by ID to prevent duplicates
            const filtered = prev.filter(m => {
                // Remove optimistic messages that match the real message
                if (m.id && m.id.toString().startsWith('optimistic-') &&
                    ((m.image && message.image && m.image === imagePreview) ||
                        (m.message && message.message && m.message === message.message)) &&
                    m.sender_guest_id === message.sender_guest_id) {
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

    // Position the attach popover above the attach button
    useEffect(() => {
        if (showFile && attachBtnRef.current) {
            const rect = attachBtnRef.current.getBoundingClientRect();
            setAttachPopoverStyle({
                position: 'fixed',
                left: rect.left + rect.width / 2 - 270, // 160 = popover width / 2
                top: rect.top - 160, // popover height + margin
                zIndex: 100,
            });
        }
    }, [showFile]);


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

    const handleSend = async () => {
        if ((input.trim() || attachedFile) && !sending && user) {
            setSending(true);
            setSendError(null);
            try {
                const payload: any = {
                    chat_id: chatId,
                    sender_guest_id: user.id,
                };
                if (input.trim()) payload.message = input.trim();
                if (attachedFile) payload.image = attachedFile;

                // Optimistically add the message (text or image)
                const optimisticId = `optimistic-${Date.now()}`;
                // setMessages(prev => [...prev, optimisticMsg]);

                // Send to backend
                const realMsg = await sendMessage(payload);

                // Replace optimistic message with real one
                setMessages(prev => prev.map(m => m.id === optimisticId ? realMsg : m));

                setInput('');
                setAttachedFile(null);
                setImagePreview(null);
            } catch (e) {
                setSendError('メッセージの送信に失敗しました');
            } finally {
                setSending(false);
            }
        }
    };

    return (
        <div className="bg-primary min-h-screen flex flex-col relative">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b border-secondary bg-primary">
                <button onClick={onBack} className="mr-2">
                    <ChevronLeft size={30} />
                </button>
                <img
                    src="/assets/avatar/1.jpg"
                    alt="avatar"
                    className="w-8 h-8 rounded-full mr-2 border border-secondary"
                />
                <span className="font-bold text-white text-base truncate">pishattoコンシェルジュ 11歳</span>
            </div>
            {/* Chat history */}
            <div className="flex-1 overflow-y-auto px-4 pb-32">
                {fetching ? (
                    <div className="flex justify-center items-center h-40 text-white">ローディング...</div>
                ) : fetchError ? (
                    <div className="text-center text-red-400 py-10">{fetchError}</div>
                ) : !chatId || isNaN(Number(chatId)) ? (
                    <div className="text-center text-white py-10">チャットが選択されていません</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-white py-10">メッセージがありません</div>
                ) : (
                    (messages || []).map((msg, idx) => {
                        const isSent = user && String(msg.sender_guest_id) === String(user.id);
                        const senderAvatar = msg.guest?.avatar || msg.cast?.avatar || '/assets/avatar/1.jpg';
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
                                <div
                                    key={msg.id || idx}
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
                            );
                        }
                        return (
                            <div key={msg.id || idx} className={isSent ? 'flex justify-end mb-4' : 'flex justify-start mb-4'}>
                                {!isSent && (
                                    <img
                                        src={senderAvatar ? `${API_BASE_URL}/${senderAvatar}` : '/assets/avatar/1.jpg'}
                                        alt="avatar"
                                        className="w-8 h-8 rounded-full mr-2 border border-secondary mt-1"
                                    />
                                )}
                                <div>
                                    {!isSent && <div className="text-xs text-gray-400 mb-1">{senderName}</div>}
                                    <div className={isSent ? 'bg-secondary text-white rounded-lg px-4 py-2' : 'bg-white text-black rounded-lg px-4 py-2'}>
                                        {msg.gift_id && msg.gift && (
                                            <div className="flex items-center mb-1">
                                                <span className="text-3xl mr-2">
                                                    <img src={`${IMAGE_BASE_URL}/storage/${msg.gift.icon}`} alt="gift" className="w-10 h-10" />
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
                                    <div className="text-xs text-gray-400 mt-1 text-right">{msg.created_at ? dayjs(msg.created_at).format('YYYY.MM.DD HH:mm:ss') : ''}</div>
                                </div>
                            </div>
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
            </div>
            {/* Input bar (always fixed at bottom) */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-primary border-t border-secondary flex flex-col px-4 py-2 z-20">
                {sendError && <div className="text-red-400 text-xs mb-1">{sendError}</div>}
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
                <div className="flex items-center w-full">
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 rounded-full border border-secondary bg-primary text-white text-sm mr-2"
                        placeholder="メッセージを入力..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                                await handleSend();
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
                    <button className="text-white ml-2" onClick={() => setShowGiftModal(true)}>
                        <Gift size={30} />
                    </button>
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
                                {gifts.map(gift => (
                                    <button
                                        key={gift.id}
                                        className="flex flex-col items-center justify-center bg-secondary rounded-lg p-2 text-white hover:bg-red-700 transition"
                                        onClick={async () => {
                                            if (!user) return;
                                            setShowGift(false);
                                            setSending(true);
                                            setSendError(null);
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
                                                // Add the sent message to the messages array immediately
                                                setMessages((prev) => [...prev, sent]);
                                                // Refresh user points after sending gift
                                                refreshUser();
                                            } catch (e: any) {
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
                                            <img src={`${APP_BASE_URL}/${gift.icon}`} alt="gift" className="w-5 h-5" />
                                        </span>
                                        <span className="text-xs">{gift.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="absolute top-2 right-2 text-white text-2xl" onClick={() => setShowGift(false)}>
                            <X size={30} />
                        </button>
                    </div>
                </div>
            )}
            {showGiftModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-primary rounded-2xl shadow-lg p-6 flex flex-col items-center border border-secondary min-w-[320px] max-w-[90vw]">
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
                            {gifts.filter(g => g.category === selectedGiftCategory).map(gift => (
                                <button
                                    key={gift.id}
                                    className="flex flex-col items-center justify-center bg-secondary rounded-lg p-2 text-white hover:bg-red-700 transition"
                                    onClick={async () => {
                                        setShowGiftModal(false);
                                        setSending(true);
                                        setSendError(null);
                                        try {
                                            const payload: any = {
                                                chat_id: chatId,
                                                sender_guest_id: user?.id,
                                                gift_id: gift.id,
                                            };
                                            const sent = await sendMessage(payload);
                                            // Ensure the sent message has the gift details
                                            if (sent && !sent.gift && gift) {
                                                sent.gift = {
                                                    id: gift.id,
                                                    name: gift.name || gift.label,
                                                    icon: gift.icon,
                                                    points: gift.points
                                                };
                                            }
                                            if ('sender_guest_id' in sent) sent.sender_guest_id = user?.id;
                                            if ('sender_cast_id' in sent) sent.sender_cast_id = user?.id;
                                            setMessages((prev) => [...prev, sent]);

                                            // Refresh user points after sending gift
                                            refreshUser();

                                            // Trigger ranking update by fetching current rankings
                                            try {
                                                await fetchRanking({
                                                    userType: 'guest',
                                                    timePeriod: 'current',
                                                    category: 'gift',
                                                    area: '全国'
                                                });
                                            } catch (error) {
                                                console.log('Ranking refresh failed:', error);
                                            }
                                        } catch (e: any) {
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
                                        <img src={`${IMAGE_BASE_URL}/storage/${gift.icon}`} alt="gift" className="w-10 h-10" />
                                    </span>
                                    <span className="text-xs">{gift.name}</span>
                                    <span className="text-xs text-yellow-300 font-bold">{gift.points}P</span>
                                </button>
                            ))}
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
                                        // Update guestReservations state immediately to show "承認済み" badge
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
                                        // Send system message to chat
                                        // await sendMessage({
                                        //     chat_id: chatId,
                                        //     message: '予約変更が承認されました',
                                        // });
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
            {/* Attach Popover */}
            {showFile && (
                <div style={attachPopoverStyle} className="w-80 bg-primary rounded-xl shadow-lg border border-secondary z-50 animate-fade-in">
                    <button
                        className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary text-white text-base border-b border-secondary"
                        onClick={() => {
                            setShowFile(false);
                            fileInputRef.current?.click();
                        }}
                    >
                        <span>写真ライブラリ</span>
                        <Image />
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setAttachedFile(file);
                                const reader = new FileReader();
                                reader.onload = ev => {
                                    if (typeof ev.target?.result === 'string') {
                                        setAttachedFile(file); // Only one image preview
                                        setImagePreview(ev.target.result as string);
                                    }
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary text-white text-base border-b border-secondary">
                        <span>写真またはビデオを撮る</span>
                        <Camera />
                    </button>
                    <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary text-white text-base">
                        <span>ファイルを選択</span>
                        <FolderClosed />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatScreen; 