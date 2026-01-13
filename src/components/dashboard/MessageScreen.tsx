import React, { useState, useEffect, useMemo } from 'react';
import { FiBell, FiStar, FiSearch, FiFilter } from 'react-icons/fi';
import ChatScreen from './ChatScreen';
import GroupChatScreen from './GroupChatScreen';
import ConciergeChat from '../ConciergeChat';
import ConciergeDetailPage from '../../pages/ConciergeDetailPage';
import { getNotifications, markNotificationRead, getCastProfileById, markChatMessagesRead } from '../../services/api';
import { useGuestChats, useGuestChatFavorites, useFavoriteChat, useUnfavoriteChat } from '../../hooks/useQueries';
import { useUser } from '../../contexts/UserContext';
import { useNotificationSettings } from '../../contexts/NotificationSettingsContext';
import { getFirstAvatarUrl } from '../../utils/avatar';
import { useNotifications, useGuestChatsRealtime, useUnreadMessageCount, useGroupChatsRealtime } from '../../hooks/useRealtime';
import { queryClient } from '../../lib/react-query';
import { queryKeys } from '../../lib/react-query';
import echo from '../../services/echo';
import NotificationScreen from './NotificationScreen';
import Spinner from '../ui/Spinner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';


const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Configure dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
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
    const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
    const { user } = useUser();
    const { isNotificationEnabled } = useNotificationSettings();

    // Get user timezone and format time function
    const userTz = dayjs.tz.guess();
    const formatTime = (timestamp: string) => {
        return dayjs.utc(timestamp).tz(userTz).format('YYYY-MM-DD HH:mm:ss');
    };

    // React Query hooks
    const { data: chats = [], isLoading } = useGuestChats(userId);
    const { data: chatFavoritesData } = useGuestChatFavorites(user?.id || 0);
    const favoritedChatIds = useMemo(() => new Set<number>((chatFavoritesData?.chats || []).map((chat: any) => chat.id)), [chatFavoritesData?.chats]);
    
    // Mutation hooks
    const favoriteChatMutation = useFavoriteChat();
    const unfavoriteChatMutation = useUnfavoriteChat();

    // Real-time connection status monitoring
    useEffect(() => {
        if (!echo.connector) return;

        const checkConnection = () => {
            if (echo.connector && 'pusher' in echo.connector) {
                const pusherConnector = echo.connector as any;
                const isConnected = pusherConnector.pusher?.connection?.state === 'connected';
                setIsRealtimeConnected(isConnected);
            }
        };

        // Check initial connection status
        checkConnection();

        // Monitor connection status changes
        if (echo.connector && 'pusher' in echo.connector) {
            const pusherConnector = echo.connector as any;
            if (pusherConnector.pusher?.connection) {
                pusherConnector.pusher.connection.bind('connected', () => {
                    console.log('MessageScreen: Reverb connected');
                    setIsRealtimeConnected(true);
                });

                pusherConnector.pusher.connection.bind('disconnected', () => {
                    console.log('MessageScreen: Reverb disconnected');
                    setIsRealtimeConnected(false);
                });

                pusherConnector.pusher.connection.bind('error', (error: any) => {
                    console.error('MessageScreen: Reverb connection error:', error);
                    setIsRealtimeConnected(false);
                });
            }
        }

        return () => {
            if (echo.connector && 'pusher' in echo.connector) {
                const pusherConnector = echo.connector as any;
                if (pusherConnector.pusher?.connection) {
                    pusherConnector.pusher.connection.unbind('connected');
                    pusherConnector.pusher.connection.unbind('disconnected');
                    pusherConnector.pusher.connection.unbind('error');
                }
            }
        };
    }, []);

    // Real-time hooks for immediate updates
    useGuestChatsRealtime(userId, (updatedChat) => {
        console.log('MessageScreen: Chat updated via real-time:', updatedChat);
        // Cache is automatically updated by the hook
        // Update notification count if needed
        if (activeBottomTab !== 'message' && updatedChat.unread > 0) {
            onNotificationCountChange?.(updatedChat.unread);
        }
    });

    // Real-time group chat updates for guest
    useGroupChatsRealtime(userId, 'guest', (groupChat) => {
        console.log('MessageScreen: Real-time group chat created:', groupChat);
        // The hook automatically updates the React Query cache
    });

    // Real-time unread message count updates
    useUnreadMessageCount(userId, 'guest', (totalUnread) => {
        console.log('MessageScreen: Total unread count updated:', totalUnread);
        // Update notification count for parent component
        if (activeBottomTab !== 'message') {
            onNotificationCountChange?.(totalUnread);
        }
    });

    // Enhanced real-time notifications with cache updates
    useNotifications(user?.id ?? '', (notification) => {
        console.log("MessageScreen: Notification received via real-time:", notification);
        
        if (notification.type === 'message') {
            // Update local state for immediate UI update
            setMessageNotifications((prev) => {
                const newNotifications = [notification, ...prev];
                if (activeBottomTab !== 'message') {
                    onNotificationCountChange?.(newNotifications.length);
                }
                return newNotifications;
            });

            // Update React Query cache for notifications
            queryClient.setQueryData(
                queryKeys.guest.notifications(Number(user?.id || 0)),
                (oldData: any) => {
                    if (!oldData) return [notification];
                    return [notification, ...oldData];
                }
            );

            // If this is a chat notification, update the chat's unread count in cache
            if (notification.chat_id) {
                queryClient.setQueryData(
                    queryKeys.guest.chats(userId),
                    (oldData: any) => {
                        if (!oldData) return oldData;
                        return oldData.map((chat: any) => 
                            chat.id === notification.chat_id 
                                ? { ...chat, unread: (chat.unread || 0) + 1 }
                                : chat
                        );
                    }
                );
            }
        }
    });

    // Real-time chat message updates for immediate unread count updates
    useEffect(() => {
        if (!userId) return;

        // Listen to all chat channels for this user
        const channels = chats.map((chat: any) => {
            if (chat.is_group_chat && chat.group_id) {
                return { type: 'group' as const, id: chat.group_id, chatId: chat.id };
            } else {
                return { type: 'individual' as const, id: chat.id, chatId: chat.id };
            }
        });

        const cleanupFunctions: (() => void)[] = [];
        
        channels.forEach(({ type, id, chatId }: { type: 'group' | 'individual', id: number, chatId: number }) => {
            const channelName = type === 'group' ? `group.${id}` : `chat.${id}`;
            const eventName = type === 'group' ? 'GroupMessageSent' : 'MessageSent';
            
            const channel = echo.channel(channelName);
            
            const handleNewMessage = (e: { message: any }) => {
                console.log(`MessageScreen: New message in ${type} chat ${id}:`, e.message);
                
                // Update React Query cache for chats to increment unread count
                queryClient.setQueryData(
                    queryKeys.guest.chats(userId),
                    (oldData: any) => {
                        if (!oldData) return oldData;
                        return oldData.map((chat: any) => 
                            chat.id === chatId 
                                ? { ...chat, unread: (chat.unread || 0) + 1 }
                                : chat
                        );
                    }
                );

                // Update notification count if not on message tab
                if (activeBottomTab !== 'message') {
                    const currentCount = messageNotifications.length;
                    onNotificationCountChange?.(currentCount + 1);
                }
            };

            channel.listen(`.${eventName}`, handleNewMessage);

            // Store cleanup function
            cleanupFunctions.push(() => {
                try {
                    channel.stopListening(`.${eventName}`);
                } catch (error) {
                    console.warn(`Error cleaning up channel ${channelName}:`, error);
                }
            });
        });

        // Return cleanup function
        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }, [chats, userId, activeBottomTab, onNotificationCountChange, messageNotifications.length]);

    // Real-time updates for when messages are marked as read
    useEffect(() => {
        if (!userId) return;

        const channel = echo.channel(`guest.${userId}`);
        
        const handleMessagesRead = (e: { chat_id: number, unread_count: number }) => {
            console.log('MessageScreen: Messages marked as read for chat:', e.chat_id, 'New unread count:', e.unread_count);
            
            // Update React Query cache for chats to reset unread count
            queryClient.setQueryData(
                queryKeys.guest.chats(userId),
                (oldData: any) => {
                    if (!oldData) return oldData;
                    return oldData.map((chat: any) => 
                        chat.id === e.chat_id 
                            ? { ...chat, unread: e.unread_count }
                            : chat
                    );
                }
            );

            // Update notification count if needed
            if (activeBottomTab !== 'message') {
                const totalUnread = chats.reduce((sum: number, chat: any) => sum + (chat.unread || 0), 0);
                onNotificationCountChange?.(totalUnread);
            }
        };

        const handleNewChat = (e: { chat: any }) => {
            console.log('MessageScreen: New chat created:', e.chat);
            
            // Update React Query cache for chats to add new chat
            queryClient.setQueryData(
                queryKeys.guest.chats(userId),
                (oldData: any) => {
                    if (!oldData) return [e.chat];
                    return [e.chat, ...oldData];
                }
            );

            // Update notification count if new chat has unread messages
            if (activeBottomTab !== 'message' && (e.chat.unread || 0) > 0) {
                const currentCount = messageNotifications.length;
                onNotificationCountChange?.(currentCount + e.chat.unread);
            }
        };

        const handleChatUpdated = (e: { chat: any }) => {
            console.log('MessageScreen: Chat updated:', e.chat);
            
            // Update React Query cache for chats to update existing chat
            queryClient.setQueryData(
                queryKeys.guest.chats(userId),
                (oldData: any) => {
                    if (!oldData) return oldData;
                    return oldData.map((chat: any) => 
                        chat.id === e.chat.id 
                            ? { ...chat, ...e.chat }
                            : chat
                    );
                }
            );

            // Update cast profiles if this chat has new cast information
            if (e.chat.cast_id && e.chat.cast_nickname) {
                setCastProfiles(prev => ({
                    ...prev,
                    [e.chat.cast_id]: {
                        cast: {
                            ...prev[e.chat.cast_id]?.cast,
                            nickname: e.chat.cast_nickname
                        }
                    }
                }));
            }
        };

        const handleFavoriteToggled = (e: { chat_id: number, is_favorited: boolean, user_id: number }) => {
            // Only handle favorites for the current user
            if (e.user_id !== userId) return;
            
            console.log('MessageScreen: Favorite toggled for chat:', e.chat_id, 'Favorited:', e.is_favorited);
            
            // Update React Query cache for chat favorites
            queryClient.setQueryData(
                queryKeys.guest.chatFavorites(userId),
                (oldData: any) => {
                    if (!oldData) return oldData;
                    
                    if (e.is_favorited) {
                        // Add to favorites if not already there
                        const chat = chats.find((c: any) => c.id === e.chat_id);
                        if (chat && !oldData.chats.some((f: any) => f.id === e.chat_id)) {
                            return {
                                ...oldData,
                                chats: [chat, ...oldData.chats]
                            };
                        }
                    } else {
                        // Remove from favorites
                        return {
                            ...oldData,
                            chats: oldData.chats.filter((f: any) => f.id !== e.chat_id)
                        };
                    }
                    
                    return oldData;
                }
            );
        };

        channel.listen("MessagesRead", handleMessagesRead);
        channel.listen(".ChatCreated", handleNewChat);
        channel.listen(".ChatUpdated", handleChatUpdated);
        channel.listen("FavoriteToggled", handleFavoriteToggled);

        return () => {
            try {
                channel.stopListening("MessagesRead");
                channel.stopListening(".ChatCreated");
                channel.stopListening(".ChatUpdated");
                channel.stopListening("FavoriteToggled");
            } catch (error) {
                console.warn('Error cleaning up channel listeners:', error);
            }
        };
    }, [userId, chats, activeBottomTab, onNotificationCountChange, messageNotifications.length]);

    /**
     * Real-Time Implementation Summary:
     * 
     * ✅ useGuestChatsRealtime - Handles chat updates and new chats
     * ✅ useUnreadMessageCount - Tracks total unread message count
     * ✅ useNotifications - Handles new notifications with cache updates
     * ✅ Chat message listeners - Updates unread counts for individual chats
     * ✅ MessagesRead listener - Resets unread counts when messages are read
     * ✅ ChatCreated listener - Adds new chats to the list
     * ✅ ChatUpdated listener - Updates chat metadata and cast profiles
     * ✅ FavoriteToggled listener - Updates favorites list in real-time
     * ✅ Connection monitoring - Tracks WebSocket connection status
     * 
     * All React Query caches are updated immediately when real-time events arrive,
     * ensuring instant UI updates without manual refetching.
     */

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

    // Helper to get last activity timestamp for sorting
    const getLastActivityTime = (chat: any): number => {
        const timeStr = chat?.updated_at || chat?.last_message_at || chat?.created_at;
        if (!timeStr) return 0;
        const t = new Date(timeStr).getTime();
        return Number.isFinite(t) ? t : 0;
    };

    // Sort chats by last activity (newest first)
    const sortedFilteredChats = useMemo(() => {
        return [...filteredChats].sort((a, b) => getLastActivityTime(b) - getLastActivityTime(a));
    }, [filteredChats]);
    const sortedFilteredFavoriteChats = useMemo(() => {
        return [...filteredFavoriteChats].sort((a, b) => getLastActivityTime(b) - getLastActivityTime(a));
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

    // const handleNotificationClick = async (id: number) => {
    //     await markNotificationRead(id);
    //     setMessageNotifications((prev) => prev.filter((n) => n.id !== id));
    // };

    // Mark all messages as read
    // const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     try {
    //         // Mark all notifications as read
    //         await Promise.all(
    //             messageNotifications.map((n: any) => markNotificationRead(n.id))
    //         );
    //         // Mark chats unread to 0 on server
    //         const chatsWithUnread = chats.filter((c: any) => (c.unread || 0) > 0);
    //         await Promise.all(
    //             chatsWithUnread.map((c: any) => markChatMessagesRead(c.id, userId, 'guest'))
    //         );
    //         setMessageNotifications([]);
    //         onNotificationCountChange?.(0);
    //     } catch (error) {
    //         console.error('Error marking all as read:', error);
    //     }
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
        <div
            className="bg-gradient-to-b from-primary via-primary to-secondary min-h-screen flex flex-col pb-24"
            style={{ paddingBottom: 'calc(10rem + env(safe-area-inset-bottom))' }}
        >
            {/* Top bar */}
            <div className="fixed max-w-md mx-auto top-0 left-0 right-0 flex justify-between items-center px-4 py-3 border-b border-secondary bg-primary z-20">
                <button
                    className="justify-self-start relative p-1"
                    aria-label="通知を開く"
                    onClick={() => setShowNotification(true)}
                >
                    <FiBell className="w-6 h-6 text-white" />
                    {messageNotifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center font-bold">
                            {messageNotifications.length > 99 ? '+99' : messageNotifications.length}
                        </span>
                    )}
                </button>
                <div className="justify-self-center font-bold text-lg text-white">メッセージ一覧</div>
                <div className="justify-self-end flex items-center gap-2">
                    {/* Real-time connection status indicator */}
                    <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-400' : 'bg-red-400'}`} 
                         title={isRealtimeConnected ? 'リアルタイム更新中' : 'リアルタイム更新停止'}>
                    </div>
                </div>
            </div>
            {/* Message notifications section */}
            {/* {messageNotifications.length > 0 && (
                <div className="bg-yellow-50 px-4 py-2 border-b border-secondary">
                    <div className="font-bold mb-1 text-yellow-800">新着メッセージ通知</div>
                    {messageNotifications.map((n) => (
                        <div key={n.id} className="mb-2 p-2 bg-yellow-100 rounded cursor-pointer" onClick={() => handleNotificationClick(n.id)}>
                            <div className="text-sm text-yellow-900">{n.message}</div>
                            <div className="text-xs text-yellow-700">{formatTime(n.created_at)}</div>
                        </div>
                    ))}
                </div>
            )} */}
            {/* Tabs */}
            <div className="flex items-center px-4 pt-24">
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
            <div className="sticky top-20 z-10 bg-primary px-4 py-3">
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

                                // Get reservation info for display
                                const getReservationInfo = () => {
                                    if (chat.reservation_name || chat.meeting_location) {
                                        const parts = [];
                                        if (chat.reservation_name) parts.push(chat.reservation_name);
                                        if (chat.meeting_location) parts.push(chat.meeting_location);
                                        return parts.join(' - ');
                                    }
                                    return null;
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
                                                        {chat.updated_at && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                最終更新: {formatTime(chat.updated_at)}
                                                            </div>
                                                        )}
                                                        {getReservationInfo() && (
                                                            <div className="text-xs text-blue-300 mt-1">
                                                                📅 {getReservationInfo()}
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

                                // Get reservation info for display
                                const getReservationInfo = () => {
                                    if (chat.reservation_name || chat.meeting_location) {
                                        const parts = [];
                                        if (chat.reservation_name) parts.push(chat.reservation_name);
                                        if (chat.meeting_location) parts.push(chat.meeting_location);
                                        return parts.join(' - ');
                                    }
                                    return null;
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
                                                        {chat.updated_at && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                最終更新: {formatTime(chat.updated_at)}
                                                            </div>
                                                        )}
                                                        {getReservationInfo() && (
                                                            <div className="text-xs text-blue-300 mt-1">
                                                                📅 {getReservationInfo()}
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