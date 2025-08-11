import React, { useState, useEffect } from 'react';
import { FiBell, FiStar } from 'react-icons/fi';
import ChatScreen from './ChatScreen';
import GroupChatScreen from './GroupChatScreen';
import ConciergeChat from '../ConciergeChat';
import ConciergeDetailPage from '../../pages/ConciergeDetailPage';
import { useChatRefresh } from '../../contexts/ChatRefreshContext';
import { getGuestChats, getNotifications, markNotificationRead, getCastProfileById, favoriteChat, unfavoriteChat, getFavoriteChats, isChatFavorited, markChatMessagesRead } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { useNotificationSettings } from '../../contexts/NotificationSettingsContext';
import { useNotifications } from '../../hooks/useRealtime';
import NotificationScreen from './NotificationScreen';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
interface MessageScreenProps {
    showChat: number | null;
    setShowChat: (show: number | null) => void;
    onNotificationCountChange?: (count: number) => void;
    activeBottomTab?: 'search' | 'message' | 'call' | 'tweet' | 'mypage';
    onConciergeStateChange?: (isShown: boolean) => void;
}

const MessageScreen: React.FC<MessageScreenProps & { userId: number }> = ({ showChat, setShowChat, userId, onNotificationCountChange, activeBottomTab, onConciergeStateChange }) => {
    const [selectedTab, setSelectedTab] = useState<'all' | 'favorite'>('all');
    const [chats, setChats] = useState<any[]>([]);
    const [messageNotifications, setMessageNotifications] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [castProfiles, setCastProfiles] = useState<{ [key: number]: any }>({});
    const [favoritedChatIds, setFavoritedChatIds] = useState<Set<number>>(new Set());
    const [showNotification, setShowNotification] = useState(false);
    const [showConcierge, setShowConcierge] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentChat, setCurrentChat] = useState<any>(null);
    const { user } = useUser();
    const { refreshKey } = useChatRefresh();
    const { isNotificationEnabled } = useNotificationSettings();

    // Notify parent when concierge state changes
    useEffect(() => {
        onConciergeStateChange?.(showConcierge);
    }, [showConcierge, onConciergeStateChange]);

    useEffect(() => {
        const loadChatsAndFavorites = async () => {
            setIsLoading(true);
            try {
                // Fetch chats and favorites in parallel
                const [chatsData, favoritesData] = await Promise.all([
                    getGuestChats(userId, 'guest'),
                    user ? getFavoriteChats(user.id) : Promise.resolve({ chats: [] })
                ]);

                const chats = chatsData || [];
                setChats(chats);

                // Set favorited chat IDs
                const favoriteChats = favoritesData.chats || [];
                const favoritedIds = new Set<number>(favoriteChats.map((chat: any) => chat.id as number));
                setFavoritedChatIds(favoritedIds);

                // Also check favorite status for each chat to ensure accuracy
                if (user && chats.length > 0) {
                    const favoriteStatusPromises = chats.map(async (chat: any) => {
                        try {
                            const status = await isChatFavorited(chat.id, user.id);
                            return { chatId: chat.id, favorited: status.favorited };
                        } catch (error) {
                            console.error(`Error checking favorite status for chat ${chat.id}:`, error);
                            return { chatId: chat.id, favorited: false };
                        }
                    });

                    const favoriteStatuses = await Promise.all(favoriteStatusPromises);
                    const actualFavoritedIds = new Set<number>(
                        favoriteStatuses
                            .filter(status => status.favorited)
                            .map(status => status.chatId)
                    );
                    setFavoritedChatIds(actualFavoritedIds);
                }

                // Fetch cast profiles for each chat
                if (chats.length > 0) {
                    const uniqueCastIds = Array.from(new Set(chats.map((chat: any) => chat.cast_id).filter(Boolean))) as number[];
                    const profilePromises = uniqueCastIds.map((castId: number) =>
                        getCastProfileById(castId)
                            .then(profile => ({ castId, profile }))
                            .catch(error => {
                                console.error(`Failed to fetch cast profile for cast ID ${castId}:`, error);
                                return { castId, profile: null };
                            })
                    );

                    await Promise.all(profilePromises).then(results => {
                        const profilesMap: { [key: number]: any } = {};
                        results.forEach(({ castId, profile }) => {
                            if (profile) {
                                profilesMap[castId] = profile;
                            }
                        });
                        setCastProfiles(profilesMap);
                    });
                }
            } catch (error) {
                console.error('Error loading chats and favorites:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadChatsAndFavorites();

        // Fetch message notifications
        if (user) {
            getNotifications('guest', user.id).then((notifications) => {
                const messageNotifs = (notifications || []).filter((n: any) => n.type === 'message');
                setMessageNotifications(messageNotifs);
            });
        }
    }, [userId, refreshKey, user]);

    // Filter chats based on search query and notification settings
    const filteredChats = chats.filter(chat => {
        // Filter by notification settings first
        // If messages are disabled, hide all non-concierge chats
        if (!isNotificationEnabled('messages') && !chat.is_concierge_chat) {
            return false;
        }

        // If concierge messages are disabled, hide concierge chats
        if (!isNotificationEnabled('concierge_messages') && chat.is_concierge_chat) {
            return false;
        }

        // Then filter by search query
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();

        // Filter by nickname
        const nickname = chat.cast_nickname?.toLowerCase() || '';
        if (nickname.includes(query)) return true;

        // Filter by age using cast profile
        const castProfile = castProfiles[chat.cast_id];
        if (castProfile) {
            const age = (new Date().getFullYear() - castProfile.cast.birth_year).toString();
            if (age.includes(query)) return true;
        }

        return false;
    });

    // Filter favorite chats based on search query and notification settings
    const filteredFavoriteChats = chats.filter(chat => {
        // First filter by favorite status
        if (!favoritedChatIds.has(chat.id)) return false;

        // Filter by notification settings
        // If messages are disabled, hide all non-concierge chats
        if (!isNotificationEnabled('messages') && !chat.is_concierge_chat) {
            return false;
        }

        // If concierge messages are disabled, hide concierge chats
        if (!isNotificationEnabled('concierge_messages') && chat.is_concierge_chat) {
            return false;
        }

        // Then filter by search query
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();

        // Filter by nickname
        const nickname = chat.cast_nickname?.toLowerCase() || '';
        if (nickname.includes(query)) return true;

        // Filter by age using cast profile
        const castProfile = castProfiles[chat.cast_id];
        if (castProfile) {
            const age = (new Date().getFullYear() - castProfile.cast.birth_year).toString();
            if (age.includes(query)) return true;
        }

        return false;
    });
    // Handle star toggle
    const handleStarToggle = async (chatId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent chat opening
        if (!user) return;

        try {
            if (favoritedChatIds.has(chatId)) {
                await unfavoriteChat(user.id, chatId);
                setFavoritedChatIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(chatId);
                    return newSet;
                });
            } else {
                await favoriteChat(user.id, chatId);
                setFavoritedChatIds(prev => new Set(Array.from(prev).concat([chatId])));
            }
        } catch (error) {
            console.error('Error toggling star:', error);
        }
    };

    // Ensure we always display the first avatar if multiple are provided
    const getFirstAvatarUrl = (avatar: string | null | undefined): string => {
        if (!avatar || typeof avatar !== 'string') return '/assets/avatar/female.png';
        const first = avatar
            .split(',')
            .map((item: string) => item.trim())
            .filter(Boolean)[0];
        return first ? `${API_BASE_URL}/${first}` : '/assets/avatar/female.png';
    };

    // Listen for real-time notifications
    useNotifications(user?.id ?? '', (notification) => {
        console.log("Notification", notification);
        if (notification.type === 'message') {
            setMessageNotifications((prev) => {
                const newNotifications = [notification, ...prev];
                if (activeBottomTab !== 'message') {
                    onNotificationCountChange?.(newNotifications.length);
                }
                return newNotifications;
            });
        }
    });

    // const handleNotificationClick = async (id: number) => {
    //     await markNotificationRead(id);
    //     setMessageNotifications((prev) => prev.filter((n) => n.id !== id));
    // };

    if (showChat) {
        if (currentChat && currentChat.is_group_chat) {
            return <GroupChatScreen
                groupId={currentChat.group_id}
                groupName={currentChat.group_name || 'Group Chat'}
                onBack={() => {
                    setShowChat(null);
                    setCurrentChat(null);
                }}
            />;
        } else {
            // Check if this is a group chat (has group_id) or individual chat
            const chat = chats.find(c => c.id === showChat);
            if (chat && chat.group_id) {
                return <GroupChatScreen groupId={chat.group_id} onBack={() => setShowChat(null)} />;
            } else {
                return <ChatScreen chatId={showChat} onBack={() => setShowChat(null)} />;
            }
        }
    }

    if (showConcierge) {
        return <ConciergeDetailPage onBack={() => setShowConcierge(false)} />;
    }

    if (showNotification) return <NotificationScreen onBack={() => setShowNotification(false)} />;

    return (
        <div className="bg-gradient-to-br from-primary via-primary to-secondary min-h-screen flex flex-col pb-24">
            {/* Top bar */}
            <div className="fixed max-w-md mx-auto top-0 left-0 right-0 flex items-center justify-between px-4 py-3 border-b border-secondary cursor-pointer bg-primary" onClick={() => setShowNotification(true)}>
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
            {/* Tabs */}
            <div className="flex items-center px-4 pt-16">
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-full border border-secondary bg-primary text-white text-sm placeholder-red-500"
                    placeholder="ニックネーム・年齢で検索"
                />
            </div>
            {/* Loading indicator */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <div className="text-lg">読み込み中...</div>
                    </div>
                </div>
            ) : (
                /* Message list */
                <div className="px-4 mt-4">
                    {/* Concierge Chat - Show only if concierge messages are enabled */}
                    {isNotificationEnabled('concierge_messages') && (
                        <ConciergeChat
                            onClick={() => setShowConcierge(true)}
                        />
                    )}

                    {selectedTab === 'all' ? (
                        filteredChats.length === 0 ? (
                            <div className="text-white text-center py-8">
                                {searchQuery.trim() ? '検索結果がありません' : 'グループチャットがありません'}
                            </div>
                        ) : (
                            filteredChats.map(chat => {
                                // Find notification for this chat
                                const chatNotif = messageNotifications.find(n => n.chat_id === chat.id);
                                const isFavorited = favoritedChatIds.has(chat.id);

                                // Get the first avatar from comma-separated string
                                const getAvatarSrc = () => getFirstAvatarUrl(chat.avatar);

                                // Handle group chat display
                                const getDisplayName = () => {
                                    if (chat.is_group_chat && chat.group_name) {
                                        // Check if this is a guest-only group (no casts assigned yet)
                                        if (chat.casts && chat.casts.length === 0) {
                                            return chat.group_name + ' (キャスト選択待ち)';
                                        }
                                        return chat.group_name;
                                    }
                                    return chat.cast_nickname || `グループチャット ${chat.id}`;
                                };

                                const getDisplayAvatar = () => {
                                    if (chat.is_group_chat && chat.casts && chat.casts.length > 0) {
                                        // For group chats, show the first cast avatar from possibly comma-separated list
                                        return getFirstAvatarUrl(chat.casts[0]?.avatar);
                                    } else if (chat.is_group_chat && (!chat.casts || chat.casts.length === 0)) {
                                        // For guest-only groups, show a default avatar
                                        return '/assets/avatar/female.png';
                                    }
                                    return getAvatarSrc();
                                };

                                return (
                                    <div key={chat.id} className="relative">
                                        <button
                                            className="w-full"
                                            onClick={async () => {
                                                setShowChat(chat.id);
                                                setCurrentChat(chat); // Set current chat for GroupChatScreen
                                                // Immediately set unread to 0 for this chat in local state
                                                setChats(prevChats => prevChats.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
                                                if (chatNotif) {
                                                    await markNotificationRead(chatNotif.id);
                                                    setMessageNotifications(prev => prev.filter(n => n.id !== chatNotif.id));
                                                }
                                                // Mark messages as read when entering any chat
                                                await markChatMessagesRead(chat.id, userId, 'guest');
                                            }}
                                        >
                                            <div className="flex items-center bg-primary rounded-lg shadow-sm p-3 relative border border-secondary">
                                                <img
                                                    src={getDisplayAvatar()}
                                                    alt="avatar"
                                                    className="w-12 h-12 rounded-full mr-3 border border-secondary"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center">
                                                        <span className="font-bold text-white text-base mr-2">
                                                            {getDisplayName()}
                                                        </span>
                                                        {chat.is_group_chat && chat.casts && chat.casts.length > 1 && (
                                                            <span className="ml-2 bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                                                {chat.casts.length}人
                                                            </span>
                                                        )}
                                                        {chat.unread > 0 && (
                                                            <span className="ml-2 bg-secondary text-white text-xs font-bold rounded-full px-2 py-0.5">
                                                                {chat.unread}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-white">
                                                        {chat.is_group_chat && chat.casts && chat.casts.length > 1 && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                参加者: {chat.casts.map((cast: any) => cast.nickname).join(', ')}
                                                            </div>
                                                        )}
                                                        {chat.is_group_chat && (!chat.casts || chat.casts.length === 0) && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                キャストが選択されるまでお待ちください
                                                            </div>
                                                        )}
                                                        {chat.created_at && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                作成日: {new Date(chat.created_at).toLocaleDateString('ja-JP')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                        {/* Star button */}
                                        <button
                                            onClick={(e) => handleStarToggle(chat.id, e)}
                                            className="absolute top-2 right-2 p-1 rounded-full bg-primary border border-secondary hover:bg-secondary transition-colors"
                                        >
                                            <FiStar
                                                className={`w-4 h-4 ${isFavorited ? 'text-yellow-400 fill-current' : 'text-white'}`}
                                            />
                                        </button>
                                    </div>
                                );
                            })
                        )
                    ) : (
                        filteredFavoriteChats.length === 0 ? (
                            <div className="text-white text-center py-8">
                                {searchQuery.trim() ? '検索結果がありません' : 'お気に入りのチャットがありません'}
                            </div>
                        ) : (
                            filteredFavoriteChats.map(chat => {
                                // Find notification for this chat
                                const chatNotif = messageNotifications.find(n => n.chat_id === chat.id);
                                const isFavorited = favoritedChatIds.has(chat.id);

                                // Get the first avatar from comma-separated string
                                const getAvatarSrc = () => getFirstAvatarUrl(chat.avatar);

                                // Handle group chat display
                                const getDisplayName = () => {
                                    if (chat.is_group_chat && chat.group_name) {
                                        // Check if this is a guest-only group (no casts assigned yet)
                                        if (chat.casts && chat.casts.length === 0) {
                                            return chat.group_name + ' (キャスト選択待ち)';
                                        }
                                        return chat.group_name;
                                    }
                                    return chat.cast_nickname || `グループチャット ${chat.id}`;
                                };

                                const getDisplayAvatar = () => {
                                    if (chat.is_group_chat && chat.casts && chat.casts.length > 0) {
                                        // For group chats, show the first cast avatar from possibly comma-separated list
                                        return getFirstAvatarUrl(chat.casts[0]?.avatar);
                                    } else if (chat.is_group_chat && (!chat.casts || chat.casts.length === 0)) {
                                        // For guest-only groups, show a default avatar
                                        return '/assets/avatar/female.png';
                                    }
                                    return getAvatarSrc();
                                };

                                return (
                                    <div key={chat.id} className="relative">
                                        <button
                                            className="w-full"
                                            onClick={async () => {
                                                setShowChat(chat.id);
                                                setCurrentChat(chat); // Set current chat for GroupChatScreen
                                                // Immediately set unread to 0 for this chat in local state
                                                setChats(prevChats => prevChats.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
                                                if (chatNotif) {
                                                    await markNotificationRead(chatNotif.id);
                                                    setMessageNotifications(prev => prev.filter(n => n.id !== chatNotif.id));
                                                }
                                                // Mark messages as read when entering any chat
                                                await markChatMessagesRead(chat.id, userId, 'guest');
                                            }}
                                        >
                                            <div className="flex items-center bg-primary rounded-lg shadow-sm p-3 relative border border-secondary">
                                                <img
                                                    src={getDisplayAvatar()}
                                                    alt="avatar"
                                                    className="w-12 h-12 rounded-full mr-3 border border-secondary"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center">
                                                        <span className="font-bold text-white text-base mr-2">
                                                            {getDisplayName()}
                                                        </span>
                                                        {chat.is_group_chat && chat.casts && chat.casts.length > 1 && (
                                                            <span className="ml-2 bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                                                {chat.casts.length}人
                                                            </span>
                                                        )}
                                                        {chat.unread > 0 && (
                                                            <span className="ml-2 bg-secondary text-white text-xs font-bold rounded-full px-2 py-0.5">
                                                                {chat.unread}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-white">
                                                        {chat.is_group_chat && chat.casts && chat.casts.length > 1 && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                参加者: {chat.casts.map((cast: any) => cast.nickname).join(', ')}
                                                            </div>
                                                        )}
                                                        {chat.is_group_chat && (!chat.casts || chat.casts.length === 0) && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                キャストが選択されるまでお待ちください
                                                            </div>
                                                        )}
                                                        {chat.created_at && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                作成日: {new Date(chat.created_at).toLocaleDateString('ja-JP')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                        {/* Star button */}
                                        <button
                                            onClick={(e) => handleStarToggle(chat.id, e)}
                                            className="absolute top-2 right-2 p-1 rounded-full bg-primary border border-secondary hover:bg-secondary transition-colors"
                                        >
                                            <FiStar
                                                className={`w-4 h-4 ${isFavorited ? 'text-yellow-400 fill-current' : 'text-white'}`}
                                            />
                                        </button>
                                    </div>
                                );
                            })
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default MessageScreen; 