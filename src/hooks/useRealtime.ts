import { useEffect } from "react";
import echo from "../services/echo";

// Real-time chat messages
export function useChatMessages(
  chatId: string | number,
  onNewMessage: (message: any) => void
) {
  useEffect(() => {
    if (!chatId) return;
    const channel = echo.channel(`chat.${chatId}`);
    channel.listen("MessageSent", (e: { message: any }) => {
      onNewMessage(e.message);
    });
    return () => {
      channel.stopListening("MessageSent");
    };
  }, [chatId, onNewMessage]);
}

// Real-time group messages
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

// Real-time reservation updates
export function useReservationUpdates(
  reservationId: string | number,
  onReservationUpdate: (reservation: any) => void
) {
  useEffect(() => {
    if (!reservationId) return;
    const channel = echo.channel(`reservation.${reservationId}`);
    channel.listen("ReservationUpdated", (e: { reservation: any }) => {
      onReservationUpdate(e.reservation);
    });
    return () => {
      channel.stopListening("ReservationUpdated");
    };
  }, [reservationId, onReservationUpdate]);
}

// Real-time notifications
export function useNotifications(
  userId: string | number,
  onNotification: (notification: any) => void
) {
  useEffect(() => {
    if (!userId) return;
    const channel = echo.channel(`user.${userId}`);
    channel.listen("NotificationSent", (e: { notification: any }) => {
      onNotification(e.notification);
    });
    return () => {
      channel.stopListening("NotificationSent");
    };
  }, [userId, onNotification]);
}

// Real-time unread message count updates
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
        onCountUpdate(1); // Just increment by 1 for each new message
      }
    });

    // Listen for messages being read
    channel.listen("MessagesRead", () => {
      onCountUpdate(0);
    });

    return () => {
      channel.stopListening("MessageSent");
      channel.stopListening("MessagesRead");
    };
  }, [userId, userType, onCountUpdate]);
}

// Tweets (public channel)
export function useTweets(onNewTweet: (tweet: any) => void) {
  useEffect(() => {
    const channel = echo.channel("tweets");
    channel.listen("TweetCreated", (e: { tweet: any }) => {
      onNewTweet(e.tweet);
    });
    return () => {
      channel.stopListening("TweetCreated");
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
