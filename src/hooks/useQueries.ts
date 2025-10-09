/* eslint-disable */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/react-query';
import {
  getGuestProfile,
  getGuestChats,
  getNotifications,
  getFavorites,
  getFavoriteChats,
  getFootprints,
  getCastList,
  getAllSatisfactionCasts,
  getTopSatisfactionCasts,
  fetchRanking,
  fetchAllTweets,
  fetchUserTweets,
  createTweet,
  likeTweet,
  getTweetLikeStatus,
  deleteTweet,
  markAllNotificationsRead,
  favoriteChat,
  unfavoriteChat,
  unfavoriteCast,
  getCastProfileById,
  getCastChats,
  getCastPointsData,
  getCastPassportData,
  getCastGrade,
  getMonthlyEarnedRanking,
  getAllReservations,
  getAllCastApplications,
  castUpdateProfile,
  applyReservation,
  startReservation,
  stopReservation,
  getChatMessages,
  getChatById,
  getGuestReservations,
  getRepeatGuests,
  getGuestProfileById,
  likeGuest,
  createChat,
  sendCastMessage,
  sendMessage,
  getLikeStatus,
  recordGuestVisit,
} from '../services/api';
import api from '../services/api';

// Guest Profile Query
export const useGuestProfile = (guestId: number) => {
  return useQuery({
    queryKey: queryKeys.guest.profile(guestId),
    queryFn: () => getGuestProfile(guestId.toString()),
    enabled: !!guestId,
    staleTime: 30 * 1000, // 30 seconds - profile can change
  });
};

// Guest Chats Query
export const useGuestChats = (guestId: number) => {
  return useQuery({
    queryKey: queryKeys.guest.chats(guestId),
    queryFn: () => getGuestChats(guestId, 'guest'),
    enabled: !!guestId,
    staleTime: 30 * 1000, // 30 seconds - chats update very frequently
    // Removed refetchInterval - real-time updates will handle this
  });
};

// Guest Notifications Query
export const useGuestNotifications = (guestId: number) => {
  return useQuery({
    queryKey: queryKeys.guest.notifications(guestId),
    queryFn: () => getNotifications('guest', guestId),
    enabled: !!guestId,
    staleTime: 1 * 60 * 1000, // 1 minute - notifications are time-sensitive
    // Removed refetchInterval - real-time updates will handle this
  });
};

// Guest Favorites Query (for cast favorites)
export const useGuestFavorites = (guestId: number) => {
  return useQuery({
    queryKey: queryKeys.guest.favorites(guestId),
    queryFn: () => getFavorites(guestId),
    enabled: !!guestId,
    staleTime: 30 * 1000, // 30 seconds - favorites can change
  });
};

// Guest Chat Favorites Query
export const useGuestChatFavorites = (guestId: number) => {
  return useQuery({
    queryKey: queryKeys.guest.chatFavorites(guestId),
    queryFn: () => getFavoriteChats(guestId),
    enabled: !!guestId,
    staleTime: 30 * 1000, // 30 seconds - chat favorites can change
  });
};

// Guest Footprints Query
export const useGuestFootprints = (guestId: number) => {
  return useQuery({
    queryKey: queryKeys.guest.footprints(guestId),
    queryFn: () => getFootprints(guestId),
    enabled: !!guestId,
    staleTime: 30 * 1000, // 30 seconds - footprints can change
  });
};

// All Casts Query
export const useAllCasts = () => {
  return useQuery({
    queryKey: queryKeys.cast.all(),
    queryFn: () => getCastList(),
    staleTime: 30 * 1000, // 30 seconds - cast list can change
  });
};

// New Casts Query (recently created casts)
export const useNewCasts = () => {
  return useQuery({
    queryKey: queryKeys.cast.new(),
    queryFn: async () => {
      const data = await getCastList({});
      // Get the 5 most recently created casts
      const recentCasts = data.casts
        ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5) || [];
      return recentCasts;
    },
    staleTime: 30 * 1000, // 30 seconds - new casts update frequently
  });
};

