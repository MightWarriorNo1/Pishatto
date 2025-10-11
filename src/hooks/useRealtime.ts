import { useEffect, useRef } from "react";
import echo from "../services/echo";
import { queryClient } from "../lib/react-query";
import { queryKeys } from "../lib/react-query";

// Real-time chat messages with React Query cache updates
export function useChatMessages(
  chatId: string | number,
  onNewMessage: (message: any) => void,
  currentUserId?: number,
  userType?: 'guest' | 'cast'
) {
  // console.log('useChatMessages: Hook called with chatId:', chatId, 'currentUserId:', currentUserId, 'userType:', userType);
  
  // Simple approach: directly set up the listener without useEffect
  if (chatId && currentUserId && userType) {
    // console.log('useChatMessages: Setting up listener for chat:', chatId);
    const channel = echo.channel(`chat.${chatId}`);
    
    // console.log('useChatMessages: Channel subscription status:', channel.subscription?.subscribed);
    
    // Add channel subscription logging
    channel.subscribed(() => {
      // console.log('useChatMessages: Successfully subscribed to channel chat.' + chatId);
    });
    
    channel.error((error: any) => {
      // console.error('useChatMessages: Channel subscription error for chat.' + chatId, error);
    });
    
    const handleNewMessage = (e: { message: any }) => {
      const newMessage = e.message;
      
      // console.log('useChatMessages: Received new message:', newMessage);
      // console.log('useChatMessages: Chat ID:', chatId, 'Current User ID:', currentUserId, 'User Type:', userType);
      // console.log('useChatMessages: Message from ChatScreen component:', currentUserId && userType);
      
      // Only update cache directly - don't invalidate queries to prevent excessive refetches
      // console.log('useChatMessages: Updating cache directly for chat', chatId);
      
      // Update the appropriate cache based on user type
      if (userType === 'guest' && currentUserId) {
        const guestCacheKey = queryKeys.guest.chatMessages(Number(chatId), Number(currentUserId));
        queryClient.setQueryData(guestCacheKey, (oldData: any) => {
          if (!oldData) return [newMessage];
          const exists = oldData.some((msg: any) => msg.id === newMessage.id);
          if (exists) return oldData;
          return [...oldData, newMessage];
        });
        // console.log('useChatMessages: Updated guest cache for chat', chatId);
      } else if (userType === 'cast' && currentUserId) {
        const castCacheKey = queryKeys.cast.chatMessages(Number(chatId), Number(currentUserId));
        queryClient.setQueryData(castCacheKey, (oldData: any) => {
          if (!oldData) return [newMessage];
          const exists = oldData.some((msg: any) => msg.id === newMessage.id);
          if (exists) return oldData;
          return [...oldData, newMessage];
        });
        // console.log('useChatMessages: Updated cast cache for chat', chatId);
      }
      
      // console.log('useChatMessages: Calling onNewMessage callback');
      // Call the callback for additional side effects
      onNewMessage(newMessage);
    };
    
    // Listen to the MessageSent event
    channel.listen(".MessageSent", handleNewMessage);
    
    // Force subscription if not already subscribed
    if (!channel.subscription) {
      // console.log('useChatMessages: Channel not subscribed, forcing subscription...');
      channel.subscribe();
    }
  }
}

// Real-time group messages with React Query cache updates
export function useGroupMessages(
  groupId: string | number,
  onNewMessage: (message: any) => void
) {
  useEffect(() => {
    if (!groupId) return;
    
    
    const channel: any = echo.channel(`group.${groupId}`);
    
    
    const handleEvent = (e: { message: any }) => {
      if (e && e.message) {
        // Update React Query cache for group messages if applicable
        // This would need to be implemented based on your group message structure
        
        onNewMessage(e.message);
      } else {
        console.warn(`useGroupMessages: Received GroupMessageSent event but no message data:`, e);
      }
    };
    channel.listen("GroupMessageSent", handleEvent);
    // Some setups require a leading dot for broadcastAs custom names
    channel.listen(".GroupMessageSent", handleEvent);
    
    return () => {
      try { channel.stopListening("GroupMessageSent"); } catch {}
      try { channel.stopListening(".GroupMessageSent"); } catch {}
      try {
        // Ensure we fully unsubscribe from the channel
        (echo as any).leave?.(`group.${groupId}`);
      } catch (err) {
        // no-op
      }
    };
  }, [groupId, onNewMessage]);
}

