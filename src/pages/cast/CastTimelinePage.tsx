import React, { useState } from 'react';
import { Bell, SlidersHorizontal, Plus } from 'lucide-react';

const stories = [
    { name: '◎ えま◎', img: '/assets/avatar/avatar-1.png' },
    { name: 'me🌙', img: '/assets/avatar/avatar-2.png' },
    { name: 'm🐱大阪', img: '/assets/avatar/female.png' },
    { name: 'ほのか/…', img: '/assets/avatar/1.jpg' },
    { name: 'ゆりあ…', img: '/assets/avatar/knight_3275232.png' },
];

const posts = [
    {
        user: 'にゃんこ🐾',
        time: '20:19',
        text: 'ひましてます\n都内誘ってください',
        img: '/assets/avatar/francesco-ZxNKxnR32Ng-unsplash.jpg',
        likes: 0,
        avatar: '/assets/avatar/avatar-2.png',
    },
    {
        user: 'あやなちゃん',
        time: '受付・20:18',
        text: '急で申し訳ないが新宿のぶり中野21時から行ける方いませんか😭😭ドタキャンされて困ってます予約してます…',
        likes: 1,
        avatar: '/assets/avatar/1.jpg',
    },
    {
        user: 'もめんちゃん',
        time: '20:16',
        text: '',
        likes: 0,
        avatar: '/assets/avatar/female.png',
    },
    {
        user: 'さくら',
        time: '19:55',
        text: '今日はいい天気ですね！',
        img: '/assets/avatar/harald-hofer-pKoKW6UQOuk-unsplash.jpg',
        likes: 2,
        avatar: '/assets/avatar/knight_3275232.png',
    },
    {
        user: 'ジョン',
        time: '19:30',
        text: '新しい友達ができました！',
        img: '/assets/avatar/jf-brou-915UJQaxtrk-unsplash.jpg',
        likes: 3,
        avatar: '/assets/avatar/avatar-1.png',
    },
];

const castPosts = [
    {
        user: 'M🐵',
        role: '会社員',
        time: '01/29(水) 01:09',
        text: '女の子側も咲く時につぶやきを表示するゲスト選べるようにして欲しいです。（合流済みのゲストにはつぶやき非表示にする、など）',
        likes: 3,
        avatar: '/assets/avatar/avatar-1.png',
        badge: '/assets/icons/crown.png',
        badgeLabel: 'ゴールドキャスト',
    },
    {
        user: 'コンシェルジュ',
        time: '01/27(月) 22:55',
        text: 'いつもpishatto六本木オフィスのご利用ありがとうございます🐤\n\n申し訳ありません🙇\n本日1/27(月)は23:30以降\n六本木オフィスに\nスタッフが在中しないため\n待機のご利用はできかねます🙇\n\nご迷惑おかけしますが\nご理解の程お願いいたします\n\n本日はpishattoパスポートにある\n待機場所をぜひご利用ください😊\n\n▼六本木駅付近\n・ハニトラ\n・muse六本木店\n・Bloom Lounge',
        likes: 1,
        avatar: '/assets/avatar/knight_3275232.png',
        badge: null,
        badgeLabel: null,
    },
];

const CastTimelinePage: React.FC = () => {
    const [tab, setTab] = useState<'all' | 'cast'>('all');
    return (
        <div className="max-w-md mx-auto pb-20 min-h-screen bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="text-2xl text-gray-700">
                    <Bell />
                </span>
                <span className="text-xl font-bold">つぶやき</span>
                <span className="text-2xl text-gray-700">
                    <SlidersHorizontal />
                </span>
            </div>
            {/* Tabs */}
            <div className="flex items-center border-b">
                <button onClick={() => setTab('all')} className={`flex-1 py-3 text-center font-bold text-base ${tab === 'all' ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}>みんなのつぶやき</button>
                <button onClick={() => setTab('cast')} className={`flex-1 py-3 text-center font-bold text-base ${tab === 'cast' ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}>キャスト専用</button>
            </div>
            {/* Stories row */}
            <div className="flex space-x-3 px-4 py-3 overflow-x-auto">
                {stories.map((story, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full border-4 border-purple-400 flex items-center justify-center overflow-hidden">
                            <img src={story.img} alt={story.name} className="w-16 h-16 object-cover" />
                        </div>
                        <span className="text-xs text-gray-700 mt-1 truncate w-16 text-center">{story.name}</span>
                    </div>
                ))}
            </div>
            {/* Posts */}
            <div className="px-4">
                {(tab === 'cast' ? castPosts : posts).map((post, idx) => (
                    <div key={idx} className="border-b py-4">
                        <div className="flex items-center mb-1">
                            <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full mr-2" />
                            <span className="font-bold text-base mr-2">{post.user}</span>
                            {('role' in post) && post.role && <span className="text-xs text-gray-400 mr-2">{post.role}</span>}
                            {('badge' in post) && post.badge && (
                                <img src={post.badge} alt="badge" className="w-5 h-5 inline-block mr-1 align-middle" />
                            )}
                            {('badgeLabel' in post) && post.badgeLabel && (
                                <span className="text-xs text-yellow-700 font-bold mr-2 align-middle">{post.badgeLabel}</span>
                            )}
                            <span className="text-xs text-gray-400">{post.time}</span>
                            <span className="ml-auto text-gray-400 text-xl">♡ {post.likes}</span>
                        </div>
                        {post.text && <div className="text-sm text-gray-900 whitespace-pre-line mb-2">{post.text}</div>}
                        {('img' in post) && post.img && <img src={post.img} alt="post" className="rounded-lg w-full max-w-xs mb-2" />}
                    </div>
                ))}
            </div>
            {/* Floating 投稿 button */}
            <button className="fixed left-1/2 -translate-x-1/2 bottom-20 z-30 bg-purple-500 text-white rounded-full px-6 py-4 shadow-lg font-bold text-lg flex items-center">
                <span className="mr-2 text-2xl">
                    <Plus /></span>投稿
            </button>
        </div>
    );
};

export default CastTimelinePage; 