// Satisfaction Casts Query
export const useSatisfactionCasts = () => {
  return useQuery({
    queryKey: queryKeys.cast.satisfaction(),
    queryFn: getAllSatisfactionCasts,
    staleTime: 15 * 60 * 1000, // 15 minutes - satisfaction data changes slowly
  });
};

// Top Satisfaction Casts Query
export const useTopSatisfactionCasts = () => {
  return useQuery({
    queryKey: queryKeys.cast.topSatisfaction(),
    queryFn: getTopSatisfactionCasts,
    staleTime: 10 * 60 * 1000, // 10 minutes - top satisfaction data changes moderately
  });
};

// Ranking Query
export const useRanking = (filters: any) => {
  return useQuery({
    queryKey: queryKeys.cast.ranking(filters),
    queryFn: () => fetchRanking(filters),
    enabled: !!filters,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// All Tweets Query
export const useAllTweets = (options: { refetchOnMount?: boolean } = {}) => {
  const { refetchOnMount = false } = options;
  return useQuery({
    queryKey: queryKeys.tweets.all(),
    queryFn: fetchAllTweets,
    staleTime: 10 * 60 * 1000, // 10 minutes - prevent refetching on navigation
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    refetchOnMount: refetchOnMount, // Don't refetch when component remounts by default
    refetchOnWindowFocus: false, // Don't refetch on window focus
    // Removed refetchInterval - real-time updates will handle this
  });
};

// User Tweets Query
export const useUserTweets = (userType: 'guest' | 'cast', userId: number, options: { refetchOnMount?: boolean } = {}) => {
  const { refetchOnMount = false } = options;
  return useQuery({
    queryKey: queryKeys.tweets.user(userType, userId),
    queryFn: () => fetchUserTweets(userType, userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - prevent refetching on navigation
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    refetchOnMount: refetchOnMount, // Don't refetch when component remounts by default
    refetchOnWindowFocus: false, // Don't refetch on window focus
    // Removed refetchInterval - real-time updates will handle this
  });
};

// Tweet Like Status Query
export const useTweetLikeStatus = (tweetId: number, userId?: number, castId?: number) => {
  return useQuery({
    queryKey: queryKeys.tweets.likes(tweetId, userId, castId),
    queryFn: () => getTweetLikeStatus(tweetId, userId, castId),
    enabled: !!tweetId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Mutations
export const useCreateTweet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTweet,
    onSuccess: () => {
      // Don't invalidate queries - let local state handle immediate updates
      // Only invalidate if we need to sync with server data
      // queryClient.invalidateQueries({ queryKey: queryKeys.tweets.all() });
      // queryClient.invalidateQueries({ queryKey: queryKeys.tweets.user('guest', 0) });
    },
  });
};

export const useLikeTweet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ tweetId, userId, castId }: { tweetId: number; userId?: number; castId?: number }) => 
      likeTweet(tweetId, userId, castId),
    onMutate: async (variables) => {
      const { tweetId, userId, castId } = variables;
      const queryKey = queryKeys.tweets.likes(tweetId, userId, castId);

      await queryClient.cancelQueries({ queryKey });

      const previousLikeData = queryClient.getQueryData(queryKey) as { liked: boolean; count: number } | undefined;

      const nextLiked = previousLikeData ? !previousLikeData.liked : true;
      const nextCount = previousLikeData
        ? Math.max(0, previousLikeData.count + (nextLiked ? 1 : -1))
        : 1;

      queryClient.setQueryData(queryKey, { liked: nextLiked, count: nextCount });

      return { queryKey, previousLikeData } as { queryKey: readonly unknown[]; previousLikeData?: { liked: boolean; count: number } };
    },
    onError: (_error, _variables, context) => {
      if (context?.queryKey) {
        if (context.previousLikeData) {
          queryClient.setQueryData(context.queryKey, context.previousLikeData);
        } else {
          queryClient.removeQueries({ queryKey: context.queryKey });
        }
      }
    },
    onSuccess: (_, variables) => {
      // Only invalidate specific tweet like status
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tweets.likes(variables.tweetId, variables.userId, variables.castId) 
      });
    },
  });
};

