/*eslint-disable */
import React, { useState, useEffect } from 'react';
import { Bell, ChevronLeft, ChevronRight, CreditCard, HelpCircle, Pencil, QrCode, Settings, TicketCheck, TicketPercent, User, Trash2 } from 'lucide-react';
import PaymentHistory from './PaymentHistory';
import GradeDetail from './GradeDetail';
import AvatarEditPage from './AvatarEditPage';
import NotificationSettingsPage from './NotificationSettingsPage';
import PaymentInfoSimplePage from './PaymentInfoSimplePage';
import PointPurchasePage from './PointPurchasePage';
import IdentityVerificationScreen from './IdentityVerificationScreen';
import HelpPage from '../help/HelpPage';
import QRCodeModal from './QRCodeModal';
import { useUser } from '../../contexts/UserContext';
import { getNotifications, deleteNotification, Notification, createChat, sendGuestMessage } from '../../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

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

function NotificationScreen({ onBack }: { onBack: () => void }) {
    const { user } = useUser();
    const [tab, setTab] = useState<'通知' | 'ニュース'>('通知');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [sendingMessage, setSendingMessage] = useState<number | null>(null);

    const newsList = [
        { date: '2025/2/18', message: '最大30,000Pの紹介クーポンがもらえる特別な期間！' },
        { date: '2025/2/3', message: '利用規約違反者への対処について' },
        { date: '2025/1/31', message: '【復旧済み】【障害】ギフトが送信できない不具合が発生しておりました' },
        { date: '2025/1/15', message: '2024年10月~12月選出「紳士パットくん」をご存知ですか？🎩' },
        { date: '2025/1/6', message: '利用規約違反者への対処について' },
        { date: '2025/1/1', message: '利用規約違反者への対処について' },
    ];

    useEffect(() => {
        if (user?.id) {
            loadNotifications();
        }
    }, [user?.id]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications('guest', user!.id);
            setNotifications(data);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
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

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-primary via-primary to-secondary pb-4">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b">
                <button onClick={onBack} className="mr-2 text-2xl text-gray-500">
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
                <div className="px-4 py-4 flex flex-col gap-4">
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
                                        src={notification.cast.avatar ? `${API_BASE_URL}/${notification.cast.avatar}` : '/assets/avatar/2.jpg'} 
                                        alt={notification.cast.nickname} 
                                        className="w-14 h-14 rounded-full object-cover border-2 border-white"
                                        onError={(e) => {
                                            e.currentTarget.src = '/assets/avatar/2.jpg';
                                        }}
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500 mb-1">
                                        {formatTimeAgo(notification.created_at)}・足あとがつきました
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
                                     !notification.message.includes('予約がキャストにマッチされました') && (
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
                <div className="bg-[#FFF7E3] min-h-[60vh]">
                    {newsList.map((item, i) => (
                        <div
                            key={i}
                            className="flex flex-col px-4 py-3 border-b border-[#ffe3b3] relative"
                        >
                            <div className="text-xs text-gray-500 mb-1">{item.date}</div>
                            <div className="text-sm text-gray-800 pr-6">{item.message}</div>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">&gt;</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const Profile: React.FC = () => {
    const { user, loading } = useUser();
    const [showNotification, setShowNotification] = useState(false);
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showGradeDetail, setShowGradeDetail] = useState(false);
    const [showAvatarEdit, setShowAvatarEdit] = useState(false);
    const [showNotificationSettings, setShowNotificationSettings] = useState(false);
    const [showPaymentInfoSimple, setShowPaymentInfoSimple] = useState(false);
    const [showPointPurchase, setShowPointPurchase] = useState(false);
    const [showIdentityVerification, setShowIdentityVerification] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);

    // Get avatar URL
    const getAvatarUrl = () => {
        if (user?.avatar) {
            return getFirstAvatarUrl(user.avatar);
        }
        return '/assets/avatar/2.jpg'; // Default avatar
    };
    if (showNotification) return <NotificationScreen onBack={() => setShowNotification(false)} />;
    if (showPaymentHistory) return <PaymentHistory onBack={() => setShowPaymentHistory(false)} userType="guest" userId={user?.id} />;
    if (showGradeDetail) return <GradeDetail onBack={() => setShowGradeDetail(false)} />;
    if (showAvatarEdit) return <AvatarEditPage onBack={() => setShowAvatarEdit(false)} />;
    if (showNotificationSettings) return <NotificationSettingsPage onBack={() => setShowNotificationSettings(false)} />;
    if (showPaymentInfoSimple) return <PaymentInfoSimplePage onBack={() => setShowPaymentInfoSimple(false)} />;
    if (showPointPurchase) return <PointPurchasePage onBack={() => setShowPointPurchase(false)} />;
    if (showIdentityVerification) return <IdentityVerificationScreen onBack={() => setShowIdentityVerification(false)} />;
    if (showHelp) return <HelpPage onBack={() => setShowHelp(false)} />;
    if (showQRCode) return <QRCodeModal onClose={() => setShowQRCode(false)} />;

    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-20">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-primary border-secondary relative">
                <button type="button" onClick={() => setShowNotification(true)} className="relative">
                    <Bell className="w-6 h-6 text-white" />
                </button>
                <span className="text-lg font-bold text-white">マイページ</span>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setShowQRCode(true)} className="text-white">
                        <QrCode className="w-6 h-6" />
                    </button>
                    <button onClick={() => setShowNotificationSettings(true)} className="text-white">
                        <Settings className="w-6 h-6" />
                    </button>
                </div>
            </div>
            {/* Coupon banner */}
            {/* <div className="bg-primary text-xs text-white px-4 py-2 border-b border-secondary flex items-center">
                <button onClick={() => setShowNotification(true)} className="mr-2 text-white">
                    <Bell className="w-6 h-6" />
                </button>
                <span>最大30,000Pの紹介クーポンがもらえる特別な期間！</span>
            </div> */}
            {/* Profile avatar and name */}
            <div className="flex flex-col items-center py-6">
                <div className="relative">
                    {loading ? (
                        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center border-4 border-secondary shadow">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <img 
                            src={getAvatarUrl()} 
                            alt="avatar" 
                            className="w-24 h-24 rounded-full object-cover border-4 border-secondary shadow" 
                            onError={(e) => {
                                // Fallback to default avatar if upload fails
                                e.currentTarget.src = '/assets/avatar/2.jpg';
                            }}
                        />
                    )}
                    <button onClick={() => setShowAvatarEdit(true)} className="absolute bottom-2 right-2 bg-secondary rounded-full p-1 border-2 border-white">
                        <Pencil className="w-6 h-6 text-white" />
                    </button>
                </div>
                <span className="mt-2 text-lg font-bold text-white">
                    {loading ? '読み込み中...' : user?.nickname || 'まこちゃん'}
                </span>
                {/* Points display */}
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-300">ポイント</span>
                    <span className="text-xl font-bold text-white">
                        {loading ? '---' : (user?.points || 0).toLocaleString()}P
                    </span>
                </div>
            </div>
            {/* Grade section */}
            <div className="bg-secondary text-white text-center py-2 font-bold">今期のグレード</div>
            <div className="bg-primary px-4 py-4 flex items-center gap-4 border border-secondary">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-3xl shadow"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FF0000" /><polygon points="12,7 13.09,10.26 16.18,10.27 13.64,12.14 14.73,15.4 12,13.53 9.27,15.4 10.36,12.14 7.82,10.27 10.91,10.26" fill="#fff" /></svg></span>
                <span className="text-2xl font-bold text-white">ビギナー</span>
                <button onClick={() => setShowGradeDetail(true)} className="ml-auto">
                    <svg width="24" height="24" fill="none" stroke="#bfa76a" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
                </button>
            </div>
            {/* Grade up section */}
            <div className="bg-secondary px-4 py-4 flex items-center gap-4 mt-2 rounded-lg mx-4">
                <div className="flex-1">
                    <div className="text-white font-bold text-sm mb-1">クレジットカードを登録するだけで次のグレードに!!</div>
                    <button onClick={() => alert('グレードアップ画面へ')} className="w-full bg-primary text-white rounded-full py-2 font-bold mt-2 border border-secondary">グレードアップする</button>
                </div>
                <img src="/assets/icons/gold-cup.png" alt="mascot" className="w-16 h-16 object-contain" />
            </div>
            {/* Settings/Options menu */}
            <div className="bg-primary mt-4 rounded-lg shadow mx-2 divide-y divide-secondary">
                <button onClick={() => setShowPaymentHistory(true)} className="w-full flex hover:bg-secondary items-center px-4 py-4 text-left">
                    <span className="mr-3">
                        <TicketCheck />
                    </span>
                    <span className="flex-1 text-white">ポイント履歴・領収書</span>
                    <span className="text-white">
                        <ChevronRight />
                    </span>
                </button>
                <button onClick={() => setShowPointPurchase(true)} className="w-full flex hover:bg-secondary  items-center px-4 py-4 text-left">
                    <span className="mr-3">
                        <TicketPercent className="w-6 h-6 text-white" />
                    </span>
                    <span className="flex-1 text-white">ポイント購入</span>
                    <span className="text-white">
                        <ChevronRight />
                    </span>
                </button>
                <button onClick={() => setShowPaymentInfoSimple(true)} className="w-full flex hover:bg-secondary  items-center px-4 py-4 text-left">
                    <span className="mr-3">
                        <CreditCard className="w-6 h-6 text-white" />
                    </span>
                    <span className="flex-1 text-white">お支払い情報</span>
                    <span className="text-white">
                        <ChevronRight />
                    </span>
                </button>
                <button onClick={() => setShowIdentityVerification(true)} className="w-full hover:bg-secondary  flex items-center px-4 py-4 text-left">
                    <span className="mr-3">
                        <User className="w-6 h-6 text-white" />
                    </span>
                    <span className="flex-1 text-white">本人認証</span>
                    <span className="bg-orange-500 text-white text-xs rounded px-2 py-1 mr-2">本人確認書類をご登録ください</span>
                    <span className="text-white">
                        <ChevronRight />
                    </span>
                </button>
                <button onClick={() => setShowHelp(true)} className="w-full flex hover:bg-secondary  items-center px-4 py-4 text-left">
                    <span className="mr-3">
                        <HelpCircle className="w-6 h-6 text-white" />
                    </span>
                    <span className="flex-1 text-white">ヘルプ</span>
                    <span className="text-white">
                        <ChevronRight />
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Profile; 