// Real-time reservation updates with React Query cache updates
export function useReservationUpdates(
  reservationId: string | number,
  onReservationUpdate: (reservation: any) => void
) {
  useEffect(() => {
    if (!reservationId) return;
    const channel = echo.channel(`reservation.${reservationId}`);
    
    const handleReservationUpdate = (e: { reservation: any }) => {
      const updatedReservation = e.reservation;
      
      // Update React Query cache for reservations
      // This would need to be implemented based on your reservation query structure
      
      onReservationUpdate(updatedReservation);
    };
    
    channel.listen("ReservationUpdated", handleReservationUpdate);
    return () => {
      channel.stopListening("ReservationUpdated");
    };
  }, [reservationId, onReservationUpdate]);
}

// Real-time notifications with React Query cache updates
export function useNotifications(
  userId: string | number,
  onNotification: (notification: any) => void
) {
  useEffect(() => {
    if (!userId) return;
    const channel = echo.channel(`user.${userId}`);
    
    const handleNotification = (e: { notification: any }) => {
      const notification = e.notification;
      
      // Update React Query cache for notifications
      queryClient.setQueryData(
        queryKeys.guest.notifications(Number(userId)),
        (oldData: any) => {
          if (!oldData) return [notification];
          return [notification, ...oldData];
        }
      );
      
      // Also update cast notifications if applicable
      queryClient.setQueryData(
        queryKeys.cast.notifications(Number(userId)),
        (oldData: any) => {
          if (!oldData) return [notification];
          return [notification, ...oldData];
        }
      );
      
      // Call the callback for UI updates
      onNotification(notification);
    };
    
    channel.listen("NotificationSent", handleNotification);
    
    return () => {
      channel.stopListening("NotificationSent");
    };
  }, [userId, onNotification]);
}

// Real-time unread message count updates with cache management
export function useUnreadMessageCount(
  userId: string | number,
  userType: 'guest' | 'cast',
  onCountUpdate: (count: number) => void
) {
  useEffect(() => {
    if (!userId) return;
    const channel = echo.channel(`user.${userId}`);
    
    // Listen for new messages that would increase unread count
    channel.listen("MessageSent", (e: { message: any }) => {
      // Only count messages from other users
      const isOwnMessage = (userType === 'guest' && e.message.sender_guest_id) || 
                          (userType === 'cast' && e.message.sender_cast_id);
      
      if (!isOwnMessage) {
        // Update React Query cache for chats to reflect new message
        if (userType === 'guest') {
          queryClient.setQueryData(
            queryKeys.guest.chats(Number(userId)),
            (oldData: any) => {
              if (!oldData) return oldData;
              return oldData.map((chat: any) => {
                if (chat.id === e.message.chat_id) {
                  return { ...chat, unread: (chat.unread || 0) + 1 };
                }
                return chat;
              });
            }
          );
        } else {
          queryClient.setQueryData(
            queryKeys.cast.chats(Number(userId)),
            (oldData: any) => {
              if (!oldData) return oldData;
              return oldData.map((chat: any) => {
                if (chat.id === e.message.chat_id) {
                  return { ...chat, unread: (chat.unread || 0) + 1 };
                }
                return chat;
              });
            }
          );
        }
        
        onCountUpdate(1); // Just increment by 1 for each new message
      }
    });

    // Listen for messages being read
    channel.listen("MessagesRead", () => {
      // Update React Query cache to reset unread counts
      if (userType === 'guest') {
        queryClient.setQueryData(
          queryKeys.guest.chats(Number(userId)),
          (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((chat: any) => ({ ...chat, unread: 0 }));
          }
        );
      } else {
        queryClient.setQueryData(
          queryKeys.cast.chats(Number(userId)),
          (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((chat: any) => ({ ...chat, unread: 0 }));
          }
        );
      }
      
      onCountUpdate(0);
    });

    return () => {
      channel.stopListening("MessageSent");
      channel.stopListening("MessagesRead");
    };
  }, [userId, userType, onCountUpdate]);
}

