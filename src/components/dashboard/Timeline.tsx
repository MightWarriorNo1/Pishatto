/*eslint-disable */
import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import PostCreatePage from './PostCreatePage';
import NotificationScreen from './NotificationScreen';
import { Bell, Plus, SlidersHorizontal, Heart, Trash2 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useNotificationSettings } from '../../contexts/NotificationSettingsContext';
import { useTweets } from '../../hooks/useRealtime';
import { useCast } from '../../contexts/CastContext';
import { useAllTweets, useUserTweets, useTweetLikeStatus, useCreateTweet, useLikeTweet, useDeleteTweet } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/react-query';
import Spinner from '../ui/Spinner';

const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const IMAGE_BASE_URL = APP_BASE_URL.replace(/\/api$/, '');

// TweetLikeButton component for handling likes with React Query
const TweetLikeButton: React.FC<{
    tweetId: number;
    userId?: number;
    isNotificationEnabled: boolean;
    onLike: (tweetId: number) => void;
}> = ({ tweetId, userId, isNotificationEnabled, onLike }) => {
    const { data: likeData } = useTweetLikeStatus(tweetId, userId);
    const liked = likeData?.liked || false;
    const count = likeData?.count || 0;

    return (
        <div className="flex items-center mt-2">
            <button
                className={`mr-2 text-lg ${
                    !isNotificationEnabled 
                        ? 'text-gray-500 cursor-not-allowed' 
                        : liked 
                            ? 'text-red-500' 
                            : 'text-gray-400'
                }`}
                onClick={() => onLike(tweetId)}
                disabled={!isNotificationEnabled}
            >
                <Heart fill={
                    !isNotificationEnabled 
                        ? 'gray' 
                        : liked 
                            ? 'red' 
                            : 'white'
                } />
            </button>
            <span className="text-white text-sm">{count}</span>
        </div>
    );
};

