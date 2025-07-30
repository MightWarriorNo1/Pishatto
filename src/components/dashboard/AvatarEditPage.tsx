import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import ProfileDetailEditPage from './ProfileDetailEditPage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Utility function to get the first available avatar from comma-separated string
const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
    if (!avatarString) {
        return '/assets/avatar/AdobeStock_1095142160_Preview.jpeg';
    }
    
    // Split by comma and get the first non-empty avatar
    const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
    
    if (avatars.length === 0) {
        return '/assets/avatar/AdobeStock_1095142160_Preview.jpeg';
    }
    
    return `${API_BASE_URL}/${avatars[0]}`;
};

interface AvatarEditPageProps {
    onBack: () => void;
}

const PreviewProfile: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useUser();
    const getAvatarUrl = () => {
        if (user?.avatar) {
            return getFirstAvatarUrl(user.avatar);
        }
        return '/assets/avatar/2.jpg';
    };
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
            {/* Large avatar image with back button */}
            <div className="relative">
                <img src={getAvatarUrl()} alt="avatar" className="w-full h-full object-cover" />
                <button onClick={onBack} className="absolute top-4 left-4 bg-primary bg-opacity-70 rounded-full p-2 text-2xl shadow text-white border border-secondary">
                    <ChevronLeft />
                </button>
            </div>
            {/* Badge */}
            <div className="px-4 mt-2">
                <span className="bg-secondary text-white text-xs rounded px-2 py-1 font-bold">最近入会</span>
            </div>
            {/* Profile card */}
            <div className="flex items-center gap-3 px-4 mt-4 ">
                <img src={getAvatarUrl()} alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-secondary shadow" />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-secondary rounded-full inline-block"></span>
                        <span className="text-xs text-white">オンライン中</span>
                    </div>
                    <div className="font-bold text-base text-white">{user?.nickname || ''}</div>
                    <div className="text-xs text-white font-bold">{user?.occupation || ''}</div>
                </div>
            </div>
            {/* Profile details */}
            <div className="grid grid-cols-2 gap-y-2 text-sm px-4 mt-4">
                <div className="text-white">身長：</div><div className="font-bold text-white">{user?.height || ''}</div>
                <div className="text-white">居住地：</div><div className="font-bold text-white">{user?.residence || ''}</div>
                <div className="text-white">出身地：</div><div className="font-bold text-white">{user?.birthplace || ''}</div>
                <div className="text-white">学歴：</div><div className="font-bold text-white">{user?.education || ''}</div>
                <div className="text-white">年収：</div><div className="font-bold text-white">{user?.annual_income || ''}</div>
                <div className="text-white">お仕事：</div><div className="font-bold text-white">{user?.occupation || ''}</div>
                <div className="text-white">お酒：</div><div className="font-bold text-white">{user?.alcohol || ''}</div>
                <div className="text-white">タバコ：</div><div className="font-bold text-white">{user?.tobacco || ''}</div>
                <div className="text-white">兄弟姉妹：</div><div className="font-bold text-white">{user?.siblings || ''}</div>
                <div className="text-white">同居人：</div><div className="font-bold text-white">{user?.cohabitant || ''}</div>
            </div>
        </div>
    );
};

const AvatarEditPage: React.FC<AvatarEditPageProps> = ({ onBack }) => {
    const { user, interests } = useUser();
    const [preview, setPreview] = useState(false);
    const [showProfileDetailEdit, setShowProfileDetailEdit] = useState(false);

    const getAvatarUrl = () => {
        if (user?.avatar) {
            return getFirstAvatarUrl(user.avatar);
        }
        return '/assets/avatar/AdobeStock_1095142160_Preview.jpeg'; // Default avatar
    };

    // Get a comma-separated string of interest tags
    const interestTags = interests && interests.length > 0
        ? interests.map(i => i.tag).join(', ')
        : '未設定';
    const ageStr = user?.age ? `${user.age}` : '未設定';
    const shiatsuStr = user?.shiatsu ? user.shiatsu : '未設定';

    if (preview) return <PreviewProfile onBack={()=>setPreview(false)} />; // Keep as is or implement preview as needed
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
                <img 
                    src={getAvatarUrl()} 
                    alt="avatar" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-secondary shadow"
                    onError={(e) => {
                        e.currentTarget.src = '/assets/avatar/AdobeStock_1095142160_Preview.jpeg';
                    }}
                />
                <div className="flex flex-row mt-4 gap-4">
                    <img 
                        src={getAvatarUrl()} 
                        alt="avatar-small" 
                        className="w-14 h-14 rounded-full object-cover border-2 border-secondary shadow"
                        onError={(e) => {
                            e.currentTarget.src = '/assets/avatar/AdobeStock_1067731649_Preview.jpeg';
                        }}
                    />
                    <button className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-white text-3xl font-bold">
                        <Plus />
                    </button>
                </div>
            </div>

            <div className="bg-primary px-4 py-3 border-b border-secondary">
                <div className="text-xs text-white font-bold mb-1">ニックネーム</div>
                <div className="flex items-center justify-between">
                    <span className="text-base text-white">{user?.nickname || 'まこちゃん'}</span>
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
                    <span className="text-base text-white">{interestTags},{ageStr},{shiatsuStr}</span>
                    <button className="text-white text-xl">
                        <ChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarEditPage;