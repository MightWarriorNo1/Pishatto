import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Share, Heart, Mail } from 'lucide-react';
import { likeCast, recordCastVisit, getCastProfileWithExtras } from '../services/api';
import { useUser } from '../contexts/UserContext';

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

    useEffect(() => {
        if (user && id) {
            recordCastVisit(user.id, Number(id));
        }
    }, [user, id]);

    useEffect(() => {
        if (id) {
            setLoading(true);
            getCastProfileWithExtras(Number(id)).then((data) => {
                setCast(data.cast);
                setBadges(data.badges || []);
                setTitles(data.titles || []);
                setRecommended(data.recommended || []);
                setLoading(false);
            });
        }
    }, [id]);

    const handleLike = async () => {
        if (!user || !id) return;
        const res = await likeCast(user.id, Number(id));
        setLiked(res.liked);
    };

    const handleMessageClick = () => {
        navigate(`/cast/${id}/message`);
    };

    // Mock image data
    const images = [
        '/assets/avatar/female.png',
        '/assets/avatar/man.png',
        '/assets/avatar/female.png',
        '/assets/avatar/female.png',
    ];

    const timePosted = '10時間前';
    const points = '7,500P';

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-primary text-white">ローディング...</div>;
    }

    return (
        <div className="min-h-screen flex justify-center bg-gray-400">
            <div className="w-full max-w-md relative bg-primary">
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
                        <button type="button" className="text-2xl text-white">
                            <Share />
                        </button>
                    </div>
                </div>
                {/* Main Image View */}
                <div className="pt-16 bg-primary">
                    <div className="relative w-full h-full">
                        <img
                            src={images[currentImageIndex]}
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
                        <div className="flex gap-2 mb-4 overflow-x-auto">
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
                        </div>
                        {/* Time Posted */}
                        <div className="text-sm text-white mb-2">
                            {timePosted}
                        </div>
                        {/* Points Info */}
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-white">30分あたりのポイント</div>
                            <div className="text-xl font-bold text-white">{points}</div>
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
                    <button
                        type="button"
                        className={`w-full mt-6 p-3 bg-secondary border rounded-lg flex items-center justify-center gap-2 ${liked ? 'text-white border-secondary' : 'text-white border-secondary'}`}
                        onClick={handleLike}
                    >
                        <Heart size={24} fill={liked ? '#e3342f' : 'none'} color={liked ? '#e3342f' : undefined} />
                        <span>いいね</span>
                    </button>
                    {liked && (
                        <button
                            type="button"
                            className="w-full mt-4 p-3 rounded-lg flex items-center justify-center gap-2 bg-secondary text-white text-lg font-bold"
                            onClick={handleMessageClick}
                        >
                            <Mail />
                            メッセージを送る
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CastDetail; 