// Tweets (public channel) - Enhanced with React Query cache updates
export function useTweets(onNewTweet?: (tweet: any) => void) {
  useEffect(() => {
    const channel = echo.channel("tweets");
    
    const handleNewTweet = (e: { tweet: any }) => {
      const newTweet = e.tweet;
      
      // Update React Query cache immediately for instant UI updates
      queryClient.setQueryData(queryKeys.tweets.all(), (oldData: any) => {
        if (!oldData) return [newTweet];
        return [newTweet, ...oldData];
      });
      
      // Update user-specific tweet caches if applicable
      if (newTweet.guest?.id) {
        queryClient.setQueryData(
          queryKeys.tweets.user('guest', newTweet.guest.id),
          (oldData: any) => {
            if (!oldData) return [newTweet];
            return [newTweet, ...oldData];
          }
        );
      }
      
      if (newTweet.cast?.id) {
        queryClient.setQueryData(
          queryKeys.tweets.user('cast', newTweet.cast.id),
          (oldData: any) => {
            if (!oldData) return [newTweet];
            return [newTweet, ...oldData];
          }
        );
      }
      
      // Call the optional callback for additional side effects
      if (onNewTweet) {
        onNewTweet(newTweet);
      }
    };
    
    channel.listen("TweetCreated", handleNewTweet);
    
    // Handle tweet updates (likes, content changes, etc.)
    channel.listen("TweetUpdated", (e: { tweet: any }) => {
      const updatedTweet = e.tweet;
      
      // Update all tweet caches with the updated tweet
      queryClient.setQueryData(queryKeys.tweets.all(), (oldData: any) => {
        if (!oldData) return [updatedTweet];
        return oldData.map((tweet: any) => 
          tweet.id === updatedTweet.id ? updatedTweet : tweet
        );
      });
      
      // Update user-specific tweet caches
      if (updatedTweet.guest?.id) {
        queryClient.setQueryData(
          queryKeys.tweets.user('guest', updatedTweet.guest.id),
          (oldData: any) => {
            if (!oldData) return [updatedTweet];
            return oldData.map((tweet: any) => 
              tweet.id === updatedTweet.id ? updatedTweet : tweet
            );
          }
        );
      }
      
      if (updatedTweet.cast?.id) {
        queryClient.setQueryData(
          queryKeys.tweets.user('cast', updatedTweet.cast.id),
          (oldData: any) => {
            if (!oldData) return [updatedTweet];
            return oldData.map((tweet: any) => 
              tweet.id === updatedTweet.id ? updatedTweet : tweet
            );
          }
        );
      }
    });
    
    // Handle tweet deletions
    channel.listen("TweetDeleted", (e: { tweetId: number }) => {
      const deletedTweetId = e.tweetId;
      
      // Remove from all tweet caches
      queryClient.setQueryData(queryKeys.tweets.all(), (oldData: any) => {
        if (!oldData) return [];
        return oldData.filter((tweet: any) => tweet.id !== deletedTweetId);
      });
      
      // Remove from user-specific tweet caches without invalidating
      queryClient.setQueryData(queryKeys.tweets.user('guest', 0), (oldData: any) => {
        if (!oldData) return [];
        return oldData.filter((tweet: any) => tweet.id !== deletedTweetId);
      });
      
      queryClient.setQueryData(queryKeys.tweets.user('cast', 0), (oldData: any) => {
        if (!oldData) return [];
        return oldData.filter((tweet: any) => tweet.id !== deletedTweetId);
      });
    });
    
    return () => {
      channel.stopListening("TweetCreated");
      channel.stopListening("TweetUpdated");
      channel.stopListening("TweetDeleted");
    };
  }, [onNewTweet]);
}

// Admin news (public channels)
export function useAdminNews(userType: 'guest' | 'cast', onNewNews: (news: any) => void) {
  useEffect(() => {
    let channelName = 'admin-news';
    if (userType === 'guest') {
      channelName = 'admin-news.guest';
    } else if (userType === 'cast') {
      channelName = 'admin-news.cast';
    }
    
    const channel = echo.channel(channelName);
    channel.listen("AdminNewsPublished", (e: { news: any }) => {
      onNewNews(e.news);
    });
    
    // Also listen to general admin-news channel for 'all' target type
    const generalChannel = echo.channel('admin-news');
    generalChannel.listen("AdminNewsPublished", (e: { news: any }) => {
      onNewNews(e.news);
    });
    
    return () => {
      channel.stopListening("AdminNewsPublished");
      generalChannel.stopListening("AdminNewsPublished");
    };
  }, [userType, onNewNews]);
}

