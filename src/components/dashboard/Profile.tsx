import React, { Component, useState } from 'react';
import { Bell, ChevronLeft, ChevronRight, CreditCard, FileUser, HelpCircle, Link, Pencil, QrCode, Settings, TicketCheck, TicketPercent, User } from 'lucide-react';
import PointHistory from './PointHistory';
import GradeDetail from './GradeDetail';
import AvatarEditPage from './AvatarEditPage';
import NotificationSettingsPage from './NotificationSettingsPage';
import PaymentInfoSimplePage from './PaymentInfoSimplePage';
import PointPurchasePage from './PointPurchasePage';
import IdentityVerificationScreen from './IdentityVerificationScreen';

const notifications = [
    {
        avatar: '/assets/avatar/AdobeStock_1095142160_Preview.jpeg',
        name: 'もえ',
        icons: '🚩中🏳️‍🌈✈️',
        area: '東京',
        age: 29,
        time: '1分前',
        info: '足あとがつきました',
        message: '初めまして！普段は不動産系の会社員とSNS関係や人材紹介の個人事業主をしてます✨ 昔は芸能活動もしてました🌸…',
    },
    {
        avatar: '/assets/avatar/AdobeStock_1067731649_Preview.jpeg',
        name: '暇なOL',
        icons: '🐰🍒',
        area: '',
        age: 32,
        time: '3分前',
        info: '足あとがつきました',
        tag: '姉pishatto',
        message: '数多くのキャストさんから見つけていただき、ありがとうございます✨\n===\n★英語・中国語OK Sophia卒🎓帰国子…',
    },
];

