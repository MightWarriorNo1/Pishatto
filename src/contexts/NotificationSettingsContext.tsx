import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
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
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const userSettings = await getNotificationSettings('guest', user.id);
        setSettings(userSettings);
      } catch (error) {
        console.error('Error loading notification settings:', error);
        // Keep default settings on error
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user?.id]);

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