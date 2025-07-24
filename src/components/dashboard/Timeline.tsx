import React, { useState, useEffect } from 'react';
import PostCreatePage from './PostCreatePage';
import { Bell, Plus, SlidersHorizontal } from 'lucide-react';
import { fetchAllTweets, createTweet } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { useTweets } from '../../hooks/useRealtime';

const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const IMAGE_BASE_URL = APP_BASE_URL.replace(/\/api$/, '');

const Timeline: React.FC = () => {
    const { user } = useUser();
    const [showPostCreate, setShowPostCreate] = useState(false);
    const [tweets, setTweets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTweets = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAllTweets();
            setTweets(data);
        } catch (e) {
            setError('つぶやきの取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTweets();
    }, []);

    useTweets((tweet) => {
        setTweets((prev) => {
            // Avoid duplicates if tweet already exists
            if (prev.some(t => t.id === tweet.id)) return prev;
            return [tweet, ...prev];
        });
    });

    const handleAddTweet = async (content: string, image?: File | null) => {
        if (!user) return;
        try {
            await createTweet({ content, guest_id: user.id, image });
            setShowPostCreate(false);
            loadTweets();
        } catch (e) {
            alert('投稿に失敗しました');
        }
    };

    if (showPostCreate) return <PostCreatePage onClose={() => setShowPostCreate(false)} onSubmit={handleAddTweet} />;
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-20 relative">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-secondary bg-primary">
                <div className="text-white">
                    <Bell />
                </div>
                <span className="text-lg font-bold mx-auto text-white">つぶやき</span>
                <button className="absolute right-4 top-3 text-white">
                    <SlidersHorizontal />
                </button>
            </div>
            {/* Posts */}
            <div className="px-4 flex flex-col gap-4">
                {loading ? (
                    <div className="text-white py-10 text-center">ローディング...</div>
                ) : error ? (
                    <div className="text-red-400 py-10 text-center">{error}</div>
                ) : tweets.length === 0 ? (
                    <div className="text-gray-400 py-10 text-center">つぶやきがありません</div>
                ) : (
                    tweets.map((tweet, idx) => (
                        <div key={tweet.id || idx} className="bg-primary rounded-lg shadow-sm p-4 flex flex-col border border-secondary">
                            <div className="flex items-center mb-1">
                                <img
                                    src={
                                        tweet.guest?.avatar
                                            ? `${APP_BASE_URL}/${tweet.guest.avatar}`
                                            : tweet.cast?.avatar
                                                ? `${APP_BASE_URL}/${tweet.cast.avatar}`
                                                : '/assets/avatar/avatar-1.png'
                                    }
                                    alt={tweet.guest?.nickname || tweet.cast?.nickname || ''}
                                    className="w-10 h-10 rounded-full object-cover mr-2 border border-secondary"
                                />
                                <div className="flex flex-col flex-1">
                                    <span className="font-bold text-sm text-white">{tweet.guest?.nickname || tweet.cast?.nickname || 'ゲスト/キャスト'}</span>
                                    <span className="text-xs text-white">{new Date(tweet.created_at).toLocaleString()}</span>
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
                                    className="max-h-48 rounded my-2 border border-secondary"
                                />
                            )}
                        </div>
                    ))
                )}
            </div>
            {/* 投稿 button inside main screen */}
            <button className="fixed left-1/2 -translate-x-1/2 bottom-20 z-30 bg-secondary text-white rounded-full px-6 py-4 shadow-lg font-bold text-lg flex items-center hover:bg-red-700 transition" onClick={() => setShowPostCreate(true)}>
                <span className="mr-2 text-2xl">
                    <Plus /></span>投稿
            </button>
        </div>
    );
};

export default Timeline;






