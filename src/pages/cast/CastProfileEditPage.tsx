import React, { useEffect, useState } from 'react';
import { getCastProfileById, castUpdateProfile, uploadCastAvatar } from '../../services/api';
import { ChevronLeft, X, Plus } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

const CastProfileEditPage: React.FC<{ onBack: () => void; onProfileUpdate?: () => void }> = ({ onBack, onProfileUpdate }) => {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const castId = Number(localStorage.getItem('castId'));
    const [form, setForm] = useState({
        nickname: '',
        avatar: '',
        height: '',
        residence: '',
        profile_text: '',
        grade_points: '',
    });
    const [initialLoading, setInitialLoading] = useState(true);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatars, setAvatars] = useState<string[]>([]);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        getCastProfileById(castId).then((data) => {
            setForm({
                nickname: data.cast.nickname || '',
                avatar: data.cast.avatar || '',
                height: data.cast.height ? data.cast.height.toString() : '',
                residence: data.cast.residence || '',
                profile_text: data.cast.profile_text || '',
                grade_points: (data.cast.grade_points ?? '').toString(),
            });
            
            // Parse multiple avatars from comma-separated string
            if (data.cast.avatar) {
                const avatarArray = data.cast.avatar.split(',').map((avatar: string) => avatar.trim()).filter((avatar: string) => avatar);
                setAvatars(avatarArray);
            } else {
                setAvatars([]);
            }
            
            setInitialLoading(false);
        }).catch(() => {
            setError('プロフィールの取得に失敗しました');
            setInitialLoading(false);
        });
    }, [castId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarUploading(true);
            setError(null);
            
            try {
                const res = await uploadCastAvatar(file);
                setAvatars(prev => [...prev, res.path]);
                // Update form avatar field with comma-separated string
                const newAvatarString = [...avatars, res.path].join(',');
                setForm(f => ({ ...f, avatar: newAvatarString }));
            } catch (err) {
                setError('アバターのアップロードに失敗しました');
            } finally {
                setAvatarUploading(false);
            }
        }
    };

    const handleDeleteAvatar = (index: number) => {
        const newAvatars = avatars.filter((_, i) => i !== index);
        setAvatars(newAvatars);
        // Update form avatar field with comma-separated string
        const newAvatarString = newAvatars.join(',');
        setForm(f => ({ ...f, avatar: newAvatarString }));
    };

    const validate = () => {
        const errors: { [key: string]: string } = {};
        if (!form.nickname.trim()) errors.nickname = 'ニックネームは必須です';
        if (!form.height || isNaN(Number(form.height))) errors.height = '身長は必須です';
        if (form.grade_points !== '' && (isNaN(Number(form.grade_points)) || Number(form.grade_points) < 0)) {
            errors.grade_points = '利用料金は0以上の数値で入力してください';
        }
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        const errors = validate();
        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) return;
        
        setSaving(true);
        try {
            await castUpdateProfile({
                id: castId,
                ...form,
                height: form.height ? Number(form.height) : undefined,
                grade_points: form.grade_points !== '' ? Number(form.grade_points) : undefined,
            });
            setSuccess(true);
            // Call the onProfileUpdate callback if provided
            if (onProfileUpdate) {
                onProfileUpdate();
            }
            setTimeout(() => onBack(), 1000);
        } catch (err) {
            setError('プロフィールの更新に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    if (initialLoading) return (<div className="flex-1 flex items-center justify-center">
                                    <Spinner size="lg" />
                                </div>)
    if (error && !avatarUploading && !saving) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="bg-gradient-to-b from-primary via-primary to-secondary min-h-screen pb-24 overflow-y-auto scrollbar-hidden">
            <div className="flex max-w-md mx-auto top-0 left-0 right-0 items-center justify-between p-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-white hover:text-secondary focus:outline-none cursor-pointer"
                    aria-label="戻る"
                >
                    <ChevronLeft size={24} />
                </button>
                <span className="text-lg font-bold text-white">プロフィール編集</span>
                <div className="w-6"></div>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
                <div className="mb-6">
                    <label className="block text-white mb-3 font-medium">アバター画像</label>
                    <div className="flex flex-wrap gap-3 mb-4">
                        {avatars.map((avatar, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={`${API_BASE_URL}/${avatar}`}
                                    alt={`Avatar ${index + 1}`}
                                    className="w-20 h-20 rounded-lg object-cover border-2 border-secondary"
                                    onError={e => (e.currentTarget.src = '/assets/avatar/avatar-1.png')}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteAvatar(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        <label className="w-20 h-20 border-2 border-dashed border-secondary rounded-lg flex items-center justify-center cursor-pointer hover:border-secondary/70 transition-colors">
                            <div className="text-center">
                                <Plus size={20} className="text-secondary mx-auto mb-1" />
                                <span className="text-secondary text-xs">追加</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                                disabled={avatarUploading}
                            />
                        </label>
                    </div>
                    {avatarUploading && (
                        <div className="text-secondary text-sm text-center">アップロード中...</div>
                    )}
                </div>

                <label className="block text-white mb-2">ニックネーム</label>
                <input
                    type="text"
                    name="nickname"
                    value={form.nickname}
                    onChange={handleChange}
                    className="w-full mb-1 p-2 rounded text-primary"
                    disabled={avatarUploading || saving}
                />
                {validationErrors.nickname && <div className="text-red-400 text-xs mb-2">{validationErrors.nickname}</div>}
               
                <label className="block text-white mb-2">身長</label>
                <input
                    type="number"
                    name="height"
                    value={form.height}
                    onChange={handleChange}
                    className="w-full mb-1 p-2 rounded text-primary"
                    disabled={avatarUploading || saving}
                />
                {validationErrors.height && <div className="text-red-400 text-xs mb-2">{validationErrors.height}</div>}
                <label className="block text-white mb-2">居住地</label>
                <input
                    type="text"
                    name="residence"
                    value={form.residence}
                    onChange={handleChange}
                    className="w-full mb-4 p-2 rounded text-primary"
                    disabled={avatarUploading || saving}
                />
                
                <label className="block text-white mb-2">プロフィール</label>
                <textarea
                    name="profile_text"
                    value={form.profile_text}
                    onChange={handleChange}
                    className="w-full mb-4 p-2 rounded text-primary"
                    disabled={avatarUploading || saving}
                />
                <label className="block text-white mb-2">利用料金（30分あたりのポイント）</label>
                <input
                    type="number"
                    name="grade_points"
                    value={form.grade_points}
                    onChange={handleChange}
                    className="w-full mb-1 p-2 rounded text-primary"
                    disabled={avatarUploading || saving}
                    min={0}
                />
                {validationErrors.grade_points && <div className="text-red-400 text-xs mb-2">{validationErrors.grade_points}</div>}
                {error && <div className="text-red-500 text-center mb-2">{error}</div>}
                {success && <div className="text-green-500 text-center mb-2">プロフィールを更新しました！</div>}
                <button 
                    type="submit" 
                    className="w-full h-16 rounded-lg bg-secondary text-lg text-white font-bold hover:bg-red-700 transition disabled:opacity-50" 
                    disabled={avatarUploading || saving}
                >
                    {saving ? '保存中...' : '保存'}
                </button>
            </form>
        </div>
    );
};

export default CastProfileEditPage; 