/*eslint-disable */
import React, { useState, useEffect } from 'react';
import { Bell, ChevronRight, CreditCard, HelpCircle, Pencil, QrCode, Settings, TicketCheck, TicketPercent, User, Medal, LogOut } from 'lucide-react';
import PaymentHistory from './PaymentHistory';
import GradeDetail from './GradeDetail';
import AvatarEditPage from './AvatarEditPage';
import NotificationSettingsPage from './NotificationSettingsPage';
import PaymentInfoSimplePage from './PaymentInfoSimplePage';
import PointPurchasePage from './PointPurchasePage';
import IdentityVerificationScreen from './IdentityVerificationScreen';
import HelpPage from '../help/HelpPage';
import QRCodeModal from './QRCodeModal';
import NotificationScreen from './NotificationScreen';
import { useUser } from '../../contexts/UserContext';
import PointHistory from './PointHistory';
import { getUnreadNotificationCount, getGuestGrade, GradeInfo } from '../../services/api';
import { useNotifications } from '../../hooks/useRealtime';
import { useNavigate } from 'react-router-dom';
import Spinner from '../ui/Spinner';
    
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Utility function to get the first available avatar from comma-separated string
const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
    if (!avatarString) {
        return '/assets/avatar/1.jpg';
    }
    
    // Split by comma and get the first non-empty avatar
    const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
    
    if (avatars.length === 0) {
        return '/assets/avatar/1.jpg';
    }
    return `${API_BASE_URL}/${avatars[0]}`;
};