// Real-time tweet notifications and badge management
export function useTweetNotifications(
  userId: number,
  userType: 'guest' | 'cast',
  onNewTweet?: (tweet: any) => void
) {
  useEffect(() => {
    if (!userId) return;
    
    const channel = echo.channel(`user.${userId}`);
    
    // Listen for new tweets that should trigger notifications
    channel.listen("TweetCreated", (e: { tweet: any }) => {
      const newTweet = e.tweet;
      
      // Only trigger notification if it's not the user's own tweet
      const isOwnTweet = (userType === 'guest' && newTweet.guest?.id === userId) ||
                        (userType === 'cast' && newTweet.cast?.id === userId);
      
      if (!isOwnTweet) {
        console.log('useTweetNotifications: Triggering notification for user:', userId);
        
        // Call the callback for UI updates (badge count, etc.)
        if (onNewTweet) {
          onNewTweet(newTweet);
        }
      } else {
        console.log('useTweetNotifications: Skipping own tweet for user:', userId);
      }
    });
    
    // Listen for tweet updates that might affect notifications
    channel.listen("TweetUpdated", (e: { tweet: any }) => {
      const updatedTweet = e.tweet;
      console.log('useTweetNotifications: Tweet updated:', updatedTweet);
      
      // Handle any notification-related updates
      if (onNewTweet) {
        onNewTweet(updatedTweet);
      }
    });
    
    return () => {
      channel.stopListening("TweetCreated");
      channel.stopListening("TweetUpdated");
    };
  }, [userId, userType, onNewTweet]);
}

// Persistent Reverb connection management
export function useReverbConnection() {
  useEffect(() => {
    // Ensure Echo is connected
    if (echo.connector && 'pusher' in echo.connector) {
      const pusherConnector = echo.connector as any;
      if (pusherConnector.pusher && pusherConnector.pusher.connection.state !== 'connected') {
        console.log('useReverbConnection: Initializing Echo connection...');
        // Echo will automatically attempt to connect
      }
    }

    // Monitor connection status
    const handleConnected = () => {
      console.log('useReverbConnection: Echo connected successfully');
    };

    const handleDisconnected = () => {
      console.log('useReverbConnection: Echo disconnected, attempting to reconnect...');
      // Echo will automatically attempt to reconnect
    };

    const handleError = (error: any) => {
      console.error('useReverbConnection: Echo connection error:', error);
    };

    // Add event listeners if they exist
    if (echo.connector && 'pusher' in echo.connector) {
      const pusherConnector = echo.connector as any;
      if (pusherConnector.pusher && pusherConnector.pusher.connection) {
        pusherConnector.pusher.connection.bind('connected', handleConnected);
        pusherConnector.pusher.connection.bind('disconnected', handleDisconnected);
        pusherConnector.pusher.connection.bind('error', handleError);
      }
    }

    return () => {
      // Cleanup event listeners
      if (echo.connector && 'pusher' in echo.connector) {
        const pusherConnector = echo.connector as any;
        if (pusherConnector.pusher && pusherConnector.pusher.connection) {
          pusherConnector.pusher.connection.unbind('connected', handleConnected);
          pusherConnector.pusher.connection.unbind('disconnected', handleDisconnected);
          pusherConnector.pusher.connection.unbind('error', handleError);
        }
      }
    };
  }, []);

  // Return connection status
  const isConnected = (() => {
    if (echo.connector && 'pusher' in echo.connector) {
      const pusherConnector = echo.connector as any;
      return pusherConnector.pusher?.connection?.state === 'connected';
    }
    return false;
  })();

  return {
    isConnected,
    connector: echo.connector,
  };
}

