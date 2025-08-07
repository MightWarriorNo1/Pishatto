/*eslint-disable */
import React, { useEffect, useState } from 'react';
import { Bell, CircleQuestionMark, Gift, Pencil, QrCode, Settings, Users, ChartSpline, UserPlus, ChevronRight, ChevronLeft, Medal } from 'lucide-react';
import { Link } from 'react-router-dom';
import CastGiftBoxPage from './CastGiftBoxPage';
import CastActivityRecordPage from './CastActivityRecordPage';
import CastFriendReferralPage from './CastFriendReferralPage';
import CastImmediatePaymentPage from './CastImmediatePaymentPage';
import { getCastProfileById, getCastPointsData, getCastPassportData, getUnreadNotificationCount, getCastGrade, GradeInfo } from '../../services/api';
import { useNotifications } from '../../hooks/useRealtime';
import CastProfileEditPage from './CastProfileEditPage';
import CastPointHistoryPage from './CastPointHistoryPage';
import CastNotificationPage from './CastNotificationPage';
import QRCodeModal from '../../components/dashboard/QRCodeModal';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Utility function to get the first available avatar from comma-separated string
// const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
//     if (!avatarString) {
//         return '/assets/avatar/avatar-1.png';
//     }
    
//     // Split by comma and get the first non-empty avatar
//     const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
    
//     if (avatars.length === 0) {
//         return '/assets/avatar/avatar-1.png';
//     }
    
//     return `${API_BASE_URL}/${avatars[0]}`;
// };

// Utility function to get all avatar URLs from comma-separated string
const getAllAvatarUrls = (avatarString: string | null | undefined): string[] => {
    if (!avatarString) {
        return ['/assets/avatar/avatar-1.png'];
    }
    
    // Split by comma and get all non-empty avatars
    const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
    
    if (avatars.length === 0) {
        return ['/assets/avatar/avatar-1.png'];
    }
    
    return avatars.map(avatar => `${API_BASE_URL}/${avatar}`);
};

interface Badge {
    id: number;
    name: string;
    icon: string;
    description: string;
}

interface GiftProps {
    id: number;
    name: string;
    category: string;
    points: number;
    icon: string;
}

interface CastProfile {
    id: number;
    nickname: string;
    avatar: string;
    birth_year: number;
    height: number;
    residence: string;
    birthplace: string;
    profile_text: string;
    badges: Badge[];
    receivedGifts: GiftProps[];
}

interface PointsData {
    monthly_total_points: number;
    gift_points: number;
    copat_back_rate: number;
    total_reservations: number;
    completed_reservations: number;
}

interface PassportData {
    id: number;
    name: string;
    image: string;
    description: string;
}

