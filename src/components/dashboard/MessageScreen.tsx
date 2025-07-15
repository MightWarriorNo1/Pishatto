import React from 'react';
import { FiBell } from 'react-icons/fi';
import ChatScreen from './ChatScreen';

interface MessageScreenProps {
    showChat: boolean;
    setShowChat: (show: boolean) => void;
}

const MessageScreen: React.FC<MessageScreenProps> = ({ showChat, setShowChat }) => {
    if (showChat) {
        return <ChatScreen onBack={() => setShowChat(false)} />;
    }
    return (
        <div className="bg-white min-h-screen flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <FiBell className="w-6 h-6 text-gray-400" />
                <div className="font-bold text-lg text-gray-700">メッセージ一覧</div>
                <div className="w-6 h-6" /> {/* Placeholder for right icon */}
            </div>
            {/* Campaign banner */}
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                <div className="bg-white rounded-lg shadow-sm flex items-center p-2">
                    <div className="bg-green-200 text-pink-600 font-bold rounded px-2 py-1 mr-2 text-xs">春のW紹介キャンペーン</div>
                    <div className="text-orange-500 text-xs font-bold mr-2">2/18</div>
                    <div className="text-gray-700 text-xs">最大30,000Pの紹介クーポンがもらえる!?</div>
                </div>
            </div>
            {/* Tabs */}
            <div className="flex items-center px-4 mt-2">
                <button className="px-4 py-1 rounded-full bg-orange-500 text-white font-bold text-sm mr-2">すべて</button>
                <button className="px-4 py-1 rounded-full bg-gray-100 text-gray-400 font-bold text-sm">お気に入り</button>
            </div>
            {/* Search bar */}
            <div className="px-4 mt-3">
                <input
                    type="text"
                    className="w-full px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-500 text-sm"
                    placeholder="ニックネームで検索"
                    disabled
                />
            </div>
            {/* Message list */}
            <div className="px-4 mt-4">
                <button className="w-full" onClick={() => setShowChat(true)}>
                    <div className="flex items-center bg-white rounded-lg shadow-sm p-3 relative">
                        <img
                            src="/assets/avatar/1.jpg"
                            alt="avatar"
                            className="w-12 h-12 rounded-full mr-3 border border-gray-200"
                        />
                        <div className="flex-1">
                            <div className="flex items-center">
                                <span className="font-bold text-gray-700 text-base mr-2">pishattoコンシェルジュ 11歳</span>
                                <span className="bg-orange-400 text-white text-[10px] rounded px-1 ml-1">P</span>
                            </div>
                            <div className="text-sm text-gray-500">メッセージが届いています</div>
                        </div>
                        <div className="flex flex-col items-end ml-2">
                            <span className="text-xs text-gray-400">22:02</span>
                            <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 mt-1">4</span>
                        </div>
                    </div>
                </button>
            </div>
            {/* Gift button */}
            <div className="fixed left-1/2 -translate-x-1/2 bottom-20 z-30 text-white rounded-full px-6 py-4  font-bold text-lg flex items-center">
                <button className="flex flex-col items-center">
                    <span className="bg-orange-400 text-white rounded-full px-3 py-2 text-xs font-bold">まとめてギフト</span>
                </button>
            </div>
        </div>
    );
};

export default MessageScreen; 