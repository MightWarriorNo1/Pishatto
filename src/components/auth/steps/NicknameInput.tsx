import React, { useState } from 'react';
import StepIndicator from './StepIndicator';

interface NicknameInputProps {
  onNext: () => void;
  onBack: () => void;
  // eslint-disable-next-line
  updateFormData: (data: { nickname: string }) => void;
  formData: {
    nickname: string;
  };
}

const NicknameInput: React.FC<NicknameInputProps> = ({
  onNext,
  onBack,
  updateFormData,
  formData,
}) => {
  const [nickname, setNickname] = useState(formData.nickname || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.length >= 2) {
      updateFormData({ nickname });
      onNext();
    }
  };

  // Random nickname generation
  const generateRandomNickname = () => {
    const adjectives = ['Happy', 'Lucky', 'Sunny', 'Cool', 'Sweet', 'Bright', 'Fun', 'Smart'];
    const nouns = ['Cat', 'Dog', 'Bird', 'Star', 'Moon', 'Sun', 'Fox', 'Bear'];
    const numbers = ['123', '777', '555', '888', '999', '111', '222', '333'];

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];

    // Japanese nicknames
    const japaneseNicknames = [
      'さくら',
      'ゆうき',
      'はると',
      'みさき',
      'かずき',
      'あおい',
      'ゆめか',
      'りょう',
      'みゆう',
      'けんと'
    ];

    // 50% chance to use Japanese nickname
    if (Math.random() > 0.5) {
      const randomJapanese = japaneseNicknames[Math.floor(Math.random() * japaneseNicknames.length)];
      setNickname(randomJapanese);
    } else {
      setNickname(`${randomAdjective}${randomNoun}${randomNumber}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-gray-800 to-secondary p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4">
        <button onClick={onBack} className="text-white hover:text-secondary cursor-pointer">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-lg font-medium mr-6 text-white">ニックネーム</h1>
      </div>
      {/* Progress Steps */}
      <div className="px-4 py-6">
        <StepIndicator totalSteps={6} currentStep={2} />
      </div>
      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        <div className="mb-6">
          <h2 className="text-base text-white mb-1">あなたのニックネームを教えてください。</h2>
          <p className="text-sm text-white">おまかせ入力を押すとランダムでニックネームの候補が表示されます。</p>
        </div>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="ニックネーム（2文字以上）"
              aria-describedby="nickname-hint"
              minLength={2}
              autoFocus
              className="w-full px-4 py-3 border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/60 focus:border-secondary bg-primary text-white placeholder-secondary"
            />
            <div className="mt-1 text-xs text-white" id="nickname-hint">
              <p>※2文字以上</p>
              <p>※あとから変更可能</p>
            </div>
          </div>
          <button
            onClick={generateRandomNickname}
            className="w-full py-3 text-white border border-secondary rounded-lg bg-secondary hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
          >
            おまかせ入力
          </button>
        </div>
      </div>
      {/* Bottom Button */}
      <div className="p-4">
        <button
          onClick={handleSubmit}
          disabled={nickname.length < 2}
          className={`w-full py-4 text-center text-white rounded-lg ${nickname.length >= 2 ? 'bg-secondary hover:bg-secondary' : 'bg-primary border border-secondary text-white'}`}
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default NicknameInput; 