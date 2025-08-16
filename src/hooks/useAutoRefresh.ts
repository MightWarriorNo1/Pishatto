import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseAutoRefreshOptions {
  interval?: number; // Refresh interval in milliseconds
  enabled?: boolean; // Whether auto-refresh is enabled
  queryKeys?: readonly (readonly unknown[])[]; // Specific query keys to refresh
}

/**
 * Hook that automatically refreshes React Query data at specified intervals
 * @param options Configuration options for auto-refresh
 */
export const useAutoRefresh = (options: UseAutoRefreshOptions = {}) => {
  const {
    interval = 50 * 1000, // Default: 50 seconds
    enabled = true,
    queryKeys = []
  } = options;
  
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const refreshData = () => {
      if (queryKeys.length > 0) {
        // Refresh specific queries
        queryKeys.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      } else {
        // Refresh all queries
        queryClient.refetchQueries();
      }
    };

    // Set up interval
    intervalRef.current = setInterval(refreshData, interval);

    // Initial refresh
    refreshData();

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, queryKeys, queryClient]);

  // Function to manually refresh data
  const refreshNow = () => {
    if (queryKeys.length > 0) {
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    } else {
      queryClient.refetchQueries();
    }
  };

  // Function to stop auto-refresh
  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Function to start auto-refresh
  const startAutoRefresh = () => {
    if (intervalRef.current) {
      return; // Already running
    }
    
    const refreshData = () => {
      if (queryKeys.length > 0) {
        queryKeys.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      } else {
        queryClient.refetchQueries();
      }
    };

    intervalRef.current = setInterval(refreshData, interval);
    refreshData(); // Initial refresh
  };

  return {
    refreshNow,
    stopAutoRefresh,
    startAutoRefresh,
    isRunning: !!intervalRef.current
  };
};
