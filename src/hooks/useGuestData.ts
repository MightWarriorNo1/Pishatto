import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/react-query';
import {
  getGuestProfile,
  getGuestChats,
  getNotifications,
  getFavorites,
  getFootprints,
} from '../services/api';

// Comprehensive hook for managing all guest data
export const useGuestData = (guestId: number) => {
  const queryClient = useQueryClient();

  // Profile data - cached for 10 minutes
  const profileQuery = useQuery({
    queryKey: queryKeys.guest.profile(guestId),
    queryFn: () => getGuestProfile(guestId.toString()),
    enabled: !!guestId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Chats data - cached for 2 minutes, real-time updates handle changes
  const chatsQuery = useQuery({
    queryKey: queryKeys.guest.chats(guestId),
    queryFn: () => getGuestChats(guestId, 'guest'),
    enabled: !!guestId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    // Removed refetchInterval - real-time updates will handle this
  });

  // Notifications data - cached for 1 minute, real-time updates handle changes
  const notificationsQuery = useQuery({
    queryKey: queryKeys.guest.notifications(guestId),
    queryFn: () => getNotifications('guest', guestId),
    enabled: !!guestId,
    staleTime: 1 * 60 * 1000, // 1 minute
    // Removed refetchInterval - real-time updates will handle this
  });

  // Favorites data - cached for 5 minutes
  const favoritesQuery = useQuery({
    queryKey: queryKeys.guest.favorites(guestId),
    queryFn: () => getFavorites(guestId),
    enabled: !!guestId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Footprints data - cached for 5 minutes
  const footprintsQuery = useQuery({
    queryKey: queryKeys.guest.footprints(guestId),
    queryFn: () => getFootprints(guestId),
    enabled: !!guestId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Prefetch related data when profile is loaded
  const prefetchRelatedData = () => {
    if (guestId) {
      // Prefetch chats and notifications when profile is loaded
      queryClient.prefetchQuery({
        queryKey: queryKeys.guest.chats(guestId),
        queryFn: () => getGuestChats(guestId, 'guest'),
        staleTime: 2 * 60 * 1000,
      });

      queryClient.prefetchQuery({
        queryKey: queryKeys.guest.notifications(guestId),
        queryFn: () => getNotifications('guest', guestId),
        staleTime: 1 * 60 * 1000,
      });
    }
  };

  // Invalidate all guest data
  const invalidateAllGuestData = () => {
    if (guestId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.guest.profile(guestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.guest.chats(guestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.guest.notifications(guestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.guest.favorites(guestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.guest.footprints(guestId) });
    }
  };

  return {
    // Data
    profile: profileQuery.data,
    chats: chatsQuery.data || [],
    notifications: notificationsQuery.data || [],
    favorites: favoritesQuery.data || [],
    footprints: footprintsQuery.data || [],
    
    // Loading states
    isLoading: profileQuery.isLoading || chatsQuery.isLoading || notificationsQuery.isLoading,
    isProfileLoading: profileQuery.isLoading,
    isChatsLoading: chatsQuery.isLoading,
    isNotificationsLoading: notificationsQuery.isLoading,
    isFavoritesLoading: favoritesQuery.isLoading,
    isFootprintsLoading: footprintsQuery.isLoading,
    
    // Error states
    error: profileQuery.error || chatsQuery.error || notificationsQuery.error,
    profileError: profileQuery.error,
    chatsError: chatsQuery.error,
    notificationsError: notificationsQuery.error,
    
    // Refetch functions
    refetchProfile: profileQuery.refetch,
    refetchChats: chatsQuery.refetch,
    refetchNotifications: notificationsQuery.refetch,
    refetchFavorites: favoritesQuery.refetch,
    refetchFootprints: footprintsQuery.refetch,
    
    // Utility functions
    prefetchRelatedData,
    invalidateAllGuestData,
  };
};

// Hook for guest profile only (when you don't need all data)
export const useGuestProfile = (guestId: number) => {
  return useQuery({
    queryKey: queryKeys.guest.profile(guestId),
    queryFn: () => getGuestProfile(guestId.toString()),
    enabled: !!guestId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for guest chats only
export const useGuestChats = (guestId: number) => {
  return useQuery({
    queryKey: queryKeys.guest.chats(guestId),
    queryFn: () => getGuestChats(guestId, 'guest'),
    enabled: !!guestId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    // Removed refetchInterval - real-time updates will handle this
  });
};

// Hook for guest notifications only
export const useGuestNotifications = (guestId: number) => {
  return useQuery({
    queryKey: queryKeys.guest.notifications(guestId),
    queryFn: () => getNotifications('guest', guestId),
    enabled: !!guestId,
    staleTime: 1 * 60 * 1000, // 1 minute
    // Removed refetchInterval - real-time updates will handle this
  });
};