const CastProfilePage: React.FC = () => {
    const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);
    const [showGiftBox, setShowGiftBox] = useState(false);
    const [showActivityRecord, setShowActivityRecord] = useState(false);
    const [showFriendReferral, setShowFriendReferral] = useState(false);
    const [showImmediatePayment, setShowImmediatePayment] = useState(false);
    const castId = Number(localStorage.getItem('castId'));
    const [showEdit, setShowEdit] = useState(false);
    const [showPointHistory, setShowPointHistory] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [cast, setCast] = useState<CastProfile | null>(null);
    const [pointsData, setPointsData] = useState<PointsData | null>(null);
    const [passportData, setPassportData] = useState<PassportData[]>([]);
    const [loading, setLoading] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);
    const [gradeInfo, setGradeInfo] = useState<GradeInfo | null>(null);
    const [gradeLoading, setGradeLoading] = useState(true);

    const fetchCastProfile = async () => {
        try {
            const data = await getCastProfileById(castId);
            setCast(data.cast);
            // Reset avatar index when cast data changes
            setCurrentAvatarIndex(0);
        } catch (error) {
            console.error('Failed to fetch cast profile:', error);
        }
    };

    const fetchPointsData = async () => {
        try {
            const data = await getCastPointsData(castId);
            setPointsData(data);
        } catch (error) {
            console.error('Failed to fetch points data:', error);
        }
    };

    const fetchPassportData = async () => {
        try {
            const data = await getCastPassportData(castId);
            setPassportData(data.passport_data);
        } catch (error) {
            console.error('Failed to fetch passport data:', error);
        }
    };

    const fetchNotificationCount = async () => {
        try {
            const count = await getUnreadNotificationCount('cast', castId);
            setNotificationCount(count);
        } catch (error) {
            console.error('Failed to fetch notification count:', error);
        }
    };

    const fetchGradeInfo = async () => {
        try {
            setGradeLoading(true);
            const data = await getCastGrade(castId);
            setGradeInfo(data);
        } catch (error) {
            console.error('Error fetching grade info:', error);
        } finally {
            setGradeLoading(false);
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            await Promise.all([
                fetchCastProfile(),
                fetchPointsData(),
                fetchPassportData(),
                fetchNotificationCount(),
                fetchGradeInfo()
            ]);
            setLoading(false);
        };
        
        if (castId) {
            fetchAllData();
        }
    }, [castId]);

    const handleProfileUpdate = () => {
        // Refresh the profile data after successful update
        fetchCastProfile();
    };

    const handleNotificationClose = () => {
        setShowNotification(false);
        // Refresh notification count when returning from notification page
        fetchNotificationCount();
    };

    // Real-time notification updates
    useNotifications(castId || 0, (notification) => {
        setNotificationCount(prev => prev + 1);
    });

    // Reset notification count when notification screen is opened
    const handleNotificationOpen = () => {
        setNotificationCount(0);
        setShowNotification(true);
    };

    // Avatar navigation functions
    const handlePreviousAvatar = () => {
        if (cast && cast.avatar) {
            const avatarUrls = getAllAvatarUrls(cast.avatar);
            setCurrentAvatarIndex(prev => 
                prev === 0 ? avatarUrls.length - 1 : prev - 1
            );
        }
    };

    const handleNextAvatar = () => {
        if (cast && cast.avatar) {
            const avatarUrls = getAllAvatarUrls(cast.avatar);
            setCurrentAvatarIndex(prev => 
                prev === avatarUrls.length - 1 ? 0 : prev + 1
            );
        }
    };

    // Get current avatar URL
    const getCurrentAvatarUrl = (): string => {
        if (!cast || !cast.avatar) {
            return '/assets/avatar/avatar-1.png';
        }
        
        const avatarUrls = getAllAvatarUrls(cast.avatar);
        return avatarUrls[currentAvatarIndex] || '/assets/avatar/avatar-1.png';
    };

    // Check if multiple avatars exist
    const hasMultipleAvatars = (): boolean => {
        if (!cast || !cast.avatar) return false;
        const avatarUrls = getAllAvatarUrls(cast.avatar);
        return avatarUrls.length > 1;
    };



    if (showGiftBox) return <CastGiftBoxPage onBack={() => setShowGiftBox(false)} />;
    if (showActivityRecord) return <CastActivityRecordPage onBack={() => setShowActivityRecord(false)} />;
    if (showFriendReferral) return <CastFriendReferralPage onBack={() => setShowFriendReferral(false)} />;
    if (showImmediatePayment) return <CastImmediatePaymentPage onBack={() => setShowImmediatePayment(false)} />;
    if (showEdit) return <CastProfileEditPage onBack={() => setShowEdit(false)} onProfileUpdate={handleProfileUpdate} />;
    if (showPointHistory) return <CastPointHistoryPage onBack={() => setShowPointHistory(false)} />;
    if (showNotification) return <CastNotificationPage onBack={handleNotificationClose} />;
    if (showQRCode) return <QRCodeModal onClose={() => setShowQRCode(false)} />;

    if (loading) {
        return (
            <div className="max-w-md bg-primary min-h-screen pb-24 flex items-center justify-center">
                <div className="text-white text-lg">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-gradient-to-br from-primary via-primary to-secondary min-h-screen pb-24">
            {/* Fixed Header */}
            <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50 flex items-center justify-between px-4 pt-4 pb-4 bg-primary border-b border-secondary">
                <button 
                    onClick={handleNotificationOpen} 
                    className="text-2xl text-white hover:text-secondary transition-colors relative"
                >
                    <Bell />
                    {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                            {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                    )}
                </button>
                <span className="text-xl font-bold text-white">マイページ</span>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => setShowQRCode(true)} 
                        className="text-2xl text-white hover:text-secondary transition-colors"
                    >
                        <QrCode />
                    </button>
                </div>
            </div>
            {/* Spacer to prevent content from being hidden behind fixed header */}
            <div className="h-16"></div>
            {/* Campaign/Event Banners */}
            <div className="px-4 pt-2 flex flex-col items-center">
                <div className="rounded-lg overflow-hidden mb-2 w-full border-2 border-secondary relative">
                    <img
                        src={getCurrentAvatarUrl()}
                        alt={`avatar-${currentAvatarIndex}`}
                        className="w-full h-64 object-cover"
                        onError={e => (e.currentTarget.src = '/assets/avatar/avatar-1.png')}
                    />
                    {/* Avatar Navigation Buttons */}
                    {hasMultipleAvatars() && (
                        <>
                            <button
                                onClick={handlePreviousAvatar}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                                aria-label="Previous avatar"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={handleNextAvatar}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                                aria-label="Next avatar"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}
                </div>
            </div>
            {/* Top row: avatar, name, pencil */}
            <div className="w-full flex flex-row justify-between items-center px-4 py-4 text-left cursor-pointer transition">
                <div className="flex items-center">
                    <div className="relative">
                        <img
                            src={getCurrentAvatarUrl()}
                            alt="profile"
                            className="w-10 h-10 rounded-full mr-2 border-2 border-secondary object-cover"
                            onError={e => (e.currentTarget.src = '/assets/avatar/avatar-1.png')}
                        />
                    </div>
                    <span className="font-bold text-lg text-white">{cast ? cast.nickname : '◎ えま◎'}</span>
                </div>
                <button className="text-white  hover:text-secondary" onClick={() => setShowEdit(true)}>
                    <Pencil />
                </button>
            </div>
            {/* Grade section */}
            <div className="bg-secondary text-white text-center py-2 font-bold">今期のグレード</div>
            <div className="bg-primary px-4 py-4 flex items-center gap-4 border border-secondary">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                </div>
                <span className="text-2xl font-bold text-white">
                    {gradeLoading ? '読み込み中...' : gradeInfo?.current_grade_name || 'ビギナー'}
                </span>
                <Link to="/cast/grade-detail" className="ml-auto cursor-pointer">
                    <ChevronRight size={24} className="text-white hover:text-secondary" />
                </Link>
            </div>
            {/* Points Section */}
            <div className="bg-gradient-to-br from-primary via-primary to-secondary border border-secondary rounded-lg mx-4 my-2 p-4">
                <div className="flex items-center mb-2">
                    <span className="text-xs font-medium text-white mr-2">今月の総売上ポイント</span>
                    <span className="text-xs text-white">
                        <CircleQuestionMark />
                    </span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                    {pointsData ? `${pointsData.monthly_total_points.toLocaleString()}P` : '0P'}
                </div>
                <div className="flex space-x-2 mb-2">
                    <div className="flex-1 bg-gray-900 rounded-lg p-2 text-center border border-secondary">
                        <div className="text-xs text-gray-400">ギフト獲得ポイント</div>
                        <div className="font-bold text-lg text-white">
                            {pointsData ? `${pointsData.gift_points.toLocaleString()}p` : '0p'}
                        </div>
                    </div>
                    <div className="flex-1 bg-gray-900 rounded-lg p-2 text-center border border-secondary">
                        <div className="text-xs text-gray-400">今月のコパトバック率</div>
                        <div className="font-bold text-lg text-white">
                            {pointsData ? `${pointsData.copat_back_rate}%` : '0%'}
                        </div>
                    </div>
                </div>
                <button className="w-full py-2 rounded-lg bg-secondary text-white font-bold hover:bg-red-700 transition" onClick={() => setShowPointHistory(true)}>所持ポイント確認・精算</button>
            </div>
            {/* Passport/Partner Shop Cards */}
            {/* <div className="bg-primary border border-secondary rounded-lg mx-4 my-2 p-4">
                <div className="font-bold text-base mb-2 text-white">pishattoパスポート</div>
                <div className="flex space-x-2 overflow-x-auto overflow-y-auto">
                    {passportData.length > 0 ? (
                        passportData.map((passport) => (
                            <div key={passport.id} className="w-60 h-24 bg-gray-900 rounded-lg min-w-[120px] flex justify-center text-xs border border-secondary">
                                <img src={passport.image} alt={passport.name} className="w-full h-full object-cover rounded" />
                            </div>
                        ))
                    ) : (
                        // Fallback to static images if no data
                        <>
                            <div className="w-60 h-24 bg-gray-900 rounded-lg min-w-[120px] flex justify-center text-xs border border-secondary">
                                <img src="/assets/avatar/AdobeStock_1095142160_Preview.jpeg" alt='img1' />
                            </div>
                            <div className="w-60 h-24 bg-gray-900 rounded-lg min-w-[120px] flex justify-center text-xs border border-secondary">
                                <img src="/assets/avatar/AdobeStock_1067731649_Preview.jpeg" alt='img1' />
                            </div>
                            <div className="w-60 h-24 bg-gray-900 rounded-lg  min-w-[120px] flex justify-center text-xs border border-secondary">
                                <img src="/assets/avatar/AdobeStock_1190678828_Preview.jpeg" alt='img1' />
                            </div>
                            <div className="w-60 h-24 bg-gray-900 rounded-lg min-w-[120px] flex justify-center text-xs border border-secondary">
                                <img src="/assets/avatar/AdobeStock_1537463438_Preview.jpeg" alt='img1' />
                            </div>
                            <div className="w-60 h-24 bg-gray-900 rounded-lg flex min-w-[120px] justify-center text-xs border border-secondary">
                                <img src="/assets/avatar/AdobeStock_1537463446_Preview.jpeg" alt='img1' />
                            </div>
                        </>
                    )}
                </div>
            </div> */}
            {/* Menu List */}
            <div className="bg-white/10 border border-secondary rounded-lg mx-4 my-2 p-2 divide-y divide-gray-800">
                <div className="w-full flex items-center px-4 py-4 text-left cursor-pointer hover:bg-secondary transition" onClick={() => setShowGiftBox(true)}>
                    <span className="text-xl mr-3 text-white">
                        <Gift />
                    </span>
                    <span className='flex-1 text-white'>ギフトボックス</span>
                    <span className="text-gray-400">
                        <ChevronRight />
                    </span>
                </div>
                <div className="w-full flex items-center px-4 py-4 text-left cursor-pointer hover:bg-secondary transition" onClick={() => setShowActivityRecord(true)}>
                    <span className="text-xl mr-3 text-white">
                        <ChartSpline />
                    </span>
                    <span className='flex-1 text-white'>活動実績</span>
                    <span className="text-gray-400">
                        <ChevronRight />
                    </span>
                </div>
                <div className="w-full flex items-center px-4 py-4 text-left cursor-pointer hover:bg-secondary transition" onClick={() => setShowFriendReferral(true)}>
                    <span className="text-xl mr-3 text-white">
                        <Users />
                    </span>
                    <span className='flex-1 text-white'>お友達紹介</span>
                    <span className="text-gray-400">
                        <ChevronRight />
                    </span>
                </div>
                <div className="w-full flex items-center px-4 py-4 text-left cursor-pointer hover:bg-secondary transition" onClick={() => setShowImmediatePayment(true)}>
                    <span className="text-xl mr-3 text-white">
                        <UserPlus />
                    </span>
                    <span className='flex-1 text-white'>すぐ入金</span>
                    <span className="text-gray-400">
                        <ChevronRight />
                    </span>
                </div>
            </div>
            {/* Info/Warning Box */}
            <div className="bg-white/10 border border-secondary rounded-lg mx-4 my-2 p-4 text-xs text-white">
                <div className="mb-2">通報・クレーム・低評価など以外にも、以下の事例等が確認された場合、アカウントが凍結となりサービスの利用ができなくなります。</div>
                <ul className="list-disc pl-5 mb-2">
                    <li>中抜き、現金の授受行為</li>
                    <li>タイマーの虚偽報告</li>
                    <li>アポイントのドタキャン・遅刻</li>
                    <li>自宅やホテル等、鍵付き個室の利用</li>
                    <li>競合サービスの登録・利用</li>
                    <li>他ユーザーの情報開示・漏洩</li>
                    <li>その他規約違反行為を伴う合流</li>
                </ul>
                <div>残念ながら毎月一定のキャストが該当してしまっています。日本一笑顔を作り、日本一稼げるサービスを一緒につくっていきましょう。</div>
            </div>
        </div>
    );
};

export default CastProfilePage; 