// Real-time reservation updates for cast dashboard
export function useCastReservations(
  castId: number,
  onReservationUpdate?: (reservation: any) => void
) {
  useEffect(() => {
    if (!castId) return;
    
    console.log(`useCastReservations: Setting up real-time listener for cast ${castId}`);
    
    // Listen to per-cast updates and global casts channel for new free calls
    const castChannel = echo.channel(`cast.${castId}`);
    const globalCastsChannel = echo.channel('casts');
    
    // Add connection status logging
    if (typeof castChannel.subscribed === 'function') {
      castChannel.subscribed(() => {
        console.log(`useCastReservations: Successfully subscribed to cast.${castId}`);
      });
    }
    if (typeof castChannel.error === 'function') {
      castChannel.error((error: any) => {
        console.error(`useCastReservations: Error on cast.${castId} channel:`, error);
      });
    }
    
    const handleNewReservation = (e: { reservation: any }) => {
      const newReservation = e.reservation;
      
      // Update React Query cache for all reservations (since cast dashboard shows all available reservations)
      queryClient.setQueryData(
        queryKeys.cast.reservations(castId),
        (oldData: any) => {
          if (!oldData) return [newReservation];
          // Check if reservation already exists to avoid duplicates
          const exists = oldData.some((r: any) => r.id === newReservation.id);
          if (exists) return oldData;
          return [newReservation, ...oldData];
        }
      );
      
      if (onReservationUpdate) {
        onReservationUpdate(newReservation);
      }
    };
    
    const handleReservationUpdate = (e: { reservation: any }) => {
      const updatedReservation = e.reservation;
      
      // Update React Query cache for all reservations
      queryClient.setQueryData(
        queryKeys.cast.reservations(castId),
        (oldData: any) => {
          if (!oldData) return [updatedReservation];
          return oldData.map((reservation: any) => 
            reservation.id === updatedReservation.id ? updatedReservation : reservation
          );
        }
      );
      
      if (onReservationUpdate) {
        onReservationUpdate(updatedReservation);
      }
    };
    
    castChannel.listen("ReservationCreated", handleNewReservation);
    castChannel.listen(".ReservationCreated", handleNewReservation);
    castChannel.listen("ReservationUpdated", handleReservationUpdate);
    castChannel.listen(".ReservationUpdated", handleReservationUpdate);
    // Also listen on a global channel for new reservations (e.g., free calls)
    globalCastsChannel.listen("ReservationCreated", handleNewReservation);
    globalCastsChannel.listen(".ReservationCreated", handleNewReservation);
    
    return () => {
      try {
        castChannel.stopListening("ReservationCreated");
        castChannel.stopListening("ReservationUpdated");
        castChannel.stopListening(".ReservationCreated");
        castChannel.stopListening(".ReservationUpdated");
        globalCastsChannel.stopListening("ReservationCreated");
        globalCastsChannel.stopListening(".ReservationCreated");
      } catch (err) {
        console.error('Error cleaning up channel listeners:', err);
      }
    };
  }, [castId, onReservationUpdate]);
}

// Convenience wrapper to avoid naming collisions with data query hook
export function useCastReservationsRealtime(
  castId: number,
  onReservationUpdate?: (reservation: any) => void
) {
  return useCastReservations(castId, onReservationUpdate);
}

// Real-time application updates for cast dashboard
export function useCastApplications(
  castId: number,
  onApplicationUpdate?: (application: any) => void
) {
  useEffect(() => {
    if (!castId) return;
    
    // Listen to general application updates
    const channel = echo.channel(`cast.${castId}`);
    
    const handleNewApplication = (e: { application: any }) => {
      const newApplication = e.application;
      
      
      // Update React Query cache for cast applications
      queryClient.setQueryData(
        queryKeys.cast.applications(castId),
        (oldData: any) => {
          if (!oldData) return [newApplication];
          return [newApplication, ...oldData];
        }
      );
      
      if (onApplicationUpdate) {
        onApplicationUpdate(newApplication);
      }
    };
    
    const handleApplicationUpdate = (e: { application: any }) => {
      const updatedApplication = e.application;
      
      // Update React Query cache for cast applications
      queryClient.setQueryData(
        queryKeys.cast.applications(castId),
        (oldData: any) => {
          if (!oldData) return [updatedApplication];
          return oldData.map((application: any) => 
            application.id === updatedApplication.id ? updatedApplication : application
          );
        }
      );
      
      if (onApplicationUpdate) {
        onApplicationUpdate(updatedApplication);
      }
    };
    
    channel.listen("ApplicationCreated", handleNewApplication);
    channel.listen("ApplicationUpdated", handleApplicationUpdate);
    
    return () => {
      channel.stopListening("ApplicationCreated");
      channel.stopListening("ApplicationUpdated");
    };
  }, [castId, onApplicationUpdate]);
}

