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
            {/* Large avatar image with enhanced overlay and back button */}
            <div className="relative group overflow-hidden rounded-b-3xl shadow-xl">
                <img 
                    src={getFirstAvatarUrl(guest.avatar)} 
                    alt="ゲストのアバター" 
                    className="w-full h-64 object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    onError={e => (e.currentTarget.src = '/assets/avatar/1.jpg')}
                />
                {/* gradient overlay for readability */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-primary/90" />

                {/* back button */}
                <button 
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 bg-primary/70 backdrop-blur rounded-full p-2 text-2xl shadow-lg text-white border border-secondary/70 hover:bg-secondary cursor-pointer transition-colors duration-200 z-10"
                    title="戻る"
                    aria-label="戻る"
                >
                    <ChevronLeft />
                </button>

                {/* quick info overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 z-10">
                    <div className="min-w-0">
                        <div className="font-extrabold text-lg text-white drop-shadow-sm truncate">{guest.nickname || ''}</div>
                        <div className="text-xs text-white/90 font-bold truncate">{guest.occupation || ''}</div>
                    </div>
                    <div className="flex gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10">
                            <Star size={14} />{guest.age || ''}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10">
                            <MapPin size={14} />{guest.residence || ''}
                        </span>
                    </div>
                </div>
            </div>

            {/* Badge */}
            <div className="px-4 mt-2">
                <span className="inline-flex items-center gap-2 bg-secondary text-white text-xs rounded px-2 py-1 font-bold shadow">
                    <Users size={14} /> ゲスト
                </span>
            </div>

            {/* Profile card */}
            <div className="flex items-center gap-3 px-4 mt-4 bg-primary/80 backdrop-blur rounded-xl shadow-lg py-4 border border-white/5">
                <img 
                    src={getFirstAvatarUrl(guest.avatar)} 
                    alt="ゲストのアバター（小）" 
                    className="w-14 h-14 rounded-full object-cover border-2 border-secondary shadow" 
                    onError={e => (e.currentTarget.src = '/assets/avatar/1.jpg')}
                    loading="lazy"
                />
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-base text-white truncate">{guest.nickname || ''}</div>
                    <div className="text-xs text-white/90 font-bold truncate">{guest.occupation || ''}</div>
                </div>
            </div>

            {/* Single action button - only show for cast members */}
            {castId && (
                <div className="px-4 mt-4">
                    <button
                        onClick={handleAction}
                        disabled={messageLoading}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 active:scale-[0.98] ${
                            liked
                                ? 'bg-secondary text-white hover:bg-secondary/85 disabled:opacity-60'
                                : 'bg-primary border border-secondary text-white hover:bg-secondary hover:text-primary disabled:opacity-60'
                        }`}
                        title={liked ? 'メッセージページへ' : 'いいねする'}
                        aria-label={liked ? 'メッセージページへ' : 'いいねする'}
                    >
                        {liked ? <MessageSquare size={20} /> : <Heart size={20} fill={'none'} />}
                        {messageLoading ? (liked ? '移動中...' : '処理中...') : liked ? 'メッセージ' : 'いいね'}
                    </button>
                </div>
            )}

            {/* Profile details */}
            <div className="px-4 mt-8">
                <div className="text-lg text-white font-bold mb-4 flex items-center gap-2"><User size={18}/>プロフィール詳細</div>
                <div className="grid grid-cols-2 gap-y-3 text-sm bg-primary/80 backdrop-blur rounded-xl shadow p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-white/85"><Star size={16}/>年齢：</div>
                    <div className="font-bold text-white/95"><span className="inline-block rounded px-2 py-1 bg-white/5 border border-white/10">{guest.age || ''}</span></div>
                    <div className="flex items-center gap-2 text-white/85"><MapPin size={16}/>身長：</div>
                    <div className="font-bold text-white/95"><span className="inline-block rounded px-2 py-1 bg-white/5 border border-white/10">{guest.height ? `${guest.height}cm` : ''}</span></div>
                    <div className="flex items-center gap-2 text-white/85"><Home size={16}/>居住地：</div>
                    <div className="font-bold text-white/95"><span className="inline-block rounded px-2 py-1 bg-white/5 border border-white/10">{guest.residence || ''}</span></div>
                    <div className="flex items-center gap-2 text-white/85"><MapPin size={16}/>出身地：</div>
                    <div className="font-bold text-white/95"><span className="inline-block rounded px-2 py-1 bg-white/5 border border-white/10">{guest.birthplace || ''}</span></div>
                    <div className="flex items-center gap-2 text-white/85"><GraduationCap size={16}/>学歴：</div>
                    <div className="font-bold text-white/95"><span className="inline-block rounded px-2 py-1 bg-white/5 border border-white/10">{guest.education || ''}</span></div>
                    <div className="flex items-center gap-2 text-white/85"><DollarSign size={16}/>年収：</div>
                    <div className="font-bold text-white/95"><span className="inline-block rounded px-2 py-1 bg-white/5 border border-white/10">{guest.annual_income || ''}</span></div>
                    <div className="flex items-center gap-2 text-white/85"><Briefcase size={16}/>お仕事：</div>
                    <div className="font-bold text-white/95"><span className="inline-block rounded px-2 py-1 bg-white/5 border border-white/10">{guest.occupation || ''}</span></div>
                    <div className="flex items-center gap-2 text-white/85"><GlassWater size={16}/>お酒：</div>
                    <div className="font-bold text-white/95"><span className="inline-block rounded px-2 py-1 bg-white/5 border border-white/10">{guest.alcohol || ''}</span></div>
                    <div className="flex items-center gap-2 text-white/85"><Cigarette size={16}/>タバコ：</div>
                    <div className="font-bold text-white/95"><span className="inline-block rounded px-2 py-1 bg-white/5 border border-white/10">{guest.tobacco || ''}</span></div>
                    <div className="flex items-center gap-2 text-white/85"><Users size={16}/>兄弟姉妹：</div>
                    <div className="font-bold text-white/95"><span className="inline-block rounded px-2 py-1 bg-white/5 border border-white/10">{guest.siblings || ''}</span></div>
                    <div className="flex items-center gap-2 text-white/85"><Home size={16}/>同居人：</div>
                    <div className="font-bold text-white/95"><span className="inline-block rounded px-2 py-1 bg-white/5 border border-white/10">{guest.cohabitant || ''}</span></div>
                    <div className="flex items-center gap-2 text-white/85"><MapPin size={16}/>好みのエリア：</div>
                    <div className="font-bold text-white/95"><span className="inline-block rounded px-2 py-1 bg-white/5 border border-white/10">{guest.favorite_area || ''}</span></div>
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
                                className="bg-secondary text-white text-xs rounded px-2 py-1 shadow transition-transform duration-200 hover:-translate-y-0.5"
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