const Profile: React.FC = () => {
    const { user, loading, logout } = useUser();
    const navigate = useNavigate();
    const [showNotification, setShowNotification] = useState(false);
    const [gradeInfo, setGradeInfo] = useState<GradeInfo | null>(null);
    const [gradeLoading, setGradeLoading] = useState(true);
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showGradeDetail, setShowGradeDetail] = useState(false);
    const [showAvatarEdit, setShowAvatarEdit] = useState(false);
    const [showNotificationSettings, setShowNotificationSettings] = useState(false);
    const [showPaymentInfoSimple, setShowPaymentInfoSimple] = useState(false);
    const [showPointPurchase, setShowPointPurchase] = useState(false);
    const [showIdentityVerification, setShowIdentityVerification] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Get avatar URL
    const getAvatarUrl = () => {
        if (user?.avatar) {
            return getFirstAvatarUrl(user.avatar);
        }
        return '/assets/avatar/1.jpg'; // Default avatar
    };

    // Fetch unread notification count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (user?.id) {
                try {
                    const count = await getUnreadNotificationCount('guest', user.id);
                    setUnreadNotificationCount(count);
                } catch (error) {
                    console.error('Failed to fetch unread notification count:', error);
                }
            }
        };

        fetchUnreadCount();
        
        // Set up interval to refresh count every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        
        return () => clearInterval(interval);
    }, [user?.id]);

    // Function to handle notification count updates
    const handleNotificationCountChange = (count: number) => {
        setUnreadNotificationCount(count);
    };

    // Real-time notification updates
    useNotifications(user?.id || 0, (notification) => {
        setUnreadNotificationCount(prev => prev + 1);
    });

    // Reset notification count when notification screen is opened
    const handleNotificationOpen = () => {
        setUnreadNotificationCount(0);
        setShowNotification(true);
    };

    // Handle logout with confirmation
    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        navigate('/');
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    // Fetch grade information
    useEffect(() => {
        const fetchGradeInfo = async () => {
            if (user?.id) {
                try {
                    setGradeLoading(true);
                    const data = await getGuestGrade(user.id);
                    setGradeInfo(data);
                } catch (error) {
                    console.error('Error fetching grade info:', error);
                } finally {
                    setGradeLoading(false);
                }
            }
        };

        fetchGradeInfo();
    }, [user?.id]);
    if (showNotification) return <NotificationScreen onBack={() => setShowNotification(false)} onNotificationCountChange={handleNotificationCountChange} />;
    if (showPaymentHistory) return <PointHistory onBack={() => setShowPaymentHistory(false)} userType="guest" userId={user?.id} />;
    if (showGradeDetail) return <GradeDetail onBack={() => setShowGradeDetail(false)} />;
    if (showAvatarEdit) return <AvatarEditPage onBack={() => setShowAvatarEdit(false)} />;
    if (showNotificationSettings) return <NotificationSettingsPage onBack={() => setShowNotificationSettings(false)} />;
    if (showPaymentInfoSimple) return <PaymentInfoSimplePage onBack={() => setShowPaymentInfoSimple(false)} />;
    if (showPointPurchase) return <PointPurchasePage onBack={() => setShowPointPurchase(false)} />;
    if (showIdentityVerification) return <IdentityVerificationScreen onBack={() => setShowIdentityVerification(false)} />;
    if (showHelp) return <HelpPage onBack={() => setShowHelp(false)} />;
    if (showQRCode) return <QRCodeModal onClose={() => setShowQRCode(false)} />;

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-primary via-primary to-secondary pb-20">
            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogOut className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">ログアウトしますか？</h3>
                            <p className="text-sm text-gray-600">ログアウトすると、再度ログインが必要になります。</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelLogout}
                                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
                            >
                                ログアウト
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Top bar */}
            <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50 flex items-center justify-between px-4 py-3 border-b bg-primary border-secondary">
                <button type="button" onClick={handleNotificationOpen} className="hover:text-secondary cursor-pointer relative">
                    <Bell className="w-6 h-6 text-white" />
                    {unreadNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                            {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                        </span>
                    )}
                </button>
                <span className="text-lg font-bold text-white">マイページ</span>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setShowQRCode(true)} className="text-white hover:text-secondary cursor-pointer">
                        <QrCode className="w-6 h-6" />
                    </button>
                    <button onClick={() => setShowNotificationSettings(true)} className="text-white hover:text-secondary cursor-pointer">
                        <Settings className="w-6 h-6" />
                    </button>
                </div>
            </div>
            {/* Add top padding to account for fixed header */}
            <div className="pt-16">
            {/* Coupon banner */}
            {/* <div className="bg-primary text-xs text-white px-4 py-2 border-b border-secondary flex items-center">
                <button onClick={() => setShowNotification(true)} className="mr-2 text-white">
                    <Bell className="w-6 h-6" />
                </button>
                <span>最大30,000Pの紹介クーポンがもらえる特別な期間！</span>
            </div> */}
            {/* Profile avatar and name */}
            <div className="flex flex-col items-center bg-gradient-to-b from-primary to-secondary py-6">
                <div className="relative">
                    {loading ? (
                        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center border-4 border-secondary shadow">
                            <Spinner />
                        </div>
                    ) : (
                        <img 
                            src={getAvatarUrl()} 
                            alt="avatar" 
                            className="w-24 h-24 rounded-full object-cover border-4 border-secondary shadow" 
                            onError={(e) => {
                                // Fallback to default avatar if upload fails
                                e.currentTarget.src = '/assets/avatar/1.jpg';
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
                <Medal size={48} className="text-secondary" />
                <span className="text-2xl font-bold text-white">
                    {gradeLoading ? '読み込み中...' : gradeInfo?.current_grade_name || 'ビギナー'}
                </span>
                <button onClick={() => setShowGradeDetail(true)} className="ml-auto cursor-pointer ">
                    <ChevronRight size={24} className="text-white hover:text-secondary" />
                </button>
            </div>
            {/* Grade up section */}
            {/* <div className="bg-secondary px-4 py-4 flex items-center gap-4 mt-2 rounded-lg mx-4">
                <div className="flex-1">
                    <div className="text-white font-bold text-sm mb-1">クレジットカードを登録するだけで次のグレードに!!</div>
                    <button onClick={() => alert('グレードアップ画面へ')} className="w-full bg-primary text-white rounded-full py-2 font-bold mt-2 border border-secondary">グレードアップする</button>
                </div>
                <img src="/assets/icons/gold-cup.png" alt="mascot" className="w-16 h-16 object-contain" />
            </div> */}
            {/* Settings/Options menu */}
            <div className="bg-white/10 my-8 rounded-lg shadow mx-2 divide-y divide-secondary">
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
            
            {/* Logout Section */}
            <div className="px-4 pb-8">
                <div className="bg-white/10 rounded-lg border border-red-400/30 overflow-hidden">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 text-red-400 hover:bg-red-500/20 transition-all duration-200 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                        <span className="font-medium">ログアウト</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile; 