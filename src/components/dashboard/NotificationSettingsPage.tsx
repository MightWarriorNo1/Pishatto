import { ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';

interface NotificationSettingsPageProps {
    onBack: () => void;
}

const initialSettings = [
    { label: '足あと', value: true },
    { label: 'いいね', value: true },
    { label: 'メッセージ', value: true },
    { label: 'コンシェルジュのメッセージ', value: true },
    { label: '合流・解散通知', value: true },
    { label: '自動延長通知', value: true },
    { label: '>つぶやきへのいいね', value: true },
    { label: '運営からのお知らせ', value: true },
];

const NotificationSettingsPage: React.FC<NotificationSettingsPageProps> = ({ onBack }) => {
    const [settings, setSettings] = useState(initialSettings);
    const [appMessage, setAppMessage] = useState(true);

    const handleToggle = (idx: number) => {
        setSettings(settings => settings.map((s, i) => i === idx ? { ...s, value: !s.value } : s));
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-br-to from-primary via-primary to-secondary relative">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
                <button onClick={onBack} className="mr-2 text-2xl text-white hover:text-secondary transition-colors">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center text-white">通知設定</span>
            </div>
            {/* Notification toggles */}
            <div className="divide-y divide-secondary">
                {settings.map((item, idx) => (
                    <div key={item.label} className="flex items-center justify-between px-4 py-4 bg-primary">
                        <span className="text-white">{item.label}</span>
                        <button
                            className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${item.value ? 'bg-secondary' : 'bg-white border border-secondary'}`}
                            onClick={() => handleToggle(idx)}
                        >
                            <span
                                className={`h-5 w-5 bg-primary rounded-full shadow transform transition-transform duration-200 ${item.value ? 'translate-x-5' : ''}`}
                            />
                        </button>
                    </div>
                ))}
                {/* Section header */}
                <div className="bg-primary text-xs text-white px-4 py-2 font-bold">アプリ内通知設定</div>
                {/* App message toggle */}
                <div className="flex items-center justify-between px-4 py-4 bg-primary">
                    <span className="text-white">メッセージ</span>
                    <button
                        className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${appMessage ? 'bg-secondary' : 'bg-primary border border-secondary'}`}
                        onClick={() => setAppMessage(v => !v)}
                    >
                        <span
                            className={`h-5 w-5 bg-primary rounded-full shadow transform transition-transform duration-200 ${appMessage ? 'translate-x-5' : ''}`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsPage; 