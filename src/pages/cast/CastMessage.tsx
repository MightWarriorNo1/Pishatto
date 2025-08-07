import React, { useState, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ChatScreen from '../../components/dashboard/ChatScreen';
import CastGroupChatScreen from '../../components/cast/dashboard/CastGroupChatScreen';
import ConciergeChat from '../../components/ConciergeChat';
import ConciergeDetailPage from '../ConciergeDetailPage';
import { useChatRefresh } from '../../contexts/ChatRefreshContext';
import { getCastChats } from '../../services/api';

interface MessageScreenProps {
    showChat: number | null;
    setShowChat: (show: number | null) => void;
}

const CastMessage: React.FC<MessageScreenProps & { userId: number }> = ({ showChat, setShowChat, userId }) => {
    const [selectedTab, setSelectedTab] = useState<'all' | 'favorite'>('all');
    const [chats, setChats] = useState<any[]>([]);
    const [showConcierge, setShowConcierge] = useState(false);
    const navigate = useNavigate();
    const { refreshKey } = useChatRefresh();

    useEffect(() => {
        getCastChats(userId)
            .then(chats => setChats(chats || []));
    }, [userId, refreshKey]);

    if (showChat) {
        // Check if this is a group chat (has group_id) or individual chat
        const chat = chats.find(c => c.id === showChat);
        if (chat && chat.group_id) {
            return <CastGroupChatScreen groupId={chat.group_id} onBack={() => setShowChat(null)} />;
        } else {
            return <ChatScreen chatId={showChat} onBack={() => setShowChat(null)} />;
        }
    }

    if (showConcierge) {
        return <ConciergeDetailPage onBack={() => setShowConcierge(false)} />;
    }

    return (
        <div className="bg-primary min-h-screen flex flex-col relative">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-secondary">
                <FiBell className="w-6 h-6 text-white" />
                <div className="font-bold text-lg text-white">メッセージ一覧</div>
                <div className="w-6 h-6" /> {/* Placeholder for right icon */}
            </div>
            {/* Campaign banner */}
            <div className="bg-primary px-4 py-2 border-b border-secondary">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-sm flex items-center p-3 text-white">
                    <div className="flex-1">
                        <div className="text-sm font-bold">2/18 | 春のW紹介キャンペーン</div>
                        <div className="text-xs">最大30,000Pの紹介クーポンがもらえる!?</div>
                    </div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
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
                {/* Concierge Chat - Always show at top */}
                <ConciergeChat 
                    onClick={() => setShowConcierge(true)}
                />
                
                {selectedTab === 'all' ? (
                    chats.length === 0 ? (
                        <div className="text-white text-center py-8">グループチャットがありません</div>
                    ) : (
                        chats.map(chat => (
                            <button key={chat.id} className="w-full" onClick={() => setShowChat(chat.id)}>
                                <div className="flex items-center bg-primary rounded-lg shadow-sm p-3 relative border border-secondary">
                                    <img
                                        src="/assets/avatar/1.jpg"
                                        alt="avatar"
                                        className="w-12 h-12 rounded-full mr-3 border border-secondary"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            <span className="font-bold text-white text-base mr-2">グループチャット {chat.id}</span>
                                        </div>
                                        <div className="text-sm text-white">ゲスト: {chat.guest_id}, キャスト: {chat.cast_id}</div>
                                    </div>
                                </div>
                            </button>
                        ))
                    )
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="text-white text-center py-8">お気に入りのキャストがいません</div>
                    </div>
                )}
            </div>
            
            {/* Floating Action Button for Gifts */}
            <div className="fixed bottom-20 right-4 z-50">
                <button className="bg-orange-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors">
                    <div className="text-center">
                        <div className="text-lg">🎁</div>
                        <div className="text-xs font-bold">まとめてギフト</div>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default CastMessage; 