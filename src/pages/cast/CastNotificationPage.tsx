import React, { useEffect, useState } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { getNotifications, markNotificationRead, deleteNotification } from '../../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface CastNotificationPageProps {
    onBack: () => void;
}

const CastNotificationPage: React.FC<CastNotificationPageProps> = ({ onBack }) => {
    const [tab, setTab] = useState<'通知' | 'ニュース'>('通知');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const castId = Number(localStorage.getItem('castId'));

    const newsList = [
        { date: '2025/2/18', message: '最大30,000Pの紹介クーポンがもらえる特別な期間！' },
        { date: '2025/2/3', message: '利用規約違反者への対処について' },
        { date: '2025/1/31', message: '【復旧済み】【障害】ギフトが送信できない不具合が発生しておりました' },
        { date: '2025/1/15', message: '2024年10月~12月選出「紳士パットくん」をご存知ですか？🎩' },
        { date: '2025/1/6', message: '利用規約違反者への対処について' },
        { date: '2025/1/1', message: '利用規約違反者への対処について' },
    ];

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                setError(null);
                const notificationsData = await getNotifications('cast', castId);
                setNotifications(notificationsData);
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
        <div className="max-w-md bg-gradient-to-br from-primary via-primary to-secondary min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-primary border-secondary">
                <button onClick={onBack} className="text-white">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="text-lg font-bold text-white">お知らせ</span>
                <div className="w-6"></div>
            </div>

            {/* Tab buttons */}
            <div className="flex border-b border-secondary">
                <button 
                    className={`flex-1 py-3 font-bold ${tab === '通知' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`} 
                    onClick={() => setTab('通知')}
                >
                    通知
                </button>
                <button 
                    className={`flex-1 py-3 font-bold ${tab === 'ニュース' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`} 
                    onClick={() => setTab('ニュース')}
                >
                    ニュース
                </button>
            </div>

            {/* Notification list */}
            {tab === '通知' && (
                <div className="px-4 py-4 flex flex-col gap-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                        </div>
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
                                    className={`bg-orange-50 rounded-lg p-4 flex gap-3 items-start relative ${!notification.read ? 'border-l-4 border-orange-500' : ''}`}
                                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
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
                                            className="absolute top-4 right-4 text-red-500 hover:text-red-600 transition-colors p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        {!notification.read && (
                                            <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full"></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}

            {/* News list */}
            {tab === 'ニュース' && (
                <div className="px-4 py-4 flex flex-col gap-4">
                    {newsList.map((news, index) => (
                        <div key={index} className="bg-gray-900 rounded-lg p-4 border border-secondary">
                            <div className="text-xs text-gray-400 mb-2">{news.date}</div>
                            <div className="text-sm text-white">{news.message}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CastNotificationPage; 