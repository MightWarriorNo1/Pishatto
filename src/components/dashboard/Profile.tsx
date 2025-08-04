/*eslint-disable */
import React, { useState, useEffect } from 'react';
import { Bell, ChevronLeft, ChevronRight, CreditCard, HelpCircle, Pencil, QrCode, Settings, TicketCheck, TicketPercent, User } from 'lucide-react';
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
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-primary via-primary to-secondary pb-20">
            {/* Top bar */}
            <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50 flex items-center justify-between px-4 py-3 border-b bg-primary border-secondary">
                <button type="button" onClick={() => setShowNotification(true)} className="hover:text-secondary cursor-pointer">
                    <Bell className="w-6 h-6 text-white" />
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
            <div className="bg-white/10 my-4 rounded-lg shadow mx-2 divide-y divide-secondary">
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
        </div>
    );
};

export default Profile; 