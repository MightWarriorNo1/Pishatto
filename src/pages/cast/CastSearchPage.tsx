/*eslint-disable */
import React, { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, SlidersHorizontal, Bell, ChevronLeft, MessageSquare, X, Users } from 'lucide-react';
import { RepeatGuest, GuestProfile } from '../../services/api';
import { 
  useRepeatGuests, 
  useGuestProfileById, 
  useLikeGuest, 
  useCreateChat, 
  useSendCastMessage, 
  useLikeStatus, 
  useRecordGuestVisit
} from '../../hooks/useQueries';
import { fetchRanking, updateRanking, checkNotificationEnabled, getAllGuests } from '../../services/api';
import CastNotificationPage from './CastNotificationPage';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useNotificationSettings } from '../../contexts/NotificationSettingsContext';
import { useCast } from '../../contexts/CastContext';
import Spinner from '../../components/ui/Spinner';
import { formatPoints } from '../../utils/formatters';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// GuestDetailPage component
type GuestDetailPageProps = { onBack: () => void; guest: RepeatGuest };

const GuestDetailPage: React.FC<GuestDetailPageProps> = ({ onBack, guest }) => {
    const { isNotificationEnabled, loading: notificationLoading } = useNotificationSettings();
    const [showEasyMessage, setShowEasyMessage] = useState(false);
    const { castId } = useCast();

    // React Query hooks
    const { data: profile, isLoading: loading } = useGuestProfileById(guest.id);
    const { data: likeStatusData } = useLikeStatus(castId || 0, guest.id);
    const likeGuestMutation = useLikeGuest();
    const createChatMutation = useCreateChat();
    const sendCastMessageMutation = useSendCastMessage();
    const recordGuestVisitMutation = useRecordGuestVisit();

    // Record visit when cast views guest profile
    const hasRecordedVisitRef = React.useRef<string | null>(null);
    useEffect(() => {
        if (!castId || !guest.id) return;

        const key = `${castId}-${guest.id}`;
        if (hasRecordedVisitRef.current === key) return; // prevent duplicate within this view

        let isMounted = true;
        (async () => {
            try {
                const { enabled } = await checkNotificationEnabled('guest', guest.id, 'footprints');
                if (!isMounted) return;
                if (enabled) {
                    hasRecordedVisitRef.current = key;
                    recordGuestVisitMutation.mutate({ castId, guestId: guest.id });
                }
            } catch (error) {
                console.error('Failed to check footprint setting or record visit:', error);
            }
        })();

        return () => { isMounted = false; };
    }, [castId, guest.id, recordGuestVisitMutation]);
    
    if (showEasyMessage) {
        return <EasyMessagePage onClose={() => setShowEasyMessage(false)} />
    }
    const handleLike = async () => {
        if (!castId) return;
        await likeGuestMutation.mutateAsync({ castId: castId as number, guestId: guest.id });
    };

    const handleMessage = async () => {
        try {
            if (!castId) return;
            const chatRes = await createChatMutation.mutateAsync({ castId: castId as number, guestId: guest.id });
            const chatId = chatRes.chat.id;
            await sendCastMessageMutation.mutateAsync({ chatId, castId: castId as number, message: '👍' });
            window.location.href = `/cast/${chatId}/message`;
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <div className="max-w-md  bg-gradient-to-b from-primary via-primary to-secondary min-h-screen pb-8 auto">
            <div className="flex items-center px-2 pt-2 pb-2">
                <button onClick={onBack} className="text-2xl text-white font-bold hover:text-secondary cursor-pointer">
                    <ChevronLeft />
                </button>
            </div>
            <div className="w-full h-48 bg-primary flex items-center justify-center border-b border-secondary">
                <img src={guest.avatar ? getFirstAvatarUrl(guest.avatar) : '/assets/avatar/1.jpg'} alt="guest_detail" className="object-contain h-full mx-auto" />
            </div>
            {/* Badge */}
            <div className="px-4 mt-2">
                <span className="inline-block bg-secondary text-white text-xs rounded px-2 py-0.5">最近入会</span>
            </div>
            {/* Profile card */}
            <div className="flex items-center px-4 py-2 mt-2 bg-primary rounded shadow border border-secondary">
                <img src={guest.avatar ? getFirstAvatarUrl(guest.avatar) : '/assets/avatar/1.jpg'} alt="guest_thumb" className="w-10 h-10 rounded mr-2 border-2 border-secondary" />
                <div>
                    <div className="font-bold text-sm text-white">{profile ? profile.nickname : guest.nickname}</div>
                    <div className="text-xs text-white">{profile ? profile.occupation : ''}</div>
                </div>
            </div>
            {/* Profile details */}
            <div className="px-4 py-2">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Spinner size="lg" />
                    </div>
                ) : profile ? (
                <table className="w-full text-sm text-white">
                    <tbody>
                        <tr><td className="py-1">身長：</td><td>{profile.height || '-'}</td></tr>
                        <tr><td className="py-1">居住地：</td><td>{profile.residence || '-'}</td></tr>
                        <tr><td className="py-1">出身地：</td><td>{profile.birthplace || '-'}</td></tr>
                        <tr><td className="py-1">学歴：</td><td>{profile.education || '-'}</td></tr>
                        <tr><td className="py-1">年収：</td><td>{profile.annual_income || '-'}</td></tr>
                        <tr><td className="py-1">お仕事：</td><td>{profile.occupation || '-'}</td></tr>
                        <tr><td className="py-1">お酒：</td><td>{profile.alcohol || '-'}</td></tr>
                        <tr><td className="py-1">タバコ：</td><td>{profile.tobacco || '-'}</td></tr>
                        <tr><td className="py-1">兄弟姉妹：</td><td>{profile.siblings || '-'}</td></tr>
                    </tbody>
                </table>
                ) : (
                  <div className="text-white">データが見つかりません</div>
                )}
            </div>
            {/* Like button */}
            <div className="px-4 py-2">
                {!likeStatusData?.liked ? (
                    <button 
                        className="w-full border border-secondary text-white rounded py-2 flex items-center justify-center font-bold hover:bg-secondary hover:text-white transition" 
                        onClick={handleLike}
                        disabled={likeGuestMutation.isPending}
                    >
                        <span className="mr-2">
                            <Heart /></span>
                        <span className="text-base">
                        </span>いいね
                    </button>
                ) : (
                    <button 
                        className="w-full border bg-secondary border-secondary text-white rounded py-2 flex items-center justify-center font-bold hover:bg-secondary hover:text-white transition" 
                        onClick={handleMessage} 
                        disabled={createChatMutation.isPending || sendCastMessageMutation.isPending}
                    >
                        <span className="mr-2">
                            <MessageSquare /></span>
                        <span className="text-base">
                        </span>メッセージ
                    </button>
                )}
            </div>
            {/* Recent post */}
            {/* <div className="px-4 pt-4">
                <div className="font-bold text-sm mb-1 text-white">最近のつぶやき</div>
                <div className="flex items-center mb-1">
                    <img src={avatarSrc} alt="guest_thumb" className="w-6 h-6 rounded mr-2 border-2 border-secondary" />
                    <span className="text-xs font-bold text-white">まこちゃん</span>
                    <span className="text-xs text-white ml-2">弁護士・22.10</span>
                    <span className="ml-auto text-white text-lg">❤ 1</span>
                </div>
                <div className="text-xs text-white">よろしくお願いします！</div>
            </div> */}
        </div>
    );
};

