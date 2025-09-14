import React, { useState, useRef } from 'react';
import { Image, LockKeyhole, Plus, CirclePlus, X, CircleUser, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';
import { API_ENDPOINTS } from '../../config/api';
import { handleLineLogin } from '../../utils/lineLogin';

// Add CSS animation for smooth modal rise
const modalStyles = `
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

interface SelectedImage {
  id: string;
  file: File;
  preview: string;
}

const CastRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [lineId, setLineId] = useState('');
    const [loading] = useState(true);
    const [isLoadingLineId, setIsLoadingLineId] = useState(false);
    const [selectedImages, setSelectedImages] = useState<{
        front: SelectedImage | null;
        profile: SelectedImage | null;
        fullBody: SelectedImage | null;
    }>({
        front: null,
        profile: null,
        fullBody: null
    });
    const [activeImageType, setActiveImageType] = useState<'front' | 'profile' | 'fullBody' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Inject CSS animation styles
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = modalStyles;
        document.head.appendChild(style);
        
        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, []);

    // Restore form data when returning from LINE login
    React.useEffect(() => {
        const savedFormData = sessionStorage.getItem('cast_register_form_data');
        const savedLineId = sessionStorage.getItem('cast_line_id');
        
        if (savedFormData) {
            try {
                const formData = JSON.parse(savedFormData);
                setPhoneNumber(formData.phoneNumber || '');
                
                // Restore selected images (preview only, not the actual files)
                if (formData.selectedImages) {
                    setSelectedImages(prev => ({
                        ...prev,
                        front: formData.selectedImages.front ? {
                            id: formData.selectedImages.front.id,
                            preview: formData.selectedImages.front.preview,
                            file: prev.front?.file || new File([], '') // Keep existing file or create empty
                        } : null,
                        profile: formData.selectedImages.profile ? {
                            id: formData.selectedImages.profile.id,
                            preview: formData.selectedImages.profile.preview,
                            file: prev.profile?.file || new File([], '')
                        } : null,
                        fullBody: formData.selectedImages.fullBody ? {
                            id: formData.selectedImages.fullBody.id,
                            preview: formData.selectedImages.fullBody.preview,
                            file: prev.fullBody?.file || new File([], '')
                        } : null,
                    }));
                }
                
                // Clear the saved data
                sessionStorage.removeItem('cast_register_form_data');
            } catch (error) {
                console.error('Error restoring form data:', error);
            }
        }
        
        // Set LINE ID if available
        if (savedLineId) {
            console.log('Setting LINE ID from sessionStorage:', savedLineId);
            setLineId(savedLineId);
            setIsLoadingLineId(false);
            sessionStorage.removeItem('cast_line_id');
        } else {
            console.log('No LINE ID found in sessionStorage');
            // Check if we're returning from LINE login (no form data but might have LINE ID)
            const hasLineId = sessionStorage.getItem('cast_line_id');
            if (hasLineId) {
                console.log('Found LINE ID in sessionStorage:', hasLineId);
                setLineId(hasLineId);
                setIsLoadingLineId(false);
                sessionStorage.removeItem('cast_line_id');
            } else {
                // Check for LINE ID in other possible locations
                const lineData = sessionStorage.getItem('lineData');
                if (lineData) {
                    try {
                        const parsedLineData = JSON.parse(lineData);
                        if (parsedLineData?.line_id) {
                            console.log('Found LINE ID in lineData:', parsedLineData.line_id);
                            setLineId(parsedLineData.line_id);
                            setIsLoadingLineId(false);
                            sessionStorage.removeItem('lineData');
                        } else {
                            setIsLoadingLineId(false);
                        }
                    } catch (error) {
                        console.error('Error parsing lineData:', error);
                        setIsLoadingLineId(false);
                    }
                } else {
                    setIsLoadingLineId(false);
                }
            }
        }
    }, []);

    const handlePlusClick = (imageType: 'front' | 'profile' | 'fullBody') => {
        setActiveImageType(imageType);
        setShowWarningModal(true);
    };

    const handleLibrarySelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0 && activeImageType) {
            const file = files[0];
            const preview = URL.createObjectURL(file);
            
            setSelectedImages(prev => ({
                ...prev,
                [activeImageType]: {
                    id: `${activeImageType}-${Date.now()}`,
                    file,
                    preview
                }
            }));
            
            setShowWarningModal(false);
            setActiveImageType(null);
            
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const closeModal = () => {
        setShowWarningModal(false);
        setActiveImageType(null);
    };

    const handleLineLoginClick = () => {
        // Set loading state
        setIsLoadingLineId(true);
        
        // Store the current form data in sessionStorage to restore after LINE login
        const formData = {
            phoneNumber,
            selectedImages: {
                front: selectedImages.front ? { id: selectedImages.front.id, preview: selectedImages.front.preview } : null,
                profile: selectedImages.profile ? { id: selectedImages.profile.id, preview: selectedImages.profile.preview } : null,
                fullBody: selectedImages.fullBody ? { id: selectedImages.fullBody.id, preview: selectedImages.fullBody.preview } : null,
            }
        };
        sessionStorage.setItem('cast_register_form_data', JSON.stringify(formData));
        
        // Directly trigger LINE OAuth flow
        handleLineLogin({
            userType: 'guest', // Use guest type for LINE OAuth
            castRegistration: true, // Flag for cast registration
            onError: (error: string) => {
                console.error('LINE login error:', error);
                setIsLoadingLineId(false);
                // Stay on the same page on error
            }
        });
    };

    const isSubmitEnabled = selectedImages.front && selectedImages.profile && selectedImages.fullBody && phoneNumber.trim() && lineId.trim();

    const handleSubmit = async () => {
        if (!isSubmitEnabled) return;

        try {
            const formData = new FormData();
            formData.append('phone_number', phoneNumber);
            formData.append('line_id', lineId);
            formData.append('front_image', selectedImages.front!.file);
            formData.append('profile_image', selectedImages.profile!.file);
            formData.append('full_body_image', selectedImages.fullBody!.file);

            const response = await fetch(API_ENDPOINTS.CAST_APPLICATION_SUBMIT, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('申請が正常に送信されました。審査結果をお待ちください。');
                // Reset form
                setSelectedImages({
                    front: null,
                    profile: null,
                    fullBody: null
                });
                setPhoneNumber('');
                setLineId('');
            } else {
                const errorData = await response.json();
                alert('申請の送信に失敗しました: ' + (errorData.message || 'エラーが発生しました'));
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('申請の送信に失敗しました。もう一度お試しください。');
        }
    };

    const renderImageBox = (type: 'front' | 'profile' | 'fullBody', label: string) => {
        const image = selectedImages[type];
        
        return (
            <div className="flex flex-col items-center">
                <div 
                    className="w-full h-40 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-white cursor-pointer relative overflow-hidden" 
                    onClick={() => handlePlusClick(type)}
                >
                    {image ? (
                        <>
                            <img 
                                src={image.preview} 
                                alt={label} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <Plus className="w-6 h-6 text-white" />
                            </div>
                        </>
                    ) : (
                        <Plus className="w-6 h-6 text-gray-400" />
                    )}
                </div>
                <span className="text-sm text-white mt-2">{label}</span>
            </div>
        );
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-primary to-secondary pb-8">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b border-secondary bg-gradient-to-b from-primary via-primary to-secondary">
                <span className="text-lg font-bold flex-1 text-center text-white">写真を提出</span>
            </div>

            <div>
                <div className="flex items-center px-4 py-3 justify-left">
                    <Image className="w-6 h-6" color='brown' />
                    <span className="text-lg font-bold flex-1 pl-2 text-left text-white">写真を提出してください</span>
                </div>
                <div className="flex items-center px-10 justify-left">
                    <span className="text-md font-bold flex-1 pl-2 text-left text-white/75">参考画像を元に、3枚以上ご自身の魅力が伝わりやすい写真を
                        提出いただくと通過率がアップします。</span>
                </div>

                <div className="px-4 py-4">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Phone size={20} />
                    電話番号を入力してください</h3>
                    <div className="relative">
                    <input
                        type="tel"
                        placeholder="電話番号を入力してください"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all pr-10 shadow"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none">
                    <Phone size='18' />
                    </span>
                    </div>
                </div>

                <div className="px-4 py-4">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><CircleUser size={20} />
                    LINEアカウント連携</h3>
                    <div className="space-y-3">
                        {lineId ? (
                            <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CircleUser className="w-5 h-5 text-green-600" />
                                        <span className="text-green-800 font-medium">LINEアカウント連携済み</span>
                                    </div>
                                    <button
                                        onClick={() => setLineId('')}
                                        className="text-green-600 hover:text-green-800 text-sm underline"
                                    >
                                        変更
                                    </button>
                                </div>
                                <p className="text-green-700 text-sm mt-1">LINE ID: {lineId}</p>
                            </div>
                        ) : isLoadingLineId ? (
                            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-blue-800 font-medium">LINE認証中...</span>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleLineLoginClick}
                                className="w-full py-3 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <CircleUser size={20} />
                                LINEでログイン
                            </button>
                        )}
                    </div>
                </div>
                {/* Photo upload boxes */}
                <div className="grid grid-cols-3 gap-4 px-4 py-6">
                    {renderImageBox('front', '正面')}
                    {renderImageBox('profile', '横顔')}
                    {renderImageBox('fullBody', '全身')}
                </div>
            </div>

            <div className="grid grid-cols-2 justify-center gap-2 px-4 pb-6">
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-white cursor-pointer" onClick={() => handlePlusClick('front')}>
                        <CirclePlus className='w-6 h-6 text-gray-400' />
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-white cursor-pointer" onClick={() => handlePlusClick('profile')}>
                        <CirclePlus className='w-6 h-6 text-gray-400' />
                    </div>
                </div>
            </div>

            {/* Warning section */}
            <div className="mx-4 mb-6">
                <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                    <LockKeyhole size={48} className="text-orange-500 mt-1 flex-shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800 mb-1">お客様情報は厳重に管理しています</span>
                        <span className="text-xs text-gray-600">提出いただいた画像は審査のみに使用し、それ以外の目的で使用しません。</span>
                    </div>
                </div>
            </div>

            {/* NG Photos Examples Section */}

            {/* Bottom action button */}
            <div className="px-4 py-6">
                <button
                    className={`w-full py-4 rounded-lg font-bold text-lg ${
                        isSubmitEnabled 
                            ? 'bg-orange-500 text-white hover:bg-orange-600' 
                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                    onClick={isSubmitEnabled ? handleSubmit : undefined}
                    disabled={!isSubmitEnabled}
                >
                    写真を提出する
                </button>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* Modal */}
            {showWarningModal && (
                <div
                    className="fixed inset-0 bg-white/10 bg-opacity-50 flex items-end justify-center z-50 transition-opacity duration-300 px-4"
                    style={{
                        animation: 'fadeIn 0.3s ease-out'
                    }}
                >
                    <div
                        className="bg-primary w-full max-w-md rounded-t-2xl p-6"
                        style={{
                            animation: 'slideUp 0.5s ease-out'
                        }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-white">審査に通りにくいNG写真の例</h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="flex flex-col items-center space-y-2">
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-red-200">
                                    <img 
                                        src='/assets/avatar/female.png' 
                                        alt="NG例: 顔が写っていない" 
                                        className="w-full h-full object-cover grayscale opacity-70" 
                                    />
                                    <div className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                                        <X className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <span className="text-xs text-white text-center font-medium leading-tight px-1">顔が写っていない</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-red-200">
                                    <img 
                                        src='/assets/avatar/female.png' 
                                        alt="NG例: 加工しすぎ" 
                                        className="w-full h-full object-cover grayscale opacity-70" 
                                    />
                                    <div className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                                        <X className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <span className="text-xs text-white text-center font-medium leading-tight px-1">加工しすぎ</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-red-200">
                                    <img 
                                        src='/assets/avatar/female.png' 
                                        alt="NG例: 画質が粗い" 
                                        className="w-full h-full object-cover grayscale opacity-70" 
                                    />
                                    <div className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                                        <X className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <span className="text-xs text-white text-center font-medium leading-tight px-1">画質が粗い</span>
                            </div>
                        </div>

                        <button
                            className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold text-lg"
                            onClick={handleLibrarySelect}
                        >
                            ライブラリから選ぶ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CastRegisterPage; 