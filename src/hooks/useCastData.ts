import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/react-query';
import {
  getCastProfileById,
  getCastChats,
  getNotifications,
  getCastPointsData,
  getCastPassportData,
  getCastGrade,
  getMonthlyEarnedRanking,
  getAllReservations,
  getAllCastApplications,
} from '../services/api';

/**
 * Comprehensive hook for cast data that provides all cast-related data with optimized caching
 * Similar to useGuestData but for cast users
 */
export const useCastData = (castId: number) => {
  const queryClient = useQueryClient();

  // Cast Profile Query
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: queryKeys.cast.profile(castId),
    queryFn: () => getCastProfileById(castId),
    enabled: !!castId,
    staleTime: 10 * 60 * 1000, // 10 minutes - profile changes slowly
  });

  // Cast Chats Query
  const {
    data: chats,
    isLoading: chatsLoading,
    error: chatsError,
  } = useQuery({
    queryKey: queryKeys.cast.chats(castId),
    queryFn: () => getCastChats(castId),
    enabled: !!castId,
    staleTime: 2 * 60 * 1000, // 2 minutes - chats update frequently
    // Removed refetchInterval - real-time updates will handle this
  });

  // Cast Notifications Query
  const {
    data: notifications,
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useQuery({
    queryKey: queryKeys.cast.notifications(castId),
    queryFn: () => getNotifications('cast', castId),
    enabled: !!castId,
    staleTime: 1 * 60 * 1000, // 1 minute - notifications are time-sensitive
    // Removed refetchInterval - real-time updates will handle this
  });

  // Cast Points Data Query
  const {
    data: pointsData,
    isLoading: pointsLoading,
    error: pointsError,
  } = useQuery({
    queryKey: queryKeys.cast.points(castId),
    queryFn: () => getCastPointsData(castId),
    enabled: !!castId,
    staleTime: 5 * 60 * 1000, // 5 minutes - points data changes moderately
  });

  // Cast Passport Data Query
  const {
    data: passportData,
    isLoading: passportLoading,
    error: passportError,
  } = useQuery({
    queryKey: queryKeys.cast.passport(castId),
    queryFn: () => getCastPassportData(castId),
    enabled: !!castId,
    staleTime: 15 * 60 * 1000, // 15 minutes - passport data changes slowly
  });

  // Cast Grade Query
  const {
    data: gradeInfo,
    isLoading: gradeLoading,
    error: gradeError,
  } = useQuery({
    queryKey: queryKeys.cast.grade(castId),
    queryFn: () => getCastGrade(castId),
    enabled: !!castId,
    staleTime: 30 * 60 * 1000, // 30 minutes - grade info changes very slowly
  });

  // Cast Monthly Ranking Query
  const {
    data: monthlyRanking,
    isLoading: rankingLoading,
    error: rankingError,
  } = useQuery({
    queryKey: queryKeys.cast.monthlyRanking(castId, 'current'),
    queryFn: () => getMonthlyEarnedRanking({ castId, limit: 10, month: 'current' }),
    enabled: !!castId,
    staleTime: 10 * 60 * 1000, // 10 minutes - ranking data changes moderately
  });

  // Cast Reservations Query
  const {
    data: reservations,
    isLoading: reservationsLoading,
    error: reservationsError,
  } = useQuery({
    queryKey: queryKeys.cast.reservations(castId),
    queryFn: () => getAllReservations(),
    enabled: !!castId,
    staleTime: 30 * 1000, // 30 seconds - reservations update frequently
    // Removed refetchInterval - real-time updates will handle this
  });

  // Cast Applications Query
  const {
    data: applications,
    isLoading: applicationsLoading,
    error: applicationsError,
  } = useQuery({
    queryKey: queryKeys.cast.applications(castId),
    queryFn: () => getAllCastApplications(castId),
    enabled: !!castId,
    staleTime: 30 * 1000, // 30 seconds - applications update frequently
    // Removed refetchInterval - real-time updates will handle this
  });

  // Combined loading state
  const isLoading = 
    profileLoading || 
    chatsLoading || 
    notificationsLoading || 
    pointsLoading || 
    passportLoading || 
    gradeLoading || 
    rankingLoading || 
    reservationsLoading || 
    applicationsLoading;

  // Combined error state
  const error = 
    profileError || 
    chatsError || 
    notificationsError || 
    pointsError || 
    passportError || 
    gradeError || 
    rankingError || 
    reservationsError || 
    applicationsError;

  // Prefetch related data for better performance
  const prefetchRelatedData = () => {
    if (castId) {
      // Prefetch all related data
      queryClient.prefetchQuery({
        queryKey: queryKeys.cast.profile(castId),
        queryFn: () => getCastProfileById(castId),
      });
      queryClient.prefetchQuery({
        queryKey: queryKeys.cast.chats(castId),
        queryFn: () => getCastChats(castId),
      });
      queryClient.prefetchQuery({
        queryKey: queryKeys.cast.notifications(castId),
        queryFn: () => getNotifications('cast', castId),
      });
    }
  };

  // Invalidate all cast data
  const invalidateAllCastData = () => {
    if (castId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.cast.profile(castId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cast.chats(castId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cast.notifications(castId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cast.points(castId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cast.passport(castId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cast.grade(castId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cast.monthlyRanking(castId, 'current') });
      queryClient.invalidateQueries({ queryKey: queryKeys.cast.reservations(castId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cast.applications(castId) });
    }
  };

  return {
    // Data
    profile: profile?.cast || null,
    chats: chats || [],
    notifications: notifications || [],
    pointsData: pointsData || null,
    passportData: passportData?.passport_data || [],
    gradeInfo: gradeInfo || null,
    monthlyRanking: monthlyRanking || null,
    reservations: reservations || [],
    applications: applications || [],
    
    // Loading states
    isLoading,
    profileLoading,
    chatsLoading,
    notificationsLoading,
    pointsLoading,
    passportLoading,
    gradeLoading,
    rankingLoading,
    reservationsLoading,
    applicationsLoading,
    
    // Error states
    error,
    profileError,
    chatsError,
    notificationsError,
    pointsError,
    passportError,
    gradeError,
    rankingError,
    reservationsError,
    applicationsError,
    
    // Utility functions
    prefetchRelatedData,
    invalidateAllCastData,
  };
};
