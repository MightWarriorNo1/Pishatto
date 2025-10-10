import { QueryClient } from '@tanstack/react-query';

// Create a query client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer to prevent unnecessary refetches
      gcTime: 10 * 60 * 1000, // 10 minutes - cache persists longer
      retry: 1,
      refetchOnWindowFocus: false, // Disable refetch on window focus to prevent navigation refetches
      refetchOnReconnect: true, // Keep refetch on reconnect for network issues
    },
  },
});

// Define query keys structure
export const queryKeys = {
  guest: {
    profile: (guestId: number) => ['guest', 'profile', guestId] as const,
    chats: (guestId: number) => ['guest', 'chats', guestId] as const,
    chatMessages: (chatId: number, guestId: number) => ['guest', 'chatMessages', chatId, guestId] as const,
    notifications: (guestId: number) => ['guest', 'notifications', guestId] as const,
    favorites: (guestId: number) => ['guest', 'favorites', guestId] as const,
    chatFavorites: (guestId: number) => ['guest', 'chatFavorites', guestId] as const,
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
    likes: (tweetId: number, guestId?: number, castId?: number) => ['tweets', 'likes', tweetId, guestId, castId] as const,
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
