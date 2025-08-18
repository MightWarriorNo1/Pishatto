/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Bird, ChevronLeft, MessageSquare, Clock, AlertCircle, CheckCircle, XCircle, Info, Send, Image} from 'lucide-react';
import { getConciergeMessages, sendConciergeMessage, markConciergeAsRead } from '../../../services/api';
import { useCast } from '../../../contexts/CastContext';
import Spinner from '../../ui/Spinner';

interface ConciergeMessage {
    id: number;
    text: string;
    is_concierge: boolean;
    message_type: string;
    category: string;
    status: string;
    admin_notes?: string;
    timestamp: string;
    created_at: string;
    metadata?: any;
}

interface CastConciergeDetailPageProps {
    onBack: () => void;
}

const CastConciergeDetailPage: React.FC<CastConciergeDetailPageProps> = ({ onBack }) => {
    const [messages, setMessages] = useState<ConciergeMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const { castId } = useCast() as any;

    useEffect(() => {
        if (castId) {
            loadMessages();
        }
    }, [castId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await getConciergeMessages(castId, 'cast');
            if (response.success) {
                setMessages(response.data.messages);
                setUnreadCount(response.data.unread_count);
            }
        } catch (error) {
            console.error('Error loading concierge messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !castId) return;

        try {
            setSending(true);
            const response = await sendConciergeMessage(castId, 'cast', newMessage);
            if (response.success) {
                // Add both user message and concierge response to the list
                setMessages(prev => [
                    ...prev,
                    response.data.user_message,
                    response.data.concierge_message
                ]);
                setNewMessage('');
                
                // Mark messages as read
                await markConciergeAsRead(castId, 'cast');
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const getMessageTypeIcon = (type: string) => {
        switch (type) {
            case 'inquiry':
                return <Info className="w-4 h-4" />;
            case 'support':
                return <AlertCircle className="w-4 h-4" />;
            case 'reservation':
                return <Clock className="w-4 h-4" />;
            case 'payment':
                return <MessageSquare className="w-4 h-4" />;
            case 'technical':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <MessageSquare className="w-4 h-4" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'in_progress':
                return <AlertCircle className="w-4 h-4 text-blue-500" />;
            case 'resolved':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'closed':
                return <XCircle className="w-4 h-4 text-gray-500" />;
            default:
                return <Clock className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'urgent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'normal':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'low':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const quickReplies = [
        'サービスについて教えて',
        'トラブルが発生しました',
        '予約について質問があります',
        '支払いについて教えて',
        '技術的な問題があります'
    ];

    return (
        <div className="bg-gradient-to-b from-primary via-primary to-secondary min-h-screen flex flex-col relative">
            {/* Header */}
            <div className="fixed top-0 max-w-md mx-auto left-0 right-0 z-20 flex items-center px-4 py-3 border-b border-secondary bg-primary">
                <button onClick={onBack} className="mr-3 cursor-pointer hover:text-secondary">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center flex-1">
                    <Bird className="w-10 h-10 text-yellow-500 cursor-pointer mr-3" />
                    <div>
                        <div className="font-bold text-white text-lg">コンシェルジュサポート</div>
                        <div className="text-white text-xs">
                            {unreadCount > 0 ? `${unreadCount}件の未読メッセージ` : 'すべて既読'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 mt-20 mb-24 overflow-y-auto pb-20">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Spinner />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Welcome message if no messages */}
                        {messages.length === 0 && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-white/10 text-white border">
                                    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-3 mb-3 text-white">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                                                <div className="w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                                                    <div className="w-3 h-3 bg-black rounded-full"></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold">pishattoコンシェルジュ</div>
                                                <div className="text-sm">ようこそ</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-sm space-y-1">
                                        <div>はじめまして。</div>
                                        <div>pishattoコンシェルジュの</div>
                                        <div>パッとくんと申します。</div>
                                        <div>「お問い合わせ窓口」として</div>
                                        <div>24時間体制でサポートさせていただきます。</div>
                                        <div>お困りの際はお気軽にご連絡ください。</div>
                                    </div>
                                    
                                    <div className="text-xs text-gray-500 mt-2">22:02</div>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="space-y-3">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.is_concierge ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                                        msg.is_concierge 
                                            ? 'bg-white text-gray-800 border border-gray-200' 
                                            : 'bg-secondary text-white'
                                    }`}>
                                        {/* Message header with type and status */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                {getMessageTypeIcon(msg.message_type)}
                                                <span className="text-xs font-medium">
                                                    {msg.message_type === 'inquiry' && 'お問い合わせ'}
                                                    {msg.message_type === 'support' && 'サポート'}
                                                    {msg.message_type === 'reservation' && '予約関連'}
                                                    {msg.message_type === 'payment' && '支払い関連'}
                                                    {msg.message_type === 'technical' && '技術的'}
                                                    {msg.message_type === 'general' && '一般'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {getStatusIcon(msg.status)}
                                                <span className="text-xs">
                                                    {msg.status === 'pending' && '未対応'}
                                                    {msg.status === 'in_progress' && '対応中'}
                                                    {msg.status === 'resolved' && '解決済み'}
                                                    {msg.status === 'closed' && 'クローズ'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Category badge */}
                                        <div className="mb-2">
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full border ${getCategoryColor(msg.category)}`}>
                                                {msg.category === 'urgent' && '緊急'}
                                                {msg.category === 'normal' && '通常'}
                                                {msg.category === 'low' && '低優先度'}
                                            </span>
                                        </div>

                                        {/* Message content */}
                                        <div className="text-sm mb-2">{msg.text}</div>

                                        {/* Admin notes if available */}
                                        {msg.admin_notes && (
                                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-2">
                                                <div className="text-xs font-medium text-yellow-800 mb-1">管理者メモ:</div>
                                                <div className="text-xs text-yellow-700">{msg.admin_notes}</div>
                                            </div>
                                        )}

                                        {/* Timestamp */}
                                        <div className="text-xs text-gray-500">{msg.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Replies */}
                        <div className="space-y-2 mt-6">
                            <div className="text-white text-sm font-bold">クイックリプライ</div>
                            <div className="flex flex-wrap gap-2">
                                {quickReplies.map((reply, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setNewMessage(reply)}
                                        className="px-3 py-1 bg-white text-primary text-xs rounded-full border border-secondary hover:bg-gray-50 transition-colors"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Message Input */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-primary border-t border-secondary flex flex-col px-4 py-2 z-20">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="メッセージを入力..."
                        className="flex-1 px-4 py-2 rounded-full border border-secondary bg-white text-gray-800 text-sm placeholder-gray-400"
                        disabled={sending}
                    />
                    <button className="p-2 text-white hover:bg-secondary rounded-full transition-colors">
                        <Image className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleSendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="p-2 bg-secondary text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CastConciergeDetailPage; 