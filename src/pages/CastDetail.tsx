/*eslint-disable */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Share, Heart, MessageSquare } from 'lucide-react';
import { likeCast, getCastProfileById, createChat, sendGuestMessage, getLikeStatus, favoriteCast, unfavoriteCast, getFavorites, getCastList, getCastBadges } from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useNotificationSettings } from '../contexts/NotificationSettingsContext';
import Toast from '../components/ui/Toast';
import { shareContent } from '../utils/clipboard';

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
        if (!user || !id) return;
        
        // Check if like notifications are enabled
        const isLikeNotificationEnabled = isNotificationEnabled('likes');
        
        if (!isLikeNotificationEnabled) {
            setToastMessage('いいね通知が無効になっています。設定で有効にしてください。');
            setToastType('error');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
            return;
        }
        
        const res = await likeCast(user.id, Number(id));
        if (res.liked) setLiked(true);
        else setLiked(false);
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
            
            // Show success toast
            setToastMessage('メッセージを送信しました。');
            setToastType('success');
            setShowToast(true);
            // Auto-hide toast after 10 seconds
            setTimeout(() => setShowToast(false), 10000);
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
            const success = await shareContent({
                title: `${cast?.nickname || 'Cast'}のプロフィール`,
                text: `${cast?.nickname || 'Cast'}のプロフィールをチェックしてみてください！`,
                url: profileUrl,
            });
            
            if (success) {
                setToastMessage('プロフィールをシェアしました。');
                setToastType('success');
            } else {
                setToastMessage('URLのコピーに失敗しました。手動でコピーしてください。');
                setToastType('error');
            }
            
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        } catch (error) {
            console.error('Share error:', error);
            setToastMessage('URLのコピーに失敗しました。手動でコピーしてください。');
            setToastType('error');
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
        return <div className="min-h-screen max-w-md mx-auto flex items-center justify-center bg-primary text-white">ローディング...</div>;
    }

    return (
        <div className="min-h-screen flex justify-center bg-gray-400">
            <div className="w-full max-w-md items-center  mx-auto relative bg-gradient-to-br from-primary via-primary to-secondary">
                <Toast
                    message={toastMessage}
                    type={toastType}
                    isVisible={showToast}
                    onClose={() => setShowToast(false)}
                />
                {/* Header */}
                <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-gradient-to-br from-primary via-primary to-secondary z-50">
                    <div className="flex items-center justify-between p-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="text-2xl text-white hover:text-secondary transition-colors"
                        >
                            <ChevronLeft />
                        </button>
                        <div className="text-lg font-medium text-white">{cast?.nickname || 'なの💫'}</div>
                        <div className="flex items-center space-x-2">
                            <button 
                                type="button" 
                                className="text-2xl text-white hover:text-yellow-400 transition-colors"
                                onClick={handleFavorite}
                            >
                                <Heart className={`w-6 h-6 ${isFavorited ? 'fill-secondary text-secondary' : 'text-white'}`} />
                            </button>
                            <button 
                                type="button" 
                                className="text-2xl text-white hover:text-secondary transition-colors"
                                onClick={handleShare}
                            >
                                <Share />
                            </button>
                        </div>
                    </div>
                </div>
                {/* Main Image View */}
                <div className="pt-16 bg-gradient-to-br from-primary via-primary to-secondary">
                    <div className="rounded-lg overflow-hidden mb-2 w-full border-2 border-secondary relative">
                        <img
                            src={images[currentImageIndex]}
                            alt="Cast"
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                                e.currentTarget.src = '/assets/avatar/female.png';
                            }}
                        />
                    
                        
                        {/* Image Navigation Buttons */}
                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-primary/50 hover:bg-primary/70 rounded-full p-2 text-white transition-colors"
                                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-primary/50 hover:bg-primary/70 rounded-full p-2 text-white transition-colors"
                                    onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                {/* Thumbnails and Info */}
                <div className="w-full max-w-md bg-gradient-to-br from-primary via-primary to-secondary border-t border-secondary">
                    <div className="p-4">
                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2 mb-4 overflow-x-auto">
                                {images.map((img: string, index: number) => (
                                    <button
                                        type="button"
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-16 h-16 flex-shrink-0 rounded-lg ${currentImageIndex === index ? 'border-2 border-secondary' : 'border border-gray-600'}`}
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
                        {/* Time Posted */}
                        <div className="text-sm text-white mb-2">
                            {timePosted}
                        </div>
                        {/* Points Info */}
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-white">30分あたりのポイント</div>
                            <div className="text-xl font-bold text-white">{cast.grade_points || '0'}</div>
                        </div>
                    </div>
                </div>
                {/* Achievements Section */}
                <div className="bg-gradient-to-br from-primary via-primary to-secondary mt-2 p-4 border-t-4 border-secondary">
                    {/* Trophy Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-4 text-white">獲得した称号</h3>
                        <div className="flex items-center justify-center">
                            {titles.length === 0 ? (
                                <div className="text-white text-sm">称号はありません</div>
                            ) : (
                                titles.map((title, idx) => (
                                    <div key={idx} className="text-center mx-2">
                                        <img
                                            src="/assets/icons/gold-cup.png"
                                            alt="Trophy"
                                            className="w-20 h-20 mx-auto mb-2"
                                        />
                                        <div className="text-sm text-white">{title.period || ''}</div>
                                        <div className="text-sm font-medium text-white">{title.name || title.title || ''}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    {/* Badges Section */}
                    <div className="border-t border-secondary pt-4">
                        <h3 className="text-lg font-bold mb-4 text-white">ゲストから受け取ったバッジ</h3>
                        {badgesLoading ? (
                            <div className="text-center py-8">
                                <div className="text-white text-sm">バッジを読み込み中...</div>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-row gap-4 overflow-x-auto">
                                    {badges.length === 0 ? (
                                        <div className="text-white text-sm col-span-4 text-center py-4">バッジはありません</div>
                                    ) : (
                                        badges.map((badge, idx) => (
                                            <div key={badge.id || idx} className="text-center">
                                                <div className="relative inline-block">
                                                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl text-white shadow-lg">
                                                        {badge.icon || '🏅'}
                                                    </div>
                                                    {badge.count > 1 && (
                                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold min-w-[20px] text-center">
                                                            {badge.count}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm mt-2 text-white font-medium">{badge.name || ''}</div>
                                                {/* {badge.description && (
                                                    <div className="text-xs text-gray-300 mt-1 px-1">{badge.description}</div>
                                                )} */}
                                            </div>
                                        ))
                                    )}
                                </div>
                                {/* {badges.length > 0 && (
                                    <div className="mt-4 text-center">
                                        <div className="text-sm text-gray-300">
                                            合計 {badges.reduce((total, badge) => total + (badge.count || 1), 0)} 個のバッジを獲得
                                        </div>
                                    </div>
                                )} */}
                            </>
                        )}
                    </div>
                </div>
                {/* Self Introduction Section */}
                <div className="bg-gradient-to-br from-primary via-primary to-secondary mt-2 p-4">
                    <h3 className="text-lg font-bold mb-4 text-white">自己紹介</h3>
                    <div className="space-y-4 text-sm text-white">
                        <p>{cast?.profile_text || '自己紹介はありません'}</p>
                    </div>
                    <div className="mb-8 mt-4">
                        <div className='flex items-center text-white font-bold rounded-lg h-12 text-lg'>
                            おすすめキャスト
                        </div>
                        <div className='flex flex-row gap-4 justify-center overflow-x-auto'>
                            {randomCasts.length === 0 ? (
                                <div className="text-white text-sm">おすすめキャストはありません</div>
                            ) : (
                                randomCasts.map((rec) => (
                                    <div key={rec.id} className="flex flex-col items-center cursor-pointer" onClick={() => navigate(`/cast/${rec.id}`)}>
                                        <img 
                                            src={getFirstAvatar(rec.avatar)} 
                                            alt={rec.nickname || ''} 
                                            className="w-32 h-32 object-cover mb-2 border-2 border-secondary"
                                            onError={(e) => {
                                                e.currentTarget.src = '/assets/avatar/female.png';
                                            }}
                                        />
                                        <span className="font-bold text-sm mb-1 text-white text-center">{rec.nickname || ''}</span>
                                        <span className="text-xs text-gray-300">{rec.birth_year ? (new Date().getFullYear() - rec.birth_year)+'歳' : ''}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    {/* Like Button */}
                    <div className="px-4 py-2">
                        {!liked ? (
                            <button 
                                className={`w-full rounded-lg py-4 flex items-center justify-center font-bold text-lg transition ${
                                    isNotificationEnabled('likes') 
                                        ? 'bg-secondary text-white hover:bg-red-700' 
                                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                }`} 
                                onClick={handleLike}
                                disabled={!isNotificationEnabled('likes')}
                            >
                                <span className="mr-2">
                                    <Heart />
                                </span>
                                <span className="text-base">
                                    {isNotificationEnabled('likes') ? 'いいね' : 'いいね (無効)'}
                                </span>
                            </button>
                        ) : (
                            <button className="w-full border bg-secondary border-secondary text-white rounded-lg py-4 flex items-center justify-center font-bold text-lg hover:bg-red-700 transition" onClick={handleMessage} disabled={messageLoading}>
                                <span className="mr-2">
                                    <MessageSquare />
                                </span>
                                <span className="text-base">
                                    メッセージ
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CastDetail; 