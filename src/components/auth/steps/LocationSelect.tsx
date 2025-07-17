import React, { useState } from 'react';

interface LocationSelectProps {
  onNext: () => void;
  onBack: () => void;
  // eslint-disable-next-line
  updateFormData: (data: { location: string }) => void;
  formData: {
    location: string;
  };
}

const LocationSelect: React.FC<LocationSelectProps> = ({
  onNext,
  onBack,
  updateFormData,
  formData,
}) => {
  const [selectedLocation, setSelectedLocation] = useState(formData.location || '');

  const locations = [
    '東京', '大阪', '福岡',
    '名古屋', '札幌', '沖縄',
    '神戸', '京都', '仙台',
    '埼玉', '横浜', '金沢',
    '静岡', '広島', '鹿児島',
    '熊本'
  ];

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    updateFormData({ location });
  };

  const handleNext = () => {
    if (selectedLocation) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4">
        <button onClick={onBack} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">1</div>
        <div className="w-8 h-8 rounded-full bg-primary text-white border border-secondary flex items-center justify-center">2</div>
        <div className="w-8 h-8 rounded-full bg-primary text-white border border-secondary flex items-center justify-center">3</div>
        <div className="w-8 h-8 rounded-full bg-primary text-white border border-secondary flex items-center justify-center">4</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4">
        <div className="mb-2">
          <h2 className="text-base text-white">よく遊ぶ場所はどこですか？</h2>
          <p className="text-xs text-white">※あとから変更可能</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {locations.map((location) => (
            <button
              key={location}
              onClick={() => handleLocationSelect(location)}
              className={`py-3 text-center rounded-lg border ${selectedLocation === location
                ? 'bg-primary text-white border-secondary'
                : 'bg-primary text-white border-secondary'
                }`}
            >
              {location}
            </button>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="p-4">
        <button
          onClick={handleNext}
          disabled={!selectedLocation}
          className={`w-full py-4 text-center text-white rounded-lg ${selectedLocation ? 'bg-primary' : 'bg-primary border border-secondary text-white'
            }`}
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default LocationSelect; 