// Real-time guest chat updates
export function useGuestChatsRealtime(
  guestId: number,
  onChatUpdate?: (chat: any) => void
) {
  useEffect(() => {
    if (!guestId) {
      return;
    }
    
    
    const channel = echo.channel(`guest.${guestId}`);

    if (typeof channel.error === 'function') {
      channel.error((error: any) => {
        console.error(`useGuestChatsRealtime: Error on guest.${guestId} channel:`, error);
      });
    }
    
    
    const handleChatUpdate = (e: { chat: any }) => {
      const updatedChat = e.chat;
      
      // Update React Query cache for guest chats - this will trigger UI updates
      queryClient.setQueryData(
        queryKeys.guest.chats(guestId),
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return [updatedChat];
          return oldData.map((chat: any) => 
            chat.id === updatedChat.id ? { ...chat, ...updatedChat } : chat
          );
        }
      );
      
      // Refetch guest chats to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.guest.chats(guestId)
      });
      
      // Also refetch cast chats if this chat involves a cast member
      if (updatedChat.cast_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.cast.chats(updatedChat.cast_id)
        });
      }
      
      if (onChatUpdate) {
        onChatUpdate(updatedChat);
      }
    };
    
    const handleNewChat = (e: { chat: any }) => {
      const newChat = e.chat;
      
      // Update React Query cache for guest chats - this will trigger UI updates
      queryClient.setQueryData(
        queryKeys.guest.chats(guestId),
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return [newChat];
          // De-duplicate by id
          const exists = oldData.some((c: any) => c.id === newChat.id);
          if (exists) return oldData;
          // Add new chat at the beginning for immediate visibility
          return [newChat, ...oldData];
        }
      );
      
      // Refetch guest chats to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.guest.chats(guestId)
      });
      
      // Also refetch cast chats if this chat involves a cast member
      if (newChat.cast_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.cast.chats(newChat.cast_id)
        });
      }
      
      if (onChatUpdate) {
        onChatUpdate(newChat);
      }
    };

    const handleChatListUpdate = (e: { chat: any }) => {
      const updatedChat = e.chat;
      
      // Update React Query cache for guest chats - this will trigger UI updates
      queryClient.setQueryData(
        queryKeys.guest.chats(guestId),
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return [updatedChat];
          // Update existing chat or add new one
          const existingIndex = oldData.findIndex((c: any) => c.id === updatedChat.id);
          if (existingIndex >= 0) {
            const newData = [...oldData];
            newData[existingIndex] = { ...newData[existingIndex], ...updatedChat };
            return newData;
          } else {
            // Add new chat at the beginning for immediate visibility
            return [updatedChat, ...oldData];
          }
        }
      );
      
      // Refetch guest chats to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.guest.chats(guestId)
      });
      
      // Also refetch cast chats if this chat involves a cast member
      if (updatedChat.cast_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.cast.chats(updatedChat.cast_id)
        });
      }
      
      if (onChatUpdate) {
        onChatUpdate(updatedChat);
      }
    };
  
    
    try {
      channel.listen(".ChatUpdated", handleChatUpdate);
      channel.listen(".ChatCreated", handleNewChat);
      channel.listen(".ChatListUpdated", handleChatListUpdate);
    } catch (error) {
      console.error(`useGuestChatsRealtime: Error setting up listeners for guest.${guestId}:`, error);
    }
    
    return () => {
      try {
        channel.stopListening(".ChatUpdated");
        channel.stopListening(".ChatCreated");
        channel.stopListening(".ChatListUpdated");  
      } catch (err) {
        console.error('Error cleaning up channel listeners:', err);
      }
    };
  }, [guestId, onChatUpdate]);  
}

