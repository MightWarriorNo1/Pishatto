import React, { useState } from 'react';
import ProfileDetailEditPage from './ProfileDetailEditPage';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface AvatarEditPageProps {
    onBack: () => void;
}

const PreviewProfile: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
        {/* Large avatar image with back button */}
        <div className="relative">
            <img src="/assets/avatar/2.jpg" alt="avatar" className="w-full h-64 object-cover" />
            <button onClick={onBack} className="absolute top-4 left-4 bg-primary bg-opacity-70 rounded-full p-2 text-2xl shadow text-white border border-secondary">
                <ChevronLeft />
            </button>
        </div>
        {/* Badge */}
        <div className="px-4 mt-2">
            <span className="bg-secondary text-white text-xs rounded px-2 py-1 font-bold">最近入会</span>
        </div>
        {/* Profile card */}
        <div className="flex items-center gap-3 px-4 mt-4">
            <img src="/assets/avatar/2.jpg" alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-secondary shadow" />
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-secondary rounded-full inline-block"></span>
                    <span className="text-xs text-white">オンライン中</span>
                </div>
                <div className="font-bold text-base text-white">まこちゃん</div>
                <div className="text-xs text-white font-bold">弁護士 / 寿司がすし</div>
            </div>
        </div>
        {/* Profile details */}
        <div className="bg-primary px-4 py-4 mt-2 rounded-lg shadow border border-secondary">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-white">身長：</div><div className="font-bold text-white">175</div>
                <div className="text-white">居住地：</div><div className="font-bold text-white">東京都</div>
                <div className="text-white">出身地：</div><div className="font-bold text-white">北海道</div>
                <div className="text-white">学歴：</div><div className="font-bold text-white">大学卒</div>
                <div className="text-white">年収：</div><div className="font-bold text-white">400万〜600万</div>
                <div className="text-white">お仕事：</div><div className="font-bold text-white">弁護士</div>
                <div className="text-white">お酒：</div><div className="font-bold text-white">ときどき飲む</div>
                <div className="text-white">タバコ：</div><div className="font-bold text-white">ときどき吸う</div>
                <div className="text-white">兄弟姉妹：</div><div className="font-bold text-white">長男</div>
                <div className="text-white">同居人：</div><div className="font-bold text-white">ペットと一緒</div>
            </div>
        </div>
        {/* Recent post */}
        <div className="bg-primary mt-6 px-4 py-3 rounded-t-lg border-t border-secondary">
            <div className="text-sm font-bold mb-2 text-white">最近のつぶやき</div>
            <div className="flex items-start gap-3">
                <img src="/assets/avatar/2.jpg" alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-secondary" />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white">まこちゃん</span>
                        <span className="text-xs text-white font-bold">弁護士</span>
                        <span className="text-xs text-white">22:10</span>
                    </div>
                    <div className="text-sm mt-1 text-white">よろしくお願いします！</div>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-white text-xl">&#10084;</span>
                    <span className="text-xs text-white">1</span>
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
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-primary border-secondary">
                <button onClick={onBack} className="text-2xl text-white">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold text-white">編集する</span>
                <span className="font-bold cursor-pointer text-white" onClick={() => setPreview(true)}>プレビュー</span>
            </div>
            {/* Avatar section */}
            <div className="flex flex-col items-center py-6">
                <img src="/assets/avatar/AdobeStock_1095142160_Preview.jpeg" alt="avatar" className="w-32 h-32 rounded-full object-cover border-4 border-secondary shadow" />
                <div className="flex flex-row mt-4 gap-4">
                    <img src="/assets/avatar/AdobeStock_1067731649_Preview.jpeg" alt="avatar-small" className="w-14 h-14 rounded-full object-cover border-2 border-secondary shadow" />
                    <button className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-white text-3xl font-bold">
                        <Plus />
                    </button>
                </div>
            </div>
            {/* Nickname */}
            <div className="bg-primary px-4 py-3 border-b border-secondary">
                <div className="text-xs text-white font-bold mb-1">ニックネーム</div>
                <div className="flex items-center justify-between">
                    <span className="text-base text-white">まこちゃん</span>
                    <button className="text-white text-xl">
                        <ChevronRight />
                    </button>
                </div>
            </div>
            {/* Today's comment */}
            <div className="bg-primary px-4 py-3 border-b border-secondary mt-2">
                <div className="text-xs text-white font-bold mb-1">今日のひとこと</div>
                <div className="flex items-center justify-between">
                    <span className="text-base text-white"> </span>
                    <button className="text-white text-xl">
                        <ChevronRight />
                    </button>
                </div>
            </div>
            {/* Simple profile */}
            <div className="bg-primary px-4 py-3 border-b border-secondary mt-2" onClick={() => setShowProfileDetailEdit(true)} style={{ cursor: 'pointer' }}>
                <div className="text-xs text-white font-bold mb-1">簡単プロフィール</div>
                <div className="flex items-center justify-between">
                    <span className="text-base text-white">わいわい,旅行,日本食,シャンパン</span>
                    <button className="text-white text-xl">
                        <ChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarEditPage; 