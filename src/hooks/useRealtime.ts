import { useEffect } from "react";
import echo from "../services/echo";
import { queryClient } from "../lib/react-query";
import { queryKeys } from "../lib/react-query";

// Real-time chat messages with React Query cache updates
export function useChatMessages(
  chatId: string | number,
  onNewMessage: (message: any) => void
) {
  useEffect(() => {
    if (!chatId) return;
    const channel = echo.channel(`chat.${chatId}`);
    
    const handleNewMessage = (e: { message: any }) => {
      const newMessage = e.message;
      console.log('useChatMessages: Received new message:', newMessage);
      
      // Update React Query cache for chat messages
      queryClient.setQueryData(
        queryKeys.cast.chatMessages(Number(chatId), newMessage.sender_cast_id || 0),
        (oldData: any) => {
          if (!oldData) return [newMessage];
          return [...oldData, newMessage];
        }
      );
      
      // Call the callback for additional side effects
      onNewMessage(newMessage);
    };
    
    channel.listen("MessageSent", handleNewMessage);
    return () => {
      channel.stopListening("MessageSent");
    };
  }, [chatId, onNewMessage]);
}

// Real-time group messages with React Query cache updates
export function useGroupMessages(
  groupId: string | number,
  onNewMessage: (message: any) => void
) {
  useEffect(() => {
    if (!groupId) return;
    
    console.log(`useGroupMessages: Setting up listener for group.${groupId}`);
    
    const channel: any = echo.channel(`group.${groupId}`);
    
    // Add connection status logging (guard methods which may not exist)
    if (typeof channel.subscribed === 'function') {
      channel.subscribed(() => {
        console.log(`useGroupMessages: Successfully subscribed to group.${groupId}`);
      });
    }
    if (typeof channel.error === 'function') {
      channel.error((error: any) => {
        console.error(`useGroupMessages: Error on group.${groupId} channel:`, error);
      });
    }
    
    const handleEvent = (e: { message: any }) => {
      console.log(`useGroupMessages: Received GroupMessageSent event for group.${groupId}:`, e);
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
      console.log(`useGroupMessages: Cleaning up listener for group.${groupId}`);
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
      console.log('useReservationUpdates: Received reservation update:', updatedReservation);
      
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
      console.log('useNotifications: Received notification:', notification);
      
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
      console.log('useTweets: Received new tweet:', newTweet);
      
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
      console.log('useTweets: Received tweet update:', updatedTweet);
      
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
      console.log('useTweets: Received tweet deletion:', deletedTweetId);
      
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
      console.log('useTweetNotifications: New tweet notification for user:', userId, 'tweet:', newTweet);
      
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
    
    // Listen to general reservation updates
    const channel = echo.channel(`cast.${castId}`);
    
    const handleNewReservation = (e: { reservation: any }) => {
      const newReservation = e.reservation;
      console.log('useCastReservations: New reservation received:', newReservation);
      
      // Update React Query cache for cast reservations
      queryClient.setQueryData(
        queryKeys.cast.reservations(castId),
        (oldData: any) => {
          if (!oldData) return [newReservation];
          return [newReservation, ...oldData];
        }
      );
      
      if (onReservationUpdate) {
        onReservationUpdate(newReservation);
      }
    };
    
    const handleReservationUpdate = (e: { reservation: any }) => {
      const updatedReservation = e.reservation;
      console.log('useCastReservations: Reservation updated:', updatedReservation);
      
      // Update React Query cache for cast reservations
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
    
    channel.listen("ReservationCreated", handleNewReservation);
    channel.listen("ReservationUpdated", handleReservationUpdate);
    
    return () => {
      channel.stopListening("ReservationCreated");
      channel.stopListening("ReservationUpdated");
    };
  }, [castId, onReservationUpdate]);
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
      console.log('useCastApplications: New application received:', newApplication);
      
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
      console.log('useCastApplications: Application updated:', updatedApplication);
      
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
    if (!guestId) return;
    
    const channel = echo.channel(`guest.${guestId}`);
    
    const handleChatUpdate = (e: { chat: any }) => {
      const updatedChat = e.chat;
      console.log('useGuestChatsRealtime: Chat updated:', updatedChat);
      
      // Update React Query cache for guest chats
      queryClient.setQueryData(
        queryKeys.guest.chats(guestId),
        (oldData: any) => {
          if (!oldData) return [updatedChat];
          return oldData.map((chat: any) => 
            chat.id === updatedChat.id ? updatedChat : chat
          );
        }
      );
      
      if (onChatUpdate) {
        onChatUpdate(updatedChat);
      }
    };
    
    const handleNewChat = (e: { chat: any }) => {
      const newChat = e.chat;
      console.log('useGuestChatsRealtime: New chat created:', newChat);
      
      // Update React Query cache for guest chats
      queryClient.setQueryData(
        queryKeys.guest.chats(guestId),
        (oldData: any) => {
          if (!oldData) return [newChat];
          return [newChat, ...oldData];
        }
      );
      
      if (onChatUpdate) {
        onChatUpdate(newChat);
      }
    };
    
    channel.listen("ChatUpdated", handleChatUpdate);
    channel.listen("ChatCreated", handleNewChat);
    
    return () => {
      channel.stopListening("ChatUpdated");
      channel.stopListening("ChatCreated");
    };
  }, [guestId, onChatUpdate]);
}


