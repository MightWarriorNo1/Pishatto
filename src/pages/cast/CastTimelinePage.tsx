/*eslint-disable */
import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import { Bell, SlidersHorizontal, Plus, Heart, Trash2 } from 'lucide-react';
import { fetchAllTweets, fetchUserTweets, createTweet, likeTweet, getTweetLikeStatus, deleteTweet } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import PostCreatePage from '../../components/dashboard/PostCreatePage';
import CastNotificationPage from './CastNotificationPage';
import { useTweets } from '../../hooks/useRealtime';
import { useCast } from '../../contexts/CastContext';
import Spinner from '../../components/ui/Spinner';
import { useAllTweets, useUserTweets, useTweetLikeStatus, useCreateTweet, useLikeTweet, useDeleteTweet } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/react-query';

const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const IMAGE_BASE_URL = APP_BASE_URL.replace(/\/api$/, '');

const CastTimelinePage: React.FC = () => {
    const { user } = useUser();
    const navigate=useNavigate();
    const [tab, setTab] = useState<'all' | 'cast'>('all');
    const [showPostCreate, setShowPostCreate] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const { castId } = useCast() as any;
    
    // Local state for tweets to prevent reloads
    const [localTweets, setLocalTweets] = useState<any[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [hasData, setHasData] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Use React Query hooks for initial data fetching only
    const {
        data: allTweets = [],
        isLoading: allTweetsLoading,
        error: allTweetsError
    } = useAllTweets({ refetchOnMount: false });

    const {
        data: userTweets = [],
        isLoading: userTweetsLoading,
        error: userTweetsError
    } = useUserTweets('cast', castId || 0, { refetchOnMount: false });

    // Set visibility when component mounts/unmounts
    useEffect(() => {
        setIsVisible(true);
        return () => setIsVisible(false);
    }, []);

    // Initialize local tweets when data is first loaded
    useEffect(() => {
        if (isInitialLoad && (allTweets.length > 0 || userTweets.length > 0)) {
            const initialTweets = tab === 'cast' 
                ? allTweets.filter((tweet: any) => tweet.cast && !tweet.guest)
                : allTweets;
            setLocalTweets(initialTweets);
            setIsInitialLoad(false);
            setHasData(true);
        }
    }, [allTweets, userTweets, tab, isInitialLoad]);

    // Update local tweets when tab changes
    useEffect(() => {
        if (!isInitialLoad && hasData && (allTweets.length > 0 || userTweets.length > 0)) {
            const filteredTweets = tab === 'cast' 
                ? allTweets.filter((tweet: any) => tweet.cast && !tweet.guest)
                : allTweets;
            setLocalTweets(filteredTweets);
        }
    }, [tab, allTweets, userTweets, isInitialLoad, hasData]);

    // Filter tweets based on tab using local state
    const tweets = tab === 'cast' 
        ? localTweets.filter((tweet: any) => tweet.cast && !tweet.guest)
        : localTweets;

    // Get like statuses for tweets
    const {
        data: likeStatuses = {},
        isLoading: likesLoading,
        error: likesError
    } = useTweetLikeStatus(tweets[0]?.id || 0, user ? user.id : castId);

    // Use mutation hooks
    const createTweetMutation = useCreateTweet();
    const likeTweetMutation = useLikeTweet();
    const deleteTweetMutation = useDeleteTweet();

    // Manual refresh function
    const queryClient = useQueryClient();
    const handleRefresh = () => {
        setIsInitialLoad(true);
        queryClient.invalidateQueries({ queryKey: queryKeys.tweets.all() });
        queryClient.invalidateQueries({ queryKey: queryKeys.tweets.user('cast', castId || 0) });
    };

    // Loading and error states
    const loading = (allTweetsLoading || userTweetsLoading || likesLoading) && isInitialLoad && isVisible;
    const error = allTweetsError || userTweetsError || likesError;

    // Real-time updates without reloading
    useTweets((tweet) => {
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

    const handleAddTweet = async (content: string, image?: File | null) => {
        if (!castId) return;
        try {
            const newTweet = await createTweetMutation.mutateAsync({ content, cast_id: castId, image });
            setShowPostCreate(false);
            
            // Add the new tweet to local state immediately for seamless UX
            setLocalTweets(prevTweets => [newTweet, ...prevTweets]);
        } catch (e) {
            alert('投稿に失敗しました');
        }
    };

    const handleLike = async (tweetId: number) => {
        if (!user && !castId) return;
        try {
            await likeTweetMutation.mutateAsync({ 
                tweetId, 
                userId: user ? user.id : undefined, 
                castId: !user && castId ? castId : undefined 
            });
            
            // Update local state immediately for seamless UX
            setLocalTweets(prevTweets => 
                prevTweets.map(tweet => 
                    tweet.id === tweetId 
                        ? { ...tweet, isLiked: !tweet.isLiked }
                        : tweet
                )
            );
        } catch (error) {
            console.error('Failed to like tweet:', error);
        }
    };

    const handleDelete = async (tweetId: number) => {
        if (!confirm('このつぶやきを削除しますか？')) return;
        
        try {
            await deleteTweetMutation.mutateAsync(tweetId);
            
            // Remove tweet from local state immediately for seamless UX
            setLocalTweets(prevTweets => prevTweets.filter(tweet => tweet.id !== tweetId));
        } catch (e) {
            alert('削除に失敗しました');
        }
    };

    // Handle tab changes smoothly
    const handleTabChange = (newTab: 'all' | 'cast') => {
        setTab(newTab);
        // No need to reload data - just filter existing local tweets
    };

    // Check if the current user is the author of the tweet
    const isCurrentUserTweet = (tweet: any) => {
        if (castId && tweet.cast?.id === castId) return true;
        return false;
    };

    const handleAvatarClick = (tweet: any) => {
        if (tweet.cast?.id) {
            navigate(`/cast/${tweet.cast.id}`);
        } else if (tweet.guest?.id) {
            navigate(`/guest/${tweet.guest.id}`);
        }
    };
    if (showPostCreate) return <PostCreatePage onClose={() => setShowPostCreate(false)} onSubmit={handleAddTweet} userType="cast" userId={castId || undefined} />;
    if (showNotification) return <CastNotificationPage onBack={() => setShowNotification(false)} />;
    return (
        <div className="max-w-md h-screen bg-gradient-to-b from-primary via-primary to-secondary bg-fixed relative overflow-hidden">
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-primary z-20">
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <span className="text-2xl text-white hover:text-secondary transition-colors cursor-pointer" onClick={() => setShowNotification(true)}>
                        <Bell />
                    </span>
                    <span className="text-xl font-bold mx-auto text-white">つぶやき</span>
                    <button onClick={handleRefresh} className="text-2xl text-white hover:text-secondary transition-colors cursor-pointer" title="更新">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
                {/* Tabs */}
                <div className="flex items-center border-b border-secondary">
                    <button onClick={() => handleTabChange('all')} className={`flex-1 py-3 text-center font-bold text-base ${tab === 'all' ? 'text-white border-b-2 border-secondary' : 'text-white'}`}>みんなのつぶやき</button>
                    <button onClick={() => handleTabChange('cast')} className={`flex-1 py-3 text-center font-bold text-base ${tab === 'cast' ? 'text-white border-b-2 border-secondary' : 'text-white'}`}>キャスト専用</button>
                </div>
            </div>
            {/* Posts - scrollable area, hidden scrollbar */}
            <div className="px-4 flex flex-col gap-4 pt-28 pb-32 overflow-y-auto h-full scrollbar-hidden">
                {loading ? (
                    <div className="flex items-center justify-center">
                        <Spinner />
                    </div>
                ) : error ? (
                    <div className="text-red-400 py-10 text-center">{error.message || 'エラーが発生しました'}</div>
                ) : tweets.length === 0 ? (
                    <div className="text-gray-400 py-10 text-center">つぶやきがありません</div>
                ) : (
                    tweets.map((tweet: any, idx: number) => (
                        <div key={tweet.id || idx} className="bg-white/10 rounded-lg shadow-sm p-4 flex flex-col border border-secondary cursor-pointer" >
                            <div className="flex items-center mb-1">
                                {(() => {
                                    // Debug avatar data
                                    console.log('Avatar debug:', {
                                        tweetId: tweet.id,
                                        castAvatar: tweet.cast?.avatar,
                                        guestAvatar: tweet.guest?.avatar,
                                        castId: tweet.cast?.id,
                                        guestId: tweet.guest?.id
                                    });
                                    
                                    let avatarSrc = '';
                                    if (tweet.cast?.avatar) {
                                        if (Array.isArray(tweet.cast.avatar)) {
                                            avatarSrc = `${APP_BASE_URL}/${tweet.cast.avatar[0]}`;
                                        } else if (typeof tweet.cast.avatar === 'string') {
                                            // Handle comma-separated avatars like in Timeline component
                                            avatarSrc = `${APP_BASE_URL}/${tweet.cast.avatar.split(',')[0].trim()}`;
                                        } else {
                                            avatarSrc = `${APP_BASE_URL}/${tweet.cast.avatar}`;
                                        }
                                    } else if (tweet.guest?.avatar) {
                                        if (Array.isArray(tweet.guest.avatar)) {
                                            avatarSrc = `${APP_BASE_URL}/${tweet.guest.avatar[0]}`;
                                        } else if (typeof tweet.guest.avatar === 'string') {
                                            avatarSrc = `${APP_BASE_URL}/${tweet.guest.avatar}`;
                                        } else {
                                            avatarSrc = `${APP_BASE_URL}/${tweet.guest.avatar}`;
                                        }
                                    } else {
                                        avatarSrc = tweet.cast?.id 
                                            ? '/assets/avatar/female.png'
                                            : '/assets/avatar/1.jpg';
                                    }
                                    
                                    return (
                                        <img 
                                            src={avatarSrc}
                                            alt="avatar" 
                                            className="w-8 h-8 rounded-full mr-2 border border-secondary cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => handleAvatarClick(tweet)}
                                            onError={(e) => {
                                                console.log('Avatar load error for:', avatarSrc);
                                                const target = e.target as HTMLImageElement;
                                                if (tweet.cast?.id) {
                                                    target.src = '/assets/avatar/female.png';
                                                } else {
                                                    target.src = '/assets/avatar/1.jpg';
                                                }
                                            }}
                                        />
                                    );
                                })()}
                                <div className="flex flex-col flex-1">
                                    <span className="text-white text-sm font-bold">
                                        {tweet.cast?.nickname || tweet.guest?.nickname || '匿名'}
                                    </span>
                                    <span className="text-gray-400 text-xs">
                                        {new Date(tweet.created_at).toLocaleString('ja-JP')}
                                    </span>
                                </div>
                                {/* Delete button - only show for current cast's own tweets */}
                                {isCurrentUserTweet(tweet) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(tweet.id);
                                        }}
                                        className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-red-400/20"
                                        title="削除"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <div className="text-white text-sm mb-2">{tweet.content}</div>
                            {tweet.image && (
                                <img 
                                    src={`${IMAGE_BASE_URL}/${tweet.image}`} 
                                    alt="tweet image" 
                                    className="w-full h-32 object-cover rounded-lg mb-2"
                                />
                            )}
                            <div className="flex items-center mt-2">
                                <button
                                    className={`mr-2 text-lg ${(likeStatuses as any)[tweet.id] ? 'text-red-500' : 'text-gray-400'}`}
                                    onClick={() => handleLike(tweet.id)}
                                >
                                    <Heart fill={(likeStatuses as any)[tweet.id] ? 'red' : 'white'} />
                                </button>
                                <span className="text-white text-sm">{(likeStatuses as any)[tweet.id] ? (likeStatuses as any)[tweet.id] : 0}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* Floating 投稿 button */}
            <button className="fixed left-1/2 -translate-x-1/2 bottom-20 z-30 bg-secondary text-white rounded-full px-6 py-4 shadow-lg font-bold text-lg flex items-center hover:bg-red-700 transition" onClick={() => setShowPostCreate(true)}>
                <span className="mr-2 text-2xl">
                    <Plus /></span>投稿
            </button>
            {showPostCreate && <PostCreatePage onClose={() => setShowPostCreate(false)} onSubmit={handleAddTweet} userType="cast" userId={castId || undefined} />}
        </div>
    );
};

export default CastTimelinePage; 