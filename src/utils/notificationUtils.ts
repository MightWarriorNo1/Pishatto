import { useNotificationSettings } from '../contexts/NotificationSettingsContext';

/**
 * Hook to check if a specific notification type is enabled
 */
export const useNotificationCheck = () => {
  const { isNotificationEnabled } = useNotificationSettings();
  
  return {
    isFootprintEnabled: () => isNotificationEnabled('footprints'),
    isLikeEnabled: () => isNotificationEnabled('likes'),
    isMessageEnabled: () => isNotificationEnabled('messages'),
    isConciergeMessageEnabled: () => isNotificationEnabled('concierge_messages'),
    isMeetupDissolutionEnabled: () => isNotificationEnabled('meetup_dissolution'),
    isAutoExtensionEnabled: () => isNotificationEnabled('auto_extension'),
    isTweetLikeEnabled: () => isNotificationEnabled('tweet_likes'),
    isAdminNoticeEnabled: () => isNotificationEnabled('admin_notices'),
  };
};

/**
 * Utility function to conditionally execute an action based on notification settings
 */
export const executeIfNotificationEnabled = <T>(
  isEnabled: boolean,
  action: () => T,
  fallback?: () => void
): T | void => {
  if (isEnabled) {
    return action();
  } else if (fallback) {
    return fallback();
  }
  return undefined;
};

/**
 * Utility function to conditionally execute an async action based on notification settings
 */
export const executeAsyncIfNotificationEnabled = async <T>(
  isEnabled: boolean,
  action: () => Promise<T>,
  fallback?: () => Promise<void>
): Promise<T | void> => {
  if (isEnabled) {
    return await action();
  } else if (fallback) {
    return await fallback();
  }
  return undefined;
}; 