// Filter Modal Component
const FilterModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    filters: FilterOptions; 
    onApplyFilters: (filters: FilterOptions) => void;
}> = ({ isOpen, onClose, filters, onApplyFilters }) => {
    const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

    // Keep local state in sync when parent filters change or modal opens
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters, isOpen]);

    const handleApply = () => {
        onApplyFilters(localFilters);
        onClose();
    };

    const handleReset = () => {
        const defaultFilters: FilterOptions = {
            residence: '全国',
            ageRange: { min: 18, max: 80 },
            heightRange: { min: 150, max: 200 },
            education: '',
            annualIncome: '',
            occupation: '',
            alcohol: '',
            tobacco: ''
        };
        setLocalFilters(defaultFilters);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-primary border border-secondary rounded-lg p-6 w-80 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">フィルター</h2>
                    <button onClick={onClose} className="text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Residence Filter */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">居住地</label>
                    <select
                        value={localFilters.residence}
                        onChange={(e) => setLocalFilters({...localFilters, residence: e.target.value})}
                        className="w-full bg-primary border border-secondary rounded px-3 py-2 text-white"
                    >
                        <option value="全国">全国</option>
                        <option value="北海道">北海道</option>
                        <option value="東京都">東京都</option>
                        <option value="大阪府">大阪府</option>
                        <option value="愛知県">愛知県</option>
                        <option value="福岡県">福岡県</option>
                    </select>
                </div>

                {/* Age Range Filter */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">年齢範囲</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            value={localFilters.ageRange.min}
                            onChange={(e) => setLocalFilters({
                                ...localFilters, 
                                ageRange: {...localFilters.ageRange, min: parseInt(e.target.value) || 18}
                            })}
                            className="w-20 bg-primary border border-secondary rounded px-2 py-1 text-white text-center"
                            min="18"
                            max="80"
                        />
                        <span className="text-white">〜</span>
                        <input
                            type="number"
                            value={localFilters.ageRange.max}
                            onChange={(e) => setLocalFilters({
                                ...localFilters, 
                                ageRange: {...localFilters.ageRange, max: parseInt(e.target.value) || 80}
                            })}
                            className="w-20 bg-primary border border-secondary rounded px-2 py-1 text-white text-center"
                            min="18"
                            max="80"
                        />
                        <span className="text-white text-sm">歳</span>
                    </div>
                </div>

                {/* Height Range Filter */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">身長範囲</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            value={localFilters.heightRange?.min || 150}
                            onChange={(e) => setLocalFilters({
                                ...localFilters, 
                                heightRange: {...(localFilters.heightRange || { min: 150, max: 200 }), min: parseInt(e.target.value) || 150}
                            })}
                            className="w-20 bg-primary border border-secondary rounded px-2 py-1 text-white text-center"
                            min="140"
                            max="200"
                        />
                        <span className="text-white">〜</span>
                        <input
                            type="number"
                            value={localFilters.heightRange?.max || 200}
                            onChange={(e) => setLocalFilters({
                                ...localFilters, 
                                heightRange: {...(localFilters.heightRange || { min: 150, max: 200 }), max: parseInt(e.target.value) || 200}
                            })}
                            className="w-20 bg-primary border border-secondary rounded px-2 py-1 text-white text-center"
                            min="140"
                            max="200"
                        />
                        <span className="text-white text-sm">cm</span>
                    </div>
                </div>

                {/* Education Filter */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">学歴</label>
                    <input
                        type="text"
                        value={localFilters.education || ''}
                        onChange={(e) => setLocalFilters({...localFilters, education: e.target.value})}
                        placeholder="例: 大卒"
                        className="w-full bg-primary border border-secondary rounded px-3 py-2 text-white placeholder-gray-400"
                    />
                </div>

                {/* Annual Income Filter */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">年収</label>
                    <select
                        value={localFilters.annualIncome || ''}
                        onChange={(e) => setLocalFilters({...localFilters, annualIncome: e.target.value})}
                        className="w-full bg-primary border border-secondary rounded px-3 py-2 text-white"
                    >
                        <option value="">すべて</option>
                        <option value="300万円未満">300万円未満</option>
                        <option value="300～500万円">300～500万円</option>
                        <option value="500～700万円">500～700万円</option>
                        <option value="700～1000万円">700～1000万円</option>
                        <option value="1000万円以上">1000万円以上</option>
                    </select>
                </div>

                {/* Occupation Filter */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">お仕事</label>
                    <input
                        type="text"
                        value={localFilters.occupation || ''}
                        onChange={(e) => setLocalFilters({...localFilters, occupation: e.target.value})}
                        placeholder="例: 会社員"
                        className="w-full bg-primary border border-secondary rounded px-3 py-2 text-white placeholder-gray-400"
                    />
                </div>

                {/* Alcohol Filter */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">お酒</label>
                    <select
                        value={localFilters.alcohol || ''}
                        onChange={(e) => setLocalFilters({...localFilters, alcohol: e.target.value as any})}
                        className="w-full bg-primary border border-secondary rounded px-3 py-2 text-white"
                    >
                        <option value="">すべて</option>
                        <option value="never">飲まない</option>
                        <option value="sometimes">時々飲む</option>
                        <option value="often">よく飲む</option>
                    </select>
                </div>

                {/* Tobacco Filter */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">タバコ</label>
                    <select
                        value={localFilters.tobacco || ''}
                        onChange={(e) => setLocalFilters({...localFilters, tobacco: e.target.value as any})}
                        className="w-full bg-primary border border-secondary rounded px-3 py-2 text-white"
                    >
                        <option value="">すべて</option>
                        <option value="never">吸わない</option>
                        <option value="sometimes">時々吸う</option>
                        <option value="often">よく吸う</option>
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                    <button
                        onClick={handleReset}
                        className="flex-1 bg-primary border border-secondary text-white rounded py-2 font-medium"
                    >
                        リセット
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 bg-secondary text-white rounded py-2 font-medium"
                    >
                        適用
                    </button>
                </div>
            </div>
        </div>
    );
};

// Filter Options Type
interface FilterOptions {
    residence: string;
    ageRange: { min: number; max: number };
    heightRange?: { min: number; max: number };
    education?: string;
    annualIncome?: string;
    occupation?: string;
    alcohol?: 'never' | 'sometimes' | 'often' | '';
    tobacco?: 'never' | 'sometimes' | 'often' | '';
}

// Ranking Data Type
interface RankingItem {
    id: number;
    rank: number;
    name: string;
    nickname?: string;
    age: number | null;
    avatar: string;
    points: number;
    region?: string;
}

import { getFirstAvatarUrl } from '../../utils/avatar';

// RankingPage component (updated with filters)
type RankingPageProps = {
    onBack: () => void;
    initialMainTab?: 'cast' | 'guest';
    initialRegion?: string;
    initialCategory?: 'gift' | 'reservation';
    initialTimePeriod?: 'current' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'allTime';
};

const RankingPage: React.FC<RankingPageProps> = ({ onBack, initialMainTab, initialRegion, initialCategory, initialTimePeriod }) => {
    const navigate = useNavigate();
    const [mainTab, setMainTab] = useState<'cast' | 'guest'>(initialMainTab || 'guest');
    const [region, setRegion] = useState(initialRegion || '全国');
    const [category, setCategory] = useState(
        initialCategory === 'reservation' ? '予約' : 'ギフト'
    );
    const [dateTab, setDateTab] = useState(
        initialTimePeriod === 'current' ? '今月' :
        initialTimePeriod === 'yesterday' ? '昨日' :
        initialTimePeriod === 'lastWeek' ? '先週' :
        initialTimePeriod === 'lastMonth' ? '先月' : '全期間'
    );
    const [loading, setLoading] = useState(false);

    const categories = ['ギフト', '予約'];
    const dateTabs = ['今月', '昨日', '先週', '先月', '全期間'];

    // Map frontend category names to backend
    const getBackendCategory = (frontendCategory: string) => {
        if (frontendCategory === 'ギフト') return 'gift';
        if (frontendCategory === '予約') return 'reservation';
        return 'gift';
    };

    // Map frontend date tabs to backend time periods
    const getBackendTimePeriod = (frontendDateTab: string) => {
        const mapping: Record<string, string> = {
            '今月': 'current',
            '昨日': 'yesterday',
            '先週': 'lastWeek',
            '先月': 'lastMonth',
            '全期間': 'allTime'
        };
        return mapping[frontendDateTab] || 'current';
    };

    // Handle navigation to detail page
    const handleUserClick = (user: RankingItem) => {
        if (mainTab === 'cast') {
            navigate(`/cast/${user.id}`);
        } else {
            navigate(`/guest/${user.id}`);
        }
    };

    // Use React Query for ranking data
    const { data: rankingResponse, isLoading: rankingLoading } = useQuery({
        queryKey: ['ranking', mainTab, region, category, dateTab],
        queryFn: async () => {
            const backendCategory = getBackendCategory(category);
            const backendTimePeriod = getBackendTimePeriod(dateTab);
            
            const response = await fetchRanking({
                userType: mainTab,
                timePeriod: backendTimePeriod,
                category: backendCategory,
                area: region
            });
            return response;
        },
        enabled: !!mainTab && !!region && !!category && !!dateTab,
    });

    // Transform ranking data
    const rankingData = React.useMemo(() => {
        if (!rankingResponse?.data) return [];
        
        const transformedData: RankingItem[] = rankingResponse.data.map((item: any, index: number) => ({
            id: item.id || item.user_id || index + 1,
            rank: index + 1,
            name: item.name || item.nickname || 'Unknown',
            nickname: item.nickname,
            age: item.age || null,
            avatar: item.avatar || '',
            points: item.points || 0,
            region: item.region || region
        }));

        // Recompute ranks after filtering so the list always starts from 1
        return transformedData.map((item, index) => ({
            ...item,
            rank: index + 1,
        }));
    }, [rankingResponse, region]);

    // Persist latest search results to localStorage to show on main page later
    useEffect(() => {
        if (!rankingData || rankingData.length === 0) return;
        try {
            const simplified = rankingData.map((item) => ({
                id: item.id,
                name: item.name,
                nickname: item.nickname,
                age: item.age,
                avatar: item.avatar,
                region: item.region,
                userType: mainTab,
            }));
            localStorage.setItem('lastSearchResults', JSON.stringify(simplified));
        } catch (e) {
            // ignore persistence errors
        }
    }, [rankingData, mainTab]);

    // React Query handles data fetching automatically

    return (
        <div className="max-w-md pb-28 bg-gradient-to-b from-primary via-primary to-secondary min-h-screen">
            {/* Header */}
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-secondary">
                <button onClick={onBack} className="text-2xl text-white font-bold hover:text-secondary cursor-pointer">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold text-white">ランキング</span>
            </div>

            {/* Main Tabs */}
            <div className="flex items-center space-x-2 px-4 py-3">
                <button onClick={() => setMainTab('cast')} className={`px-4 py-2 rounded-lg font-bold ${mainTab === 'cast' ? 'bg-secondary text-white' : 'bg-primary text-white border border-secondary'}`}>キャスト</button>
                <button onClick={() => setMainTab('guest')} className={`px-4 py-2 rounded-lg font-bold ${mainTab === 'guest' ? 'bg-secondary text-white' : 'bg-primary text-white border border-secondary'}`}>ゲスト</button>
                <div className="flex-1" />
                <div className="relative">
                    <select
                        className="flex items-center border border-secondary rounded px-3 py-1 text-white bg-primary"
                        value={region}
                        onChange={e => setRegion(e.target.value)}
                    >
                        <option value="全国">全国</option>
                        <option value="北海道">北海道</option>
                        <option value="東京都">東京都</option>
                        <option value="大阪府">大阪府</option>
                        <option value="愛知県">愛知県</option>
                        <option value="福岡県">福岡県</option>
                    </select>
                </div>
            </div>

            {/* Category Buttons */}
            <div className="flex space-x-2 px-4 pb-2">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-1 rounded-lg font-bold border border-secondary ${category === cat ? 'bg-secondary text-white' : 'bg-primary text-white'}`}>{cat}</button>
                ))}
            </div>

            {/* Date Tabs */}
            <div className="px-4 mt-4 mx-auto w-full">
                <div className='flex text-sm w-full'>
                    {dateTabs.map(tab => (
                        <button key={tab} onClick={() => setDateTab(tab)} className={`${dateTab === tab ? 'flex-1 py-2 text-white border-b border-secondary' : 'flex-1 py-2 text-white'}`}>{tab}</button>
                    ))}
                </div>
            </div>

            {/* Ranking List */}
            <div className="pt-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Spinner />
                    </div>
                ) : rankingData.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-white">該当するランキングデータがありません</div>
                    </div>
                ) : (
                    rankingData.map((user, idx) => (
                        user.rank === 1 ? (
                            <div key={user.id} className="flex flex-col items-center px-4 py-4">
                                <div className="flex items-center mb-2 w-full">
                                    <div className="w-6 h-6 bg-secondary text-white flex items-center justify-center rounded font-bold mr-2">{user.rank}</div>
                                    <div className="text-xs text-white ml-auto">{formatPoints(user.points)}</div>
                                </div>
                                <div className="flex flex-col items-center w-full">
                                    <div className="w-28 h-28 rounded-full border-4 border-secondary overflow-hidden mb-2 cursor-pointer" onClick={() => handleUserClick(user)}>
                                        <img src={getFirstAvatarUrl(user.avatar, '/assets/avatar/1.jpg')} alt={user.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-lg font-bold text-white">{user.name}{user.age && `　${user.age}歳`}</div>
                                    {user.region && user.region !== '全国' && (
                                        <div className="text-sm text-white opacity-70">{user.region}</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div key={user.id} className="flex items-center px-4 py-2 border-b border-secondary">
                                <div className={`flex items-center justify-center w-8 h-8 text-lg font-bold ${user.rank === 2 ? 'text-white bg-primary border border-secondary rounded' : user.rank === 3 ? 'text-white bg-primary border border-secondary rounded' : 'text-white bg-primary border border-secondary rounded'}`}>{user.rank}</div>
                                <div className="mx-4">
                                    <img 
                                        src={getFirstAvatarUrl(user.avatar, '/assets/avatar/1.jpg')} 
                                        alt={user.name} 
                                        className="w-16 h-16 rounded-full border-4 border-transparent cursor-pointer"
                                        onClick={() => handleUserClick(user)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="text-base font-bold text-white">{user.name}{user.age && `　${user.age}歳`}</div>
                                    {user.region && user.region !== '全国' && (
                                        <div className="text-sm text-white opacity-70">{user.region}</div>
                                    )}
                                </div>
                                {/* <div className="text-sm text-white">{formatPoints(user.points)}</div> */}
                            </div>
                        )
                    ))
                )}
            </div>
        </div>
    );
};

// Add EasyMessagePage component
const EasyMessagePage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="max-w-md mx-auto bg-gradient-to-b from-primary via-primary to-secondary min-h-screen pb-8 relative">
            {/* Header with close button */}
            <div className="flex items-center px-4 pt-4 pb-2">
                <button onClick={onClose} className="text-2xl text-white font-bold">×</button>
                <div className="flex-1 text-center text-lg font-bold -ml-8 text-white">らくらくメッセ</div>
                <div style={{ width: 32 }} /> {/* Spacer for symmetry */}
            </div>
            {/* Description */}
            <div className="px-4 text-sm text-white mb-4">
                らくらくメッセを使うと、おすすめのゲスト25~30人にメッセージが送れるよ♪簡単にアポゲット！
            </div>
            {/* Region select */}
            <div className="px-4 mb-2">
                <div className="flex items-center justify-between">
                    <span className="text-base font-bold mr-2 text-white">地域を選択</span>
                    <button className="border border-secondary rounded px-4 py-2 text-base font-bold flex items-center text-white bg-primary">
                        全国 <span className="ml-2">▼</span>
                    </button>
                </div>
                <div className="text-xs text-white mt-1">*地域を選択すると、その地域をよく利用するゲストに送信されます。</div>
            </div>
            {/* Message textarea */}
            <div className="px-4 mb-8">
                <textarea
                    className="w-full h-28 border border-secondary rounded bg-primary p-3 text-base resize-none focus:outline-none text-white"
                    placeholder="ここにメッセージを入力..."
                />
            </div>
            {/* Nickname note */}
            <div className="px-4 text-xs text-white mb-2">
                文中に“%”と入力すると、ゲストのニックネームが表示されます。 例）“%さん” → 「ゲストの名前」さん
            </div>
            {/* Checkbox for history */}
            <div className="px-4 flex items-center mb-8">
                <input type="checkbox" id="saveHistory" className="mr-2 w-4 h-4" />
                <label htmlFor="saveHistory" className="text-xs text-white">チェックを入れると次回以降、履歴として保存します</label>
            </div>
            <div className="px-4 text-xs text-white mb-8">※ 履歴として保存できるのは最大6個までとなります。</div>
            {/* No history message */}
            <div className="px-4 text-center text-white mb-8">履歴がまだありません。</div>
            {/* Send button */}
            <div className="px-4 mb-2">
                <button className="w-full bg-secondary text-white rounded py-3 font-bold text-base hover:bg-red-700 transition" disabled>
                    メッセージを送信する
                </button>
            </div>
            {/* Note about sending time */}
            <div className="px-4 text-xs text-white text-center">
                メッセージの送信に10秒ほどかかる場合があります
            </div>
        </div>
    );
};

// Modal to show all repeat guests
type RepeatGuestsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    guests: RepeatGuest[];
    onSelectGuest: (guest: RepeatGuest) => void;
};

const RepeatGuestsModal: React.FC<RepeatGuestsModalProps> = ({ isOpen, onClose, guests, onSelectGuest }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-primary via-primary to-secondary border-2 border-secondary rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Enhanced Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b-2 border-secondary bg-gradient-to-r from-primary to-secondary">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                                <Users size={20} />
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-white">リピートゲスト一覧</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>

                {/* Guest Count Badge */}
                <div className="px-6 py-3 bg-white/5 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">総ゲスト数</span>
                        <span className="bg-secondary text-white text-sm font-bold px-3 py-1 rounded-full">
                            {guests.length}人
                        </span>
                    </div>
                </div>

                {/* Enhanced Guest Grid */}
                <div className="p-6 overflow-y-auto scrollbar-hidden max-h-[60vh]">
                    {guests.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">😔</span>
                            </div>
                            <div className="text-white text-lg font-medium mb-2">該当ゲストなし</div>
                            <div className="text-gray-300 text-sm">現在リピートしそうなゲストはいません</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {guests.map((guest, index) => (
                                <div
                                    key={guest.id}
                                    className="group bg-gradient-to-br from-white/10 to-white/5 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20 hover:border-secondary/50 overflow-hidden"
                                    onClick={() => onSelectGuest(guest)}
                                >
                                    {/* Guest Avatar with Hover Effect */}
                                    <div className="relative overflow-hidden">
                                        <div className="w-full h-28 bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                                            <img
                                                src={guest.avatar ? getFirstAvatarUrl(guest.avatar) : '/assets/avatar/1.jpg'}
                                                alt={guest.nickname}
                                                className="w-20 h-20 object-cover rounded-full border-3 border-white/30 group-hover:border-secondary/50 transition-all duration-300 group-hover:scale-110"
                                            />
                                        </div>
                                        {/* Reservation Count Badge */}
                                        <div className="absolute top-2 right-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                            {guest.reservations_count}回
                                        </div>
                                    </div>

                                    {/* Guest Info */}
                                    <div className="p-3 space-y-2">
                                        <div className="text-center">
                                            <div className="text-sm font-bold text-white truncate">
                                                {guest.nickname}
                                            </div>
                                            {guest.birth_year && (
                                                <div className="text-xs text-gray-300">
                                                    {new Date().getFullYear() - guest.birth_year}歳
                                                </div>
                                            )}
                                        </div>
                                        
                                        {guest.residence && (
                                            <div className="flex items-center justify-center space-x-1">
                                                <span className="text-[10px] text-gray-400">📍</span>
                                                <span className="text-[10px] text-gray-300 truncate">
                                                    {guest.residence}
                                                </span>
                                            </div>
                                        )}

                                        {/* Hover Action Indicator */}
                                        <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="text-xs text-secondary font-medium">
                                                タップして詳細表示 →
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Enhanced Footer */}
                <div className="px-6 py-4 bg-white/5 border-t border-white/10">
                    <div className="text-center">
                        <div className="text-xs text-gray-400 mb-2">
                            リピート率の高いゲストを優先表示
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CastSearchPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const { isNotificationEnabled } = useNotificationSettings();
    const [messageLoading, setMessageLoading] = useState<number | null>(null);
    const [rankingLoading, setRankingLoading] = useState(false);
    const [showNotification, setShowNotification]=useState(false);
    const [showEasyMessage, setShowEasyMessage] = useState(false);
    const [showRanking, setShowRanking] = useState(false);
    const [showGuestDetail, setShowGuestDetail] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<RepeatGuest | null>(null);
    const [showAllRepeatGuests, setShowAllRepeatGuests] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
        residence: '全国',
        ageRange: { min: 18, max: 80 },
        heightRange: { min: 150, max: 200 },
        education: '',
        annualIncome: '',
        occupation: '',
        alcohol: '',
        tobacco: ''
    });
    const [filterLoading, setFilterLoading] = useState(false);
    const [rankingInit, setRankingInit] = useState<{
        initialMainTab?: 'cast' | 'guest';
        initialRegion?: string;
        initialCategory?: 'gift' | 'reservation';
        initialTimePeriod?: 'current' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'allTime';
    } | null>(null);
    const [lastSearchDisplayResults, setLastSearchDisplayResults] = useState<DisplayUser[]>([]);

    // React Query hooks
    const { data: repeatGuests = [], isLoading: loading } = useRepeatGuests();

    // Derived list based on current filters (not used for main filtering anymore, but kept for repeat guests section)
    const filteredRepeatGuests = useMemo(() => {
        return repeatGuests.filter((guest) => {
            // Residence filter
            const residenceOk =
                !filters.residence || filters.residence === '全国'
                    ? true
                    : (guest.residence || '').includes(filters.residence);

            // Age filter
            const currentYear = new Date().getFullYear();
            const guestAge = guest.birth_year ? currentYear - guest.birth_year : null;
            const ageOk = guestAge === null
                ? true
                : guestAge >= filters.ageRange.min && guestAge <= filters.ageRange.max;

            return residenceOk && ageOk;
        });
    }, [repeatGuests, filters]);

    const handleApplyFilters = async (newFilters: FilterOptions) => {
        setFilters(newFilters);
        setFilterLoading(true);
        try {
            // Prepare filter parameters for API call
            const filterParams: any = {};
            
            if (newFilters.residence && newFilters.residence !== '全国') {
                filterParams.residence = newFilters.residence;
            }
            
            if (newFilters.ageRange) {
                filterParams.min_age = newFilters.ageRange.min;
                filterParams.max_age = newFilters.ageRange.max;
            }
            
            if (newFilters.heightRange) {
                filterParams.height_min = newFilters.heightRange.min;
                filterParams.height_max = newFilters.heightRange.max;
            }
            
            if (newFilters.education) {
                filterParams.education = newFilters.education;
            }
            
            if (newFilters.annualIncome) {
                filterParams.annual_income = newFilters.annualIncome;
            }
            
            if (newFilters.occupation) {
                filterParams.occupation = newFilters.occupation;
            }
            
            if (newFilters.alcohol) {
                filterParams.alcohol = newFilters.alcohol;
            }
            
            if (newFilters.tobacco) {
                filterParams.tobacco = newFilters.tobacco;
            }

            // Fetch guests with filters
            const guests = await getAllGuests(filterParams);
            
            // Store in localStorage for persistence
            const simplified = guests.map((guest: any) => ({
                id: guest.id,
                name: guest.nickname,
                nickname: guest.nickname,
                age: guest.birth_year ? new Date().getFullYear() - guest.birth_year : null,
                avatar: guest.avatar ?? null,
                region: guest.residence,
                userType: 'guest',
            }));

            localStorage.setItem('lastFilterResults', JSON.stringify(simplified));

            // Map to display format
            const displayMapped: DisplayUser[] = simplified.map((item: any) => {
                const avatarValue = (!item.avatar || (typeof item.avatar === 'string' && !item.avatar.trim())) 
                    ? null 
                    : item.avatar;
                return {
                    id: item.id,
                    avatar: getFirstAvatarUrl(avatarValue, '/assets/avatar/1.jpg'),
                    displayName: item.nickname || item.name || 'Unknown',
                    age: item.age ?? null,
                    region: item.region,
                    userType: 'guest',
                };
            });
            setLastSearchDisplayResults(displayMapped);
        } catch (e) {
            console.error('Failed to fetch filter results:', e);
            setLastSearchDisplayResults([]);
        } finally {
            setFilterLoading(false);
        }
    };

    // Load all guests on initial page load
    useEffect(() => {
        const loadAllGuests = async () => {
            setFilterLoading(true);
            try {
                // Fetch all guests without any filters
                const guests = await getAllGuests();
                
                // Map to simplified format
                const simplified = guests.map((guest: any) => ({
                    id: guest.id,
                    name: guest.nickname,
                    nickname: guest.nickname,
                    age: guest.birth_year ? new Date().getFullYear() - guest.birth_year : null,
                    avatar: guest.avatar ?? null,
                    region: guest.residence,
                    userType: 'guest',
                }));

                // Map to display format
                const displayMapped: DisplayUser[] = simplified.map((item: any) => {
                    const avatarValue = (!item.avatar || (typeof item.avatar === 'string' && !item.avatar.trim())) 
                        ? null 
                        : item.avatar;
                    return {
                        id: item.id,
                        avatar: getFirstAvatarUrl(avatarValue, '/assets/avatar/1.jpg'),
                        displayName: item.nickname || item.name || 'Unknown',
                        age: item.age ?? null,
                        region: item.region,
                        userType: 'guest',
                    };
                });
                setLastSearchDisplayResults(displayMapped);
            } catch (e) {
                console.error('Failed to load all guests:', e);
                setLastSearchDisplayResults([]);
            } finally {
                setFilterLoading(false);
            }
        };

        loadAllGuests();
    }, []);

    // Normalize items for rendering in Previous Results section
    type DisplayUser = { id: number; avatar: string; displayName: string; age?: number | null; region?: string; userType?: 'cast' | 'guest' };
    const filteredRepeatGuestsForDisplay: DisplayUser[] = useMemo(() => {
        return filteredRepeatGuests.map((g) => ({
            id: g.id,
            avatar: g.avatar ? getFirstAvatarUrl(g.avatar) : '/assets/avatar/1.jpg',
            displayName: g.nickname,
            age: g.birth_year ? new Date().getFullYear() - g.birth_year : null,
            region: g.residence,
        }));
    }, [filteredRepeatGuests]);
    if (showGuestDetail && selectedGuest) {
        return <GuestDetailPage onBack={() => setShowGuestDetail(false)} guest={selectedGuest} />;
    }
    if (showRanking) {
        return <RankingPage onBack={() => setShowRanking(false)} {...(rankingInit || {})} />;
    }
    if (showEasyMessage) {
        return <EasyMessagePage onClose={() => setShowEasyMessage(false)} />;
    }
    if (showNotification) {
        return <CastNotificationPage   onBack={() => setShowNotification(false)} />;
    }
    return (
        <div className="flex-1 max-w-md min-h-screen pb-32 bg-gradient-to-b from-primary via-primary to-secondary overflow-y-auto">
            {/* Top bar with filter and crown */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="text-white hover:text-secondary transition-colors cursor-pointer" onClick={() => setShowNotification(true)}>
                    <Bell />
                </span>
                <button className="flex items-center bg-secondary text-white rounded-full px-4 py-1 font-bold text-base" onClick={() => setShowFilterModal(true)}><span className="mr-2">
                    <SlidersHorizontal /></span>絞り込む</button>
                <span className="text-2xl text-white cursor-pointer" onClick={() => setShowRanking(true)}>
                    <img src="/assets/icons/crown.png" alt='crown' />
                </span>
            </div>

            {/* Active Filters Display */}
            {(filters.residence !== '全国' || filters.ageRange.min !== 18 || filters.ageRange.max !== 80 || 
              filters.education || filters.annualIncome || filters.occupation || filters.alcohol || filters.tobacco) && (
                <div className="px-4 py-2 bg-secondary bg-opacity-20 border-b border-secondary">
                    <div className="text-xs text-white">
                        フィルター適用中:
                        {filters.residence !== '全国' && ` 居住地: ${filters.residence}`}
                        {(filters.ageRange.min !== 18 || filters.ageRange.max !== 80) && ` 年齢: ${filters.ageRange.min}-${filters.ageRange.max}歳`}
                        {filters.education && ` 学歴: ${filters.education}`}
                        {filters.annualIncome && ` 年収: ${filters.annualIncome}`}
                        {filters.occupation && ` 職業: ${filters.occupation}`}
                    </div>
                </div>
            )}
            {/* Repeat guests */}
            <div className="px-4 pt-2 pb-1 flex items-center justify-between">
                <span className="text-base font-bold text-white">あなたにリピートしそうなゲスト</span>
                <button className="text-xs text-white font-bold" onClick={() => setShowAllRepeatGuests(true)}>すべて見る &gt;</button>
            </div>
            <div className="gap-3 px-4 pb-4 max-w-md mx-auto overflow-x-auto flex flex-row items-center">
                {loading ? (
                    <div className="flex justify-center items-center w-full">
                        <Spinner />
                    </div>
                ) : repeatGuests.length === 0 ? (
                  <div className="text-white w-full text-center">該当ゲストなし</div>
                ) : repeatGuests.map((guest) => (
                    <div
                        key={guest.id}
                        className="bg-primary rounded-lg shadow relative cursor-pointer transition-transform hover:scale-105 border border-secondary flex flex-col items-center p-3"
                        onClick={() => navigate(`/guest/${guest.id}`)}
                    >
                        <div className="w-20 h-20 mb-2 relative">
                            <img
                                src={guest.avatar ? getFirstAvatarUrl(guest.avatar) : '/assets/avatar/1.jpg'}
                                alt={guest.nickname}
                                className="w-full h-full object-cover rounded-lg border-2 border-secondary"
                            />
                        </div>
                        <div className="text-xs text-white font-bold truncate w-full text-center">
                            {guest.nickname}
                            {guest.birth_year ? `（${new Date().getFullYear() - guest.birth_year}歳）` : ''}
                        </div>
                        {guest.residence && (
                            <div className="text-[10px] text-white opacity-80 truncate w-full text-center">{guest.residence}</div>
                        )}
                        <div className="text-xs text-white mt-1">{guest.reservations_count}回利用</div>
                    </div>
                ))}
            </div>
            {/* Previous filter results */}
            <div className="px-4 pt-2 pb-1 flex items-center justify-between">
                <span className="text-base font-bold text-white">絞り込み結果</span>
                <span className="text-sm text-gray-300">{lastSearchDisplayResults.length}件</span>
            </div>
            <div className="grid grid-cols-2 gap-4 px-4 pb-24">
                {filterLoading ? (
                    <div className="col-span-2 flex items-center justify-center py-8">
                        <Spinner />
                    </div>
                ) : lastSearchDisplayResults.length > 0 ? (
                    lastSearchDisplayResults.map((guest) => (
                        <div
                            key={guest.id}
                            className="group relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border border-white/20 hover:border-secondary/50 overflow-hidden"
                            onClick={() => navigate(guest.userType === 'cast' ? `/cast/${guest.id}` : `/guest/${guest.id}`)}
                        >
                            {/* Avatar with gradient overlay */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={guest.avatar || '/assets/avatar/1.jpg'}
                                    alt={guest.displayName}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    onError={(e) => {
                                        e.currentTarget.src = '/assets/avatar/1.jpg';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-60" />
                            </div>
                            
                            {/* Info section */}
                            <div className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold text-white truncate flex-1">
                                        {guest.displayName}
                                    </h3>
                                    {guest.age && (
                                        <span className="ml-2 bg-secondary/80 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            {guest.age}歳
                                        </span>
                                    )}
                                </div>
                                
                                {guest.region && (
                                    <div className="flex items-center text-xs text-gray-300">
                                        <span className="mr-1">📍</span>
                                        <span className="truncate">{guest.region}</span>
                                    </div>
                                )}
                                
                                {/* Hover indicator */}
                                {/* <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="bg-secondary text-white text-xs px-3 py-1 rounded-full">
                                        詳細を見る →
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-8">
                        <div className="text-white text-sm">絞り込みを実行すると結果がここに表示されます</div>
                    </div>
                )}
            </div>
            {/* Floating yellow button */}
            {/* <button
                className="fixed left-1/2 -translate-x-1/2 bottom-20 z-30 bg-secondary text-white rounded-full px-8 py-4 shadow-lg font-bold text-lg flex items-center hover:bg-red-700 transition"
                onClick={() => setShowEasyMessage(true)}
            >
                <span className="mr-2">
                    <MessageCircleQuestionMark /></span>らくらく
            </button> */}

            {/* All Repeat Guests Modal */}
            <RepeatGuestsModal
                isOpen={showAllRepeatGuests}
                onClose={() => setShowAllRepeatGuests(false)}
                guests={repeatGuests}
                onSelectGuest={(guest) => {
                    navigate(`/guest/${guest.id}`);
                    setShowAllRepeatGuests(false);
                }}
            />

            {/* Filter Modal */}
            <FilterModal
                isOpen={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                filters={filters}
                onApplyFilters={handleApplyFilters}
            />
        </div>
    );
};

export default CastSearchPage; 