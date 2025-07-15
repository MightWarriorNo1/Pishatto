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
        <div className="max-w-md mx-auto min-h-screen bg-white">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b bg-white">
                <button onClick={onBack} className="mr-2 text-2xl text-gray-500">&#60;</button>
                <span className="text-lg font-bold flex-1 text-center">通知設定</span>
            </div>
            {/* Notification toggles */}
            <div className="divide-y">
                {settings.map((item, idx) => (
                    <div key={item.label} className="flex items-center justify-between px-4 py-4 bg-white">
                        <span>{item.label}</span>
                        <button
                            className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${item.value ? 'bg-blue-500' : 'bg-gray-300'}`}
                            onClick={() => handleToggle(idx)}
                        >
                            <span
                                className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 ${item.value ? 'translate-x-5' : ''}`}
                            />
                        </button>
                    </div>
                ))}
                {/* Section header */}
                <div className="bg-gray-100 text-xs text-gray-500 px-4 py-2 font-bold">アプリ内通知設定</div>
                {/* App message toggle */}
                <div className="flex items-center justify-between px-4 py-4 bg-white">
                    <span>メッセージ</span>
                    <button
                        className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${appMessage ? 'bg-blue-500' : 'bg-gray-300'}`}
                        onClick={() => setAppMessage(v => !v)}
                    >
                        <span
                            className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 ${appMessage ? 'translate-x-5' : ''}`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsPage; 