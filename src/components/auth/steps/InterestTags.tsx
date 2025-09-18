import React, { useState } from 'react';
import { GuestInterest } from '../../../services/api';
import StepIndicator from './StepIndicator';

interface InterestTagsData {
  interests: GuestInterest[];
}

interface InterestTagsProps {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: InterestTagsData) => void;
  formData: InterestTagsData;
}

const InterestTags: React.FC<InterestTagsProps> = ({
  onNext,
  onBack,
  updateFormData,
  formData,
}) => {
  const [selectedTags, setSelectedTags] = useState<GuestInterest[]>(formData.interests || []);

  const categories: { [key: string]: string[] } = {
    'アロマの香り': ['無香料', '柑橘系', 'ラベンダー'],
    '会話量': ['多', '普', '少', 'なし'],
    '音楽': ['あり', 'なし']
  };

  const handleTagSelect = (category: string, tag: string) => {
    const exists = selectedTags.some(t => t.tag === tag && t.category === category);
    setSelectedTags(prev =>
      exists
        ? prev.filter(t => !(t.tag === tag && t.category === category))
        : [...prev, { category, tag }]
    );
  };

  const handleSubmit = () => {
    updateFormData({ interests: selectedTags });
    onNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-gray-800 to-secondary p-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4">
        <button onClick={onBack} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Progress Steps */}
      <div className="px-4 py-4">
        <StepIndicator totalSteps={6} currentStep={3} />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4">
        <div className="mb-6">
          <h2 className="text-base text-white">あなたにマッチするキャストを探すために、希望するキャストの特徴や好みを設定してください。</h2>
          <p className="text-xs text-white mt-1">※あとから変更可能</p>
        </div>

        <div className="space-y-6">
          {Object.entries(categories).map(([category, tags]) => (
            <div key={category}>
              <h3 className="text-base font-medium mb-3 text-white">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagSelect(category, tag)}
                    aria-pressed={selectedTags.some(t => t.tag === tag && t.category === category)}
                    className={`px-4 py-2 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/60 ${
                      selectedTags.some(t => t.tag === tag && t.category === category)
                        ? 'bg-secondary text-white border-secondary'
                        : 'bg-primary text-white border-secondary hover:bg-secondary/20'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="p-4">
        <button
          onClick={handleSubmit}
          disabled={selectedTags.length === 0}
          className={`w-full py-4 text-center text-white rounded-lg ${selectedTags.length > 0 ? 'bg-secondary' : 'bg-pink-300 border border-secondary text-white'
            }`}
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default InterestTags; 