import React, { useState, useRef, useEffect } from 'react';
import { Image, Camera, FolderClosed, Gift, ChevronLeft, X } from 'lucide-react';
import { sendMessage, getChatMessages, fetchAllGifts} from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { useChatMessages } from '../../hooks/useRealtime';

interface ChatScreenProps {
    chatId: number;
    onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ chatId, onBack }) => {
    const { user } = useUser();
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
    const [localMessages, setLocalMessages] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [sendError, setSendError] = useState<string | null>(null);
    const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const IMAGE_BASE_URL = APP_BASE_URL.replace(/\/api$/, '');
    const [gifts, setGifts] = useState<any[]>([]);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [selectedGiftCategory, setSelectedGiftCategory] = useState('standard');

    useChatMessages(chatId, (message) => {
        setMessages((prev) => {
            if (prev.some(m => m.id === message.id)) return prev;
            return [ message,...prev];
        });
    });

    useEffect(() => {
        setFetching(true);
        setFetchError(null);
        const fetchMessages = async () => {
            if (!chatId || isNaN(Number(chatId))) {
                setMessages([]);
                setFetching(false);
                return;
            }
            try {
                const msgs = await getChatMessages(chatId);
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
                const sent = await sendMessage(payload);
                // Patch the sender_guest_id or sender_cast_id for immediate alignment
                if ('sender_guest_id' in sent) sent.sender_guest_id = user.id;
                if ('sender_cast_id' in sent) sent.sender_cast_id = user.id;
                setMessages((prev) => [...prev, sent]);
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
                        const isSent = (user && (msg.sender_guest_id === user.id));
                        const senderAvatar = msg.guest?.avatar || msg.cast?.avatar || '/assets/avatar/1.jpg';
                        const senderName = msg.guest?.nickname || msg.cast?.nickname || 'ゲスト/キャスト';
                        let proposal = null;
                        try {
                            const parsed = typeof msg.message === 'string' ? JSON.parse(msg.message) : null;
                            if (parsed && parsed.type === 'proposal') proposal = parsed;
                        } catch (e) { }
                        if (proposal) {
                            return (
                                <div key={msg.id || idx} className="flex justify-start mb-4">
                                    <div className="bg-orange-600 text-white rounded-lg px-4 py-3 max-w-[80%] text-sm shadow-md">
                                        <div>日程：{proposal.date ? new Date(proposal.date).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}～</div>
                                        <div>人数：{proposal.people.replace(/名$/, '')}人</div>
                                        <div>時間：{proposal.duration}</div>
                                        <div>消費ポイント：{proposal.totalPoints.toLocaleString()}P</div>
                                        <div>（延長：{proposal.extensionPoints.toLocaleString()}P / 15分）</div>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <div key={msg.id || idx} className={isSent ? 'flex justify-end mb-4' : 'flex justify-start mb-4'}>
                                {!isSent && (
                                    <img
                                        src={senderAvatar}
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
                                    <div className="text-xs text-gray-400 mt-1 text-right">{msg.created_at}</div>
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
                                                setLocalMessages((prev) => [...prev, sent]);
                                            } catch (e) {
                                                setSendError('ギフトの送信に失敗しました');
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
                                            if ('sender_guest_id' in sent) sent.sender_guest_id = user?.id;
                                            if ('sender_cast_id' in sent) sent.sender_cast_id = user?.id;
                                            setMessages((prev) => [...prev, sent]);
                                        } catch (e) {
                                            setSendError('ギフトの送信に失敗しました');
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