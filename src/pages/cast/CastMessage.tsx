import React, { useState } from 'react';
import { FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface MessageScreenProps {
    showChat: boolean;
    setShowChat: (show: boolean) => void;
}

const CastMessage: React.FC<MessageScreenProps> = ({ showChat, setShowChat }) => {
    const [selectedTab, setSelectedTab] = useState<'all' | 'favorite'>('all');
    const navigate = useNavigate();
    // Mock favorite casts data
    const favoriteCasts = [
        {
            id: 1,
            name: 'カナ',
            age: 24,
            imageUrl: '/assets/avatar/female.png',
            lastMessage: 'こんにちは！',
            time: '21:30',
            unread: 2,
        },
        {
            id: 2,
            name: 'もな',
            age: 20,
            imageUrl: '/assets/avatar/female.png',
            lastMessage: 'またね！',
            time: '20:15',
            unread: 0,
        },
    ];

    return (
        <div className="bg-primary min-h-screen flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-secondary">
                <FiBell className="w-6 h-6 text-white" />
                <div className="font-bold text-lg text-white">メッセージ一覧</div>
                <div className="w-6 h-6" /> {/* Placeholder for right icon */}
            </div>
            {/* Campaign banner */}
            <div className="bg-primary px-4 py-2 border-b border-secondary">
                <div className="bg-primary rounded-lg shadow-sm flex items-center p-2">
                    <img src="/assets/icons/logo_call.png" />
                </div>
            </div>
            {/* Tabs */}
            <div className="flex items-center px-4 mt-2">
                <button
                    className={`px-4 py-1 rounded-full font-bold text-sm mr-2 ${selectedTab === 'all' ? 'bg-secondary text-white' : 'bg-primary text-white border border-secondary'}`}
                    onClick={() => setSelectedTab('all')}
                >
                    すべて
                </button>
                <button
                    className={`px-4 py-1 rounded-full font-bold text-sm ${selectedTab === 'favorite' ? 'bg-secondary text-white' : 'bg-primary text-white border border-secondary'}`}
                    onClick={() => setSelectedTab('favorite')}
                >
                    お気に入り
                </button>
            </div>
            {/* Search bar */}
            <div className="px-4 mt-3">
                <input
                    type="text"
                    className="w-full px-4 py-2 rounded-full border border-secondary bg-primary text-white text-sm placeholder-red-500"
                    placeholder="ニックネームで検索"
                />
            </div>
            {/* Message list */}
            <div className="px-4 mt-4">
                {selectedTab === 'all' ? (
                    <button className="w-full" onClick={() => setShowChat(true)}>
                        <div className="flex items-center bg-primary rounded-lg shadow-sm p-3 relative border border-secondary">
                            <img
                                src="/assets/avatar/1.jpg"
                                alt="avatar"
                                className="w-12 h-12 rounded-full mr-3 border border-secondary"
                            />
                            <div className="flex-1">
                                <div className="flex items-center">
                                    <span className="font-bold text-white text-base mr-2">pishattoコンシェルジュ 11歳</span>
                                    <span className="bg-secondary text-white text-[10px] rounded px-1 ml-1">P</span>
                                </div>
                                <div className="text-sm text-white">メッセージが届いています</div>
                            </div>
                            <div className="flex flex-col items-end ml-2">
                                <span className="text-xs text-white">22:02</span>
                                <span className="bg-secondary text-white text-xs rounded-full px-2 py-0.5 mt-1">4</span>
                            </div>
                        </div>
                    </button>
                ) : (
                    <div className="flex flex-col gap-3">
                        {favoriteCasts.length === 0 ? (
                            <div className="text-white text-center py-8">お気に入りのキャストがいません</div>
                        ) : (
                            favoriteCasts.map(cast => (
                                <button
                                    key={cast.id}
                                    className="w-full text-left"
                                    onClick={() => navigate(`/cast/${cast.id}/message`)}
                                >
                                    <div className="flex items-center bg-primary rounded-lg shadow-sm p-3 relative border border-secondary">
                                        <img
                                            src={cast.imageUrl}
                                            alt="avatar"
                                            className="w-12 h-12 rounded-full mr-3 border border-secondary"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <span className="font-bold text-white text-base mr-2">{cast.name} {cast.age}歳</span>
                                            </div>
                                            <div className="text-sm text-white">{cast.lastMessage}</div>
                                        </div>
                                        <div className="flex flex-col items-end ml-2">
                                            <span className="text-xs text-white">{cast.time}</span>
                                            {cast.unread > 0 && (
                                                <span className="bg-secondary text-white text-xs rounded-full px-2 py-0.5 mt-1">{cast.unread}</span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CastMessage; 