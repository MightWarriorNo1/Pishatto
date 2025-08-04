import React, { useState, useEffect } from 'react';
import StepIndicator from './StepIndicator';
import { locationService } from '../../../services/locationService';

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
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setError(null);
        const activeLocations = await locationService.getActiveLocations();
        setLocations(activeLocations);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setError('場所の読み込みに失敗しました。しばらく待ってから再度お試しください。');
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    updateFormData({ favorite_area: location });
  };

  const handleNext = () => {
    if (selectedLocation) {
      onNext();
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const fetchLocations = async () => {
      try {
        setError(null);
        const activeLocations = await locationService.getActiveLocations();
        setLocations(activeLocations);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setError('場所の読み込みに失敗しました。しばらく待ってから再度お試しください。');
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  };

  return (
    <div className="min-h-screen bg-gradient-br-to from-primary via-primary to-secondary flex flex-col">
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

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-white text-sm mt-2">読み込み中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-white text-sm mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-red-400"
            >
              再試行
            </button>
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white text-sm">利用可能な場所がありません。</p>
          </div>
        ) : (
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
        )}
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