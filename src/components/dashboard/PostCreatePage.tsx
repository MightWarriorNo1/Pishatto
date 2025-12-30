/*eslint-disable*/
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { getGuestProfileById, getCastProfileById } from '../../services/api';
import getFirstAvatarUrl from '../../utils/avatar';

interface PostCreatePageProps {
    onClose: () => void;
    onSubmit: (content: string, image?: File | null) => void;
    userType?: 'guest' | 'cast';
    userId?: number;
}

interface UserProfile {
    id: number;
    nickname: string;
    avatar?: string;
}

const PostCreatePage: React.FC<PostCreatePageProps> = ({ onClose, onSubmit, userType, userId }) => {
    console.log('PostCreatePage: Component initialized with props:', { userType, userId });
    
    // All hooks must be called before any conditional logic
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Validate required props after hooks
    if (!onClose || !onSubmit) {
        console.error('PostCreatePage: Missing required props onClose or onSubmit');
        return null;
    }

    useEffect(() => {
        const fetchUserProfile = async () => {
            console.log('PostCreatePage: fetchUserProfile called with userType:', userType, 'userId:', userId);
            
            if (!userType || !userId) {
                console.log('PostCreatePage: Missing userType or userId, setting loading to false');
                setLoading(false);
                return;
            }

            try {
                let profile;
                if (userType === 'guest') {
                    console.log('PostCreatePage: Fetching guest profile for userId:', userId);
                    profile = await getGuestProfileById(userId);
                } else if (userType === 'cast') {
                    console.log('PostCreatePage: Fetching cast profile for userId:', userId);
                    const response = await getCastProfileById(userId);
                    profile = response.cast;
                }

                console.log('PostCreatePage: Profile received:', profile);

                if (profile) {
                    setUserProfile({
                        id: profile.id,
                        nickname: profile.nickname,
                        avatar: profile.avatar
                    });
                } else {
                    // Set default profile if API doesn't return data
                    console.log('PostCreatePage: No profile data, setting default');
                    setUserProfile({
                        id: userId,
                        nickname: 'ユーザー',
                        avatar: undefined
                    });
                }
            } catch (error) {
                console.error('PostCreatePage: Failed to fetch user profile:', error);
                // Set default profile on error
                setUserProfile({
                    id: userId,
                    nickname: 'ユーザー',
                    avatar: undefined
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userType, userId]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setImage(null);
            setImagePreview(null);
        }
    };

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = () => {
        // Allow submission if there's either content or an image
        if (content.trim() || image) {
            onSubmit(content, image);
        }
    };
    
    try {
        return (
            <div className="max-w-md min-h-screen bg-gradient-to-b from-primary via-primary to-secondary flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-secondary bg-primary">
                <button onClick={onClose} className="text-3xl text-white font-bol hover:text-tp,atp">
                    <X />
                </button>
                <span className="flex-1 text-center text-lg font-bold text-white">つぶやきを投稿</span>
                <button
                    className="text-white font-bold text-base hover:text-secondary cursor-pointer"
                    disabled={!content.trim() && !image}
                    onClick={handleSubmit}
                >
                    投稿する
                </button>
            </div>
            {/* User info */}
            <div className="flex items-center gap-2 px-4 mt-4">
                {loading ? (
                    <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
                ) : (
                    <img 
                        src={userProfile?.avatar ? getFirstAvatarUrl(userProfile.avatar) : '/assets/avatar/female.png'} 
                        alt="avatar" 
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = '/assets/avatar/2.jpg';
                        }}
                    />
                )}
                <span className="font-bold text-white">
                    {loading ? '読み込み中...' : userProfile?.nickname || 'ユーザー'}
                </span>
            </div>
            {/* Textarea */}
            <textarea
                className="w-full px-4 py-6 text-lg text-white border-none outline-none resize-none bg-primary"
                style={{ minHeight: 120 }}
                placeholder="今なにしてる？"
                value={content}
                onChange={e => setContent(e.target.value)}
            />
            {/* Image upload icon/button, now directly under 投稿する */}
            <div className="flex items-center px-4 mt-2 gap-3">
                <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded bg-secondary text-white font-bold shadow hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                    onClick={handleImageUploadClick}
                >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 15l3-3 2 2 3-3" /><circle cx="8.5" cy="8.5" r="1.5" /></svg>
                    <span>画像を添付</span>
                </button>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                />
                {image && (
                    <span className="text-white text-xs truncate max-w-[120px]">{image.name}</span>
                )}
            </div>
            {/* Image preview */}
            {imagePreview && (
                <div className="flex justify-center py-2">
                    <img src={imagePreview} alt="preview" className="max-h-40 rounded border border-gray-300" />
                    <button
                        type="button"
                        className="ml-2 text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center"
                        onClick={() => { setImage(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    >
                        <X />
                    </button>
                </div>
            )}
        </div>
        );
    } catch (error) {
        console.error('PostCreatePage: Error rendering component:', error);
        return (
            <div className="max-w-md min-h-screen bg-gradient-to-b from-primary via-primary to-secondary flex flex-col">
                <div className="flex items-center justify-between px-4 py-4 border-b border-secondary bg-primary">
                    <button onClick={onClose} className="text-3xl text-white font-bold">
                        <X />
                    </button>
                    <span className="flex-1 text-center text-lg font-bold text-white">エラーが発生しました</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-white text-center">
                        <p>投稿画面の読み込みに失敗しました</p>
                        <button 
                            onClick={onClose}
                            className="mt-4 px-4 py-2 bg-secondary text-white rounded"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            </div>
        );
    }
};

export default PostCreatePage; 