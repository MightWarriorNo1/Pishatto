import React, { useState } from 'react';
import PostCreatePage from './PostCreatePage';
import { Bell, SlidersHorizontal } from 'lucide-react';

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
            {/* Stories */}
            <div className="flex gap-3 px-4 py-3 overflow-x-auto">
                {stories.map((story, idx) => (
                    <div key={idx} className="flex flex-col items-center cursor-pointer" onClick={() => alert(`${story.name}のストーリーを表示`)}>
                        <div className={`rounded-full border-2 ${story.isNew ? 'border-secondary' : 'border-black'} p-1`}>
                            <img src={story.img} alt={story.name} className="w-12 h-12 rounded-full object-cover" />
                        </div>
                        <span className="text-xs mt-1 text-white truncate max-w-[48px]">{story.name}{idx === 0 && <span className="text-white ml-1">＋</span>}</span>
                    </div>
                ))}
            </div>
            {/* Posts */}
            <div className="px-4 flex flex-col gap-4">
                {posts.map((post, idx) => (
                    <div key={idx} className="bg-primary rounded-lg shadow-sm p-4 flex flex-col border border-secondary">
                        <div className="flex items-center mb-1">
                            <img src={post.user.img} alt={post.user.name} className="w-10 h-10 rounded-full object-cover mr-2 border border-secondary" />
                            <div className="flex flex-col flex-1">
                                <span className="font-bold text-sm text-white">{post.user.name}{post.user.age && ` ${post.user.age}歳`}</span>
                                {post.user.job && <span className="text-xs text-white">{post.user.job}・{post.time}</span>}
                                {!post.user.job && <span className="text-xs text-white">{post.time}</span>}
                            </div>
                            <span className="ml-2 text-white">{post.likes}</span>
                        </div>
                        <div className="text-white text-sm whitespace-pre-line mt-1">{post.content}</div>
                    </div>
                ))}
            </div>
            {/* 投稿 button inside main screen */}
            <div className="flex justify-end px-4">
                <button className="bg-secondary text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg" onClick={() => setShowPostCreate(true)}>
                    <span className="text-2xl font-bold mb-1">＋</span>
                    <span className="text-xs font-bold">投稿</span>
                </button>
            </div>
        </div>
    );
};

export default Timeline;






