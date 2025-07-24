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
