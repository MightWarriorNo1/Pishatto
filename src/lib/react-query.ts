import { QueryClient } from '@tanstack/react-query';

// Create a query client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds - data becomes stale quickly
      gcTime: 50 * 1000, // 50 seconds - cache is garbage collected after 50 seconds
      retry: 1,
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnReconnect: true, // Refetch when reconnecting to network
    },
  },
});

// Define query keys structure
export const queryKeys = {
  guest: {
    profile: (guestId: number) => ['guest', 'profile', guestId] as const,
    chats: (guestId: number) => ['guest', 'chats', guestId] as const,
    notifications: (guestId: number) => ['guest', 'notifications', guestId] as const,
    favorites: (guestId: number) => ['guest', 'favorites', guestId] as const,
    footprints: (guestId: number) => ['guest', 'footprints', guestId] as const,
  },
  cast: {
    all: () => ['cast', 'all'] as const,
    new: () => ['cast', 'new'] as const,
    satisfaction: () => ['cast', 'satisfaction'] as const,
    topSatisfaction: () => ['cast', 'topSatisfaction'] as const,
    ranking: (filters: any) => ['cast', 'ranking', filters] as const,
    profile: (castId: number) => ['cast', 'profile', castId] as const,
    chats: (castId: number) => ['cast', 'chats', castId] as const,
    notifications: (castId: number) => ['cast', 'notifications', castId] as const,
    points: (castId: number) => ['cast', 'points', castId] as const,
    passport: (castId: number) => ['cast', 'passport', castId] as const,
    grade: (castId: number) => ['cast', 'grade', castId] as const,
    monthlyRanking: (castId: number, month: string) => ['cast', 'monthlyRanking', castId, month] as const,
    reservations: (castId: number) => ['cast', 'reservations', castId] as const,
    applications: (castId: number) => ['cast', 'applications', castId] as const,
    chatMessages: (chatId: number, castId: number) => ['cast', 'chatMessages', chatId, castId] as const,
    chatById: (chatId: number) => ['cast', 'chatById', chatId] as const,
    guestReservations: (guestId: number) => ['cast', 'guestReservations', guestId] as const,
    repeatGuests: () => ['cast', 'repeatGuests'] as const,
    guestProfile: (guestId: number) => ['cast', 'guestProfile', guestId] as const,
    likeStatus: (castId: number, guestId: number) => ['cast', 'likeStatus', castId, guestId] as const,
  },
  tweets: {
    all: () => ['tweets', 'all'] as const,
    user: (userType: string, userId: number) => ['tweets', 'user', userType, userId] as const,
    likes: (tweetId: number, userId?: number) => ['tweets', 'likes', tweetId, userId] as const,
  },
};

// Function to manually clear all cache
export const clearAllCache = () => {
  queryClient.clear();
};

// Function to clear specific query cache
export const clearQueryCache = (queryKey: readonly unknown[]) => {
  queryClient.removeQueries({ queryKey });
};

// Function to invalidate and refetch specific queries
export const invalidateAndRefetch = (queryKey: readonly unknown[]) => {
  queryClient.invalidateQueries({ queryKey });
};

// Function to refetch all active queries
export const refetchAllQueries = () => {
  queryClient.refetchQueries();
};

// Function to set up automatic cache clearing every 50 seconds
export const setupAutoCacheClear = () => {
  const interval = setInterval(() => {
    queryClient.clear();
  }, 50 * 1000); // Clear cache every 50 seconds
  
  return () => clearInterval(interval); // Return cleanup function
};
