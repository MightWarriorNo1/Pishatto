/*eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, Trash2 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { getNotifications, deleteNotification, Notification, createChat, sendGuestMessage, getAdminNews, AdminNews, getCastProfileById, markAllNotificationsRead, fetchUserChats } from '../../services/api';
import { useAdminNews } from '../../hooks/useRealtime';
import Spinner from '../ui/Spinner';

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


const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface NotificationScreenProps {
    onBack: () => void;
    onNotificationCountChange?: (count: number) => void;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({ onBack, onNotificationCountChange }) => {
    const { user } = useUser();
    const [tab, setTab] = useState<'通知' | 'ニュース'>('通知');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [adminNews, setAdminNews] = useState<AdminNews[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [sendingMessage, setSendingMessage] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id) {
            loadNotifications();
            loadAdminNews();
            // Mark all notifications as read when screen is opened
            markAllNotificationsRead('guest', user.id).catch(error => {
                console.error('Failed to mark notifications as read:', error);
            });
        }
    }, [user?.id]);

    // Real-time admin news updates
    useAdminNews('guest', (news) => {
        setAdminNews(prev => {
            // Check if news already exists to avoid duplicates
            const exists = prev.find(item => item.id === news.id);
            if (!exists) {
                return [news, ...prev];
            }
            return prev;
        });
    });

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications('guest', user!.id);
            
            // Filter out admin news from notifications - they should only appear in the news tab
            const nonAdminNotifications = data.filter(notification => notification.type !== 'admin_news');
            
            // Fetch cast profiles for notifications that have cast_id
            const notificationsWithCastData = await Promise.all(
                nonAdminNotifications.map(async (notification) => {
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
            
            // Update unread count
            const unreadCount = notificationsWithCastData.filter(n => !n.read).length;
            onNotificationCountChange?.(unreadCount);
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
        console.log('Attempting to delete notification:', id);
        
        if (!window.confirm('この通知を削除しますか？')) {
            return;
        }
        
        try {
            setDeletingId(id);
            console.log('Calling deleteNotification API...');
            await deleteNotification(id);
            console.log('Notification deleted successfully');
            
            const updatedNotifications = notifications.filter(n => n.id !== id);
            setNotifications(updatedNotifications);
            
            // Update unread count
            const unreadCount = updatedNotifications.filter(n => !n.read).length;
            onNotificationCountChange?.(unreadCount);
        } catch (error) {
            console.error('Failed to delete notification:', error);
            alert('通知の削除に失敗しました。');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSendMessage = async (notification: Notification) => {
        if (!user?.id || !notification.cast) {
            alert('メッセージを送信できませんでした。');
            return;
        }

        try {
            setSendingMessage(notification.id);
            
            let chatId: number;
            
            // Check if this is a "キャストと合流しました" notification
            if (notification.message.includes('キャストと合流しました。合流後は自動延長となります。解散する際はキャストに解散とお伝えし、ボタン押下して終了となります。それでは、キャストとの時間をごゆっくりとお楽しみください。')) {
                // For meeting notifications, find the existing chat
                const existingChats = await fetchUserChats('guest', user.id);
                const existingChat = existingChats.find((chat: any) => chat.cast_id === notification.cast!.id);
                
                if (existingChat) {
                    chatId = existingChat.id;
                } else {
                    // If no existing chat found, create a new one
                    const chatResponse = await createChat(notification.cast.id, user.id);
                    chatId = chatResponse.chat.id;
                }
            } else {
                // For other notifications, create a new chat
                const chatResponse = await createChat(notification.cast.id, user.id);
                chatId = chatResponse.chat.id;
                
                // Send an initial message only for new chats
                await sendGuestMessage(chatId, user.id, 'こんにちは！');
            }
            
            // Mark notification as read locally without deleting it
            const updatedNotifications = notifications.map(n =>
                n.id === notification.id ? { ...n, read: true } : n
            );
            setNotifications(updatedNotifications);
            // Update unread count
            const unreadCount = updatedNotifications.filter(n => !n.read).length;
            onNotificationCountChange?.(unreadCount);

            // Navigate to dashboard message tab with the chat opened
            navigate('/dashboard', { replace: true, state: { openChatId: chatId, openMessageTab: true } });
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

    const renderNotificationMessage = (message: string) => {
        // Split message by newlines and process each line
        const lines = message.split('\n');
        
        return lines.map((line, index) => {
            // Check if line contains a URL
            if (line.includes('🔗') || line.includes('URL：') || line.includes('http')) {
                // Extract URL from the line
                const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
                if (urlMatch) {
                    const url = urlMatch[1];
                    const displayText = line.replace(url, '').trim();

                    const sameOrigin = (() => {
                        try {
                            const u = new URL(url);
                            return u.origin === window.location.origin;
                        } catch {
                            return false;
                        }
                    })();

                    // If same origin, do client-side navigation to show PublicReceiptView
                    if (sameOrigin) {
                        const path = new URL(url).pathname;
                        return (
                            <div key={index} className="mb-2">
                                <span className="text-white/90">{displayText}</span>
                                <button
                                    onClick={() => navigate(path)}
                                    className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 underline font-medium transition-colors ml-1 hover:scale-105"
                                >
                                    {url}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </button>
                            </div>
                        );
                    }
                    
                    // External link fallback
                    return (
                        <div key={index} className="mb-2">
                            <span className="text-white/90">{displayText}</span>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 underline font-medium transition-colors ml-1 hover:scale-105"
                            >
                                {url}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    );
                }
            }
            
            // Regular line without URL - check for emojis and style accordingly
            if (line.trim() === '') {
                return <div key={index} className="h-2"></div>; // Empty line spacing
            }
            
            // Style lines with emojis
            if (line.includes('🎉') || line.includes('✅')) {
                return (
                    <div key={index} className="text-green-300 font-semibold text-base mb-2">
                        {line}
                    </div>
                );
            }
            
            if (line.includes('📄') || line.includes('🔗')) {
                return (
                    <div key={index} className="text-blue-300 font-medium mb-2">
                        {line}
                    </div>
                );
            }
            
            if (line.includes('⚠️')) {
                return (
                    <div key={index} className="text-yellow-300 font-medium mb-2">
                        {line}
                    </div>
                );
            }
            
            if (line.includes('🙏')) {
                return (
                    <div key={index} className="text-purple-300 font-medium mb-2">
                        {line}
                    </div>
                );
            }
            
            // Default styling for regular text
            return (
                <div key={index} className="text-white/90 mb-2">
                    {line}
                </div>
            );
        });
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-primary to-secondary pb-24">
            {/* Top bar - Fixed */}
            <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50">
                <div className="flex items-center px-4 py-3 border-b bg-gradient-to-b from-primary via-primary to-secondary">
                    <button onClick={onBack} className="mr-2 text-2xl text-white">
                        <ChevronLeft className="w-6 h-6 text-white hover:text-secondary cursor-pointer" />
                    </button>
                    <span className="text-lg font-bold flex-1 text-center">お知らせ</span>
                </div>
                {/* Tabs - Fixed */}
                <div className="flex border-b bg-gradient-to-b from-primary via-primary to-secondary">
                    <button className={`flex-1 py-3 font-bold ${tab === '通知' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`} onClick={() => setTab('通知')}>通知</button>
                    <button className={`flex-1 py-3 font-bold ${tab === 'ニュース' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`} onClick={() => setTab('ニュース')}>ニュース</button>
                </div>
            </div>
            {/* Content with top padding to account for fixed header */}
            <div className="pt-24">
                {/* Notification list */}
                {tab === '通知' && (
                    <div className="px-4 py-6 flex flex-col gap-4">
                        {loading ? (
                            <Spinner />
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                通知はありません
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div key={notification.id} className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-5 flex gap-4 items-start relative border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                                    {notification.cast && (
                                        <img 
                                            src={getFirstAvatarUrl(notification.cast.avatar)} 
                                            alt={notification.cast.nickname} 
                                            className="w-16 h-16 rounded-full object-cover border-3 border-white/30 shadow-lg cursor-pointer hover:border-white/50 transition-all duration-300"
                                            onError={(e) => {
                                                e.currentTarget.src = '/assets/avatar/female.png';
                                            }}
                                            onClick={() => navigate(`/cast/${notification.cast!.id}`)}
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="text-xs text-white/70 font-medium">
                                                {formatTimeAgo(notification.created_at)}
                                                {notification.type === 'admin_news' && (
                                                    <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">Admin News</span>
                                                )}
                                            </div>
                                        </div>
                                        {notification.cast && (
                                            <div className="flex items-center mb-3">
                                                <span className="text-lg font-bold text-white mr-2">{notification.cast.nickname}</span>
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            </div>
                                        )}
                                        <div className="text-sm text-white/90 leading-relaxed">
                                            {renderNotificationMessage(notification.message)}
                                        </div>
                                        {/* Show message button for specific notification types */}
                                        {/* {!notification.message.includes('新しいメッセージが届きました') && 
                                         !notification.message.includes('キャストが予約に応募しました') &&
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
                                        )} */}
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteNotification(notification.id)}
                                        disabled={deletingId === notification.id}
                                        className="absolute top-3 right-3 p-2 text-white/60 hover:text-red-400 hover:bg-red-500/20 disabled:opacity-50 z-10 cursor-pointer rounded-full transition-all duration-300 hover:scale-110"
                                    >
                                        {deletingId === notification.id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-400"></div>
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
        </div>
    );
};

export default NotificationScreen; 