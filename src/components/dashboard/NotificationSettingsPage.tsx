import { ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNotificationSettings } from '../../contexts/NotificationSettingsContext';
import { updateNotificationSettings, NotificationSettings } from '../../services/api';

interface NotificationSettingsPageProps {
    onBack: () => void;
}

const settingLabels: Record<keyof NotificationSettings, string> = {
    footprints: '足あと',
    likes: 'いいね',
    messages: 'メッセージ',
    concierge_messages: 'コンシェルジュのメッセージ',
    meetup_dissolution: '合流・解散通知',
    auto_extension: '自動延長通知',
    tweet_likes: 'つぶやきへのいいね',
    admin_notices: '運営からのお知らせ',
};

const NotificationSettingsPage: React.FC<NotificationSettingsPageProps> = ({ onBack }) => {
    const { user } = useUser();
    const { settings, updateSettings, loading: contextLoading } = useNotificationSettings();
    const [saving, setSaving] = useState(false);

    const handleToggle = async (key: keyof NotificationSettings) => {
        if (!user?.id || saving) return;

        const newValue = !settings[key];
        
        // Update local state immediately for responsive UI
        updateSettings({ [key]: newValue });

        try {
            setSaving(true);
            await updateNotificationSettings('guest', user.id, { [key]: newValue });
        } catch (error) {
            console.error('Error updating notification setting:', error);
            // Revert on error
            updateSettings({ [key]: !newValue });
        } finally {
            setSaving(false);
        }
    };

    if (contextLoading) {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-primary via-primary to-secondary relative">
                <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
                    <button onClick={onBack} className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer transition-colors">
                        <ChevronLeft />
                    </button>
                    <span className="text-lg font-bold flex-1 text-center text-white">通知設定</span>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-primary via-primary to-secondary relative">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
                <button onClick={onBack} className="mr-2 text-2xl text-white hover:text-secondary transition-colors cursor-pointer">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center text-white">通知設定</span>
            </div>
            {/* Notification toggles */}
            <div className="divide-y divide-secondary">
                {Object.entries(settingLabels).map(([key, label]) => {
                    const settingKey = key as keyof NotificationSettings;
                    const isEnabled = settings[settingKey];
                    
                    return (
                        <div key={key} className="flex items-center justify-between px-4 py-4 bg-primary">
                            <span className="text-white">{label}</span>
                            <button
                                className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${isEnabled ? 'bg-secondary' : 'bg-white border border-secondary'}`}
                                onClick={() => handleToggle(settingKey)}
                                disabled={saving}
                            >
                                <span
                                    className={`h-5 w-5 bg-primary rounded-full shadow transform transition-transform duration-200 ${isEnabled ? 'translate-x-5' : ''}`}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NotificationSettingsPage; 