export const useDeleteTweet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTweet,
    onSuccess: () => {
      // Don't invalidate queries - let local state handle immediate updates
      // Only invalidate if we need to sync with server data
      // queryClient.invalidateQueries({ queryKey: queryKeys.tweets.all() });
      // queryClient.invalidateQueries({ queryKey: queryKeys.tweets.user('guest', 0) });
    },
  });
};

export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userType, userId }: { userType: 'guest' | 'cast'; userId: number }) => 
      markAllNotificationsRead(userType, userId),
    onSuccess: (_, variables) => {
      // Invalidate notifications for the user
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.guest.notifications(variables.userId) 
      });
    },
  });
};

// Favorite Chat Mutation
export const useFavoriteChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, chatId }: { userId: number; chatId: number }) => 
      favoriteChat(userId, chatId),
    onSuccess: (_, variables) => {
      // Invalidate chat favorites for the user
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.guest.chatFavorites(variables.userId) 
      });
    },
  });
};

// Unfavorite Chat Mutation
export const useUnfavoriteChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, chatId }: { userId: number; chatId: number }) => 
      unfavoriteChat(userId, chatId),
    onSuccess: (_, variables) => {
      // Invalidate chat favorites for the user
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.guest.chatFavorites(variables.userId) 
      });
    },
  });
};

// Unfavorite Cast Mutation
export const useUnfavoriteCast = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, castId }: { userId: number; castId: number }) => 
      unfavoriteCast(userId, castId),
    onSuccess: (_, variables) => {
      // Invalidate favorites for the user
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.guest.favorites(variables.userId) 
      });
    },
  });
};

// ===== CAST QUERIES =====

// Cast Profile Query
export const useCastProfile = (castId: number) => {
  return useQuery({
    queryKey: queryKeys.cast.profile(castId),
    queryFn: () => getCastProfileById(castId),
    enabled: !!castId,
    staleTime: 10 * 60 * 1000, // 10 minutes - profile changes slowly
  });
};

// Cast Chats Query
export const useCastChats = (castId: number) => {
  return useQuery({
    queryKey: queryKeys.cast.chats(castId),
    queryFn: () => getCastChats(castId),
    enabled: !!castId,
    staleTime: 2 * 60 * 1000, // 2 minutes - chats update frequently
    // Removed refetchInterval - real-time updates will handle this
  });
};

// Cast Notifications Query
export const useCastNotifications = (castId: number) => {
  return useQuery({
    queryKey: queryKeys.cast.notifications(castId),
    queryFn: () => getNotifications('cast', castId),
    enabled: !!castId,
    staleTime: 1 * 60 * 1000, // 1 minute - notifications are time-sensitive
    // Removed refetchInterval - real-time updates will handle this
  });
};

// Cast Points Data Query
export const useCastPoints = (castId: number) => {
  return useQuery({
    queryKey: queryKeys.cast.points(castId),
    queryFn: () => getCastPointsData(castId),
    enabled: !!castId,
    staleTime: 5 * 60 * 1000, // 5 minutes - points data changes moderately
  });
};

// Cast Passport Data Query
export const useCastPassport = (castId: number) => {
  return useQuery({
    queryKey: queryKeys.cast.passport(castId),
    queryFn: () => getCastPassportData(castId),
    enabled: !!castId,
    staleTime: 15 * 60 * 1000, // 15 minutes - passport data changes slowly
  });
};

// Cast Grade Query
export const useCastGrade = (castId: number) => {
  return useQuery({
    queryKey: queryKeys.cast.grade(castId),
    queryFn: () => getCastGrade(castId),
    enabled: !!castId,
    staleTime: 30 * 60 * 1000, // 30 minutes - grade info changes very slowly
  });
};

