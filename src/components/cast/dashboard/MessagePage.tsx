import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios'; // Remove axios, not needed
import { ChevronLeft, Calendar, Image} from 'lucide-react';
import MessageProposalPage from './MessageProposalPage';
import { sendMessage, getChatMessages } from '../../../services/api';
import { getCastChats } from '../../../services/api';
import { useChatMessages } from '../../../hooks/useRealtime';

const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
interface Message {
    id: string;
    avatar: string;
    name: string;
    lastMessage: string;
    timestamp: Date;
    unread: boolean;
}

interface MessageDetailProps {
    message: Message;
    onBack: () => void;
}


const MessageDetail: React.FC<MessageDetailProps> = ({ message, onBack }) => {
    const [messageProposal, setMessageProposal] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const IMAGE_BASE_URL = APP_BASE_URL.replace(/\/api$/, '');

    // Fetch initial messages once
    useEffect(() => {
        const fetchMessages = async () => {
            const msgs = await getChatMessages(Number(message.id));
            setMessages(Array.isArray(msgs) ? msgs : []);
        };
        fetchMessages();
    }, [message.id]);

    // Real-time updates
    useChatMessages(message.id, (msg) => {
        setMessages((prev) => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
        });
    });

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

    if (messageProposal) return <MessageProposalPage 
        onBack={() => setMessageProposal(false)}
        onProposalSend={async (proposal) => {
            setSending(true);
            try {
                const castIdStr = localStorage.getItem('castId');
                const castId = castIdStr ? Number(castIdStr) : null;
                if (!castId) return;
                const payload: any = {
                    chat_id: Number(message.id),
                    sender_cast_id: castId,
                    message: JSON.stringify({ type: 'proposal', ...proposal }),
                };
                const sent = await sendMessage(payload);
                setMessages((prev) => [...prev, sent]);
            } finally {
                setSending(false);
                setMessageProposal(false);
            }
        }}
    />;
    return (
        <div className="max-w-md min-h-screen bg-primary">
            {/* Header */}
            <div className="flex items-center px-4 py-3 border-b border-secondary">
                <button onClick={onBack} className="mr-2">
                    <ChevronLeft className="text-white" size={24} />
                </button>
                <div className="flex items-center">
                    <img src={message.avatar} alt={message.name} className="w-8 h-8 rounded-full mr-2" />
                    <span className="text-lg font-bold text-white">{message.name}</span>
                </div>
            </div>

            {/* Messages area */}
            {/* <div className="h-[calc(100vh-180px)] overflow-y-auto"> */}
            <div className=" p-4">
                {(messages || []).map((msg, idx) => {
                    let proposal = null;
                    try {
                        const parsed = typeof msg.message === 'string' ? JSON.parse(msg.message) : null;
                        if (parsed && parsed.type === 'proposal') proposal = parsed;
                    } catch (e) {}
                    if (proposal) {
                        return (
                            <div key={msg.id || idx} className="flex justify-end mb-4">
                                <div className="bg-orange-500 text-white rounded-lg px-4 py-3 max-w-[80%] text-sm shadow-md">
                                    <div>日程：{proposal.date ? new Date(proposal.date).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}～</div>
                                    <div>人数：{proposal.people.replace(/名$/, '')}人</div>
                                    <div>時間：{proposal.duration}</div>
                                    <div>消費ポイント：{proposal.totalPoints.toLocaleString()}P</div>
                                    <div>（延長：{proposal.extensionPoints.toLocaleString()}P / 15分）</div>
                                </div>
                            </div>
                        );
                    }
                    const castIdStr = localStorage.getItem('castId');
                    const castId = castIdStr ? Number(castIdStr) : null;
                    const isSent = msg.sender_cast_id && castId && msg.sender_cast_id === castId;
                    return (
                        <div key={msg.id || idx} className={isSent ? 'flex justify-end mb-4' : 'flex justify-start mb-4'}>
                            <div className={isSent ? 'bg-secondary text-white rounded-lg px-4 py-2 max-w-[80%]' : 'bg-white text-black rounded-lg px-4 py-2 max-w-[80%]'}>
                                {/* Gift display */}
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
                        </div>
                    );
                })}
            </div>

            {/* Input area */}
            <div className="w-full max-w-md flex flex-col px-4 py-2 border-b border-secondary bg-primary">
                <div className="flex items-center mb-2">
                    
                    <input
                        className="flex-1 border-none outline-none text-lg bg-primary text-white placeholder-red-400"
                        placeholder="メッセージを入力..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter' && (newMessage.trim() || attachedFile) && !sending) {
                                setSending(true);
                                try {
                                    const castIdStr = localStorage.getItem('castId');
                                    const castId = castIdStr ? Number(castIdStr) : null;
                                    if (!castId) return;
                                    const payload: any = {
                                        chat_id: Number(message.id),
                                        sender_cast_id: castId,
                                    };
                                    if (newMessage.trim()) payload.message = newMessage.trim();
                                    if (attachedFile) payload.image = attachedFile;
                                    const sent = await sendMessage(payload);
                                    setMessages((prev) => [...prev, sent]);
                                    setNewMessage('');
                                    setAttachedFile(null);
                                    setImagePreview(null);
                                } finally {
                                    setSending(false);
                                }
                            }
                        }}
                    />
                    <span className="text-white ml-2 cursor-pointer" onClick={handleImageButtonClick}>
                        <Image size={30}/>
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                    <span className="text-white ml-2 cursor-pointer" onClick={() => setMessageProposal(true)}>
                        <Calendar size={30}/>
                    </span>
                </div>
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
            </div>
        </div >
    );
};

const MessagePage: React.FC = () => {
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const castIdStr = localStorage.getItem('castId');
                const castId = castIdStr ? Number(castIdStr) : null;
                if (!castId) {
                    setMessages([]);
                    setLoading(false);
                    return;
                }
                const chats = await getCastChats(castId);
                // Map chat data to Message interface
                const mapped = (chats || []).map((chat: any) => ({
                    id: chat.id,
                    avatar: `${APP_BASE_URL}/${chat.avatar}` || '/assets/avatar/1.jpg',
                    name: chat.guest_nickname || `ゲスト ${chat.guest_id}`,
                    lastMessage: chat.last_message || '',
                    timestamp: chat.updated_at ? new Date(chat.updated_at) : new Date(),
                    unread: !!chat.unread,
                }));
                setMessages(mapped);
            } catch (err) {
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, []);

    if (selectedMessage) {
        return <MessageDetail message={selectedMessage} onBack={() => setSelectedMessage(null)} />;
    }

    return (
        <div className="max-w-md min-h-screen bg-primary pb-20">
            <div className="border-b border-secondary">
                <h1 className="text-lg font-bold text-center py-3 text-white">メッセージ</h1>
            </div>
            {loading ? (
                <div className="text-center text-white py-10">ローディング...</div>
            ) : (
                <div className="divide-y divide-secondary">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">メッセージがありません</div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className="flex items-center p-4 cursor-pointer hover:bg-secondary/10"
                                onClick={() => setSelectedMessage(message)}
                            >
                                <img src={message.avatar} alt={message.name} className="w-12 h-12 rounded-full mr-4" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-white">{message.name}</span>
                                        <span className="text-xs text-gray-400">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {/* <div className="flex items-center">
                                        <p className="text-sm text-gray-300 truncate">{message.lastMessage}</p>
                                    </div> */}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default MessagePage;
