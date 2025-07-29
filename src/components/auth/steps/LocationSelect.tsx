import React, { useState } from 'react';
import StepIndicator from './StepIndicator';

interface LocationSelectProps {
  onNext: () => void;
  onBack: () => void;
  // eslint-disable-next-line
  updateFormData: (data: { favorite_area: string }) => void;
  formData: {
    favorite_area: string;
  };
}

const LocationSelect: React.FC<LocationSelectProps> = ({
  onNext,
  onBack,
  updateFormData,
  formData,
}) => {
  const [selectedLocation, setSelectedLocation] = useState(formData.favorite_area || '');

  const locations = [
    '東京都',
    '大阪府',
    '愛知県',
    '福岡県',
    '北海道'
  ];

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    updateFormData({ favorite_area: location });
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
      <div className="px-4 py-4 bg-primary">
        <StepIndicator totalSteps={6} currentStep={1} />
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
                ? 'bg-secondary text-white border-secondary'
                : 'bg-primary text-white border-secondary hover:bg-secondary'
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
          className={`w-full py-4 text-center text-white rounded-lg ${selectedLocation ? 'bg-secondary hover:bg-red-400' : 'bg-primary border border-secondary text-white hover:bg-secondary'
            }`}
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default LocationSelect; 