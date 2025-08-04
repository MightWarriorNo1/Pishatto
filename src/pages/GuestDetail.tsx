/*eslint-disable */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getGuestProfileById, GuestProfile, likeGuest, createChat, sendCastMessage, getLikeStatus, recordGuestVisit } from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Utility function to get the first available avatar from comma-separated string
const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
    if (!avatarString) {
        return '/assets/avatar/avatar-1.png';
    }
    
    // Split by comma and get the first non-empty avatar
    const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
    
    if (avatars.length === 0) {
        return '/assets/avatar/avatar-1.png';
    }
    
    return `${API_BASE_URL}/${avatars[0]}`;
};

const GuestDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [guest, setGuest] = useState<GuestProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [messageLoading, setMessageLoading] = useState(false);
    const castId = Number(localStorage.getItem('castId')) || null;

    useEffect(() => {
        if (id) {
            setLoading(true);
            getGuestProfileById(Number(id))
                .then((data) => {
                    setGuest(data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching guest profile:', error);
                    setLoading(false);
                });
        }
    }, [id]);

    useEffect(() => {
        if (castId && guest?.id) {
            recordGuestVisit(castId, guest.id);
        }
    }, [castId, guest?.id]);
    
    useEffect(() => {
        if (guest && castId) {
            checkLikeStatus();
        }
    }, [guest, castId]);

    const checkLikeStatus = async () => {
        if (!guest) return;
        try {
            // Only check like status if we're a cast member
            if (castId) {
                const res = await getLikeStatus(castId, guest.id);
                setLiked(res.liked);
            }
        } catch (error) {
            console.error('Error checking like status:', error);
        }
    };

    const handleLike = async () => {
        if (!guest || !castId) return;
        try {
            const res = await likeGuest(castId, guest.id);
            setLiked(res.liked);
        } catch (error) {
            console.error('Error liking guest:', error);
        }
    };

    const handleMessage = async () => {
        if (!guest || !castId) return;
        setMessageLoading(true);
        try {
            const chatRes = await createChat(castId, guest.id);
            const chatId = chatRes.chat.id;
            await sendCastMessage(chatId, castId, '👍');
            // Navigate to chat or show success message
            navigate(`/cast/${castId}/message`);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setMessageLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-primary flex items-center justify-center">
                <div className="text-white">ローディング...</div>
            </div>
        );
    }

    if (!guest) {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-primary flex items-center justify-center">
                <div className="text-white">ゲストが見つかりません</div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
            {/* Large avatar image with back button */}
            <div className="relative">
                <img 
                    src={getFirstAvatarUrl(guest.avatar)} 
                    alt="guest avatar" 
                    className="w-full h-64 object-cover" 
                />
                <button 
                    onClick={() => navigate(-1)} 
                    className="absolute top-4 left-4 bg-primary bg-opacity-70 rounded-full p-2 text-2xl shadow text-white border border-secondary"
                >
                    <ChevronLeft />
                </button>
            </div>

            {/* Badge */}
            <div className="px-4 mt-2">
                <span className="bg-secondary text-white text-xs rounded px-2 py-1 font-bold">ゲスト</span>
            </div>

            {/* Profile card */}
            <div className="flex items-center gap-3 px-4 mt-4">
                <img 
                    src={getFirstAvatarUrl(guest.avatar)} 
                    alt="guest avatar" 
                    className="w-14 h-14 rounded-full object-cover border-2 border-secondary shadow" 
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-secondary rounded-full inline-block"></span>
                        <span className="text-xs text-white">オンライン中</span>
                    </div>
                    <div className="font-bold text-base text-white">{guest.nickname || ''}</div>
                    <div className="text-xs text-white font-bold">{guest.occupation || ''}</div>
                </div>
            </div>

            {/* Action buttons - only show for cast members */}
            {/* {castId && (
                <div className="flex gap-2 px-4 mt-4">
                    <button
                        onClick={handleLike}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold ${
                            liked 
                                ? 'bg-red-500 text-white' 
                                : 'bg-primary border border-secondary text-white'
                        }`}
                    >
                        <Heart size={20} fill={liked ? 'white' : 'none'} />
                        {liked ? 'いいね済み' : 'いいね'}
                    </button>
                    <button
                        onClick={handleMessage}
                        disabled={messageLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold bg-secondary text-white"
                    >
                        <MessageSquare size={20} />
                        {messageLoading ? '送信中...' : 'メッセージ'}
                    </button>
                </div>
            )} */}

            {/* Profile details */}
            <div className="grid grid-cols-2 gap-y-2 text-sm px-4 mt-6">
                <div className="text-white">年齢：</div>
                <div className="font-bold text-white">{guest.age || ''}</div>
                <div className="text-white">身長：</div>
                <div className="font-bold text-white">{guest.height ? `${guest.height}cm` : ''}</div>
                <div className="text-white">居住地：</div>
                <div className="font-bold text-white">{guest.residence || ''}</div>
                <div className="text-white">出身地：</div>
                <div className="font-bold text-white">{guest.birthplace || ''}</div>
                <div className="text-white">学歴：</div>
                <div className="font-bold text-white">{guest.education || ''}</div>
                <div className="text-white">年収：</div>
                <div className="font-bold text-white">{guest.annual_income || ''}</div>
                <div className="text-white">お仕事：</div>
                <div className="font-bold text-white">{guest.occupation || ''}</div>
                <div className="text-white">お酒：</div>
                <div className="font-bold text-white">{guest.alcohol || ''}</div>
                <div className="text-white">タバコ：</div>
                <div className="font-bold text-white">{guest.tobacco || ''}</div>
                <div className="text-white">兄弟姉妹：</div>
                <div className="font-bold text-white">{guest.siblings || ''}</div>
                <div className="text-white">同居人：</div>
                <div className="font-bold text-white">{guest.cohabitant || ''}</div>
                <div className="text-white">好みのエリア：</div>
                <div className="font-bold text-white">{guest.favorite_area || ''}</div>
            </div>

            {/* Interests */}
            {guest.interests && guest.interests.length > 0 && (
                <div className="px-4 mt-4">
                    <div className="text-white font-bold mb-2">興味・関心</div>
                    <div className="flex flex-wrap gap-2">
                        {guest.interests.map((interest, index) => (
                            <span 
                                key={index} 
                                className="bg-secondary text-white text-xs rounded px-2 py-1"
                            >
                                {typeof interest === 'string' 
                                    ? interest 
                                    : typeof interest === 'object' && interest.category && interest.tag
                                        ? `${interest.category}: ${interest.tag}`
                                        : JSON.stringify(interest)
                                }
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuestDetail; 