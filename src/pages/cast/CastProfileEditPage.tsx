import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCastProfileById, castUpdateProfile, uploadCastAvatar } from '../../services/api';
import { ChevronLeft } from 'lucide-react';

const CastProfileEditPage: React.FC<{ onBack: () => void; onProfileUpdate?: () => void }> = ({ onBack, onProfileUpdate }) => {
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const castId = Number(localStorage.getItem('castId'));
    const [form, setForm] = useState({
        nickname: '',
        avatar: '',
        birth_year: '',
        height: '',
        residence: '',
        birthplace: '',
        profile_text: '',
    });
    const [initialLoading, setInitialLoading] = useState(true);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('/assets/avatar/avatar-1.png');
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        getCastProfileById(castId).then((data) => {
            setForm({
                nickname: data.cast.nickname || '',
                avatar: data.cast.avatar || '',
                birth_year: data.cast.birth_year ? data.cast.birth_year.toString() : '',
                height: data.cast.height ? data.cast.height.toString() : '',
                residence: data.cast.residence || '',
                birthplace: data.cast.birthplace || '',
                profile_text: data.cast.profile_text || '',
            });
            setAvatarPreview(data.cast.avatar ? `${API_BASE_URL}/${data.cast.avatar}` : '/assets/avatar/avatar-1.png');
            setInitialLoading(false);
        }).catch(() => {
            setError('プロフィールの取得に失敗しました');
            setInitialLoading(false);
        });
    }, [castId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Set preview immediately for better UX
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
            setAvatarUploading(true);
            setError(null);
            
            try {
                const res = await uploadCastAvatar(file);
                setForm(f => ({ ...f, avatar: res.path }));
                // Update preview to use the uploaded image URL
                setAvatarPreview(`${API_BASE_URL}/${res.path}`);
            } catch (err) {
                setError('アバターのアップロードに失敗しました');
                // Revert to previous avatar on error
                setAvatarPreview(form.avatar ? `${API_BASE_URL}/${form.avatar}` : '/assets/avatar/avatar-1.png');
            } finally {
                setAvatarUploading(false);
            }
        }
    };

    const validate = () => {
        const errors: { [key: string]: string } = {};
        if (!form.nickname.trim()) errors.nickname = 'ニックネームは必須です';
        if (!form.birth_year || isNaN(Number(form.birth_year))) errors.birth_year = '生年は必須です';
        if (!form.height || isNaN(Number(form.height))) errors.height = '身長は必須です';
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
                birth_year: form.birth_year ? Number(form.birth_year) : undefined,
                height: form.height ? Number(form.height) : undefined,
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

    if (initialLoading) return <div className="text-center text-white">読み込み中...</div>;
    if (error && !avatarUploading && !saving) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="max-w-md bg-primary min-h-screen pb-24">
            <div className="flex items-center p-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="mr-2 text-white hover:text-secondary focus:outline-none"
                    aria-label="戻る"
                >
                    <ChevronLeft size={24} />
                </button>
                <span className="text-lg font-bold text-white">プロフィール編集</span>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
                <div className="flex flex-col items-center mb-4">
                    <div className="relative">
                        <img
                            src={avatarPreview}
                            alt="avatar preview"
                            className="w-24 h-24 rounded-full object-cover border-2 border-secondary mb-2"
                            onError={e => (e.currentTarget.src = '/assets/avatar/avatar-1.png')}
                        />
                        {avatarUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                <div className="text-white text-xs">アップロード中...</div>
                            </div>
                        )}
                    </div>
                    <label className="text-white mb-2 cursor-pointer">
                        アバター画像を選択
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                            disabled={avatarUploading}
                        />
                    </label>
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
                <label className="block text-white mb-2">生年</label>
                <input
                    type="number"
                    name="birth_year"
                    value={form.birth_year}
                    onChange={handleChange}
                    className="w-full mb-1 p-2 rounded text-primary"
                    disabled={avatarUploading || saving}
                />
                {validationErrors.birth_year && <div className="text-red-400 text-xs mb-2">{validationErrors.birth_year}</div>}
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
                <label className="block text-white mb-2">出身地</label>
                <input
                    type="text"
                    name="birthplace"
                    value={form.birthplace}
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
                {error && <div className="text-red-500 text-center mb-2">{error}</div>}
                {success && <div className="text-green-500 text-center mb-2">プロフィールを更新しました！</div>}
                <button 
                    type="submit" 
                    className="w-full h-10 rounded-lg bg-secondary text-white font-bold hover:bg-red-700 transition disabled:opacity-50" 
                    disabled={avatarUploading || saving}
                >
                    {saving ? '保存中...' : '保存'}
                </button>
            </form>
        </div>
    );
};

export default CastProfileEditPage; 