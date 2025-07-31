/*eslint-disable */
import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import { Bell, SlidersHorizontal, Plus, Heart } from 'lucide-react';
import { fetchAllTweets, fetchUserTweets, createTweet, likeTweet, getTweetLikeStatus } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import PostCreatePage from '../../components/dashboard/PostCreatePage';
import { useTweets } from '../../hooks/useRealtime';

const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const IMAGE_BASE_URL = APP_BASE_URL.replace(/\/api$/, '');

const CastTimelinePage: React.FC = () => {
    const { user } = useUser();
    const navigate=useNavigate();
    const [tab, setTab] = useState<'all' | 'cast'>('all');
    const [tweets, setTweets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPostCreate, setShowPostCreate] = useState(false);
    const [likeStatuses, setLikeStatuses] = useState<{ [tweetId: number]: boolean }>({});
    const [likeCounts, setLikeCounts] = useState<{ [tweetId: number]: number }>({});
    const castId = Number(localStorage.getItem('castId')) || null;

    const loadTweets = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = tab === 'cast' && user ? await fetchUserTweets('cast', user.id) : await fetchAllTweets();
            setTweets(data);
        } catch (e) {
            setError('つぶやきの取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    // Fetch like status and count for all tweets
    const fetchLikes = async (tweets: any[]) => {
        const promises = tweets.map(async (tweet) => {
            const { liked, count } = await getTweetLikeStatus(tweet.id, user ? user.id : undefined, !user && castId ? castId : undefined);
            return { id: tweet.id, liked, count };
        });
        const results = await Promise.all(promises);
        const statuses: { [tweetId: number]: boolean } = {};
        const counts: { [tweetId: number]: number } = {};
        results.forEach(({ id, liked, count }) => {
            statuses[id] = liked;
            counts[id] = count;
        });
        setLikeStatuses(statuses);
        setLikeCounts(counts);
    };

    useEffect(() => {
        loadTweets();
    }, [tab]);

    useEffect(() => {
        if (tweets.length > 0 && (user || castId)) fetchLikes(tweets);
    }, [tweets, user, castId]);

    useTweets((tweet) => {
        if (tab === 'all') {
            setTweets((prev) => {
                if (prev.some(t => t.id === tweet.id)) return prev;
                return [tweet, ...prev];
            });
        }
    });

    const handleAddTweet = async (content: string, image?: File | null) => {
        if (!castId) return;
        try {
            await createTweet({ content, cast_id: castId, image });
            setShowPostCreate(false);
            loadTweets();
        } catch (e) {
            alert('投稿に失敗しました');
        }
    };

    const handleLike = async (tweetId: number) => {
        if (!user && !castId) return;
        const res = await likeTweet(tweetId, user ? user.id : undefined, !user && castId ? castId : undefined);
        setLikeStatuses((prev) => ({ ...prev, [tweetId]: res.liked }));
        setLikeCounts((prev) => ({ ...prev, [tweetId]: res.count }));
    };
    const handleAvatarClick = (tweet: any) => {
        if (tweet.cast?.id) {
            navigate(`/cast/${tweet.cast.id}`);
        } else if (tweet.guest?.id) {
            navigate(`/guest/${tweet.guest.id}`);
        }
    };
    if (showPostCreate) return <PostCreatePage onClose={() => setShowPostCreate(false)} onSubmit={handleAddTweet} userType="cast" userId={castId || undefined} />;
    return (
        <div className="max-w-md pb-20 min-h-screen bg-primary">
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-primary z-20">
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <span className="text-2xl text-white">
                        <Bell />
                    </span>
                    <span className="text-xl font-bold text-white">つぶやき</span>
                    <span className="text-2xl text-white">
                        <SlidersHorizontal />
                    </span>
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
                    <div className="text-white py-10 text-center">ローディング...</div>
                ) : error ? (
                    <div className="text-red-400 py-10 text-center">{error}</div>
                ) : tweets.length === 0 ? (
                    <div className="text-gray-400 py-10 text-center">つぶやきがありません</div>
                ) : (
                    tweets.map((tweet, idx) => (
                        <div key={tweet.id || idx} className="bg-primary rounded-lg shadow-sm p-4 flex flex-col border border-secondary cursor-pointer" >
                            <div className="flex items-center mb-1">
                                <img src={
                                        tweet.guest?.avatar
                                            ? `${APP_BASE_URL}/${tweet.guest.avatar}`
                                            : tweet.cast?.avatar
                                                ? `${APP_BASE_URL}/${tweet.cast.avatar.split(',')[0].trim()}`
                                                : '/assets/avatar/avatar-1.png'
                                    } alt={tweet.guest?.nickname || tweet.cast?.nickname || ''} className="w-10 h-10 rounded-full object-cover mr-2 border border-secondary cursor-pointer hover:opacity-80 transition-opacity" 
                                    onClick={() => handleAvatarClick(tweet)} 
                                    />
                                <div className="flex flex-col flex-1">
                                    <span className="font-bold text-sm text-white">{tweet.guest?.nickname || tweet.cast?.nickname || 'ゲスト/キャスト'}</span>
                                    <span className="text-xs text-white">{new Date(tweet.created_at + 'Z').toLocaleString('ja-JP')}</span>
                                </div>
                            </div>
                            <div className="text-white text-sm whitespace-pre-line mt-1">{tweet.content}</div>
                            {tweet.image && (
                                <img
                                    src={
                                        tweet.image.startsWith('http')
                                            ? tweet.image
                                            : `${IMAGE_BASE_URL}/storage/${tweet.image}`
                                    }
                                    alt="tweet"
                                    className="max-h-48 rounded my-2 border border-secondary object-cover"
                                />
                            )}
                            {/* Like button and count */}
                            <div className="flex items-center mt-2">
                                <button
                                    className={`mr-2 text-lg ${likeStatuses[tweet.id] ? 'text-red-500' : 'text-gray-400'}`}
                                    onClick={() => handleLike(tweet.id)}
                                >
                                    <Heart fill={likeStatuses[tweet.id] ? 'red' : 'white'} />
                                </button>
                                <span className="text-white text-sm">{likeCounts[tweet.id] || 0}</span>
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