// Real-time cast chat updates (new chats or updates)
export function useCastChatsRealtime(
  castId: number,
  onChatEvent?: (chat: any) => void
) {
  useEffect(() => {
    if (!castId) return;
    
    
    
    const channel = echo.channel(`cast.${castId}`);
    

    const handleNewChat = (e: { chat: any }) => {
      const newChat = e.chat;
      
      // Update React Query cache for cast chats - this will trigger UI updates
      queryClient.setQueryData(
        queryKeys.cast.chats(castId),
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return [newChat];
          // De-duplicate by id
          const exists = oldData.some((c: any) => c.id === newChat.id);
          if (exists) return oldData;
          // Add new chat at the beginning for immediate visibility
          return [newChat, ...oldData];
        }
      );
      
      // Refetch cast chats to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.cast.chats(castId)
      });
      
      // Also refetch guest chats if this chat involves a guest member
      if (newChat.guest_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.guest.chats(newChat.guest_id)
        });
      }
      
      onChatEvent?.(newChat);
    };

    const handleChatUpdated = (e: { chat: any }) => {
      const updatedChat = e.chat;
      
      // Update React Query cache for cast chats - this will trigger UI updates
      queryClient.setQueryData(
        queryKeys.cast.chats(castId),
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return [updatedChat];
          return oldData.map((c: any) => c.id === updatedChat.id ? { ...c, ...updatedChat } : c);
        }
      );
      
      // Refetch cast chats to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.cast.chats(castId)
      });
      
      // Also refetch guest chats if this chat involves a guest member
      if (updatedChat.guest_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.guest.chats(updatedChat.guest_id)
        });
      }
      
      onChatEvent?.(updatedChat);
    };

    const handleChatListUpdate = (e: { chat: any }) => {
      const updatedChat = e.chat;
      
      // Update React Query cache for cast chats - this will trigger UI updates
      queryClient.setQueryData(
        queryKeys.cast.chats(castId),
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return [updatedChat];
          // Update existing chat or add new one
          const existingIndex = oldData.findIndex((c: any) => c.id === updatedChat.id);
          if (existingIndex >= 0) {
            const newData = [...oldData];
            newData[existingIndex] = { ...newData[existingIndex], ...updatedChat };
            return newData;
          } else {
            // Add new chat at the beginning for immediate visibility
            return [updatedChat, ...oldData];
          }
        }
      );
      
      // Refetch cast chats to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.cast.chats(castId)
      });
      
      // Also refetch guest chats if this chat involves a guest member
      if (updatedChat.guest_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.guest.chats(updatedChat.guest_id)
        });
      }
      
      onChatEvent?.(updatedChat);
    };

    channel.listen(".ChatCreated", handleNewChat);
    channel.listen(".ChatUpdated", handleChatUpdated);
    channel.listen(".ChatListUpdated", handleChatListUpdate);

    return () => {
      try {
        channel.stopListening(".ChatCreated");
        channel.stopListening(".ChatUpdated");
        channel.stopListening(".ChatListUpdated");
      } catch (err) {
        console.error('Error cleaning up channel listeners:', err);
      }
    };
  }, [castId, onChatEvent]);
}

// Real-time group chat creation updates
export function useGroupChatsRealtime(
  userId: number,
  userType: 'guest' | 'cast',
  onGroupChatCreated?: (groupChat: any) => void
) {
  useEffect(() => {
    if (!userId) return;
    
    
    const channel = echo.channel(`${userType}.${userId}`);
    
    const handleGroupChatCreated = (e: { chatGroup: any }) => {
      const newGroupChat = e.chatGroup;
      
      // Update React Query cache for chats - this will trigger UI updates
      const queryKey = userType === 'guest' 
        ? queryKeys.guest.chats(userId)
        : queryKeys.cast.chats(userId);
      
      // Note: The actual chat entries will be updated by ChatCreated events
      // This hook primarily handles group chat metadata updates
      queryClient.setQueryData(
        queryKey,
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return [];
          // The individual chat entries will be added by ChatCreated events
          // We just ensure the cache is available
          return oldData;
        }
      );
      
      // Refetch chats for the current user to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: queryKey
      });
      
      // Also refetch chats for all participants in the group
      if (newGroupChat.participants) {
        newGroupChat.participants.forEach((participant: any) => {
          if (participant.guest_id && participant.guest_id !== userId) {
            queryClient.invalidateQueries({
              queryKey: queryKeys.guest.chats(participant.guest_id)
            });
          }
          if (participant.cast_id && participant.cast_id !== userId) {
            queryClient.invalidateQueries({
              queryKey: queryKeys.cast.chats(participant.cast_id)
            });
          }
        });
      }
      
      if (onGroupChatCreated) {
        onGroupChatCreated(newGroupChat);
      }
    };
    
    channel.listen(".ChatGroupCreated", handleGroupChatCreated);
    
    return () => {
      try {
        channel.stopListening(".ChatGroupCreated");
      } catch (err) {
        console.error('Error cleaning up group chat listeners:', err);
      }
    };
  }, [userId, userType, onGroupChatCreated]);
}


