/*eslint-disable */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, MessageCircle } from 'lucide-react';
import { getNotifications, markNotificationRead, deleteNotification, getAdminNews, AdminNews, markAllNotificationsRead, getReservationById, createChat, fetchUserChats } from '../../services/api';
import { useAdminNews } from '../../hooks/useRealtime';
import { useCast } from '../../contexts/CastContext';
import Spinner from '../../components/ui/Spinner';
import { useCastNotifications } from '../../hooks/useQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/react-query';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface CastNotificationPageProps {
    onBack: () => void;
}

const CastNotificationPage: React.FC<CastNotificationPageProps> = ({ onBack }) => {
    const [tab, setTab] = useState<'通知' | 'Admin News'>('通知');
    const [adminNews, setAdminNews] = useState<AdminNews[]>([]);
    const [showNotification, setShowNotification] = useState(false);
    const [messageLoading, setMessageLoading] = useState<number | null>(null);
    // Use authenticated cast context
    const { castId } = useCast() as any;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Use React Query hook for notifications
    const {
        data: notifications = [],
        isLoading: notificationsLoading,
        error: notificationsError
    } = useCastNotifications(castId || 0);

    // Delete notification mutation
    const deleteNotificationMutation = useMutation({
        mutationFn: deleteNotification,
        onSuccess: () => {
            // Invalidate and refetch notifications
            queryClient.invalidateQueries({ 
                queryKey: queryKeys.cast.notifications(castId) 
            });
        },
        onError: (error) => {
            console.error('Failed to delete notification:', error);
        }
    });

    const loadAdminNews = async () => {
        try {
            const data = await getAdminNews('cast', castId);
            setAdminNews(data);
        } catch (error) {
            console.error('Failed to load admin news:', error);
        }
    };

    useEffect(() => {
        if (castId) {
            loadAdminNews();
        }
    }, [castId]);

    // Mark all notifications as read when opening the notification page
    useEffect(() => {
        if (!castId) return;
        markAllNotificationsRead('cast', castId).catch((error) => {
            console.error('Failed to mark notifications as read:', error);
        });
    }, [castId]);

    // Also mark as read when switching back to the 通知 tab
    useEffect(() => {
        if (tab === '通知' && castId) {
            markAllNotificationsRead('cast', castId).catch(() => {});
        }
    }, [tab, castId]);

    // Real-time admin news updates
    useAdminNews('cast', (news) => {
        setAdminNews(prev => {
            // Check if news already exists to avoid duplicates
            const exists = prev.find(item => item.id === news.id);
            if (!exists) {
                return [news, ...prev];
            }
            return prev;
        });
    });

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await markNotificationRead(notificationId);
            // React Query will handle the update automatically
            // No need to manually update state
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId: number) => {
        console.log('Attempting to delete notification:', notificationId);
        
        if (!window.confirm('この通知を削除しますか？')) {
            return;
        }
        
        try {
            console.log('Calling deleteNotificationMutation...');
            await deleteNotificationMutation.mutateAsync(notificationId);
            console.log('Notification deleted successfully');
        } catch (error) {
            console.error('Failed to delete notification:', error);
            alert('通知の削除に失敗しました。');
        }
    };

    const handleAvatarClick = async (notification: any) => {
        try {
            if (notification?.reservation_id) {
                const reservation = await getReservationById(notification.reservation_id);
                if (reservation?.guest_id) {
                    navigate(`/guest/${reservation.guest_id}`);
                    return;
                }
            }
            if (notification?.cast?.id) {
                navigate(`/cast/${notification.cast.id}`);
            }
        } catch (e) {
            console.error('Failed to open detail from notification:', e);
        }
    };

    const handleOpenChat = async (notification: any) => {
        try {
            if (!castId) return;
            setMessageLoading(notification.id);

            // If this is a message notification, navigate to the relevant chat
            if (notification?.type === 'message' || notification?.message === '新しいメッセージが届きました') {
                const chats = await fetchUserChats('cast', Number(castId));
                if (Array.isArray(chats) && chats.length > 0) {
                    // Prefer a chat with unread messages; otherwise, take the most recent chat
                    const unreadChats = chats.filter((c: any) => (c.unread || 0) > 0);
                    const sortByTimestampDesc = (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                    const targetChat = (unreadChats.length > 0 ? unreadChats.sort(sortByTimestampDesc) : chats.sort(sortByTimestampDesc))[0];
                    if (targetChat?.id) {
                        navigate(`/cast/${targetChat.id}/message`);
                        return;
                    }
                }
            }

            // Fallback for reservation-based notifications
            if (notification?.reservation_id) {
                const reservation = await getReservationById(notification.reservation_id);
                if (!reservation?.guest_id) return;
                const res = await createChat(Number(castId), reservation.guest_id, notification.reservation_id);
                const chatId = res?.chat?.id;
                if (chatId) {
                    navigate(`/cast/${chatId}/message`);
                }
            }
        } catch (e) {
            console.error('Failed to open chat from notification:', e);
        } finally {
            setMessageLoading(null);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return '数分前';
        if (diffInHours < 24) return `${diffInHours}時間前`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}日前`;
        
        return date.toLocaleDateString('ja-JP');
    };

    return (
        <div className="max-w-md bg-gradient-to-b from-primary via-primary to-secondary min-h-screen pb-20 overflow-y-auto scrollbar-hidden">
            {/* Header - Fixed */}
            <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-b from-primary via-primary to-secondary border-secondary">
                    <button onClick={onBack} className="text-white hover:text-secondary transition-colors">
                        <ChevronLeft className="w-6 h-6 hover:text-secondary cursor-pointer" />
                    </button>
                    <span className="text-lg font-bold text-white">お知らせ</span>
                    <div className="w-6"></div>
                </div>

                {/* Tab buttons - Fixed */}
                <div className="flex border-b border-secondary bg-gradient-to-b from-primary via-primary to-secondary">
                    <button 
                        className={`flex-1 py-3 font-bold ${tab === '通知' ? 'border-b-2 border-white text-white' : 'text-white'}`} 
                        onClick={() => setTab('通知')}
                    >
                        通知
                    </button>
                    <button 
                        className={`flex-1 py-3 font-bold ${tab === 'Admin News' ? 'border-b-2 border-white text-white' : 'text-white'}`} 
                        onClick={() => setTab('Admin News')}
                    >
                        ニュース
                    </button>
                </div>
            </div>

            {/* Content with top padding to account for fixed header */}
            <div className="pt-24">
                {/* Notification list */}
                {tab === '通知' && (
                    <div className="px-4 pt-4 pb-16 flex flex-col gap-4">
                        {notificationsLoading ? (
                            <Spinner />
                        ) : notificationsError ? (
                            <div className="text-center py-8 text-red-500">
                                {notificationsError.message || '通知の取得に失敗しました'}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                通知はありません
                            </div>
                        ) : (
                            <>
                                {notifications.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className={`bg-white/10 rounded-lg p-4 flex gap-3 items-start relative`}
                                    >
                                        {notification.cast && (
                                            <img 
                                                src={notification.cast.avatar ? `${API_BASE_URL}/${notification.cast.avatar}` : '/assets/avatar/female.png'} 
                                                alt={notification.cast.nickname} 
                                                className="w-14 h-14 rounded-full object-cover border-2 border-white cursor-pointer"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/assets/avatar/female.png';
                                                }}
                                                onClick={() => handleAvatarClick(notification)}
                                            />
                                        )}
                                        <div className="flex-1">
                                            <div className="text-xs text-white mb-1">
                                                {formatTimeAgo(notification.created_at)}
                                            </div>
                                            <div className="text-sm text-white mb-2">
                                                {notification.message}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                {(notification.reservation_id || notification.cast) && (
                                                    <button 
                                                        className="w-full bg-orange-500 text-white rounded font-bold py-2 flex items-center justify-center gap-2 disabled:opacity-50"
                                                        onClick={() => handleOpenChat(notification)}
                                                        disabled={messageLoading === notification.id}
                                                    >
                                                        <MessageCircle />
                                                        メッセージを送る
                                                    </button>
                                                )}
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteNotification(notification.id);
                                                }}
                                                disabled={deleteNotificationMutation.isPending}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors p-2 disabled:opacity-50 z-10 cursor-pointer"
                                            >
                                                {deleteNotificationMutation.isPending ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* Admin News list */}
                {tab === 'Admin News' && (
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

export default CastNotificationPage; 