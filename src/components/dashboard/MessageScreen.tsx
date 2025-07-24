import React, { useState, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import ChatScreen from './ChatScreen';
import { useNavigate } from 'react-router-dom';
import { useChatRefresh } from '../../contexts/ChatRefreshContext';
import { getGuestChats, getNotifications, markNotificationRead } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { useNotifications } from '../../hooks/useRealtime';

interface MessageScreenProps {
    showChat: number | null;
    setShowChat: (show: number | null) => void;
    onNotificationCountChange?: (count: number) => void;
}

const MessageScreen: React.FC<MessageScreenProps & { userId: number }> = ({ showChat, setShowChat, userId, onNotificationCountChange }) => {
    const [selectedTab, setSelectedTab] = useState<'all' | 'favorite'>('all');
    const [chats, setChats] = useState<any[]>([]);
    const [messageNotifications, setMessageNotifications] = useState<any[]>([]);
    const { user } = useUser();
    const { refreshKey } = useChatRefresh();
    useEffect(() => {
        getGuestChats(userId)
            .then(chats => setChats(chats || []));
        // Fetch message notifications
        if (user) {
            getNotifications('guest', user.id).then((notifications) => {
                const messageNotifs = (notifications || []).filter((n: any) => n.type === 'message');
                setMessageNotifications(messageNotifs);
                // Only call onNotificationCountChange if not in message tab
                // (Dashboard.tsx now handles clearing count on tab switch)
            });
        }
    }, [userId, refreshKey, user]);

    // Listen for real-time notifications
    useNotifications(user?.id ?? '', (notification) => {
        if (notification.type === 'message') {
            setMessageNotifications((prev) => {
                const newNotifications = [notification, ...prev];
                onNotificationCountChange?.(newNotifications.length);
                return newNotifications;
            });
        }
    });

    // const handleNotificationClick = async (id: number) => {
    //     await markNotificationRead(id);
    //     setMessageNotifications((prev) => prev.filter((n) => n.id !== id));
    // };

    if (showChat) {
        return <ChatScreen chatId={showChat} onBack={() => setShowChat(null)} />;
    }

    return (
        <div className="bg-primary min-h-screen flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-secondary">
                <FiBell className="w-6 h-6 text-white" />
                <div className="font-bold text-lg text-white">メッセージ一覧</div>
                <div className="w-6 h-6" /> {/* Placeholder for right icon */}
            </div>
            {/* Message notifications section */}
            {/* {messageNotifications.length > 0 && (
                <div className="bg-yellow-50 px-4 py-2 border-b border-secondary">
                    <div className="font-bold mb-1 text-yellow-800">新着メッセージ通知</div>
                    {messageNotifications.map((n) => (
                        <div key={n.id} className="mb-2 p-2 bg-yellow-100 rounded cursor-pointer" onClick={() => handleNotificationClick(n.id)}>
                            <div className="text-sm text-yellow-900">{n.message}</div>
                            <div className="text-xs text-yellow-700">{new Date(n.created_at).toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            )} */}
            {/* Campaign banner */}
            {/* <div className="bg-primary px-4 py-2 border-b border-secondary">
                <div className="bg-primary rounded-lg shadow-sm flex items-center p-2">
                    <img src="/assets/icons/logo_call.png" alt='logo_call' />
                </div>
            </div> */}
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
                    chats.length === 0 ? (
                        <div className="text-white text-center py-8">グループチャットがありません</div>
                    ) : (
                        // chats.map(chat => (
                        //     <button key={chat.id} className="w-full" onClick={() => setShowChat(chat.id)}>
                        //         <div className="flex items-center bg-primary rounded-lg shadow-sm p-3 relative border border-secondary">
                        //             <img
                        //                 src={chat.avatar || '/assets/avatar/1.jpg'}
                        //                 alt="avatar"
                        //                 className="w-12 h-12 rounded-full mr-3 border border-secondary"
                        //             />
                        //             <div className="flex-1">
                        //                 <div className="flex items-center">
                        //                     <span className="font-bold text-white text-base mr-2">グループチャット {chat.id}</span>
                        //                     {chat.unread > 0 && (
                        //                         <span className="ml-2 bg-secondary text-white text-xs font-bold rounded-full px-2 py-0.5">
                        //                             {chat.unread}
                        //                         </span>
                        //                     )}
                        //                 </div>
                        //                 <div className="text-sm text-white">ゲスト: {chat.guest_id}, キャスト: {chat.cast_id}</div>
                        //             </div>
                        //             <div className="text-sm text-white bg-secondary rounded-full px-2 py-0.5">
                        //                 {messageNotifications.length}
                        //             </div>
                        //         </div>
                        //     </button>
                        // ))
                        chats.map(chat => {
                            // Find notification for this chat
                            const chatNotif = messageNotifications.find(n => n.chat_id === chat.id);

                            return (
                                <button
                                    key={chat.id}
                                    className="w-full"
                                    onClick={async () => {
                                        setShowChat(chat.id);
                                        if (chatNotif) {
                                            await markNotificationRead(chatNotif.id);
                                            setMessageNotifications(prev => prev.filter(n => n.id !== chatNotif.id));
                                        }
                                    }}
                                >
                                    <div className="flex items-center bg-primary rounded-lg shadow-sm p-3 relative border border-secondary">
                                        <img
                                            src={chat.avatar || '/assets/avatar/1.jpg'}
                                            alt="avatar"
                                            className="w-12 h-12 rounded-full mr-3 border border-secondary"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <span className="font-bold text-white text-base mr-2">グループチャット {chat.id}</span>
                                                {/* Show badge if notification exists */}
                                                {chatNotif && (
                                                    <span className="ml-2 bg-secondary text-white text-xs font-bold rounded-full px-2 py-0.5">
                                                        !
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-white">ゲスト: {chat.guest_id}, キャスト: {chat.cast_id}</div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="text-white text-center py-8">お気に入りのキャストがいません</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageScreen; 