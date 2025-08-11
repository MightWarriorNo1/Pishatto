import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus,Trash2 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { uploadGuestAvatar, deleteGuestAvatar } from '../../services/api';
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
        <div className="max-w-md mx-auto min-h-screen bg-gradient-br-to from-primary via-primary to-secondary pb-8">
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
            <div className="grid grid-cols-2 gap-y-2 text-sm px-4 mt-4 pb-20">
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
    const { user, interests, updateUser } = useUser();
    const [preview, setPreview] = useState(false);
    const [showProfileDetailEdit, setShowProfileDetailEdit] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getAvatarUrl = () => {
        if (user?.avatar) {
            return getFirstAvatarUrl(user.avatar);
        }
        return '/assets/avatar/AdobeStock_1095142160_Preview.jpeg'; // Default avatar
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('画像ファイルを選択してください。');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('ファイルサイズは5MB以下にしてください。');
            return;
        }

        if (!user?.phone) {
            alert('ユーザー情報が見つかりません。');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        // Simulate smooth upload progress
        const startTime = Date.now();
        const duration = 2000; // 2 seconds for smooth animation

        const progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / duration) * 90, 90); // Smooth progress up to 90%

            setUploadProgress(progress);

            if (progress >= 90) {
                clearInterval(progressInterval);
            }
        }, 50); // Update every 50ms for smoother animation

        try {
            const data = await uploadGuestAvatar(file, user.phone);

            setUploadProgress(100);

            // Update user context with new avatar
            if (updateUser && data.avatar) {
                updateUser({ ...user, avatar: data.avatar });
            }

            // alert('アバターが正常に更新されました。');
        } catch (error: any) {
            console.error('Avatar upload error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'アップロードに失敗しました。';
            alert(`アップロードエラー: ${errorMessage}`);
        } finally {
            clearInterval(progressInterval);
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleAvatarClick = () => {
        if (!uploading && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDeleteAvatar = async () => {
        if (!user?.phone) {
            alert('ユーザー情報が見つかりません。');
            return;
        }

        if (!user?.avatar) {
            alert('アバターが設定されていません。');
            return;
        }

        if (!window.confirm('アバターを削除しますか？')) {
            return;
        }

        setUploading(true);

        try {
            await deleteGuestAvatar(user.phone);

            // Update user context to remove avatar
            if (updateUser) {
                updateUser({ ...user, avatar: undefined });
            }

            alert('アバターが削除されました。');
        } catch (error: any) {
            console.error('Avatar delete error:', error);
            const errorMessage = error.response?.data?.message || error.message || '削除に失敗しました。';
            alert(`削除エラー: ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    };

    // Get a comma-separated string of interest tags
    const interestTags = interests && interests.length > 0
        ? interests.map(i => i.tag).join(', ')
        : '未設定';
    const ageStr = user?.age ? `${user.age}` : '未設定';
    const shiatsuStr = user?.shiatsu ? user.shiatsu : '未設定';

    if (preview) return <PreviewProfile onBack={() => setPreview(false)} />; // Keep as is or implement preview as needed
    if (showProfileDetailEdit) return <ProfileDetailEditPage onBack={() => setShowProfileDetailEdit(false)} />;

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-br-to from-primary via-primary to-secondary pb-8">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
            />

            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-primary border-secondary">
                <button onClick={onBack} className="text-2xl text-white hover:text-secondary cursor-pointer">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold text-white">編集する</span>
                <span className="font-bold cursor-pointer text-white" onClick={() => setPreview(true)}>プレビュー</span>
            </div>

            {/* Avatar section */}
            <div className="flex flex-col items-center py-6">
                <div className="relative">
                    <img
                        src={getAvatarUrl()}
                        alt="avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-secondary shadow cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={handleAvatarClick}
                        onError={(e) => {
                            e.currentTarget.src = '/assets/avatar/AdobeStock_1095142160_Preview.jpeg';
                        }}
                    />
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                            <div className="text-white text-sm">アップロード中...</div>
                        </div>
                    )}
                    {user?.avatar && (
                        <button
                            onClick={handleDeleteAvatar}
                            disabled={uploading}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                <div className="flex flex-row mt-4 gap-4">
                    <img
                        src={getAvatarUrl()}
                        alt="avatar-small"
                        className="w-14 h-14 rounded-full object-cover border-2 border-secondary shadow"
                        onError={(e) => {
                            e.currentTarget.src = '/assets/avatar/AdobeStock_1067731649_Preview.jpeg';
                        }}
                    />
                    <button
                        onClick={handleAvatarClick}
                        disabled={uploading}
                        className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-white text-3xl font-bold hover:bg-secondary/80 transition-colors disabled:opacity-50"
                    >
                        {uploading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                            <Plus />
                        )}
                    </button>
                                 </div>

                 {/* Nickname section */}
                 <div className="bg-primary px-4 py-3 border-b border-secondary mt-2">
                     <div className="text-xs text-white font-bold mb-1">ニックネーム</div>
                     <div className="flex items-center justify-between">
                         <span className="text-base text-white">{user?.nickname || 'まこちゃん'}</span>
                         <button className="text-white text-xl">
                             <ChevronRight />
                         </button>
                     </div>
                 </div>

                 
                 {uploading && (
                     <div className="mt-4 w-full max-w-xs">
                         <div className="bg-gray-200 rounded-full h-2">
                             <div 
                                 className="bg-secondary h-2 rounded-full transition-all duration-300"
                                 style={{ width: `${uploadProgress}%` }}
                             ></div>
                         </div>
                         <p className="text-white text-xs text-center mt-2">アップロード中... {uploadProgress}%</p>
                     </div>
                 )}
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