const Timeline: React.FC = () => {
    const { user } = useUser();
    const { isNotificationEnabled } = useNotificationSettings();
    const navigate = useNavigate();
    const [showPostCreate, setShowPostCreate] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const { castId } = useCast() as any;
    const [tab, setTab] = useState<'all' | 'guest'>('all');
    const queryClient = useQueryClient();
    
    // Local state for tweets to prevent reloads
    const [localTweets, setLocalTweets] = useState<any[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [hasData, setHasData] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // React Query hooks - only fetch on initial load and when visible
    const { data: allTweets = [], isLoading: allTweetsLoading, error: allTweetsError } = useAllTweets({ 
        refetchOnMount: false 
    });
    const { data: userTweets = [], isLoading: userTweetsLoading, error: userTweetsError } = useUserTweets(
        user ? 'guest' : 'cast',
        user ? user.id : (castId || 0),
        { refetchOnMount: false }
    );

    // Set visibility when component mounts/unmounts
    useEffect(() => {
        setIsVisible(true);
        return () => setIsVisible(false);
    }, []);

    // Initialize local tweets when data is first loaded
    useEffect(() => {
        if (isInitialLoad && (allTweets.length > 0 || userTweets.length > 0)) {
            const initialTweets = tab === 'guest'      
                ? allTweets.filter((tweet: any) => tweet.guest && !tweet.cast) // Show only guest tweets
                : allTweets; // Show all tweets
            setLocalTweets(initialTweets);
            setIsInitialLoad(false);
            setHasData(true);
        }
    }, [allTweets, userTweets, tab, isInitialLoad]);

    // Update local tweets when tab changes
    useEffect(() => {
        if (!isInitialLoad && hasData && (allTweets.length > 0 || userTweets.length > 0)) {
            const filteredTweets = tab === 'guest'      
                ? allTweets.filter((tweet: any) => tweet.guest && !tweet.cast) // Show only guest tweets
                : allTweets; // Show all tweets
            setLocalTweets(filteredTweets);
        }
    }, [tab, allTweets, userTweets, isInitialLoad, hasData]);

    // Determine which data to use based on tab using local state
    const tweets = tab === 'guest'      
        ? localTweets.filter((tweet: any) => tweet.guest && !tweet.cast) // Show only guest tweets
        : localTweets; // Show all tweets
    const loading = (allTweetsLoading || userTweetsLoading) && isInitialLoad && isVisible;
    const error = allTweetsError || userTweetsError;

    // React Query mutations
    const createTweetMutation = useCreateTweet();
    const likeTweetMutation = useLikeTweet();
    const deleteTweetMutation = useDeleteTweet();

    // Manual refresh function
    const handleRefresh = () => {
        setIsInitialLoad(true);
        queryClient.invalidateQueries({ queryKey: queryKeys.tweets.all() });
        queryClient.invalidateQueries({ queryKey: queryKeys.tweets.user(user ? 'guest' : 'cast', user ? user.id : (castId || 0)) });
    };

    // Real-time tweet updates - update local state to prevent refetching
    useTweets((tweet) => {
        // Update local state with new tweets to prevent unnecessary refetching
        setLocalTweets(prevTweets => {
            // Check if tweet already exists
            const exists = prevTweets.some(t => t.id === tweet.id);
            if (!exists) {
                // Add new tweet to the beginning
                return [tweet, ...prevTweets];
            }
            return prevTweets;
        });
    });

    const handleAvatarClick = (tweet: any) => {
        if (tweet.cast?.id) {
            navigate(`/cast/${tweet.cast.id}`);
        } else if (tweet.guest?.id) {
            navigate(`/guest/${tweet.guest.id}`);
        }
    };

    const handleAddTweet = async (content: string, image?: File | null) => {
        if (!user) return;
        
        // Allow posting if there's either content or an image
        if (!content.trim() && !image) {
            alert('テキストまたは画像を入力してください');
            return;
        }
        
        try {
            const newTweet = await createTweetMutation.mutateAsync({ 
                content: content.trim() || '', // Ensure content is never undefined
                guest_id: user.id, 
                image 
            });
            setShowPostCreate(false);
            
            // Add the new tweet to local state immediately for seamless UX
            setLocalTweets(prevTweets => [newTweet, ...prevTweets]);
        } catch (e) {
            alert('投稿に失敗しました');
        }
    };

    const handleLike = async (tweetId: number) => {
        if (!isNotificationEnabled('likes')) {
            return; 
        }
        
        try {
            await likeTweetMutation.mutateAsync({
                tweetId,
                userId: user ? user.id : undefined,
                castId: !user && castId ? castId : undefined
            });
        } catch (e) {
            console.error('Failed to like tweet:', e);
        }
    };

    const handleDeleteTweet = async (tweetId: number) => {
        if (!confirm('このつぶやきを削除しますか？')) return;
        
        try {
            await deleteTweetMutation.mutateAsync(tweetId);
        } catch (e) {
            alert('削除に失敗しました');
        }
    };

    // Check if the current user is the author of the tweet
    const isCurrentUserTweet = (tweet: any) => {
        const isGuestTweet = user && tweet.guest?.id === user.id;
        const isCastTweet = castId && tweet.cast?.id === castId;
        
        return isGuestTweet || isCastTweet;
    };

    if (showPostCreate) return <PostCreatePage onClose={() => setShowPostCreate(false)} onSubmit={handleAddTweet} userType="guest" userId={user?.id} />;
    if (showNotification) return <NotificationScreen onBack={() => setShowNotification(false)} />;
    return (
        <div className="max-w-md mx-auto h-screen bg-gradient-to-b from-primary via-primary to-secondary bg-fixed relative overflow-hidden">
            {/* Fixed Top bar */}
            <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-10">
                <div className="grid grid-cols-3 items-center px-4 py-3 border-b border-secondary bg-primary">
                    <button onClick={() => setShowNotification(true)} className="justify-self-start text-white cursor-pointer">
                        <Bell />
                    </button>
                    <span className="justify-self-center text-lg font-bold text-white">つぶやき</span>
                    <button onClick={handleRefresh} className="justify-self-end text-white cursor-pointer hover:text-secondary transition-colors" title="更新">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
                <div className="flex items-center border-b border-secondary bg-primary">
                    <button onClick={() => setTab('all')} className={`flex-1 py-3 text-center   font-bold text-base ${tab === 'all' ? 'text-white border-b-2 border-secondary' : 'text-white'}`}>みんなのつぶやき</button>
                    <button onClick={() => setTab('guest')} className={`flex-1 py-3 text-center font-bold text-base ${tab === 'guest' ? 'text-white border-b-2 border-secondary' : 'text-white'}`}>ゲストの投稿</button>
                </div>
            </div>
            {/* Posts */}
            <div className="px-4 flex flex-col gap-4 pt-32 pb-32 overflow-y-auto h-full scrollbar-hidden">
                {loading ? (
                    <Spinner />
                ) : error ? (
                    <div className="text-red-400 py-10 text-center">{error.message || 'エラーが発生しました'}</div>
                ) : tweets.length === 0 ? (
                    <div className="text-gray-400 py-10 text-center">つぶやきがありません</div>
                ) : (
                    tweets.map((tweet: any, idx: number) => (
                        <div key={tweet.id || idx} className="bg-white/10 rounded-lg shadow-sm p-4 flex flex-col border border-secondary cursor-pointer" >
                            <div className="flex items-center mb-1">
                                <img
                                    src={
                                        tweet.guest?.avatar
                                            ? `${APP_BASE_URL}/${tweet.guest.avatar}`
                                            : tweet.cast?.avatar
                                                ? `${APP_BASE_URL}/${tweet.cast.avatar.split(',')[0].trim()}`
                                                : tweet.cast?.id 
                                                ? '/assets/avatar/female.png'
                                                : '/assets/avatar/1.jpg'
                                    }
                                    alt={tweet.guest?.nickname || tweet.cast?.nickname || ''}
                                    className="w-10 h-10 rounded-full object-cover mr-2 border border-secondary cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleAvatarClick(tweet)}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        if (tweet.cast?.id) {
                                            target.src = '/assets/avatar/female.png';
                                        } else {
                                            target.src = '/assets/avatar/1.jpg';
                                        }
                                    }}
                                />
                                <div className="flex flex-col flex-1">
                                    <span className="font-bold text-sm text-white">{tweet.guest?.nickname || tweet.cast?.nickname || 'ゲスト/キャスト'}</span>
                                    <span className="text-xs text-white">{new Date(tweet.created_at).toLocaleString('ja-JP')}</span>
                                </div>
                                {/* Delete button - only show for user's own tweets */}
                                {isCurrentUserTweet(tweet) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTweet(tweet.id);
                                        }}
                                        className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-red-400/20"
                                        title="削除"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                            <div className="text-white text-sm whitespace-pre-line mt-1">{tweet.content}</div>
                            {(() => {
                                if (!tweet.image) return null;
                                if (typeof tweet.image !== 'string') return null;
                                const isAbsolute = tweet.image.startsWith('http') || tweet.image.startsWith('data:') || tweet.image.startsWith('blob:');
                                const src = isAbsolute ? tweet.image : `${IMAGE_BASE_URL}/storage/${tweet.image}`;
                                return (
                                    <img
                                        src={src}
                                        alt="tweet"
                                        className="max-h-48 rounded my-2 border border-secondary object-cover"
                                    />
                                );
                            })()}
                            {/* Like button and count */}
                            <TweetLikeButton 
                                tweetId={tweet.id} 
                                userId={user?.id} 
                                isNotificationEnabled={isNotificationEnabled('likes')}
                                onLike={handleLike}
                            />
                        </div>
                    ))
                )}
            </div>
            {/* 投稿 button inside main screen */}
            <button className="fixed left-1/2 -translate-x-1/2 bottom-24 z-30 bg-secondary text-white rounded-full px-6 py-4 shadow-lg font-bold text-lg flex items-center hover:bg-red-700 transition" onClick={() => setShowPostCreate(true)}>
                <span className="mr-2 text-2xl">
                    <Plus /></span>投稿
            </button>
        </div>
    );
};

export default Timeline;