// Cast Monthly Ranking Query
export const useCastMonthlyRanking = (castId: number, month: 'current' | 'last' = 'current') => {
  return useQuery({
    queryKey: queryKeys.cast.monthlyRanking(castId, month),
    queryFn: () => getMonthlyEarnedRanking({ castId, limit: 10, month }),
    enabled: !!castId,
    staleTime: 10 * 60 * 1000, // 10 minutes - ranking data changes moderately
  });
};

// Cast Reservations Query
export const useCastReservations = (castId: number) => {
  return useQuery({
    queryKey: queryKeys.cast.reservations(castId),
    queryFn: () => getAllReservations(),
    enabled: !!castId,
    staleTime: 30 * 1000, // 30 seconds - reservations update frequently
    // Removed refetchInterval - real-time updates will handle this
  });
};

// Cast Applications Query
export const useCastApplications = (castId: number) => {
  return useQuery({
    queryKey: queryKeys.cast.applications(castId),
    queryFn: () => getAllCastApplications(castId),
    enabled: !!castId,
    staleTime: 30 * 1000, // 30 seconds - applications update frequently
    // Removed refetchInterval - real-time updates will handle this
  });
};

// ===== CAST MUTATIONS =====

// Cast Profile Update Mutation
export const useUpdateCastProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => castUpdateProfile(data),
    onSuccess: (_, variables) => {
      // Invalidate cast profile queries
      if (variables.id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.cast.profile(variables.id) 
        });
      }
    },
  });
};

// Cast Avatar Upload Mutation
export const useUploadCastAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) => {
      // Assuming there's an avatar upload API function
      return api.post('/cast/avatar-upload', formData);
    },
    onSuccess: (_, variables) => {
      // Invalidate cast profile queries to refresh avatar
      // This would need to be called with the cast ID
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.cast.profile(0) // This should be the actual cast ID
      });
    },
  });
};

// Cast Reservation Application Mutation
export const useApplyReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reservationId, castId }: { reservationId: number; castId: number }) => 
      applyReservation(reservationId, castId),
    onSuccess: (_, variables) => {
      // Invalidate reservations and applications
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.cast.reservations(variables.castId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.cast.applications(variables.castId) 
      });
    },
  });
};

// Cast Reservation Start/Stop Mutations
export const useStartReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reservationId, castId }: { reservationId: number; castId: number }) => 
      startReservation(reservationId, castId),
    onSuccess: (_, variables) => {
      // Invalidate reservations
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.cast.reservations(variables.castId) 
      });
    },
  });
};

export const useStopReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reservationId, castId }: { reservationId: number; castId: number }) => 
      stopReservation(reservationId, castId),
    onSuccess: (_, variables) => {
      // Invalidate reservations
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.cast.reservations(variables.castId) 
      });
    },
  });
};

// ===== MESSAGE PAGE QUERIES =====

// Chat Messages Query
export const useChatMessages = (chatId: number, castId: number) => {
  return useQuery({
    queryKey: queryKeys.cast.chatMessages(chatId, castId),
    queryFn: () => getChatMessages(chatId, castId, 'cast'),
    enabled: !!chatId && !!castId,
    staleTime: 30 * 1000, // 30 seconds - messages update frequently
    // Removed refetchInterval - real-time updates will handle this
  });
};

// Chat By ID Query
export const useChatById = (chatId: number) => {
  return useQuery({
    queryKey: queryKeys.cast.chatById(chatId),
    queryFn: () => getChatById(chatId),
    enabled: !!chatId,
    staleTime: 5 * 60 * 1000, // 5 minutes - chat info changes slowly
  });
};

// Guest Reservations Query
export const useGuestReservations = (guestId: number) => {
  return useQuery({
    queryKey: queryKeys.cast.guestReservations(guestId),
    queryFn: () => getGuestReservations(guestId),
    enabled: !!guestId,
    staleTime: 2 * 60 * 1000, // 2 minutes - reservations can change
  });
};

// ===== CAST SEARCH PAGE QUERIES =====

