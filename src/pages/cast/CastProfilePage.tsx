/*eslint-disable */
import React, { useEffect, useState } from 'react';
import { Bell, CircleQuestionMark, Gift, Pencil, QrCode, Settings, Users, ChartSpline, UserPlus, ChevronRight, ChevronLeft, Medal, Calendar, LogOut, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import CastGiftBoxPage from './CastGiftBoxPage';
import CastActivityRecordPage from './CastActivityRecordPage';
import CastFriendReferralPage from './CastFriendReferralPage';
import CastImmediatePaymentPage from './CastImmediatePaymentPage';
import { useCast } from '../../contexts/CastContext';
import { getCastProfileById, getCastPointsData, getCastPassportData, getUnreadNotificationCount, getCastGrade, GradeInfo, getMonthlyEarnedRanking, MonthlyRankingResponse } from '../../services/api';
import { useNotifications } from '../../hooks/useRealtime';
import CastProfileEditPage from './CastProfileEditPage';
import CastPointHistoryPage from './CastPointHistoryPage';
import CastNotificationPage from './CastNotificationPage';
import QRCodeModal from '../../components/dashboard/QRCodeModal';
import Spinner from '../../components/ui/Spinner';
import { useCastData } from '../../hooks/useCastData';
import { useCastMonthlyRanking } from '../../hooks/useQueries';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

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

// Always return the first avatar when multiple are present
const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
    const avatarUrls = getAllAvatarUrls(avatarString);
    return avatarUrls[0] || '/assets/avatar/avatar-1.png';
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
    transfer_points: number;
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
    const { castId, logout } = useCast();
    const [showEdit, setShowEdit] = useState(false);
    const [showPointHistory, setShowPointHistory] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<'current' | 'last'>('current');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Use React Query hooks for data fetching
    const {
        profile: cast,
        pointsData,
        passportData,
        gradeInfo,
        isLoading: castDataLoading,
        error: castDataError,
        invalidateAllCastData,
    } = useCastData(castId || 0);

    // Use individual hook for monthly ranking with month selection
    const {
        data: ranking,
        isLoading: rankingLoading,
        error: rankingError,
        refetch: refetchRanking
    } = useCastMonthlyRanking(castId || 0, selectedMonth);

    // Get notification count using the existing API function
    const [notificationCount, setNotificationCount] = useState(0);

    const fetchNotificationCount = async () => {
        try {
            if (!castId) return;
            const count = await getUnreadNotificationCount('cast', castId as number);
            setNotificationCount(count);
        } catch (error) {
            console.error('Failed to fetch notification count:', error);
        }
    };

    useEffect(() => {
        if (castId) {
            fetchNotificationCount();
        }
    }, [castId]);

    // Update ranking when month changes
    useEffect(() => {
        if (castId) {
            // React Query will automatically refetch when the month changes
            // due to the query key dependency
        }
    }, [castId, selectedMonth]);

    const handleProfileUpdate = () => {
        // Ensure fresh data is fetched immediately after profile edit
        invalidateAllCastData?.();
    };

    const handleNotificationClose = () => {
        setShowNotification(false);
        fetchNotificationCount(); // Refresh notification count
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

    // Handle month selection for ranking
    const handleMonthChange = (month: 'current' | 'last') => {
        setSelectedMonth(month);
        // React Query will automatically refetch when the month changes
    };

    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            // Invalidate cached cast data and explicitly refetch ranking
            invalidateAllCastData?.();
            await refetchRanking();
        } finally {
            setIsRefreshing(false);
        }
    };

    // Handle logout with confirmation
    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        try {
            await logout();
            setShowLogoutConfirm(false);
        } catch (error) {
            console.error('Error during logout:', error);
            // Still close the modal even if logout fails
            setShowLogoutConfirm(false);
        }
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };


    if (showGiftBox) return <CastGiftBoxPage onBack={() => setShowGiftBox(false)} />;
    if (showActivityRecord) return <CastActivityRecordPage onBack={() => setShowActivityRecord(false)} />;
    if (showFriendReferral) return <CastFriendReferralPage onBack={() => setShowFriendReferral(false)} />;
    if (showImmediatePayment) return <CastImmediatePaymentPage onBack={() => setShowImmediatePayment(false)} />;
    if (showEdit) return <CastProfileEditPage onBack={() => setShowEdit(false)} onProfileUpdate={handleProfileUpdate} />;
    if (showPointHistory) return <CastPointHistoryPage onBack={() => setShowPointHistory(false)} />;
    if (showNotification) return <CastNotificationPage onBack={handleNotificationClose} />;
    if (showQRCode) return <QRCodeModal onClose={() => setShowQRCode(false)} />;

    if (castDataLoading) {
        return (
            <div className="max-w-md bg-gradient-to-b from-primary via-primary to-secondary min-h-screen pb-24 flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-gradient-to-b from-primary via-primary to-secondary min-h-screen overflow-y-auto scrollbar-hidden">
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
            {/* Main content container with proper spacing */}
            <div className="pt-16">
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
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:text-secondary cursor-pointer text-white p-2 rounded-full transition-all duration-200"
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">
                        {gradeInfo?.current_grade_name || 'ビギナー'}
                    </span>
                    {ranking && (
                        <span className="text-sm text-white/90">
                            今月のランキング: {ranking.summary.my_rank !== null && ranking.summary.my_rank !== undefined ? `#${ranking.summary.my_rank}` : '—'} / Pt {ranking.summary.my_points ?? 0}
                        </span>
                    )}
                </div>
                <Link to="/cast/grade-detail" className="ml-auto cursor-pointer">
                    <ChevronRight size={24} className="text-white hover:text-secondary" />
                </Link>
            </div>
            {/* Points Section */}
            <div className="bg-gradient-to-b from-primary via-primary to-secondary border border-secondary rounded-lg mx-4 my-2 p-4">
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
                        <div className="text-xs text-gray-400">予約獲得ポイント</div>
                        <div className="font-bold text-lg text-white">
                            {pointsData ? `${pointsData.transfer_points.toLocaleString()}p` : '0p'}
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2 mb-2">
                    <div className="flex-1 bg-gray-900 rounded-lg p-2 text-center border border-secondary">
                        <div className="text-xs text-gray-400">今月のコパトバック率</div>
                        <div className="font-bold text-lg text-white">
                            {pointsData ? `${pointsData.copat_back_rate}%` : '0%'}
                        </div>
                    </div>
                    <div className="flex-1 bg-gray-900 rounded-lg p-2 text-center border border-secondary">
                        <div className="text-xs text-gray-400">総取引数</div>
                        <div className="font-bold text-lg text-white">
                            {pointsData ? `${pointsData.total_reservations}件` : '0件'}
                        </div>
                    </div>
                </div>
                <button className="w-full py-2 rounded-lg bg-secondary text-white font-bold hover:bg-red-700 transition" onClick={() => setShowPointHistory(true)}>所持ポイント確認・精算</button>
            </div>
            {/* Enhanced Monthly Ranking Section */}
            <div className="bg-white/10 border border-secondary rounded-lg mx-4 my-2 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Medal className="text-yellow-400" size={24} />
                        <span className="font-bold text-lg text-white">月間ランキング</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="text-white" size={16} />
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => handleMonthChange(e.target.value as 'current' | 'last')}
                            className="bg-secondary text-white text-sm px-2 py-1 rounded border border-white/20"
                        >
                            <option value="current">今月</option>
                            <option value="last">先月</option>
                        </select>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing || rankingLoading}
                            className="ml-1 text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            {isRefreshing || rankingLoading ? (
                                <>
                                    <RefreshCcw size={12} className="animate-spin" />
                                    <span>更新中...</span>
                                </>
                            ) : (
                                <span>更新</span>
                            )}
                        </button>
                    </div>
                </div>
                
                {rankingLoading ? (
                    <div className="text-center py-8">
                        <div className="text-white">ランキング読み込み中...</div>
                    </div>
                ) : ranking && ranking.data && ranking.data.length > 0 ? (
                    <>
                        {/* Current Cast Ranking Summary */}
                        {ranking.summary.my_rank !== null && ranking.summary.my_rank !== undefined && (
                            <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30 rounded-lg p-3 mb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">{ranking.summary.my_rank}</span>
                                        </div>
                                        <div>
                                            <div className="text-white font-semibold">あなたの順位</div>
                                            <div className="text-yellow-400 text-sm">{ranking.summary.my_points?.toLocaleString()}P</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white/70 text-xs">期間</div>
                                        <div className="text-white text-sm">
                                            {ranking.summary.period_start} - {ranking.summary.period_end}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Top 10 Ranking List */}
                        <div className="space-y-2">
                            <div className="text-center text-white/70 text-sm mb-3">TOP 10</div>
                            {ranking.data.map((item, index) => (
                                <div key={item.user_id} className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                                    item.user_id === castId ? 'bg-yellow-400/20 border border-yellow-400/30' : 'bg-white/5 hover:bg-white/10'
                                }`}>
                                    <div className="w-8 text-center">
                                        {index === 0 && <span className="text-yellow-400 text-lg">🥇</span>}
                                        {index === 1 && <span className="text-gray-300 text-lg">🥈</span>}
                                        {index === 2 && <span className="text-orange-400 text-lg">🥉</span>}
                                        {index > 2 && <span className="text-white font-bold">{item.rank}</span>}
                                    </div>
                                    <img
                                        src={getFirstAvatarUrl(item.avatar)}
                                        onError={e => (e.currentTarget.src = '/assets/avatar/avatar-1.png')}
                                        alt={item.name}
                                        className="w-8 h-8 rounded-full border border-secondary object-cover mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className={`truncate ${item.user_id === castId ? 'text-yellow-400 font-semibold' : 'text-white'}`}>
                                            {item.name}
                                        </div>
                                    </div>
                                    <div className="text-white font-semibold">{item.points.toLocaleString()}P</div>
                                </div>
                            ))}
                             {/* Show current user's ranking even if not in TOP 10 */}
                             {!ranking.data.some(i => i.user_id === castId) && (ranking.summary.my_rank !== null && ranking.summary.my_rank !== undefined) && (
                                 <>
                                     <div className="text-center text-white/50 text-xs mt-3">あなた</div>
                                     <div className="flex items-center px-3 py-2 rounded-lg transition-colors bg-yellow-400/20 border border-yellow-400/30">
                                         <div className="w-8 text-center">
                                             <span className="text-white font-bold">{ranking.summary.my_rank}</span>
                                         </div>
                                         <img
                                             src={getFirstAvatarUrl(cast?.avatar)}
                                             onError={e => (e.currentTarget.src = '/assets/avatar/avatar-1.png')}
                                             alt={cast?.nickname || 'you'}
                                             className="w-8 h-8 rounded-full border border-secondary object-cover mr-3"
                                         />
                                         <div className="flex-1">
                                             <div className="truncate text-yellow-400 font-semibold">
                                                 {cast?.nickname || 'あなた'}
                                             </div>
                                         </div>
                                         <div className="text-white font-semibold">{(ranking.summary.my_points ?? 0).toLocaleString()}P</div>
                                     </div>
                                 </>
                             )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-white/70">ランキングデータがありません</div>
                    </div>
                )}
            </div>
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
                <div>通報・クレーム・低評価など以外にも、以下の事例等が確認された場合、アカウントが凍結となりサービスの利用ができなくなります。</div>
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

            {/* Logout Section */}
            <div className="px-4 pb-32">
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

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">ログアウト確認</h3>
                            <p className="text-gray-600">本当にログアウトしますか？</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelLogout}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                ログアウト
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CastProfilePage;