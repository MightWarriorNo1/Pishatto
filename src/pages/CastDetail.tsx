/*eslint-disable */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Share, Heart, MessageSquare, Star, Trophy, Award, User } from 'lucide-react';
import { likeCast, getCastProfileById, createChat, sendGuestMessage, getLikeStatus, favoriteCast, unfavoriteCast, getFavorites, getCastList, getCastBadges } from '../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/react-query';
import { useUser } from '../contexts/UserContext';
import { useNotificationSettings } from '../contexts/NotificationSettingsContext';
import Toast from '../components/ui/Toast';
import Spinner from '../components/ui/Spinner';
import { formatPoints } from '../utils/formatters';

// Interface for badge data
interface Badge {
    id: number;
    name: string;
    icon: string;
    description?: string;
    count: number;
    received_at?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const CastDetail: React.FC = () => {
    //eslint-disable-next-line
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const { isNotificationEnabled } = useNotificationSettings();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [liked, setLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [cast, setCast] = useState<any>(null);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [badgesLoading, setBadgesLoading] = useState(false);
    const [titles, setTitles] = useState<any[]>([]);
    const [recommended, setRecommended] = useState<any[]>([]);
    const [allCasts, setAllCasts] = useState<any[]>([]);
    const [randomCasts, setRandomCasts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageLoading, setMessageLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [isFavorited, setIsFavorited] = useState(false);
    const queryClient = useQueryClient();

    // Function to fetch all casts and get 3 random ones (excluding current cast)
    const fetchAllCastsAndGetRandom = async () => {
        try {
            const response = await getCastList({});
            const allCastsData = response.casts || [];
            setAllCasts(allCastsData);
            
            // Filter out the current cast and get 3 random ones
            const otherCasts = allCastsData.filter((castItem: any) => castItem.id !== Number(id));
            const shuffled = [...otherCasts].sort(() => 0.5 - Math.random());
            const selectedCasts = shuffled.slice(0, 3);
            setRandomCasts(selectedCasts);
        } catch (error) {
            console.error('Error fetching all casts:', error);
            setRandomCasts([]);
        }
    };

    // Function to fetch cast badges with counts
    const fetchCastBadges = async (castId: number) => {
        try {
            setBadgesLoading(true);
            const badgesData = await getCastBadges(castId);
            console.log("Cast badges data:", badgesData);
            
            // Process badges to include count information
            const processedBadges: Badge[] = badgesData.map((badge: any) => ({
                id: badge.id,
                name: badge.name,
                icon: badge.icon,
                description: badge.description,
                count: badge.count || 1, // Get count directly from badge object
                received_at: badge.received_at
            }));
            
            setBadges(processedBadges);
        } catch (error) {
            console.error('Error fetching cast badges:', error);
            setBadges([]);
        } finally {
            setBadgesLoading(false);
        }
    };

    useEffect(()=>{
        likeStatus();
        checkFavoriteStatus();
        fetchAllCastsAndGetRandom();
    },[Number(id), Number(user?.id)]);

    useEffect(() => {
        if (id) {
            setLoading(true);
            console.log("Fetching cast profile for ID:", id);
            getCastProfileById(Number(id)).then((data) => {
                console.log("Cast data:", data);
                setCast(data.cast);
                setTitles(data.titles || []);
                setRecommended(data.recommended || []);
                
                // Fetch badges separately to get proper count information
                fetchCastBadges(Number(id));
                
                setLoading(false);
            });
        }
    }, [id]);

    const handleLike = async () => {
        if (!user || !id || isLiking) return;
        
        // Check if like notifications are enabled
        const isLikeNotificationEnabled = isNotificationEnabled('likes');
        
        if (!isLikeNotificationEnabled) {
            setToastMessage('いいね通知が無効になっています。設定で有効にしてください。');
            setToastType('error');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
            return;
        }

        // Optimistic UI update
        const previousLiked = liked;
        setLiked(true);
        setIsLiking(true);

        try {
            const res = await likeCast(user.id, Number(id));
            setLiked(!!res.liked);
        } catch (error) {
            setLiked(previousLiked);
            setToastMessage('いいねに失敗しました。再度お試しください。');
            setToastType('error');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        } finally {
            setIsLiking(false);
        }
    };

    const likeStatus = async () => {
        const res = await getLikeStatus(Number(id), Number(user?.id));
        if (res.liked) setLiked(true);
        else setLiked(false);
    };

    const checkFavoriteStatus = async () => {
        if (!user || !id) return;
        try {
            const favorites = await getFavorites(user.id);
            const isInFavorites = favorites.casts?.some((favCast: any) => favCast.id === Number(id));
            setIsFavorited(isInFavorites || false);
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const handleFavorite = async () => {
        if (!user || !id) return;
        try {
            if (isFavorited) {
                await unfavoriteCast(user.id, Number(id));
                setIsFavorited(false);
                setToastMessage('お気に入りから削除しました。');
            } else {
                await favoriteCast(user.id, Number(id));
                setIsFavorited(true);
                setToastMessage('お気に入りに追加しました。');
            }
            setToastType('success');
            setShowToast(true);
            // Immediately refresh guest favorites so Dashboard Favorites tab updates without manual refresh
            queryClient.invalidateQueries({ queryKey: queryKeys.guest.favorites(user.id) });
            // Auto-hide toast after 10 seconds
            setTimeout(() => setShowToast(false), 10000);
        } catch (error) {
            setToastMessage('お気に入りの操作に失敗しました。');
            setToastType('error');
            setShowToast(true);
            // Auto-hide toast after 10 seconds
            setTimeout(() => setShowToast(false), 10000);
        }
    };

    const handleMessage = async () => {
        // Check if message notifications are enabled
        const isMessageNotificationEnabled = isNotificationEnabled('messages');
        
        if (!isMessageNotificationEnabled) {
            setToastMessage('メッセージ通知が無効になっています。設定で有効にしてください。');
            setToastType('error');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
            return;
        }
        
        setMessageLoading(true);
        try {
            const chatRes = await createChat(cast.id,Number(user?.id));
            const chatId = chatRes.chat.id;
            await sendGuestMessage(chatId, Number(user?.id), '👍');
            // await sendCastMessage(chatId, Number(id), '👍');
            
            // Navigate directly to guest dashboard message tab with this chat opened
            navigate('/dashboard', { replace: true, state: { openChatId: chatId, openMessageTab: true } });
        } catch (error) {
            // Show error toast
            setToastMessage('メッセージの送信に失敗しました。再度お試しください。');
            setToastType('error');
            setShowToast(true);
            // Auto-hide toast after 10 seconds
            setTimeout(() => setShowToast(false), 10000);
        } finally {
            setMessageLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            const profileUrl = window.location.href;
            
            // Direct clipboard copy instead of share dialog
            await navigator.clipboard.writeText(profileUrl);
            
            setToastMessage('URLをクリップボードにコピーしました。');
            setToastType('success');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
            // Fallback for older browsers
            try {
                const textArea = document.createElement('textarea');
                textArea.value = window.location.href;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                if (document.body.contains(textArea)) {
                    document.body.removeChild(textArea);
                }
                
                setToastMessage('URLをクリップボードにコピーしました。');
                setToastType('success');
            } catch (fallbackErr) {
                console.error('Fallback copy failed:', fallbackErr);
                setToastMessage('URLのコピーに失敗しました。手動でコピーしてください。');
                setToastType('error');
            }
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        }
    };


    // Parse multiple avatars from comma-separated string
    const getAvatarUrls = () => {
        if (cast?.avatar) {
            return cast.avatar.split(',').map((avatar: string) => avatar.trim()).filter((avatar: string) => avatar);
        }
        return [];
    };

    // Get first avatar from multiple avatars
    const getFirstAvatar = (avatarString: string) => {
        if (avatarString) {
            const avatars = avatarString.split(',').map((avatar: string) => avatar.trim()).filter((avatar: string) => avatar);
            return avatars.length > 0 ? `${API_BASE_URL}/${avatars[0]}` : '/assets/avatar/female.png';
        }
        return '/assets/avatar/female.png';
    };



    const avatarUrls = getAvatarUrls();
    const images = avatarUrls.length > 0 ? avatarUrls.map((url: string) => `${API_BASE_URL}/${url}`) : ['/assets/avatar/female.png'];

    const timePosted = '10時間前';

    if (loading) {
        return (
            <div className="min-h-screen max-w-md mx-auto flex justify-center items-center bg-gradient-to-b from-primary via-primary to-secondary">
                <div className="text-center">
                    <Spinner />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen max-w-md mx-auto bg-gradient-to-b from-primary via-primary to-secondary pb-0">
            <div className="w-full max-w-md mx-auto relative pb-0">
                <Toast
                    message={toastMessage}
                    type={toastType}
                    isVisible={showToast}
                    onClose={() => setShowToast(false)}
                />
                
                {/* Enhanced Header */}
                <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-gradient-to-b from-primary/95 via-primary/95 to-secondary/95 backdrop-blur-md z-50 shadow-lg">
                    <div className="relative flex items-center justify-between p-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="text-2xl text-white hover:text-secondary transition-all duration-200 cursor-pointer p-2 rounded-full hover:bg-white/10"
                        >
                            <ChevronLeft />
                        </button>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-lg font-bold text-white text-center">
                                {cast?.nickname || 'なの💫'}
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button 
                                type="button" 
                                className="text-2xl text-white hover:text-yellow-400 transition-all duration-200 p-2 rounded-full hover:bg-white/10"
                                onClick={handleFavorite}
                            >
                                <Star className={`w-6 h-6 ${isFavorited ? 'fill-secondary text-secondary animate-pulse' : 'text-white'}`} />
                            </button>
                            <button 
                                type="button" 
                                className="text-2xl text-white hover:text-secondary transition-all duration-200 p-2 rounded-full hover:bg-white/10"
                                onClick={handleShare}
                            >
                                <Share />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Enhanced Main Image View */}
                <div className="pt-20 pb-6">
                    <div className="mx-4 rounded-2xl overflow-hidden shadow-2xl border-4 border-secondary/30 relative group">
                        <img
                            src={images[currentImageIndex]}
                            alt="Cast"
                            className="w-full h-80 object-cover transition-all duration-300 group-hover:scale-105"
                            onError={(e) => {
                                e.currentTarget.src = '/assets/avatar/female.png';
                            }}
                        />
                    
                        {/* Enhanced Category Badge */}
                        {cast?.category && (
                            <div className="absolute bottom-4 left-4">
                                <div className={`px-4 py-2 rounded-full text-sm font-bold text-white shadow-2xl backdrop-blur-sm ${
                                    cast.category === 'ロイヤルVIP' 
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-300' 
                                        : cast.category === 'VIP' 
                                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-300' 
                                        : 'bg-gradient-to-r from-blue-600 to-green-600 border-2 border-blue-300'
                                }`}>
                                    {cast.category}
                                </div>
                            </div>
                        )}
                        
                        {/* Enhanced Image Navigation */}
                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 cursor-pointer rounded-full p-3 text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full p-3 text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                                    onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}

                        {/* Image Counter */}
                        {images.length > 1 && (
                            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Thumbnails and Info */}
                <div className="mx-4 mb-6">
                    {/* Enhanced Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                            {images.map((img: string, index: number) => (
                                <button
                                    type="button"
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-20 h-20 flex-shrink-0 rounded-xl transition-all duration-200 hover:scale-105 ${
                                        currentImageIndex === index 
                                            ? 'border-4 border-secondary shadow-lg scale-110' 
                                            : 'border-2 border-white/30 hover:border-white/50'
                                    }`}
                                >
                                    <img 
                                        src={img} 
                                        alt={`Thumbnail ${index + 1}`} 
                                        className="w-full h-full object-cover rounded-lg" 
                                        onError={e => (e.currentTarget.src = '/assets/avatar/female.png')}
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Enhanced Info Cards */}
                    <div className="space-y-4">
                        {/* Time Posted */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <div className="flex items-center text-white">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                                <span className="text-sm font-medium">{timePosted}</span>
                            </div>
                        </div>

                        {/* Points Info */}
                        <div className="bg-gradient-to-r from-secondary/20 to-secondary/10 backdrop-blur-sm rounded-xl p-4 border border-secondary/30">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-white font-medium">30分あたりのポイント</div>
                                <div className="text-2xl font-bold text-secondary flex items-center">
                                    <Star className="w-6 h-6 mr-2 fill-current" />
                                    {formatPoints(cast.grade_points)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Achievements Section */}
                <div className="mx-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                        {/* Enhanced Trophy Section */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-6 text-white flex items-center">
                                <Trophy className="w-6 h-6 mr-3 text-yellow-400" />
                                獲得した称号
                            </h3>
                            <div className="flex items-center justify-center">
                                {titles.length === 0 ? (
                                    <div className="text-white/70 text-center py-8">
                                        <Trophy className="w-16 h-16 mx-auto mb-3 text-white/30" />
                                        <div className="text-lg">称号はありません</div>
                                        <div className="text-sm text-white/50">まだ称号を獲得していません</div>
                                    </div>
                                ) : (
                                    titles.map((title, idx) => (
                                        <div key={idx} className="text-center mx-3 group">
                                            <div className="relative">
                                                <img
                                                    src="/assets/icons/gold-cup.png"
                                                    alt="Trophy"
                                                    className="w-24 h-24 mx-auto mb-3 transition-transform duration-200 group-hover:scale-110"
                                                />
                                                <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                                    {idx + 1}
                                                </div>
                                            </div>
                                            <div className="text-sm text-white/80 mb-1">{title.period || ''}</div>
                                            <div className="text-sm font-bold text-white">{title.name || title.title || ''}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Enhanced Badges Section */}
                        <div className="border-t border-white/20 pt-6">
                            <h3 className="text-xl font-bold mb-6 text-white flex items-center">
                                <Award className="w-6 h-6 mr-3 text-blue-400" />
                                ゲストから受け取ったバッジ
                            </h3>
                            {badgesLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                                    <div className="text-white text-lg">バッジを読み込み中...</div>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-4 gap-4">
                                        {badges.length === 0 ? (
                                            <div className="col-span-4 text-center py-12">
                                                <Award className="w-16 h-16 mx-auto mb-3 text-white/30" />
                                                <div className="text-lg text-white/70">バッジはありません</div>
                                                <div className="text-sm text-white/50">まだバッジを受け取っていません</div>
                                            </div>
                                        ) : (
                                            badges.map((badge, idx) => (
                                                <div key={badge.id || idx} className="text-center group">
                                                    <div className="relative inline-block">
                                                        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-secondary to-blue-500 flex items-center justify-center text-3xl text-white shadow-lg transition-transform duration-200 group-hover:scale-110 border-2 border-white/20">
                                                            {badge.icon || '🏅'}
                                                        </div>
                                                        {badge.count > 1 && (
                                                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold min-w-[24px] text-center shadow-lg border-2 border-white">
                                                                {badge.count}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-sm mt-3 text-white font-medium px-2">{badge.name || ''}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enhanced Self Introduction Section */}
                <div className="mx-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-white flex items-center">
                            <User className="w-6 h-6 mr-3 text-green-400" />
                            自己紹介
                        </h3>
                        <div className="text-white leading-relaxed">
                            <p className="text-base whitespace-pre-line">{cast?.profile_text || '自己紹介はありません'}</p>
                        </div>
                    </div>
                </div>

                {/* Enhanced Recommended Casts Section */}
                <div className="mx-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                        <h3 className="text-xl font-bold mb-6 text-white flex items-center">
                            <Star className="w-6 h-6 mr-3 text-yellow-400" />
                            おすすめキャスト
                        </h3>
                        <div className="flex flex-row gap-4 justify-center overflow-x-auto pb-2">
                            {randomCasts.length === 0 ? (
                                <div className="text-white text-sm">おすすめキャストはありません</div>
                            ) : (
                                randomCasts.map((rec) => (
                                    <div key={rec.id} className="flex flex-col cursor-pointer" onClick={() => navigate(`/cast/${rec.id}`)}>
                                        <div className="relative">
                                            <img 
                                                src={getFirstAvatar(rec.avatar)} 
                                                alt={rec.nickname || ''} 
                                                className="w-32 h-32 object-cover mb-2 border-2 border-secondary"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/assets/avatar/female.png';
                                                }}
                                            />
                                            {/* Category Badge for Random Casts */}
                                            {rec.category && (
                                                <div className="absolute bottom-2 left-2">
                                                    <div className={`px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                                                        rec.category === 'ロイヤルVIP' 
                                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                                                            : rec.category === 'VIP' 
                                                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                                                            : 'bg-gradient-to-r from-blue-500 to-green-500'
                                                    }`}>
                                                        {rec.category}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-bold text-sm mb-1 text-white text-center">{rec.nickname || ''}</span>
                                        <span className="text-xs text-gray-300 text-center">{rec.birth_year ? (new Date().getFullYear() - rec.birth_year)+'歳' : ''}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="mx-4 pb-4">
                    {!liked ? (
                        <button 
                            className={`w-full rounded-xl py-5 flex items-center justify-center font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
                                isNotificationEnabled('likes') 
                                    ? 'bg-gradient-to-r from-secondary to-red-600 text-white hover:from-red-600 hover:to-secondary' 
                                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                            }`} 
                            onClick={handleLike}
                            disabled={!isNotificationEnabled('likes') || isLiking}
                        >
                            <Heart className={`w-6 h-6 mr-3 ${isNotificationEnabled('likes') ? 'animate-pulse' : ''}`} />
                            <span className="text-base">
                                {isNotificationEnabled('likes') ? (isLiking ? '処理中...' : 'いいね') : 'いいね (無効)'}
                            </span>
                        </button>
                    ) : (
                        <button 
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl py-5 flex items-center justify-center font-bold text-lg hover:from-purple-600 hover:to-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]" 
                            onClick={handleMessage} 
                            disabled={messageLoading}
                        >
                            <MessageSquare className="w-6 h-6 mr-3" />
                            <span className="text-base">
                                {messageLoading ? '処理中...' : 'メッセージ'}
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CastDetail; 