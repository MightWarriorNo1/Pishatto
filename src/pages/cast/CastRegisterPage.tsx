import React, { useState, useRef } from 'react';
import { Image, LockKeyhole, Plus, CirclePlus, X, CircleUser, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';
import { API_ENDPOINTS } from '../../config/api';
import { handleLineLogin } from '../../utils/lineLogin';
import { getCsrfToken, refreshCsrfToken } from '../../utils/csrf';

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
  serverUrl?: string;
  sessionId?: string;
}

const CastRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [lineId, setLineId] = useState('');
    const [lineName, setLineName] = useState('');
    const [loading] = useState(true);
    const [uploadSessionId, setUploadSessionId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    // Check for LINE callback data and restore form data
    React.useEffect(() => {
        // Check URL parameters for LINE callback data
        const urlParams = new URLSearchParams(window.location.search);
        const lineIdFromUrl = urlParams.get('line_id');
        const lineNameFromUrl = urlParams.get('line_name');
        const lineEmailFromUrl = urlParams.get('line_email');
        const lineAvatarFromUrl = urlParams.get('line_avatar');
        
        if (lineIdFromUrl) {
            setLineId(lineIdFromUrl);
            if (lineNameFromUrl) {
                setLineName(lineNameFromUrl);
            }
            
            // Store LINE data in sessionStorage for persistence
            sessionStorage.setItem('cast_line_data', JSON.stringify({
                line_id: lineIdFromUrl,
                line_name: lineNameFromUrl,
                line_email: lineEmailFromUrl,
                line_avatar: lineAvatarFromUrl
            }));
            
            // Clean up URL parameters
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }

    // Restore form data when returning from LINE login
        const savedFormData = sessionStorage.getItem('cast_register_form_data');
        const savedLineData = sessionStorage.getItem('cast_line_data');
        
        if (savedFormData) {
            try {
                const formData = JSON.parse(savedFormData);
                setPhoneNumber(formData.phoneNumber || '');
                
                // Restore upload session ID if available
                if (formData.uploadSessionId) {
                    setUploadSessionId(formData.uploadSessionId);
                }
                
                // Restore selected images from server if session ID is available
                if (formData.uploadSessionId) {
                    loadImagesFromServer(formData.uploadSessionId);
                } else if (formData.selectedImages) {
                    // Fallback to local preview only
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
        
        // Restore LINE data from sessionStorage
        if (savedLineData) {
            try {
                const lineData = JSON.parse(savedLineData);
                setLineId(lineData.line_id || '');
                setLineName(lineData.line_name || '');
            } catch (error) {
                console.error('Error restoring LINE data:', error);
            }
        }
    }, []);

    // Cleanup function to remove temporary images when component unmounts
    React.useEffect(() => {
        return () => {
            if (uploadSessionId) {
                // Clean up temporary images on server
                getCsrfToken().then(csrfToken => {
                    fetch(API_ENDPOINTS.CAST_CLEANUP_IMAGES, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        credentials: 'include',
                        body: JSON.stringify({ session_id: uploadSessionId })
                    }).catch(error => {
                        console.error('Error cleaning up images:', error);
                    });
                }).catch(error => {
                    console.error('Error getting CSRF token for cleanup:', error);
                });
            }
        };
    }, [uploadSessionId]);

    const handlePlusClick = (imageType: 'front' | 'profile' | 'fullBody') => {
        setActiveImageType(imageType);
        setShowWarningModal(true);
    };

    const handleLibrarySelect = () => {
        fileInputRef.current?.click();
    };

    const loadImagesFromServer = async (sessionId: string) => {
        try {
            // Get CSRF token
            const csrfToken = await getCsrfToken();
            
            const response = await fetch(`${API_ENDPOINTS.CAST_GET_IMAGES}?session_id=${sessionId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
            });
            
            const result = await response.json();
            console.log('Images loaded from server:', result);
            
            if (result.success && result.images) {
                const images: { front: SelectedImage | null; profile: SelectedImage | null; fullBody: SelectedImage | null } = {
                    front: null,
                    profile: null,
                    fullBody: null
                };
                
                // Convert server URLs to image objects
                Object.entries(result.images).forEach(([type, url]) => {
                    // Map backend type names to frontend type names
                    const frontendType = type === 'full_body' ? 'fullBody' : type;
                    if (frontendType === 'front' || frontendType === 'profile' || frontendType === 'fullBody') {
                        console.log(`Setting ${frontendType} image URL:`, url);
                        images[frontendType] = {
                            id: `${frontendType}-${Date.now()}`,
                            file: new File([], ''), // Empty file since we're loading from server
                            preview: url as string,
                            serverUrl: url as string,
                            sessionId: sessionId
                        };
                    }
                });
                
                setSelectedImages(images);
            }
        } catch (error) {
            console.error('Error loading images from server:', error);
        }
    };

    const uploadImageToServer = async (file: File, type: 'front' | 'profile' | 'fullBody'): Promise<{ success: boolean; serverUrl?: string; sessionId?: string; error?: string }> => {
        try {
            setIsUploading(true);
            
            const formData = new FormData();
            formData.append('image', file);
            formData.append('type', type);
            if (uploadSessionId) {
                formData.append('session_id', uploadSessionId);
            }
            
            console.log('Uploading image:', {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                type: type,
                sessionId: uploadSessionId
            });

            // Get CSRF token
            const csrfToken = await getCsrfToken();
            if (!csrfToken) {
                throw new Error('CSRF token not found. Please refresh the page and try again.');
            }

            let response = await fetch(API_ENDPOINTS.CAST_UPLOAD_SINGLE_IMAGE, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
                body: formData,
            });

            // If we get a 419 error, try to refresh the CSRF token and retry
            if (response.status === 419) {
                console.log('CSRF token expired, refreshing...');
                const newToken = await refreshCsrfToken();
                if (newToken) {
                    // Retry with new token
                    response = await fetch(API_ENDPOINTS.CAST_UPLOAD_SINGLE_IMAGE, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            ...(newToken && { 'X-CSRF-TOKEN': newToken }),
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        credentials: 'include',
                        body: formData,
                    });
                }
            }

            const result = await response.json();
            console.log('Image upload result:', result);
            
            if (result.success) {
                // Store the session ID for future uploads
                if (result.session_id && !uploadSessionId) {
                    setUploadSessionId(result.session_id);
                }
                return {
                    success: true,
                    serverUrl: result.image_url,
                    sessionId: result.session_id
                };
            } else {
                return {
                    success: false,
                    error: result.message || 'Upload failed'
                };
            }
        } catch (error) {
            console.error('Image upload error:', error);
            return {
                success: false,
                error: 'Upload failed: ' + (error as Error).message
            };
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0 && activeImageType) {
            const file = files[0];
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('画像ファイルを選択してください。');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }
            
            // Validate file size (max 50MB)
            const maxSize = 50 * 1024 * 1024; // 50MB in bytes
            if (file.size > maxSize) {
                alert('ファイルサイズは50MB以下にしてください。');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }
            
            const preview = URL.createObjectURL(file);
            
            // Create the image object first
            const newImage: SelectedImage = {
                    id: `${activeImageType}-${Date.now()}`,
                    file,
                    preview
            };
            
            // Update state immediately for UI feedback
            setSelectedImages(prev => ({
                ...prev,
                [activeImageType]: newImage
            }));
            
            setShowWarningModal(false);
            setActiveImageType(null);
            
            // Upload to server
            const uploadResult = await uploadImageToServer(file, activeImageType);
            
            if (uploadResult.success) {
                // Update the image with server URL and session ID
                setSelectedImages(prev => ({
                    ...prev,
                    [activeImageType]: {
                        ...prev[activeImageType]!,
                        serverUrl: uploadResult.serverUrl,
                        sessionId: uploadResult.sessionId
                    }
                }));
            } else {
                // Show error and remove the image
                alert(`画像のアップロードに失敗しました: ${uploadResult.error}`);
                setSelectedImages(prev => ({
                    ...prev,
                    [activeImageType]: null
                }));
            }
            
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
        // Store the current form data in sessionStorage to restore after LINE login
        const formData = {
            phoneNumber,
            uploadSessionId, // Store the upload session ID
            selectedImages: {
                front: selectedImages.front ? { 
                    id: selectedImages.front.id, 
                    preview: selectedImages.front.preview,
                    serverUrl: selectedImages.front.serverUrl,
                    sessionId: selectedImages.front.sessionId
                } : null,
                profile: selectedImages.profile ? { 
                    id: selectedImages.profile.id, 
                    preview: selectedImages.profile.preview,
                    serverUrl: selectedImages.profile.serverUrl,
                    sessionId: selectedImages.profile.sessionId
                } : null,
                fullBody: selectedImages.fullBody ? { 
                    id: selectedImages.fullBody.id, 
                    preview: selectedImages.fullBody.preview,
                    serverUrl: selectedImages.fullBody.serverUrl,
                    sessionId: selectedImages.fullBody.sessionId
                } : null,
            }
        };
        sessionStorage.setItem('cast_register_form_data', JSON.stringify(formData));
        
        // Directly trigger LINE OAuth flow with cast-specific callback
        handleLineLogin({
            userType: 'guest', // Use guest type for LINE OAuth
            castRegistration: true, // Flag for cast registration
            useCastCallback: true, // Use cast-specific callback
            onError: (error: string) => {
                console.error('LINE login error:', error);
                // Stay on the same page on error
            }
        });
    };

    const isSubmitEnabled = selectedImages.front && selectedImages.profile && selectedImages.fullBody && phoneNumber.trim() && lineId.trim();

    const handleSubmit = async () => {
        if (!isSubmitEnabled || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('phone_number', phoneNumber);
            formData.append('line_id', lineId);
            if (lineName) {
                formData.append('line_name', lineName);
            }
            
            // Use server URLs if available, otherwise fall back to files
            if (selectedImages.front?.serverUrl) {
                formData.append('front_image_url', selectedImages.front.serverUrl);
            } else if (selectedImages.front?.file) {
                formData.append('front_image', selectedImages.front.file);
            }
            
            if (selectedImages.profile?.serverUrl) {
                formData.append('profile_image_url', selectedImages.profile.serverUrl);
            } else if (selectedImages.profile?.file) {
                formData.append('profile_image', selectedImages.profile.file);
            }
            
            if (selectedImages.fullBody?.serverUrl) {
                formData.append('full_body_image_url', selectedImages.fullBody.serverUrl);
            } else if (selectedImages.fullBody?.file) {
                formData.append('full_body_image', selectedImages.fullBody.file);
            }
            
            // Add upload session ID if available
            if (uploadSessionId) {
                formData.append('upload_session_id', uploadSessionId);
            }

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
                setLineName('');
                sessionStorage.removeItem('cast_line_data');
            } else {
                const errorData = await response.json();
                alert('申請の送信に失敗しました: ' + (errorData.message || 'エラーが発生しました'));
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('申請の送信に失敗しました。もう一度お試しください。');
        } finally {
            setIsSubmitting(false);
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
                            {isUploading && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            )}
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
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-primary to-secondary pb-[100px]">
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
                          maxLength={12}
                        placeholder="電話番号を入力してください"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all pr-10 shadow"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none">
                    <Phone size='18' />
                    </span>
                    </div>
                    <div className="text-xs text-red-300 mt-6">※ログインに電話番号が必要になります。必ず正しい電話番号をご入力ください。</div>
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
                                        onClick={() => {
                                            setLineId('');
                                            setLineName('');
                                            sessionStorage.removeItem('cast_line_data');
                                        }}
                                        className="text-green-600 hover:text-green-800 text-sm underline"
                                    >
                                        変更
                                    </button>
                                </div>
                                <p className="text-green-700 text-sm mt-1">
                                    {lineName && `名前: ${lineName}`}
                                    <br />
                                    LINE ID: {lineId}
                                </p>
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
                    <div className="text-xs text-red-300 mt-6">※LINEアカウントを連携は必要になります。</div>
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
                        isSubmitEnabled && !isSubmitting
                            ? 'bg-orange-500 text-white hover:bg-orange-600' 
                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                    onClick={isSubmitEnabled && !isSubmitting ? handleSubmit : undefined}
                    disabled={!isSubmitEnabled || isSubmitting}
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                            送信中...
                        </div>
                    ) : (
                        '写真を提出する'
                    )}
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