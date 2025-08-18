/*eslint-disable */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, MessageSquare, User, MapPin, Briefcase, GraduationCap, DollarSign, GlassWater, Cigarette, Users, Home, Star } from 'lucide-react';
import { getGuestProfileById, GuestProfile, likeGuest, createChat, getLikeStatus, recordGuestVisit } from '../services/api';
import { useNotificationSettings } from '../contexts/NotificationSettingsContext';
import { useCast } from '../contexts/CastContext';
import Spinner from '../components/ui/Spinner';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Utility function to get the first available avatar from comma-separated string
const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
    if (!avatarString) {
        return '/assets/avatar/1.jpg';
    }
    
    // Split by comma and get the first non-empty avatar
    const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
    
    if (avatars.length === 0) {
        return '/assets/avatar/1.jpg';
    }
    
    return `${API_BASE_URL}/${avatars[0]}`;
};

const GuestDetail: React.FC = () => {
    const { id } = useParams();
    const { castId } = useCast() as any;
    const navigate = useNavigate();
    const { isNotificationEnabled } = useNotificationSettings();
    const [guest, setGuest] = useState<GuestProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [messageLoading, setMessageLoading] = useState(false);


    console.log('castId', castId);
    console.log('id', id);
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
            // Check if footprint notifications are enabled before recording visit
            const isFootprintNotificationEnabled = isNotificationEnabled('footprints');
            
            if (isFootprintNotificationEnabled) {
                recordGuestVisit(Number(castId), guest.id);
            }
        }
    }, [castId, guest?.id, isNotificationEnabled]);
    
    // Initialize liked state from localStorage to avoid reset on refresh
    useEffect(() => {
        if (castId && id) {
            const key = `guest_like_${castId}_${id}`;
            const stored = localStorage.getItem(key);
            if (stored === 'true') {
                setLiked(true);
            }
        }
    }, [castId, id]);
    
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
                const res = await getLikeStatus(Number(castId), guest.id);
                // Only update to true to avoid overriding locally persisted like state
                if (res.liked) {
                    setLiked(true);
                    const key = `guest_like_${castId}_${guest.id}`;
                    localStorage.setItem(key, 'true');
                }
            }
        } catch (error) {
            console.error('Error checking like status:', error);
        }
    };

    const handleAction = async () => {
        if (!guest || !castId) return;
        if (!liked) {
            // First click: like the guest and persist locally
            setMessageLoading(true);
            try {
                const res = await likeGuest(Number(castId), guest.id);
                const isLiked = Boolean(res?.liked ?? true);
                setLiked(isLiked);
                const key = `guest_like_${castId}_${guest.id}`;
                localStorage.setItem(key, isLiked ? 'true' : 'false');
            } catch (error) {
                console.error('Error liking guest:', error);
            } finally {
                setMessageLoading(false);
            }
        } else {
            // Second click: navigate to message detail (create/open chat)
            setMessageLoading(true);
            try {
                const chatRes = await createChat(Number(castId), guest.id);
                const chatId = chatRes.chat.id;
                navigate(`/cast/${chatId}/message`);
            } catch (error) {
                console.error('Error opening message:', error);
            } finally {
                setMessageLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-primary flex items-center justify-center">
                <Spinner />
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
                    className="w-full h-64 object-cover rounded-b-3xl shadow-lg transition-all duration-300" 
                    onError={e => (e.currentTarget.src = '/assets/avatar/1.jpg')}
                />
                <button 
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 bg-primary bg-opacity-80 rounded-full p-2 text-2xl shadow-lg text-white border border-secondary hover:bg-secondary cursor-pointer transition-colors duration-200 z-10"
                    title="戻る"
                >
                    <ChevronLeft />
                </button>
            </div>

            {/* Badge */}
            <div className="px-4 mt-2">
                <span className="bg-secondary text-white text-xs rounded px-2 py-1 font-bold shadow">ゲスト</span>
            </div>

            {/* Profile card */}
            <div className="flex items-center gap-3 px-4 mt-4 bg-primary rounded-xl shadow-lg py-4">
                <img 
                    src={getFirstAvatarUrl(guest.avatar)} 
                    alt="guest avatar" 
                    className="w-14 h-14 rounded-full object-cover border-2 border-secondary shadow" 
                    onError={e => (e.currentTarget.src = '/assets/avatar/1.jpg')}
                />
                <div className="flex-1">
                    <div className="font-bold text-base text-white">{guest.nickname || ''}</div>
                    <div className="text-xs text-white font-bold">{guest.occupation || ''}</div>
                </div>
            </div>

            {/* Single action button - only show for cast members */}
            {castId && (
                <div className="px-4 mt-4">
                    <button
                        onClick={handleAction}
                        disabled={messageLoading}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 ${
                            liked
                                ? 'bg-secondary text-white hover:bg-secondary/80 disabled:opacity-60'
                                : 'bg-primary border border-secondary text-white hover:bg-secondary hover:text-primary disabled:opacity-60'
                        }`}
                        title={liked ? 'メッセージページへ' : 'いいねする'}
                    >
                        {liked ? <MessageSquare size={20} /> : <Heart size={20} fill={'none'} />}
                        {messageLoading ? (liked ? '移動中...' : '処理中...') : liked ? 'メッセージ' : 'いいね'}
                    </button>
                </div>
            )}

            {/* Profile details */}
            <div className="px-4 mt-8">
                <div className="text-lg text-white font-bold mb-4 flex items-center gap-2"><User size={18}/>プロフィール詳細</div>
                <div className="grid grid-cols-2 gap-y-3 text-sm bg-primary rounded-xl shadow p-4">
                    <div className="flex items-center gap-2 text-white"><Star size={16}/>年齢：</div>
                    <div className="font-bold text-white">{guest.age || ''}</div>
                    <div className="flex items-center gap-2 text-white"><MapPin size={16}/>身長：</div>
                    <div className="font-bold text-white">{guest.height ? `${guest.height}cm` : ''}</div>
                    <div className="flex items-center gap-2 text-white"><Home size={16}/>居住地：</div>
                    <div className="font-bold text-white">{guest.residence || ''}</div>
                    <div className="flex items-center gap-2 text-white"><MapPin size={16}/>出身地：</div>
                    <div className="font-bold text-white">{guest.birthplace || ''}</div>
                    <div className="flex items-center gap-2 text-white"><GraduationCap size={16}/>学歴：</div>
                    <div className="font-bold text-white">{guest.education || ''}</div>
                    <div className="flex items-center gap-2 text-white"><DollarSign size={16}/>年収：</div>
                    <div className="font-bold text-white">{guest.annual_income || ''}</div>
                    <div className="flex items-center gap-2 text-white"><Briefcase size={16}/>お仕事：</div>
                    <div className="font-bold text-white">{guest.occupation || ''}</div>
                    <div className="flex items-center gap-2 text-white"><GlassWater size={16}/>お酒：</div>
                    <div className="font-bold text-white">{guest.alcohol || ''}</div>
                    <div className="flex items-center gap-2 text-white"><Cigarette size={16}/>タバコ：</div>
                    <div className="font-bold text-white">{guest.tobacco || ''}</div>
                    <div className="flex items-center gap-2 text-white"><Users size={16}/>兄弟姉妹：</div>
                    <div className="font-bold text-white">{guest.siblings || ''}</div>
                    <div className="flex items-center gap-2 text-white"><Home size={16}/>同居人：</div>
                    <div className="font-bold text-white">{guest.cohabitant || ''}</div>
                    <div className="flex items-center gap-2 text-white"><MapPin size={16}/>好みのエリア：</div>
                    <div className="font-bold text-white">{guest.favorite_area || ''}</div>
                </div>
            </div>

            {/* Interests */}
            {guest.interests && guest.interests.length > 0 && (
                <div className="px-4 mt-8">
                    <div className="text-lg text-white font-bold mb-2 flex items-center gap-2"><Star size={18}/>興味・関心</div>
                    <div className="flex flex-wrap gap-2">
                        {guest.interests.map((interest, index) => (
                            <span 
                                key={index} 
                                className="bg-secondary text-white text-xs rounded px-2 py-1 shadow"
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