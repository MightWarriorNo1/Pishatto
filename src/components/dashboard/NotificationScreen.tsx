import React, { useState, useEffect } from 'react';
import { Bell, ChevronLeft, Trash2 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { getNotifications, deleteNotification, Notification, createChat, sendGuestMessage, getAdminNews, AdminNews, getCastProfileById } from '../../services/api';

// Utility function to get the first available avatar from comma-separated string
const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
    if (!avatarString) {
        return '/assets/avatar/2.jpg';
    }
    
    // Split by comma and get the first non-empty avatar
    const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
    if (avatars.length === 0) {
        return '/assets/avatar/2.jpg';
    }
    
    return `${API_BASE_URL}/${avatars[0]}`;
};


const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface NotificationScreenProps {
    onBack: () => void;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({ onBack }) => {
    const { user } = useUser();
    const [tab, setTab] = useState<'通知' | 'ニュース'>('通知');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [adminNews, setAdminNews] = useState<AdminNews[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [sendingMessage, setSendingMessage] = useState<number | null>(null);

    useEffect(() => {
        if (user?.id) {
            loadNotifications();
            loadAdminNews();
        }
    }, [user?.id]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications('guest', user!.id);
            
            // Fetch cast profiles for notifications that have cast_id
            const notificationsWithCastData = await Promise.all(
                data.map(async (notification) => {
                    if (notification.cast_id) {
                        try {
                            const castProfile = await getCastProfileById(notification.cast_id);
                            return {
                                ...notification,
                                cast: {
                                    id: castProfile.cast.id,
                                    nickname: castProfile.cast.nickname,
                                    avatar: castProfile.cast.avatar
                                }
                            };
                        } catch (error) {
                            console.error(`Failed to fetch cast profile for cast_id ${notification.cast_id}:`, error);
                            return notification;
                        }
                    }
                    return notification;
                })
            );
            
            setNotifications(notificationsWithCastData);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAdminNews = async () => {
        try {
            const data = await getAdminNews('guest', user!.id);
            setAdminNews(data);
        } catch (error) {
            console.error('Failed to load admin news:', error);
        }
    };

    const handleDeleteNotification = async (id: number) => {
        try {
            setDeletingId(id);
            await deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleSendMessage = async (notification: Notification) => {
        console.log("NOTIFICATION", notification);
        console.log("USER", user);
        if (!user?.id || !notification.cast) {
            alert('メッセージを送信できませんでした。');
            return;
        }

        try {
            setSendingMessage(notification.id);
            
            // Create a chat with the cast
            const chatResponse = await createChat(notification.cast.id, user.id);
            const chatId = chatResponse.chat.id;
            
            // Send an initial message
            await sendGuestMessage(chatId, user.id, 'こんにちは！');
            
            // Mark notification as read
            await deleteNotification(notification.id);
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        
            alert('メッセージを送信しました！');
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('メッセージの送信に失敗しました。');
        } finally {
            setSendingMessage(null);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return '今';
        if (diffInMinutes < 60) return `${diffInMinutes}分前`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}時間前`;
        return `${Math.floor(diffInMinutes / 1440)}日前`;
    };

    console.log("Notification", notifications);
    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-primary via-primary to-secondary pb-24">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b">
                <button onClick={onBack} className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <span className="text-lg font-bold flex-1 text-center">お知らせ</span>
            </div>
            {/* Tabs */}
            <div className="flex border-b">
                <button className={`flex-1 py-3 font-bold ${tab === '通知' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`} onClick={() => setTab('通知')}>通知</button>
                <button className={`flex-1 py-3 font-bold ${tab === 'ニュース' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`} onClick={() => setTab('ニュース')}>ニュース</button>
            </div>
            {/* Notification list */}
            {tab === '通知' && (
                <div className="px-4 py-2 flex flex-col gap-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            通知はありません
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div key={notification.id} className="bg-orange-50 rounded-lg p-4 flex gap-3 items-start relative">
                                {notification.cast && (
                                    <img 
                                        src={getFirstAvatarUrl(notification.cast.avatar)} 
                                        alt={notification.cast.nickname} 
                                        className="w-14 h-14 rounded-full object-cover border-2 border-white"
                                        onError={(e) => {
                                            e.currentTarget.src = '/assets/avatar/2.jpg';
                                        }}
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500 mb-1">
                                        {formatTimeAgo(notification.created_at)}・{notification.type === 'admin_news' ? 'Admin News' : '足あとがつきました'}
                                    </div>
                                    {notification.cast && (
                                        <div className="flex items-center mb-1">
                                            <span className="text-lg font-bold mr-1">{notification.cast.nickname}</span>
                                        </div>
                                    )}
                                    <div className="text-sm text-gray-700 mb-2">
                                        {notification.message}
                                    </div>
                                    {/* Only show send message button for certain notification types */}
                                    {!notification.message.includes('新しいメッセージが届きました') && 
                                     !notification.message.includes('予約がキャストにマッチされました') &&
                                     notification.type !== 'admin_news' && (
                                        <button 
                                            onClick={() => handleSendMessage(notification)}
                                            disabled={sendingMessage === notification.id}
                                            className="w-full bg-orange-500 text-white rounded font-bold py-2 flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {sendingMessage === notification.id ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                                    送信中...
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M22 7l-10 7L2 7" /></svg>
                                                    メッセージを送る
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleDeleteNotification(notification.id)}
                                    disabled={deletingId === notification.id}
                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                                >
                                    {deletingId === notification.id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
            {tab === 'ニュース' && (
                <div className="px-4 py-4 flex flex-col gap-4">
                    {adminNews.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            ニュースはありません
                        </div>
                    ) : (
                        adminNews.map((news) => (
                            <div key={news.id} className="bg-white/10 rounded-lg p-4 border border-secondary">
                                <div className="text-xs text-gray-400 mb-2">{news.published_at}</div>
                                <div className="text-sm font-semibold text-white mb-1">{news.title}</div>
                                <div className="text-sm text-gray-300">{news.content}</div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationScreen; 