// Repeat Guests Query
export const useRepeatGuests = () => {
  return useQuery({
    queryKey: queryKeys.cast.repeatGuests(),
    queryFn: () => getRepeatGuests(),
    staleTime: 5 * 60 * 1000, // 5 minutes - repeat guests list changes slowly
  });
};

// Guest Profile By ID Query
export const useGuestProfileById = (guestId: number) => {
  return useQuery({
    queryKey: queryKeys.cast.guestProfile(guestId),
    queryFn: () => getGuestProfileById(guestId),
    enabled: !!guestId,
    staleTime: 10 * 60 * 1000, // 10 minutes - profile changes slowly
  });
};

// Like Status Query
export const useLikeStatus = (castId: number, guestId: number) => {
  return useQuery({
    queryKey: queryKeys.cast.likeStatus(castId, guestId),
    queryFn: () => getLikeStatus(castId, guestId),
    enabled: !!castId && !!guestId,
    staleTime: 1 * 60 * 1000, // 1 minute - like status can change
  });
};

// ===== MESSAGE PAGE MUTATIONS =====

// Send Message Mutation
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sendMessage,
    onMutate: async (variables) => {
      // Only proceed if we have valid IDs
      if (!variables.chat_id || !variables.sender_cast_id) {
        return;
      }

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.cast.chatMessages(variables.chat_id, variables.sender_cast_id) 
      });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(
        queryKeys.cast.chatMessages(variables.chat_id, variables.sender_cast_id)
      );

      // Create optimistic message
      const optimisticMessage = {
        id: `optimistic-${Date.now()}`,
        chat_id: variables.chat_id,
        sender_cast_id: variables.sender_cast_id,
        message: variables.message,
        image: variables.image,
        created_at: new Date().toISOString(),
        isOptimistic: true
      };

      // Optimistically update to the new value
      queryClient.setQueryData(
        queryKeys.cast.chatMessages(variables.chat_id, variables.sender_cast_id),
        (old: any) => {
          const oldMessages = old || [];
          return [...oldMessages, optimisticMessage];
        }
      );

      // Return a context object with the snapshotted value
      return { previousMessages, optimisticMessage };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMessages && variables.chat_id && variables.sender_cast_id) {
        queryClient.setQueryData(
          queryKeys.cast.chatMessages(variables.chat_id, variables.sender_cast_id),
          context.previousMessages
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      if (variables.chat_id && variables.sender_cast_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.cast.chatMessages(variables.chat_id, variables.sender_cast_id) 
        });
      }
      // Also invalidate cast chats list
      if (variables.sender_cast_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.cast.chats(variables.sender_cast_id) 
        });
      }
    },
  });
};

// ===== CAST SEARCH PAGE MUTATIONS =====

// Like Guest Mutation
export const useLikeGuest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ castId, guestId }: { castId: number; guestId: number }) => 
      likeGuest(castId, guestId),
    onSuccess: (_, variables) => {
      // Invalidate like status
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.cast.likeStatus(variables.castId, variables.guestId) 
      });
    },
  });
};

// Create Chat Mutation
export const useCreateChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ castId, guestId, reservationId }: { castId: number; guestId: number; reservationId?: number }) => 
      createChat(castId, guestId, reservationId),
    onSuccess: (_, variables) => {
      // Invalidate cast chats list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.cast.chats(variables.castId) 
      });
    },
  });
};

// Send Cast Message Mutation
export const useSendCastMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ chatId, castId, message }: { chatId: number; castId: number; message: string }) => 
      sendCastMessage(chatId, castId, message),
    onSuccess: (_, variables) => {
      // Invalidate chat messages for the specific chat
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.cast.chatMessages(variables.chatId, variables.castId) 
      });
      // Also invalidate cast chats list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.cast.chats(variables.castId) 
      });
    },
  });
};

// Record Guest Visit Mutation
export const useRecordGuestVisit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ castId, guestId }: { castId: number; guestId: number }) => 
      recordGuestVisit(castId, guestId),
    // No invalidation needed as this is just for tracking
  });
};
