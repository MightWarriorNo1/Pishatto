import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Share, Heart, Mail } from 'lucide-react';

const CastDetail: React.FC = () => {
    //eslint-disable-next-line
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [liked, setLiked] = useState(false);
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

    // Mock badge data
    const badges = [
        { id: 1, name: '可愛い', count: 3, icon: '❤️' },
        { id: 2, name: 'ピュア', count: 1, icon: '🤍' },
        { id: 3, name: '笑顔', count: 1, icon: '😊' },
        { id: 4, name: '明るい', count: 1, icon: '☀️' },
    ];

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
                            <div className="text-center">
                                <img
                                    src="/assets/icons/gold-cup.png"
                                    alt="Trophy"
                                    className="w-20 h-20 mx-auto mb-2"
                                />
                                <div className="text-sm text-white">2024年5月 週間ポイント</div>
                                <div className="text-sm font-medium text-white">美組 チーム優勝</div>
                            </div>
                        </div>
                    </div>
                    {/* Badges Section */}
                    <div className="border-t border-secondary">
                        <h3 className="text-lg font-bold mb-4 text-white">ゲストから受け取ったバッジ</h3>
                        <div className="grid grid-cols-4 gap-4">
                            {badges.map((badge) => (
                                <div key={badge.id} className="text-center">
                                    <div className="relative inline-block">
                                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl text-white">
                                            {badge.icon}
                                        </div>
                                        {badge.count > 1 && (
                                            <div className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full px-1">
                                                ×{badge.count}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm mt-1 text-white">{badge.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Self Introduction Section */}
                <div className="bg-primary mt-2 p-4">
                    <h3 className="text-lg font-bold mb-4 text-white">自己紹介</h3>
                    <div className="space-y-4 text-sm text-white">
                        <p>はじめまして、なのっていいます😺💘</p>
                        <p>ご飯 飲み カフェ カラオケ<br />
                            シーシャ 野球 ダーツ ポーカー💗</p>
                        <p>ゴルフ始めてみたいので教えてくれる方募集です🤔</p>
                        <p>食べものの好き嫌いありません🤍<br />
                            お酒もなんでも好きです🍾 飲めます🤍</p>
                        <p>周りからは愛嬌あるって言われます🐱<br />
                            人と喋るのが大好きです🥰</p>
                        <p>ぜひコバトでお会いしたいです💗</p>
                        <p>都内どこでも行きます🎵<br />
                            タカ以降のお時間比較的空いてます🔥</p>
                    </div>

                    <div className="mb-8 overflow-x-auto mt-4">
                        <div className='flex items-center text-white font-bold rounded-lg px-2 h-12 text-lg'>
                            おすすめキャスト
                        </div>
                        <div className='flex flex-row'>
                            {images.map((img, index) => (
                                <img src={img} alt={`Thumbnail ${index + 1}`} className="w-32 h-32 object-cover" />
                            ))}
                        </div>
                    </div>
                    {/* Like Button */}
                    <button
                        type="button"
                        className={`w-full mt-6 p-3 bg-secondary border rounded-lg flex items-center justify-center gap-2 ${liked ? 'text-white border-secondary' : 'text-white border-secondary'}`}
                        onClick={() => setLiked((prev) => !prev)}
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