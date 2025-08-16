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

const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const IMAGE_BASE_URL = APP_BASE_URL.replace(/\/api$/, '');

const CastTimelinePage: React.FC = () => {
    const { user } = useUser();
    const navigate=useNavigate();
    const [tab, setTab] = useState<'all' | 'cast'>('all');
    const [showPostCreate, setShowPostCreate] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const { castId } = useCast() as any;

    // Use React Query hooks for data fetching
    const {
        data: allTweets = [],
        isLoading: allTweetsLoading,
        error: allTweetsError
    } = useAllTweets();

    const {
        data: userTweets = [],
        isLoading: userTweetsLoading,
        error: userTweetsError
    } = useUserTweets('cast', castId || 0);

    // Filter tweets based on tab
    const tweets = tab === 'cast' 
        ? allTweets.filter((tweet: any) => tweet.cast && !tweet.guest)
        : allTweets;

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

    // Loading and error states
    const loading = allTweetsLoading || userTweetsLoading || likesLoading;
    const error = allTweetsError || userTweetsError || likesError;

    useTweets((tweet) => {
        if (tab === 'all') {
            // React Query will handle the update automatically
            // No need to manually update state
        }
    });

    const handleAddTweet = async (content: string, image?: File | null) => {
        if (!castId) return;
        try {
            await createTweetMutation.mutateAsync({ content, cast_id: castId, image });
            setShowPostCreate(false);
            // React Query will automatically refetch tweets
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
            // React Query will automatically update the like status
        } catch (error) {
            console.error('Failed to like tweet:', error);
        }
    };

    const handleDelete = async (tweetId: number) => {
        try {
            await deleteTweetMutation.mutateAsync(tweetId);
            // React Query will automatically refetch tweets
        } catch (e) {
            alert('削除に失敗しました');
        }
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
        <div className="max-w-md pb-28 min-h-screen bg-gradient-to-br from-primary via-primary to-secondary">
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-primary z-20">
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <span className="text-2xl text-white hover:text-secondary transition-colors cursor-pointer" onClick={() => setShowNotification(true)}>
                        <Bell />
                    </span>
                    <span className="text-xl font-bold mx-auto text-white">つぶやき</span>
                    {/* <span className="text-2xl text-white">
                        <SlidersHorizontal />
                    </span> */}
                </div>
                {/* Tabs */}
                <div className="flex items-center border-b border-secondary">
                    <button onClick={() => setTab('all')} className={`flex-1 py-3 text-center font-bold text-base ${tab === 'all' ? 'text-white border-b-2 border-secondary' : 'text-white'}`}>みんなのつぶやき</button>
                    <button onClick={() => setTab('cast')} className={`flex-1 py-3 text-center font-bold text-base ${tab === 'cast' ? 'text-white border-b-2 border-secondary' : 'text-white'}`}>キャスト専用</button>
                </div>
            </div>
            {/* Posts - with top margin to account for fixed header */}
            <div className="px-4 flex flex-col gap-4 pt-28">
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
                                <img src={
                                    tweet.cast?.avatar 
                                        ? `${IMAGE_BASE_URL}/${tweet.cast.avatar}` 
                                        : '/assets/avatar/avatar-1.png'
                                } 
                                alt="avatar" 
                                className="w-8 h-8 rounded-full mr-2 border border-secondary"
                                />
                                <span className="text-white text-sm font-bold">{tweet.cast?.nickname || '匿名'}</span>
                                <span className="text-gray-400 text-xs ml-2">
                                    {new Date(tweet.created_at).toLocaleString('ja-JP')}
                                </span>
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