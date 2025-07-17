import React, { useState } from 'react';
import { FiBell } from 'react-icons/fi';
import ChatScreen from './ChatScreen';

interface MessageScreenProps {
    showChat: boolean;
    setShowChat: (show: boolean) => void;
}

const MessageScreen: React.FC<MessageScreenProps> = ({ showChat, setShowChat }) => {
    const [selectedTab, setSelectedTab] = useState<'all' | 'favorite'>('all');
    if (showChat) {
        return <ChatScreen onBack={() => setShowChat(false)} />;
    }

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
                    <img src="/assets/icons/logo_call.png" alt="logo_call"/>
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
            </div>
            {/* Gift button */}
            <div className="fixed left-1/2 -translate-x-1/2 bottom-20 z-30 text-white rounded-full px-6 py-4  font-bold text-lg flex items-center">
                <button className="flex flex-col items-center">
                    <span className="bg-secondary text-white rounded-full px-3 py-2 text-xs font-bold">まとめてギフト</span>
                </button>
            </div>
        </div>
    );
};

export default MessageScreen; 