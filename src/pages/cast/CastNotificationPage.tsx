/*eslint-disable */
import React, { useEffect, useState } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { getNotifications, markNotificationRead, deleteNotification, getAdminNews, AdminNews } from '../../services/api';
import { useAdminNews } from '../../hooks/useRealtime';
import { useCast } from '../../contexts/CastContext';
import Spinner from '../../components/ui/Spinner';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface CastNotificationPageProps {
    onBack: () => void;
}

const CastNotificationPage: React.FC<CastNotificationPageProps> = ({ onBack }) => {
    const [tab, setTab] = useState<'通知' | 'Admin News'>('通知');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [adminNews, setAdminNews] = useState<AdminNews[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Use authenticated cast context
    const { castId } = useCast() as any;

    const loadAdminNews = async () => {
        try {
            const data = await getAdminNews('cast', castId);
            setAdminNews(data);
        } catch (error) {
            console.error('Failed to load admin news:', error);
        }
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                setError(null);
                const notificationsData = await getNotifications('cast', castId);
                
                // Filter out admin news from notifications - they should only appear in the news tab
                const nonAdminNotifications = notificationsData.filter(notification => notification.type !== 'admin_news');
                
                setNotifications(nonAdminNotifications);
                await loadAdminNews();
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
                setError('通知の取得に失敗しました');
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };

        if (castId) {
            fetchNotifications();
        }
    }, [castId]);

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
            setNotifications(prev => 
                prev.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId: number) => {
        try {
            await deleteNotification(notificationId);
            setNotifications(prev => 
                prev.filter(notification => notification.id !== notificationId)
            );
        } catch (error) {
            console.error('Failed to delete notification:', error);
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
        <div className="max-w-md bg-gradient-to-br from-primary via-primary to-secondary min-h-screen pb-20">
            {/* Header - Fixed */}
            <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-br from-primary via-primary to-secondary border-secondary">
                    <button onClick={onBack} className="text-white hover:text-secondary transition-colors">
                        <ChevronLeft className="w-6 h-6 hover:text-secondary cursor-pointer" />
                    </button>
                    <span className="text-lg font-bold text-white">お知らせ</span>
                    <div className="w-6"></div>
                </div>

                {/* Tab buttons - Fixed */}
                <div className="flex border-b border-secondary bg-gradient-to-br from-primary via-primary to-secondary">
                    <button 
                        className={`flex-1 py-3 font-bold ${tab === '通知' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`} 
                        onClick={() => setTab('通知')}
                    >
                        通知
                    </button>
                    <button 
                        className={`flex-1 py-3 font-bold ${tab === 'Admin News' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`} 
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
                    <div className="px-4 py-4 flex flex-col gap-4">
                        {loading ? (
                            <Spinner />
                        ) : error ? (
                            <div className="text-center py-8 text-red-500">
                                {error}
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
                                        className={`bg-orange-50 rounded-lg p-4 flex gap-3 items-start relative`}
                                    >
                                        {notification.cast && (
                                            <img 
                                                src={notification.cast.avatar ? `${API_BASE_URL}/${notification.cast.avatar}` : '/assets/avatar/avatar-1.png'} 
                                                alt={notification.cast.nickname} 
                                                className="w-14 h-14 rounded-full object-cover border-2 border-white"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/assets/avatar/avatar-1.png';
                                                }}
                                            />
                                        )}
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-500 mb-1">
                                                {formatTimeAgo(notification.created_at)}
                                            </div>
                                            <div className="text-sm text-gray-800 mb-2">
                                                {notification.message}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                {notification.cast && (
                                                    <button className="bg-orange-500 text-white px-3 py-1 rounded text-xs">
                                                        メッセージを送る
                                                    </button>
                                                )}
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteNotification(notification.id);
                                                }}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
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