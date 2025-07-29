import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Share, Heart, MessageSquare } from 'lucide-react';
import { likeCast, getCastProfileById, createChat, sendGuestMessage, getLikeStatus, favoriteCast, unfavoriteCast, getFavorites } from '../services/api';
import { useUser } from '../contexts/UserContext';
import Toast from '../components/ui/Toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const CastDetail: React.FC = () => {
    //eslint-disable-next-line
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [liked, setLiked] = useState(false);
    const [cast, setCast] = useState<any>(null);
    const [badges, setBadges] = useState<any[]>([]);
    const [titles, setTitles] = useState<any[]>([]);
    const [recommended, setRecommended] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageLoading, setMessageLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(()=>{
        likeStatus();
        checkFavoriteStatus();
    },[Number(id), Number(user?.id)]);

    useEffect(() => {
        if (id) {
            setLoading(true);
            getCastProfileById(Number(id)).then((data) => {
                setCast(data.cast);
                console.log("cast", data.cast);
                setLoading(false);
            });
        }
    }, [id]);

    const handleLike = async () => {
        if (!user || !id) return;
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
        } catch (error) {
            setToastMessage('お気に入りの操作に失敗しました。');
            setToastType('error');
            setShowToast(true);
        }
    };

    const handleMessage = async () => {
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
        } catch (error) {
            // Show error toast
            setToastMessage('メッセージの送信に失敗しました。再度お試しください。');
            setToastType('error');
            setShowToast(true);
        } finally {
            setMessageLoading(false);
        }
    };


    // Mock image data
    const images = [
        '/assets/avatar/female.png',
        '/assets/avatar/man.png',
        '/assets/avatar/female.png',
        '/assets/avatar/female.png',
    ];

    const timePosted = '10時間前';

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-primary text-white">ローディング...</div>;
    }

    return (
        <div className="min-h-screen flex justify-center bg-gray-400">
            <div className="w-full max-w-md relative bg-primary">
                {/* Toast Notification */}
                <Toast
                    message={toastMessage}
                    type={toastType}
                    isVisible={showToast}
                    onClose={() => setShowToast(false)}
                />
                {/* Header */}
                <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-primary z-50">
                    <div className="flex items-center justify-between p-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="text-2xl text-white"
                        >
                            <ChevronLeft />
                        </button>
                        <div className="text-lg font-medium text-white">なの💫</div>
                        <div className="flex items-center space-x-2">
                            <button 
                                type="button" 
                                className="text-2xl text-white hover:text-yellow-400 transition-colors"
                                onClick={handleFavorite}
                            >
                                <Heart className={`w-6 h-6 ${isFavorited ? 'fill-secondary text-secondary' : 'text-white'}`} />
                            </button>
                            <button type="button" className="text-2xl text-white">
                                <Share />
                            </button>
                        </div>
                    </div>
                </div>
                {/* Main Image View */}
                <div className="pt-16 bg-primary">
                    <div className="relative w-full h-full">
                        <img
                            src={cast.avatar ? `${API_BASE_URL}/${cast.avatar}` : '/assets/avatar/female.png'}
                            alt="Cast"
                            className="w-full h-full object-contain"
                        />
                        {/* Image Navigation Buttons */}
                        <button
                            type="button"
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-primary/50 rounded-full p-2"
                            onClick={() => setCurrentImageIndex((prev) => Math.max(0, prev - 1))}
                        >
                            <ChevronLeft />
                        </button>
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-primary/50 rounded-full p-2"
                            onClick={() => setCurrentImageIndex((prev) => Math.min(images.length - 1, prev + 1))}
                        >
                            <ChevronRight />
                        </button>
                    </div>
                </div>
                {/* Thumbnails and Info */}
                <div className="w-full max-w-md bg-primary border-t border-secondary">
                    <div className="p-4">
                        {/* Thumbnails */}
                        {/* <div className="flex gap-2 mb-4 overflow-x-auto">
                            {images.map((img, index) => (
                                <button
                                    type="button"
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-16 h-16 flex-shrink-0 ${currentImageIndex === index ? 'border-2 border-secondary' : ''}`}
                                >
                                    <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div> */}
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
                <div className="bg-primary mt-2 p-4 border-t-4 border-secondary">
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
                    <div className="border-t border-secondary">
                        <h3 className="text-lg font-bold mb-4 text-white">ゲストから受け取ったバッジ</h3>
                        <div className="grid grid-cols-4 gap-4">
                            {badges.length === 0 ? (
                                <div className="text-white text-sm col-span-4">バッジはありません</div>
                            ) : (
                                badges.map((badge, idx) => (
                                    <div key={idx} className="text-center">
                                        <div className="relative inline-block">
                                            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl text-white">
                                                {badge.icon || '🏅'}
                                            </div>
                                            {badge.count > 1 && (
                                                <div className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full px-1">
                                                    ×{badge.count}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm mt-1 text-white">{badge.name || badge.label || ''}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                {/* Self Introduction Section */}
                <div className="bg-primary mt-2 p-4">
                    <h3 className="text-lg font-bold mb-4 text-white">自己紹介</h3>
                    <div className="space-y-4 text-sm text-white">
                        <p>{cast?.profile_text || '自己紹介はありません'}</p>
                    </div>
                    <div className="mb-8 overflow-x-auto mt-4">
                        <div className='flex items-center text-white font-bold rounded-lg px-2 h-12 text-lg'>
                            おすすめキャスト
                        </div>
                        <div className='flex flex-row gap-2'>
                            {recommended.length === 0 ? (
                                <div className="text-white text-sm">おすすめキャストはありません</div>
                            ) : (
                                recommended.map((rec) => (
                                    <div key={rec.id} className="flex flex-col items-center cursor-pointer" onClick={() => navigate(`/cast/${rec.id}`)}>
                                        <img src={rec.avatar || '/assets/avatar/female.png'} alt={rec.nickname || ''} className="w-20 h-20 rounded-full object-cover mb-2 border-2 border-secondary" />
                                        <span className="font-bold text-sm mb-1 text-white">{rec.nickname || ''}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    {/* Like Button */}
                    <div className="px-4 py-2">
                        {!liked ? (
                        <button className="w-full border border-secondary text-white rounded py-2 flex items-center justify-center font-bold hover:bg-secondary hover:text-white transition" onClick={handleLike}>
                                <span className="mr-2">
                                    <Heart /></span>
                                <span className="text-base">
                                </span>いいね
                            </button>
                        ) : (
                            <button className="w-full border bg-secondary border-secondary text-white rounded py-2 flex items-center justify-center font-bold hover:bg-secondary hover:text-white transition" onClick={handleMessage} disabled={messageLoading}>
                                <span className="mr-2">
                                    <MessageSquare /></span>
                                <span className="text-base">
                                </span>メッセージ
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CastDetail; 