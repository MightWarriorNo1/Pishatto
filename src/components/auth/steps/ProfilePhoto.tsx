import React, { useState, useRef } from 'react';

interface ProfilePhotoProps {
  onNext: () => void;
  onBack: () => void;
  // eslint-disable-next-line
  updateFormData: (data: { profilePhoto: File | null }) => void;
  formData: {
    profilePhoto: File | null;
  };
}

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({
  onNext,
  onBack,
  updateFormData,
  formData,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData({ profilePhoto: file });
      setShowOptions(false); // Close the options menu after selection
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <div className="px-4 py-4">
        <button onClick={onBack} className="text-gray-600 text-xl">
          ＜
        </button>
      </div>
      <div className="flex-1 px-4 flex flex-col">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">1</div>
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">2</div>
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">3</div>
          <div className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center">4</div>
        </div>

        <div className="mb-6">
          <h1 className="text-lg font-medium mb-2">
            プロフィール写真
          </h1>
          <p className="text-sm text-gray-500">
            ※あとから変更可能
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gray-500 flex items-center justify-center">
              {formData.profilePhoto ? (
                <img 
                  src={URL.createObjectURL(formData.profilePhoto)} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
            </div>
            <button
              onClick={() => setShowOptions(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#FF6B00] rounded-full flex items-center justify-center text-white"
            >
              +
            </button>
          </div>
        </div>

        {showOptions && (
          <div className="bg-white rounded-lg shadow-md">
            <button
              className="w-full py-4 px-4 flex items-center space-x-3 text-left border-b border-gray-100"
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              <span className="text-xl">📷</span>
              <span>写真ライブラリ</span>
            </button>
            <button
              className="w-full py-4 px-4 flex items-center space-x-3 text-left border-b border-gray-100"
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              <span className="text-xl">📸</span>
              <span>写真またはビデオを撮る</span>
            </button>
            <button
              className="w-full py-4 px-4 flex items-center space-x-3 text-left"
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              <span className="text-xl">📁</span>
              <span>ファイルを選択</span>
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="mt-auto pb-8">
          <button
            onClick={onNext}
            className="w-full py-4 bg-[#FF6B00] text-white rounded-lg font-medium"
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhoto;