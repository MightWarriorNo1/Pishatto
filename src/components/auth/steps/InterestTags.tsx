import React, { useState } from 'react';

interface InterestTagsData {
  interests: string[];
}

interface InterestTagsProps {
  onNext: () => void;
  onBack: () => void;
  // eslint-disable-next-line
  updateFormData: (data: InterestTagsData) => void;
  formData: InterestTagsData;
}

const InterestTags: React.FC<InterestTagsProps> = ({
  onNext,
  onBack,
  updateFormData,
  formData,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(formData.interests || []);

  const categories = {
    '飲み方': ['わいわい', 'しっとり', 'パリピ'],
    '趣味': ['海好き', 'ゴルフ', 'カラオケ', 'アニメ', '漫画'],
    '映画鑑賞': [],
    'アクティビティ': ['トレーニング', '麻雀', '旅行', '温泉', 'BBQ'],
    '音楽': ['ゲーム']
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    updateFormData({ interests: selectedTags });
    onNext();
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
        <div className="flex items-center justify-between max-w-[240px] mx-auto">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center border border-secondary">1</div>
          <div className="flex-1 h-[2px] bg-secondary"></div>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center border border-secondary justify-center">2</div>
          <div className="flex-1 h-[2px] bg-secondary"></div>
          <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center border border-secondary">3</div>
          <div className="flex-1 h-[2px] bg-secondary"></div>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center border border-secondary">4</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4">
        <div className="mb-6">
          <h2 className="text-base text-white">あなたにマッチするキャストを探すために、趣味や好みのタグを設定してください。</h2>
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
                    onClick={() => handleTagSelect(tag)}
                    className={`px-4 py-2 rounded-full border ${selectedTags.includes(tag)
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-primary text-white border-secondary hover:bg-secondary'
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