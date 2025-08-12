import React, { useState, useEffect } from 'react';
import StepIndicator from './StepIndicator';
import { locationService } from '../../../services/locationService';
import { ChevronLeft } from 'lucide-react';
import Spinner from '../../ui/Spinner';

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
    <div className="min-h-screen bg-gradient-to-b from-primary via-gray-800 to-secondary p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4">
        <button onClick={onBack} className="text-white hover:text-secondary cursor-pointer">
          <ChevronLeft />
        </button>
      </div>

      {/* Progress Steps */}
      <div className="px-4 py-4">
        <StepIndicator totalSteps={6} currentStep={1} />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4">
        <div className="mb-2">
          <h2 className="text-base text-white">よく遊ぶ場所はどこですか？</h2>
          <p className="text-xs text-white">※あとから変更可能</p>
        </div>

            {loading ? (
                <Spinner />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-white text-sm mb-4">{error}</p>
              <button
              onClick={handleRetry}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-secondary/60"
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
                className={`py-3 text-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/60 ${selectedLocation === location
                  ? 'bg-secondary text-white border-secondary'
                  : 'bg-primary text-white border-secondary hover:bg-secondary/20'
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
            className={`w-full py-4 text-center text-white rounded-lg transition-colors ${selectedLocation ? 'bg-secondary hover:bg-red-400' : 'bg-primary border border-secondary text-white'
            }`}
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default LocationSelect; 