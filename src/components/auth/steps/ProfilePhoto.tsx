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
    <div className="min-h-screen bg-primary flex flex-col">
      <div className="px-4 py-4">
        <button onClick={onBack} className="text-white text-xl">
          ＜
        </button>
      </div>
      <div className="flex-1 px-4 flex flex-col">
        <div className="px-4 py-6 bg-primary">
          <div className="flex items-center justify-between max-w-[240px] mx-auto">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center border border-secondary">1</div>
            <div className="flex-1 h-[2px] bg-secondary"></div>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center border border-secondary justify-center">2</div>
            <div className="flex-1 h-[2px] bg-secondary"></div>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center border border-secondary">3</div>
            <div className="flex-1 h-[2px] bg-secondary"></div>
            <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center border border-secondary">4</div>
          </div>
        </div>
        <div className="mb-6">
          <h1 className="text-lg font-medium mb-2 text-white">
            プロフィール写真
          </h1>
          <p className="text-sm text-white">
            ※あとから変更可能
          </p>
        </div>
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center">
              {formData.profilePhoto ? (
                <img
                  src={URL.createObjectURL(formData.profilePhoto)}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <svg
                  className="w-12 h-12 text-white"
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
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
            >
              +
            </button>
          </div>
        </div>
        {showOptions && (
          <div className="bg-primary rounded-lg shadow-md border border-secondary">
            <button
              className="w-full py-4 px-4 flex items-center space-x-3 text-left border-b border-secondary text-white"
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              <span className="text-xl">📷</span>
              <span>写真ライブラリ</span>
            </button>
            <button
              className="w-full py-4 px-4 flex items-center space-x-3 text-left border-b border-secondary text-white"
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              <span className="text-xl">📸</span>
              <span>写真またはビデオを撮る</span>
            </button>
            <button
              className="w-full py-4 px-4 flex items-center space-x-3 text-left text-white"
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
            className="w-full py-4 bg-secondary text-white rounded-lg font-medium"
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhoto;