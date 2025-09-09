/*eslint-disable */
import { ChevronLeft, Lock } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { uploadIdentity, getGuestProfileById } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import Spinner from '../ui/Spinner';

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
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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
            // Optimistically set status to pending until admin reviews
            setVerificationStatus('pending');
            // Refresh verification status after successful upload
            await getIdentityVerificationStatus();
        } catch (err: any) {
            setError(err.message || 'アップロードに失敗しました');
        } finally {
            setAvatarUploading(false);
        }
    };
    
    const handleStartClick = () => {
        if (!selectedFile) {
            fileInputRef.current?.click();
            return;
        }
        handleSubmit();
    };
    
    const getIdentityVerificationStatus = async () => {
        if (!user?.id) return;
        setIsLoadingStatus(true);
        try {
            const res = await getGuestProfileById(user.id);
            const image = res.identity_verification;
            const status = res.identity_verification_completed as typeof verificationStatus;
            setVerificationImage(image);
            // Guard against inconsistent backend data where status is success but no image exists
            if (status === 'success' && !image) {
                setVerificationStatus(null);
            } else {
                setVerificationStatus(status || null);
            }
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
            <div className="max-w-md items-center min-h-screen bg-gradient-to-b from-primary via-primary to-secondary flex flex-col justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-br-to from-primary via-primary to-secondary overflow-y-auto pb-8">
            {/* Top bar */}
            <div className="flex justify-center items-center px-4 pt-6 pb-6">
                <button onClick={onBack} className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer">
                    <ChevronLeft />
                </button>
                <span className="flex-1 text-center text-base font-bold text-white">本人認証</span>
            </div>
            {/* Red instruction section */}
            <div className="bg-primary text-white text-center py-6 px-4">
                <div className="text-xl font-bold mb-2">本人確認書類を撮影してください</div>
                <div className="text-sm">安心してPishattoをご利用いただくために、<br />ご協力をお願いいたします。</div>
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
                    <img src="/assets/identity/driver.jpeg" alt="license" className="w-16 h-16" />
                    <span className="text-xs mt-1">免許証</span>
                </div>
                <div className="flex flex-col items-center">
                    <img src="/assets/identity/passport.jpeg" alt="passport" className="w-16 h-16" />
                    <span className="text-xs mt-1">パスポート</span>
                </div>
                <div className="flex flex-col items-center">
                    <img src="/assets/identity/my-number.jpeg" alt="my-number" className="w-16 h-16" />
                    <span className="text-xs mt-1">マイナンバー</span>
                </div>
            </div>
            {/* Image preview - show only after selecting image, or when pending with existing image */}
            {(((selectedFile || previewUrl) as unknown as boolean) || (verificationStatus === 'pending' && verificationImage)) && (
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
                    {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
                </div>
            )}
            {/* Hidden file input - always present so the button can trigger it */}
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                disabled={avatarUploading || submitted}
            />
            {/* Info box */}
            <div className="mx-4 border border-secondary rounded-xl bg-primary px-4 mb-4 flex flex-col items-center">
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
                        onClick={handleStartClick}
                        disabled={avatarUploading || submitted}
                    >
                        {avatarUploading ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span className="ml-2">アップロード中...</span>
                            </>
                        ) : (
                            selectedFile ? 'IDカード画像提出' : '本人認証をはじめる'
                        )}
                    </button>
                )}
                {/* Show pending message if status is pending */}
                {verificationStatus === 'pending' && (
                    <div className="mt-4 text-center text-white font-bold flex items-center justify-center">
                        <span className="ml-2">管理者が承認するまでお待ちください。</span>
                    </div>
                )}
                {/* Show success message only if status is success AND an image exists */}
                {verificationStatus === 'success' && verificationImage && (
                    <div className="mt-4 text-center text-white font-bold">既に本人確認を完了しています。</div>
                )}
                {/* Show error if any */}
                {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
            </div>
        </div>
    );
};

export default IdentityVerificationScreen; 