import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { useCast } from './CastContext';
import { getNotificationSettings, NotificationSettings } from '../services/api';

interface NotificationSettingsContextType {
  settings: NotificationSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  isNotificationEnabled: (settingKey: keyof NotificationSettings) => boolean;
}

const NotificationSettingsContext = createContext<NotificationSettingsContextType | undefined>(undefined);

interface NotificationSettingsProviderProps {
  children: ReactNode;
}

export const NotificationSettingsProvider: React.FC<NotificationSettingsProviderProps> = ({ children }) => {
  const { user } = useUser();
  const { castId } = useCast();
  const [settings, setSettings] = useState<NotificationSettings>({
    footprints: true,
    likes: true,
    messages: true,
    concierge_messages: true,
    meetup_dissolution: true,
    auto_extension: true,
    tweet_likes: true,
    admin_notices: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      // Determine which user type is active for notification settings
      const isGuest = Boolean(user?.id);
      const isCast = !isGuest && Boolean(castId);

      if (!isGuest && !isCast) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userType = isGuest ? 'guest' : 'cast';
        const targetId = isGuest ? (user as any).id : (castId as number);
        const userSettings = await getNotificationSettings(userType as 'guest' | 'cast', targetId);
        setSettings(userSettings);
      } catch (error) {
        console.error('Error loading notification settings:', error);
        // Keep default settings on error
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user?.id, castId]);

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const isNotificationEnabled = (settingKey: keyof NotificationSettings): boolean => {
    return settings[settingKey];
  };

  return (
    <NotificationSettingsContext.Provider
      value={{
        settings,
        loading,
        updateSettings,
        isNotificationEnabled,
      }}
    >
      {children}
    </NotificationSettingsContext.Provider>
  );
};

export const useNotificationSettings = () => {
  const context = useContext(NotificationSettingsContext);
  if (context === undefined) {
    throw new Error('useNotificationSettings must be used within a NotificationSettingsProvider');
  }
  return context;
}; 