function NotificationScreen({ onBack }: { onBack: () => void }) {
    const [tab, setTab] = useState<'通知' | 'ニュース'>('通知');
    const newsList = [
        { date: '2025/2/18', message: '最大30,000Pの紹介クーポンがもらえる特別な期間！' },
        { date: '2025/2/3', message: '利用規約違反者への対処について' },
        { date: '2025/1/31', message: '【復旧済み】【障害】ギフトが送信できない不具合が発生しておりました' },
        { date: '2025/1/15', message: '2024年10月~12月選出「紳士パットくん」をご存知ですか？🎩' },
        { date: '2025/1/6', message: '利用規約違反者への対処について' },
        { date: '2025/1/1', message: '利用規約違反者への対処について' },
    ];
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-4">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b">
                <button onClick={onBack} className="mr-2 text-2xl text-gray-500">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center">お知らせ</span>
            </div>
            {/* Tabs */}
            <div className="flex border-b">
                <button className={`flex-1 py-3 font-bold ${tab === '通知' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`} onClick={() => setTab('通知')}>通知</button>
                <button className={`flex-1 py-3 font-bold ${tab === 'ニュース' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`} onClick={() => setTab('ニュース')}>ニュース</button>
            </div>
            {/* Notification list */}
            {tab === '通知' && (
                <div className="px-4 py-4 flex flex-col gap-4">
                    {notifications.map((n, i) => (
                        <div key={i} className="bg-orange-50 rounded-lg p-4 flex gap-3 items-start">
                            <img src={n.avatar} alt={n.name} className="w-14 h-14 rounded-full object-cover" />
                            <div className="flex-1">
                                <div className="text-xs text-gray-500 mb-1">{n.time}・{n.info}</div>
                                <div className="flex items-center mb-1">
                                    <span className="text-lg font-bold mr-1">{n.name}</span>
                                    <span className="text-base mr-1">{n.icons}</span>
                                    {n.area && <span className="text-gray-700 text-xs mr-1">{n.area}</span>}
                                    <span className="text-gray-700 text-xs">{n.age}歳</span>
                                    {n.tag && <span className="ml-2 bg-purple-500 text-white text-xs rounded px-2 py-0.5">{n.tag}</span>}
                                </div>
                                <div className="text-xs text-gray-700 mb-2 whitespace-pre-line">{n.message}</div>
                                <button className="w-full bg-orange-500 text-white rounded font-bold py-2 flex items-center justify-center gap-2">
                                    <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M22 7l-10 7L2 7" /></svg>
                                    メッセージを送る
                                </button>
                            </div>
                        </div>
                    ))}
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
    const [showNotification, setShowNotification] = useState(false);
    const [showPointHistory, setShowPointHistory] = useState(false);
    const [showGradeDetail, setShowGradeDetail] = useState(false);
    const [showAvatarEdit, setShowAvatarEdit] = useState(false);
    const [showNotificationSettings, setShowNotificationSettings] = useState(false);
    const [showPaymentInfoSimple, setShowPaymentInfoSimple] = useState(false);
    const [showPointPurchase, setShowPointPurchase] = useState(false);
    const [showIdentityVerification, setShowIdentityVerification] = useState(false);
    if (showNotification) return <NotificationScreen onBack={() => setShowNotification(false)} />;
    if (showPointHistory) return <PointHistory onBack={() => setShowPointHistory(false)} />;
    if (showGradeDetail) return <GradeDetail onBack={() => setShowGradeDetail(false)} />;
    if (showAvatarEdit) return <AvatarEditPage onBack={() => setShowAvatarEdit(false)} />;
    if (showNotificationSettings) return <NotificationSettingsPage onBack={() => setShowNotificationSettings(false)} />;
    if (showPaymentInfoSimple) return <PaymentInfoSimplePage onBack={() => setShowPaymentInfoSimple(false)} />;
    if (showPointPurchase) return <PointPurchasePage onBack={() => setShowPointPurchase(false)} />;
    if (showIdentityVerification) return <IdentityVerificationScreen onBack={() => setShowIdentityVerification(false)} />;
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-20">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-primary border-secondary relative">
                <button onClick={() => setShowNotification(true)} className="relative">
                    <Bell className="w-6 h-6 text-white" />
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full px-1">1</span>
                </button>
                <span className="text-lg font-bold text-white">マイページ</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => alert('QRコードを開く')} className="text-white">
                        <QrCode className="w-6 h-6" />
                    </button>
                    <button onClick={() => setShowNotificationSettings(true)} className="text-white">
                        <Settings className="w-6 h-6" />
                    </button>
                </div>
            </div>
            {/* Coupon banner */}
            <div className="bg-primary text-xs text-white px-4 py-2 border-b border-secondary flex items-center">
                <button onClick={() => setShowNotification(true)} className="mr-2 text-white">
                    <Bell className="w-6 h-6" />
                </button>
                <span>最大30,000Pの紹介クーポンがもらえる特別な期間！</span>
            </div>
            {/* Profile avatar and name */}
            <div className="flex flex-col items-center py-6">
                <div className="relative">
                    <img src="/assets/avatar/2.jpg" alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-secondary shadow" />
                    <button onClick={() => setShowAvatarEdit(true)} className="absolute bottom-2 right-2 bg-secondary rounded-full p-1 border-2 border-white">
                        <Pencil className="w-6 h-6 text-white" />
                    </button>
                </div>
                <span className="mt-2 text-lg font-bold text-white">まこちゃん</span>
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
            <div className="bg-primary mt-4 rounded-lg shadow mx-2 divide-y divide-red-600">
                <button onClick={() => setShowPointHistory(true)} className="w-full flex items-center px-4 py-4 text-left">
                    <span className="mr-3">
                        <TicketCheck />
                    </span>
                    <span className="flex-1 text-white">ポイント履歴・領収書</span>
                    <span className="text-white">
                        <ChevronRight />
                    </span>
                </button>
                <button onClick={() => setShowPaymentInfoSimple(true)} className="w-full flex items-center px-4 py-4 text-left">
                    <span className="mr-3">
                        <CreditCard className="w-6 h-6 text-white" />
                    </span>
                    <span className="flex-1 text-white">お支払い情報</span>
                    <span className="text-white">
                        <ChevronRight />
                    </span>
                </button>
                <button onClick={() => setShowPointPurchase(true)} className="w-full flex items-center px-4 py-4 text-left">
                    <span className="mr-3">
                        <TicketPercent className="w-6 h-6 text-white" />
                    </span>
                    <span className="flex-1 text-white">ポイント購入</span>
                    <span className="text-white">
                        <ChevronRight />
                    </span>
                </button>
                <button onClick={() => setShowIdentityVerification(true)} className="w-full flex items-center px-4 py-4 text-left">
                    <span className="mr-3">
                        <User className="w-6 h-6 text-white" />
                    </span>
                    <span className="flex-1 text-white">本人認証</span>
                    <span className="bg-orange-500 text-white text-xs rounded px-2 py-1 mr-2">本人確認書類をご登録ください</span>
                    <span className="text-white">
                        <ChevronRight />
                    </span>
                </button>
                <button onClick={() => alert('クーポン')} className="w-full flex items-center px-4 py-4 text-left">
                    <span className="mr-3">
                        <TicketPercent className="w-6 h-6 text-white" />
                    </span>
                    <span className="flex-1 text-white">クーポン</span>
                    <span className="text-white">
                        <ChevronRight />
                    </span>
                </button>
                <button onClick={() => alert('pishattoアプリ版「バトラー」再連携')} className="w-full flex items-center px-4 py-4 text-left">
                    <span className="mr-3">
                        <Link className="w-6 h-6 text-white" />
                    </span>
                    <span className="flex-1 text-white">pishattoアプリ版「バトラー」再連携</span>
                    <span className="text-white">
                        <ChevronRight />
                    </span>
                </button>
                <button onClick={() => alert('キャスト応募')} className="w-full flex items-center px-4 py-4 text-left">
                    <span className="mr-3">
                        <FileUser className="w-6 h-6 text-white" />
                    </span>
                    <span className="flex-1 text-white">キャスト応募</span>
                    <span className="text-white">
                        <ChevronRight />
                    </span>
                </button>
                <button onClick={() => alert('ヘルプ')} className="w-full flex items-center px-4 py-4 text-left">
                    <span className="mr-3">
                        <HelpCircle className="w-6 h-6 text-white" />
                    </span>
                    <span className="flex-1 text-white">ヘルプ</span>
                    <span className="text-white">
                        <ChevronRight />
                    </span>
                </button>
            </div>
            {/* App download banner */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-primary border-t flex items-center px-4 py-2 z-20">
                <img src="https://placehold.co/40x40?text=P" alt="pishatto" className="w-10 h-10 rounded mr-2" />
                <div className="flex-1">
                    <div className="text-xs font-bold">待望のpishattoアプリ版登場！</div>
                    <div className="text-xs text-gray-500">pishatto専用ブラウザアプリ「バトラー」</div>
                </div>
                <button onClick={() => window.open('https://apps.apple.com/', '_blank')} className="ml-2">
                    <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="h-8" />
                </button>
            </div>
        </div>
    );
};

export default Profile; 