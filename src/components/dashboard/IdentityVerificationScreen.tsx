/*eslint-disable */
import { ChevronLeft, Lock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { uploadIdentity, getGuestProfileById } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
// Loading spinner component
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${sizeClasses[size]}`} />
    );
};

const IdentityVerificationScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useUser();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
    const [verificationImage,setVerificationImage] = useState<string | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    // Upload image to backend and get URL or success
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
    };

    const handleSubmit = async () => {
        if (!selectedFile || !user?.id) return;
        setAvatarUploading(true);
        setError(null);
        try {
            const res = await uploadIdentity(selectedFile, user.id);
            if (!res.success) throw new Error('アップロードに失敗しました');
            setSubmitted(true);
            // Refresh verification status after successful upload
            await getIdentityVerificationStatus();
        } catch (err: any) {
            setError(err.message || 'アップロードに失敗しました');
        } finally {
            setAvatarUploading(false);
        }
    };
    
    const getIdentityVerificationStatus = async () => {
        if (!user?.id) return;
        setIsLoadingStatus(true);
        try {
            const res = await getGuestProfileById(user.id);
            console.log("Res", res);
            console.log("Res.identity_verification", res.identity_verification);
            setVerificationImage(res.identity_verification);
            console.log("Verification Image", verificationImage);
            setVerificationStatus(res.identity_verification_completed);
        } catch (error) {
            console.error('Failed to fetch verification status:', error);
        } finally {
            setIsLoadingStatus(false);
        }
    };

    useEffect(() => {
        getIdentityVerificationStatus();
    }, [user?.id]);

    // Clear preview when verification image exists (already verified)
    useEffect(() => {
        if (verificationImage && verificationStatus === 'success') {
            setPreviewUrl(null);
            setSelectedFile(null);
        }
        // Don't clear preview for pending status - keep showing the uploaded image
    }, [verificationImage, verificationStatus]);

    // Show loading screen while fetching initial status
    if (isLoadingStatus) {
        return (
            <div className="max-w-md items-center min-h-screen bg-primary flex flex-col justify-center">
                <LoadingSpinner size="lg" />
                <div className="text-center mt-4">
                    <div className="text-white mt-4 text-sm">読み込み中...</div>
                </div>
            </div>
        );
    }

    console.log("Verification Status", verificationStatus);
    console.log("Verification Image", verificationImage);
    console.log("Preview URL", previewUrl);
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
            {/* Top bar */}
            <div className="flex justify-center items-center px-4 pt-6 pb-6">
                <button onClick={onBack} className="mr-2 text-2xl text-white">
                    <ChevronLeft />
                </button>
                <span className="flex-1 text-center text-base font-bold text-white">本人認証</span>
            </div>
            {/* Red instruction section */}
            <div className="bg-primary text-white text-center py-6 px-4">
                <div className="text-xl font-bold mb-2">本人確認書類を撮影してください</div>
                <div className="text-sm">安心してpishattoをご利用いただくために、<br />ご協力をお願いいたします。</div>
            </div>
            {/* Phone + ID illustration */}
            <div className="flex justify-center -mt-10 mb-8">
                {/* Placeholder illustration */}
                <svg width="300" height="120" viewBox="0 0 300 120" fill="none">
                    <rect x="10" y="20" width="280" height="80" rx="20" fill="#fff" stroke="#bbb" strokeWidth="4" />
                    <rect x="60" y="40" width="180" height="40" rx="4" fill="#eee" stroke="#bbb" strokeWidth="2" />
                    <rect x="70" y="50" width="100" height="10" rx="2" fill="#ffe066" />
                    <rect x="70" y="65" width="60" height="6" rx="2" fill="#ccc" />
                    <rect x="180" y="50" width="30" height="20" rx="4" fill="#b3e5fc" />
                </svg>
            </div>
            {/* Acceptable documents */}
            <div className="text-center font-bold text-lg mb-">登録可能な本人確認書類</div>
            <div className="flex justify-center gap-8 mb-6">
                <div className="flex flex-col items-center">
                    {/* License icon */}
                    <svg width="64" height="40" viewBox="0 0 64 40" fill="none"><rect x="2" y="2" width="60" height="36" rx="4" fill="#fff" stroke="#bbb" strokeWidth="2" /><rect x="8" y="8" width="30" height="6" rx="2" fill="#ffe066" /><rect x="8" y="18" width="20" height="4" rx="2" fill="#ccc" /><rect x="40" y="8" width="12" height="12" rx="3" fill="#b3e5fc" /></svg>
                    <span className="text-xs mt-1">免許証</span>
                </div>
                <div className="flex flex-col items-center">
                    {/* Passport icon */}
                    <svg width="64" height="40" viewBox="0 0 64 40" fill="none"><rect x="8" y="4" width="20" height="32" rx="4" fill="#e53935" /><rect x="36" y="4" width="20" height="32" rx="4" fill="#3949ab" /></svg>
                    <span className="text-xs mt-1">パスポート</span>
                </div>
                <div className="flex flex-col items-center">
                    {/* MyNumber icon */}
                    <svg width="64" height="40" viewBox="0 0 64 40" fill="none"><rect x="2" y="2" width="60" height="36" rx="4" fill="#fff" stroke="#bbb" strokeWidth="2" /><rect x="8" y="8" width="30" height="6" rx="2" fill="#b3e5fc" /><rect x="8" y="18" width="20" height="4" rx="2" fill="#ccc" /><rect x="40" y="8" width="12" height="12" rx="3" fill="#ffe066" /></svg>
                    <span className="text-xs mt-1">マイナンバー</span>
                </div>
            </div>
            {/* Image upload and preview - show for failed, pending, or null status */}
            {(verificationStatus === 'failed' || verificationStatus === 'pending' || verificationStatus === null) && (
                <div className="flex flex-col items-center mb-4">
                    <div className="relative">
                        <img
                            src={previewUrl || (verificationImage ? `${APP_BASE_URL}/storage/${verificationImage}` : '/assets/avatar/avatar-1.png')}
                            alt="avatar preview"
                            className="w-32 h-32 object-cover border-2 border-secondary"
                            onError={e => (e.currentTarget.src = '/assets/avatar/avatar-1.png')}
                        />
                        {avatarUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                <div className="flex flex-col items-center">
                                    <LoadingSpinner size="sm" />
                                    <div className="text-white text-xs mt-1">アップロード中...</div>
                                </div>
                            </div>
                        )}
                    </div>
                    <label className="text-white mb-2 cursor-pointer">
                        IDカードの画像をアップロード
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                            disabled={avatarUploading || submitted || verificationStatus === 'failed'}
                        />
                    </label>
                    {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
                </div>
            )}
            {/* Info box */}
            <div className="mx-4 border border-secondary rounded-xl bg-primarypx-4 mb-24 flex flex-col items-center">
                <Lock className="text-white mb-2" />
                <div className="font-bold mb-1 text-white">お客様情報は厳重に管理しています</div>
                <div className="text-xs text-white text-center">提出いただいた証明書の画像は本人確認のみに使用し、<br />他の目的には一切使用しません。</div>
            </div>
            {/* Start button and status messages */}
            <div className="px-4">
                {/* Show button for failed status or null status (initial state) */}
                {(verificationStatus === 'failed' || verificationStatus === null) && (
                    <button
                        className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg disabled:opacity-50 flex items-center justify-center"
                        onClick={handleSubmit}
                        disabled={!selectedFile || avatarUploading || submitted}
                    >
                        {avatarUploading ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span className="ml-2">アップロード中...</span>
                            </>
                        ) : (
                            '本人認証をはじめる'
                        )}
                    </button>
                )}
                {/* Show pending message if status is pending */}
                {verificationStatus === 'pending' && (
                    <div className="mt-4 text-center text-white font-bold flex items-center justify-center">
                        <span className="ml-2">管理者が承認するまでお待ちください。</span>
                    </div>
                )}
                {/* Show success message if status is success */}
                {verificationStatus === 'success' && (
                    <div className="mt-4 text-center text-white font-bold">既に本人確認を完了しています。</div>
                )}
                {/* Show error if any */}
                {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
            </div>
        </div>
    );
};

export default IdentityVerificationScreen; 