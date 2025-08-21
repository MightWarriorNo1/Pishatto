import React, { useState, useRef } from 'react';
import { Image, LockKeyhole, Plus, CirclePlus, X, CircleUser } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { API_ENDPOINTS } from '../../config/api';

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
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [lineURL,setLineURL]=useState('');
    const [loading] = useState(true);
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
            document.head.removeChild(style);
        };
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

    const isSubmitEnabled = selectedImages.front && selectedImages.profile && selectedImages.fullBody && lineURL.trim();

    const handleSubmit = async () => {
        if (!isSubmitEnabled) return;

        try {
            const formData = new FormData();
            formData.append('line_url', lineURL);
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
                setLineURL('');
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
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><CircleUser size={20} />
                    入力 ライン アカウント URL</h3>
                    <div className="relative">
                    <input
                        type="text"
                        placeholder="LINEアカウントのURLを入力してください。"
                        value={lineURL}
                        onChange={(e) => setLineURL(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all pr-10 shadow"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none">
                    <CircleUser size='18' />
                    </span>
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

                        <div className="flex gap-2 mb-6">
                            <div className="flex flex-col items-center">
                                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                    <img src='/assets/avatar/female.png' alt="warning" className="w-32 h-32 object-cover" />
                                    <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                        <X className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <span className="text-xs text-white mt-2 text-center">顔が写っていない</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                    <img src='/assets/avatar/female.png' alt="warning" className="w-32 h-32 object-cover" />
                                    <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                        <X className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <span className="text-xs text-white mt-2 text-center">加工しすぎ</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                    <img src='/assets/avatar/female.png' alt="warning" className="w-32 h-32 object-cover" />
                                    <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                        <X className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <span className="text-xs text-white mt-2 text-center">画質が粗い</span>
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