import React, { useState } from 'react';
import PostCreatePage from './PostCreatePage';

const stories = [
    { name: 'まこと', img: '/assets/avatar/AdobeStock_1095142160_Preview.jpeg', isNew: true },
    { name: 'カエル', img: '/assets/avatar/2.jpg', isNew: false },
    { name: 'ゆう', img: '/assets/avatar/AdobeStock_1067731649_Preview.jpeg', isNew: false },
    { name: 'りほ', img: '/assets/avatar/AdobeStock_1190678828_Preview.jpeg', isNew: false },
];

const initialPosts = [
    {
        user: { name: 'キリ', age: 27, job: 'クリエイター', img: '/assets/avatar/AdobeStock_1537463438_Preview.jpeg' },
        time: '1分前',
        content: '裁縫が得意な人いますか？',
        likes: 0,
    },
    {
        user: { name: 'Hiro', age: 28, job: 'IT関連', img: '/assets/avatar/AdobeStock_1537463446_Preview.jpeg' },
        time: '2分前',
        content: '明日の夜、急遽予定が空きました！！！\n久々にお酒飲みたいと思っており、どなたか一緒に行きませんかー？',
        likes: 2,
    },
    {
        user: { name: '', age: '', job: '', img: '/assets/avatar/T06LD1H7RDE-U07S7J2QWKH-2ab7091be9e0-512.jpg' },
        time: '6分前',
        content: '🐒',
        likes: 7,
    },
    {
        user: { name: 'R', age: 23, job: '美容', img: '/assets/avatar/T06LD1H7RDE-U086L3N9W4F-6a0b2fcb5192-512.jpg' },
        time: '7分前',
        content: '23歳なりました(｡&bull;_&bull;｡, )~☆\nお祝いしてくれたら嬉しいです🥺🥺🍭',
        likes: 1,
    },
];

const Timeline: React.FC = () => {
    const [showPostCreate, setShowPostCreate] = useState(false);
    const [posts, setPosts] = useState(initialPosts);
    const handleAddPost = (content: string) => {
        setPosts([
            {
                user: { name: 'まこちゃん', age: '', job: '', img: '/assets/avatar/avatar-1.png' },
                time: 'たった今',
                content,
                likes: 0,
            },
            ...posts,
        ]);
        setShowPostCreate(false);
    };
    if (showPostCreate) return <PostCreatePage onClose={() => setShowPostCreate(false)} onSubmit={handleAddPost} />;
    return (
        <div className="max-w-md mx-auto min-h-screen bg-white pb-20 relative">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="text-lg font-bold mx-auto">つぶやき</span>
                <button className="absolute right-4 top-3 text-gray-400">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="6" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="18" r="2" /></svg>
                </button>
            </div>
            {/* Stories */}
            <div className="flex gap-3 px-4 py-3 overflow-x-auto">
                {stories.map((story, idx) => (
                    <div key={idx} className="flex flex-col items-center cursor-pointer" onClick={() => alert(`${story.name}のストーリーを表示`)}>
                        <div className={`rounded-full border-2 ${story.isNew ? 'border-orange-400' : 'border-gray-200'} p-1`}>
                            <img src={story.img} alt={story.name} className="w-12 h-12 rounded-full object-cover" />
                        </div>
                        <span className="text-xs mt-1 text-gray-700 truncate max-w-[48px]">{story.name}{idx === 0 && <span className="text-orange-400 ml-1">＋</span>}</span>
                    </div>
                ))}
            </div>
            {/* Posts */}
            <div className="px-4 flex flex-col gap-4">
                {posts.map((post, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
                        <div className="flex items-center mb-1">
                            <img src={post.user.img} alt={post.user.name} className="w-10 h-10 rounded-full object-cover mr-2" />
                            <div className="flex flex-col flex-1">
                                <span className="font-bold text-sm text-gray-800">{post.user.name}{post.user.age && ` ${post.user.age}歳`}</span>
                                {post.user.job && <span className="text-xs text-blue-400">{post.user.job}・{post.time}</span>}
                                {!post.user.job && <span className="text-xs text-gray-400">{post.time}</span>}
                            </div>
                            <span className="ml-2 text-gray-400">{post.likes}</span>
                        </div>
                        <div className="text-gray-800 text-sm whitespace-pre-line mt-1">{post.content}</div>
                    </div>
                ))}
            </div>
            {/* 投稿 button inside main screen */}
            <div className="flex justify-end mt-8 mb-8">
                <button className="bg-orange-500 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg" onClick={() => setShowPostCreate(true)}>
                    <span className="text-2xl font-bold mb-1">＋</span>
                    <span className="text-xs font-bold">投稿</span>
                </button>
            </div>
        </div>
    );
};

export default Timeline;






