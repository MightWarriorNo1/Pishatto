import React, { useState, useEffect, useMemo } from 'react';
import { FiBell, FiStar, FiSearch, FiCheckCircle, FiFilter } from 'react-icons/fi';
import ChatScreen from './ChatScreen';
import GroupChatScreen from './GroupChatScreen';
import ConciergeChat from '../ConciergeChat';
import ConciergeDetailPage from '../../pages/ConciergeDetailPage';
import { useChatRefresh } from '../../contexts/ChatRefreshContext';
import { getNotifications, markNotificationRead, getCastProfileById, favoriteChat, unfavoriteChat, getFavoriteChats, isChatFavorited, markChatMessagesRead } from '../../services/api';
import { useGuestChats, useGuestFavorites, useFavoriteChat, useUnfavoriteChat } from '../../hooks/useQueries';
import { useUser } from '../../contexts/UserContext';
import { useNotificationSettings } from '../../contexts/NotificationSettingsContext';
import { useNotifications } from '../../hooks/useRealtime';
import NotificationScreen from './NotificationScreen';
import Spinner from '../ui/Spinner';

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
    const [messageNotifications, setMessageNotifications] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterAge, setFilterAge] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [castProfiles, setCastProfiles] = useState<{ [key: number]: any }>({});
    const [showNotification, setShowNotification] = useState(false);
    const [showConcierge, setShowConcierge] = useState(false);
    const [currentChat, setCurrentChat] = useState<any>(null);
    const { user } = useUser();
    const { refreshKey } = useChatRefresh();
    const { isNotificationEnabled } = useNotificationSettings();

    // React Query hooks
    const { data: chats = [], isLoading } = useGuestChats(userId);
    const { data: favoritesData } = useGuestFavorites(user?.id || 0);
    const favoritedChatIds = new Set<number>((favoritesData?.chats || []).map((chat: any) => chat.id));
    
    // Mutation hooks
    const favoriteChatMutation = useFavoriteChat();
    const unfavoriteChatMutation = useUnfavoriteChat();

    // Notify parent when concierge state changes
    useEffect(() => {
        onConciergeStateChange?.(showConcierge);
    }, [showConcierge, onConciergeStateChange]);

    // Fetch cast profiles when chats change
    useEffect(() => {
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

            Promise.all(profilePromises).then(results => {
                const profilesMap: { [key: number]: any } = {};
                results.forEach(({ castId, profile }) => {
                    if (profile) {
                        profilesMap[castId] = profile;
                    }
                });
                setCastProfiles(profilesMap);
            });
        }
    }, [chats]);

    // Fetch message notifications
    useEffect(() => {
        if (user) {
            getNotifications('guest', user.id).then((notifications) => {
                const messageNotifs = (notifications || []).filter((n: any) => n.type === 'message');
                setMessageNotifications(messageNotifs);
            });
        }
    }, [user]);



    // Filter chats based on search query, age filter, and notification settings
    const filteredChats = useMemo(() => chats.filter((chat: any) => {
        if (!isNotificationEnabled('messages') && !chat.is_concierge_chat) {
            return false;
        }

        // If concierge messages are disabled, hide concierge chats
        if (!isNotificationEnabled('concierge_messages') && chat.is_concierge_chat) {
            return false;
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            
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
        }

        // Filter by age if specified
        if (filterAge.trim()) {
            const castProfile = castProfiles[chat.cast_id];
            if (castProfile) {
                const age = (new Date().getFullYear() - castProfile.cast.birth_year).toString();
                if (!age.includes(filterAge.trim())) return false;
            }
        }

        return true;
    }), [chats, isNotificationEnabled, searchQuery, filterAge, castProfiles]);

    // Filter favorite chats based on search query, age filter, and notification settings
    const filteredFavoriteChats = useMemo(() => chats.filter((chat: any) => {
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

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            
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
        }

        // Filter by age if specified
        if (filterAge.trim()) {
            const castProfile = castProfiles[chat.cast_id];
            if (castProfile) {
                const age = (new Date().getFullYear() - castProfile.cast.birth_year).toString();
                if (!age.includes(filterAge.trim())) return false;
            }
        }

        return true;
    }), [chats, favoritedChatIds, isNotificationEnabled, searchQuery, filterAge, castProfiles]);

    // Sort chats to show unread first
    const sortedFilteredChats = useMemo(() => {
        return [...filteredChats].sort((a, b) => (b?.unread || 0) - (a?.unread || 0));
    }, [filteredChats]);
    const sortedFilteredFavoriteChats = useMemo(() => {
        return [...filteredFavoriteChats].sort((a, b) => (b?.unread || 0) - (a?.unread || 0));
    }, [filteredFavoriteChats]);

    // Counts for tabs
    const allCount = filteredChats.length;
    const favoriteCount = filteredFavoriteChats.length;
    // Handle star toggle
    const handleStarToggle = async (chatId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent chat opening
        if (!user) return;

        try {
            if (favoritedChatIds.has(chatId)) {
                await unfavoriteChatMutation.mutateAsync({ userId: user.id, chatId });
            } else {
                await favoriteChatMutation.mutateAsync({ userId: user.id, chatId });
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

    // Mark all messages as read
    const handleMarkAllAsRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            // Mark all notifications as read
            await Promise.all(
                messageNotifications.map((n: any) => markNotificationRead(n.id))
            );
            // Mark chats unread to 0 on server
            const chatsWithUnread = chats.filter((c: any) => (c.unread || 0) > 0);
            await Promise.all(
                chatsWithUnread.map((c: any) => markChatMessagesRead(c.id, userId, 'guest'))
            );
            setMessageNotifications([]);
            onNotificationCountChange?.(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

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
            const chat = chats.find((c: any) => c.id === showChat);
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
            <div className="fixed max-w-md mx-auto top-0 left-0 right-0 flex items-center justify-between px-4 py-3 border-b border-secondary bg-primary">
                <button
                    className="relative p-1"
                    aria-label="通知を開く"
                    onClick={() => setShowNotification(true)}
                >
                    <FiBell className="w-6 h-6 text-white" />
                    {messageNotifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center font-bold">
                            {messageNotifications.length}
                        </span>
                    )}
                </button>
                <div className="font-bold text-lg text-white">メッセージ一覧</div>
                <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1 text-xs font-bold text-white bg-secondary/80 hover:bg-secondary px-2 py-1 rounded-full border border-secondary"
                    aria-label="すべて既読にする"
                >
                    <FiCheckCircle className="w-4 h-4" />
                    <span>すべて既読</span>
                </button>
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
                    className={`px-4 py-1 rounded-full font-bold text-sm mr-2 flex items-center gap-2 ${selectedTab === 'all' ? 'bg-secondary text-white' : 'bg-primary text-white border border-secondary'}`}
                    onClick={() => setSelectedTab('all')}
                >
                    すべて
                    <span className="text-[10px] font-bold bg-primary text-white border border-secondary rounded-full px-2 py-[2px]">
                        {allCount}
                    </span>
                </button>
                <button
                    className={`px-4 py-1 rounded-full font-bold text-sm flex items-center gap-2 ${selectedTab === 'favorite' ? 'bg-secondary text-white' : 'bg-primary text-white border border-secondary'}`}
                    onClick={() => setSelectedTab('favorite')}
                >
                    お気に入り
                    <span className="text-[10px] font-bold bg-primary text-white border border-secondary rounded-full px-2 py-[2px]">
                        {favoriteCount}
                    </span>
                </button>
            </div>
            {/* Search bar */}
            <div className="px-4 mt-3">
                <div className="flex items-center">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="ニックネームで検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-secondary text-white rounded-lg border-none outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                        />
                        {searchQuery && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                    {filteredChats.length}/{chats.length}
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`ml-2 p-2 rounded-lg transition-colors ${
                            showFilters || filterAge ? 'bg-secondary text-white' : 'bg-secondary/50 text-gray-400'
                        }`}
                        title="フィルター"
                    >
                        <FiFilter size={20} />
                    </button>
                </div>
                
                {/* Age Filter - Expandable */}
                {showFilters && (
                    <div className="mt-2">
                        <div className="flex items-center">
                            <input
                                type="text"
                                placeholder="年齢で検索 (例: 20, 30)"
                                value={filterAge}
                                onChange={(e) => setFilterAge(e.target.value)}
                                className="flex-1 px-3 py-2 bg-secondary text-white rounded-lg border-none outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                            />
                            {(searchQuery || filterAge) && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterAge('');
                                    }}
                                    className="ml-2 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                                    title="フィルターをクリア"
                                >
                                    クリア
                                </button>
                            )}
                        </div>
                        {filterAge && (
                            <div className="mt-2 text-xs text-gray-400">
                                年齢フィルター: {filterAge} ({filteredChats.length}件)
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Loading indicator */}
            {isLoading ? (
                <Spinner />
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
                        sortedFilteredChats.length === 0 ? (
                            <div className="text-white text-center py-8">
                                {searchQuery.trim() ? '検索結果がありません' : 'グループチャットがありません'}
                            </div>
                        ) : (
                            sortedFilteredChats.map(chat => {
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
                                        return getFirstAvatarUrl(chat.casts[0]?.avatar);
                                    } else if (chat.is_group_chat && (!chat.casts || chat.casts.length === 0)) {
                                        return '/assets/avatar/female.png';
                                    }
                                    return getAvatarSrc();
                                };

                                const isUnread = (chat.unread || 0) > 0;
                                return (
                                    <div key={chat.id} className="relative">
                                        <button
                                            className={`w-full text-left`}
                                            onClick={async () => {
                                                setShowChat(chat.id);
                                                setCurrentChat(chat); 
                                                if (chatNotif) {
                                                    await markNotificationRead(chatNotif.id);
                                                    setMessageNotifications(prev => prev.filter(n => n.id !== chatNotif.id));
                                                }
                                                // Mark messages as read when entering any chat
                                                await markChatMessagesRead(chat.id, userId, 'guest');
                                            }}
                                        >
                                            <div className={`flex items-center rounded-lg shadow-sm p-3 relative border ${isUnread ? 'bg-white/10 border-secondary' : 'bg-white/10 border-secondary'} hover:bg-secondary/30 transition-colors`}>
                                                <img
                                                    src={getDisplayAvatar()}
                                                    alt="avatar"
                                                    className={`w-12 h-12 rounded-full mr-3 border ${isFavorited ? 'ring-2 ring-yellow-400 border-yellow-400' : 'border-secondary'}`}
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
                                            aria-label={isFavorited ? 'お気に入り解除' : 'お気に入りに追加'}
                                            aria-pressed={isFavorited}
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
                        sortedFilteredFavoriteChats.length === 0 ? (
                            <div className="text-white text-center py-8">
                                {searchQuery.trim() ? '検索結果がありません' : 'お気に入りのチャットがありません'}
                            </div>
                        ) : (
                            sortedFilteredFavoriteChats.map(chat => {
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

                                const isUnread = (chat.unread || 0) > 0;
                                return (
                                    <div key={chat.id} className="relative">
                                        <button
                                            className={`w-full text-left`}
                                            onClick={async () => {
                                                setShowChat(chat.id);
                                                setCurrentChat(chat); // Set current chat for GroupChatScreen
                                                if (chatNotif) {
                                                    await markNotificationRead(chatNotif.id);
                                                    setMessageNotifications(prev => prev.filter(n => n.id !== chatNotif.id));
                                                }
                                                // Mark messages as read when entering any chat
                                                await markChatMessagesRead(chat.id, userId, 'guest');
                                            }}
                                        >
                                            <div className={`flex items-center rounded-lg shadow-sm p-3 relative border ${isUnread ? 'bg-secondary/20 border-secondary' : 'bg-primary border-secondary'} hover:bg-secondary/30 transition-colors`}>
                                                <img
                                                    src={getDisplayAvatar()}
                                                    alt="avatar"
                                                    className={`w-12 h-12 rounded-full mr-3 border ${isFavorited ? 'ring-2 ring-yellow-400 border-yellow-400' : 'border-secondary'}`}
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
                                            aria-label={isFavorited ? 'お気に入り解除' : 'お気に入りに追加'}
                                            aria-pressed={isFavorited}
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