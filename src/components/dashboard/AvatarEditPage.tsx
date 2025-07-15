import React, { useState } from 'react';
import ProfileDetailEditPage from './ProfileDetailEditPage';

interface AvatarEditPageProps {
    onBack: () => void;
}

const PreviewProfile: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="max-w-md mx-auto min-h-screen bg-white pb-8">
        {/* Large avatar image with back button */}
        <div className="relative">
            <img src="/public/assets/avatar/avatar-1.png" alt="avatar" className="w-full h-64 object-cover" />
            <button onClick={onBack} className="absolute top-4 left-4 bg-white bg-opacity-70 rounded-full p-2 text-2xl shadow">&#60;</button>
        </div>
        {/* Orange badge */}
        <div className="px-4 mt-2">
            <span className="bg-orange-500 text-white text-xs rounded px-2 py-1 font-bold">最近入会</span>
        </div>
        {/* Profile card */}
        <div className="flex items-center gap-3 px-4 mt-4">
            <img src="/public/assets/avatar/avatar-1.png" alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                    <span className="text-xs text-gray-600">オンライン中</span>
                </div>
                <div className="font-bold text-base">まこちゃん</div>
                <div className="text-xs text-blue-700 font-bold">弁護士 / 寿司がすし</div>
            </div>
        </div>
        {/* Profile details */}
        <div className="bg-white px-4 py-4 mt-2 rounded-lg shadow">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-500">身長：</div><div className="font-bold">175</div>
                <div className="text-gray-500">居住地：</div><div className="font-bold">東京都</div>
                <div className="text-gray-500">出身地：</div><div className="font-bold">北海道</div>
                <div className="text-gray-500">学歴：</div><div className="font-bold">大学卒</div>
                <div className="text-gray-500">年収：</div><div className="font-bold">400万〜600万</div>
                <div className="text-gray-500">お仕事：</div><div className="font-bold">弁護士</div>
                <div className="text-gray-500">お酒：</div><div className="font-bold">ときどき飲む</div>
                <div className="text-gray-500">タバコ：</div><div className="font-bold">ときどき吸う</div>
                <div className="text-gray-500">兄弟姉妹：</div><div className="font-bold">長男</div>
                <div className="text-gray-500">同居人：</div><div className="font-bold">ペットと一緒</div>
            </div>
        </div>
        {/* Recent post */}
        <div className="bg-gray-50 mt-6 px-4 py-3 rounded-t-lg border-t">
            <div className="text-sm font-bold mb-2">最近のつぶやき</div>
            <div className="flex items-start gap-3">
                <img src="/public/assets/avatar/avatar-1.png" alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold">まこちゃん</span>
                        <span className="text-xs text-blue-700 font-bold">弁護士</span>
                        <span className="text-xs text-gray-400">22:10</span>
                    </div>
                    <div className="text-sm mt-1">よろしくお願いします！</div>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-pink-500 text-xl">&#10084;</span>
                    <span className="text-xs text-gray-500">1</span>
                </div>
            </div>
        </div>
    </div>
);

const AvatarEditPage: React.FC<AvatarEditPageProps> = ({ onBack }) => {
    const [preview, setPreview] = useState(false);
    const [showProfileDetailEdit, setShowProfileDetailEdit] = useState(false);
    if (preview) return <PreviewProfile onBack={() => setPreview(false)} />;
    if (showProfileDetailEdit) return <ProfileDetailEditPage onBack={() => setShowProfileDetailEdit(false)} />;
    return (
        <div className="max-w-md mx-auto min-h-screen bg-[#f6f8fa] pb-8">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
                <button onClick={onBack} className="text-2xl text-gray-500">&#60;</button>
                <span className="text-lg font-bold">編集する</span>
                <span className="font-bold cursor-pointer" style={{ color: 'black' }} onClick={() => setPreview(true)}>プレビュー</span>
            </div>
            {/* Avatar section */}
            <div className="flex flex-col items-center py-6">
                <img src="/public/assets/avatar/avatar-1.png" alt="avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow" />
                <div className="flex items-center mt-4 gap-4">
                    <img src="/public/assets/avatar/avatar-1.png" alt="avatar-small" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
                    <button className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-bold">+</button>
                </div>
            </div>
            {/* Nickname */}
            <div className="bg-white px-4 py-3 border-b">
                <div className="text-xs text-gray-500 font-bold mb-1">ニックネーム</div>
                <div className="flex items-center justify-between">
                    <span className="text-base">まこちゃん</span>
                    <button className="text-gray-400 text-xl">&gt;</button>
                </div>
            </div>
            {/* Today's comment */}
            <div className="bg-white px-4 py-3 border-b mt-2">
                <div className="text-xs text-gray-500 font-bold mb-1">今日のひとこと</div>
                <div className="flex items-center justify-between">
                    <span className="text-base text-gray-400"> </span>
                    <button className="text-gray-400 text-xl">&gt;</button>
                </div>
            </div>
            {/* Simple profile */}
            <div className="bg-white px-4 py-3 border-b mt-2" onClick={() => setShowProfileDetailEdit(true)} style={{ cursor: 'pointer' }}>
                <div className="text-xs text-gray-500 font-bold mb-1">簡単プロフィール</div>
                <div className="flex items-center justify-between">
                    <span className="text-base">わいわい,旅行,日本食,シャンパン</span>
                    <button className="text-gray-400 text-xl">&gt;</button>
                </div>
            </div>
        </div>
    );
};

export default AvatarEditPage; 