import React, { useState } from 'react';

interface NicknameProps {
  onNext: () => void;
  onBack: () => void;
  // eslint-disable-next-line
  updateFormData: (data: { nickname: string }) => void;
  formData: {
    nickname: string;
  };
}

const Nickname: React.FC<NicknameProps> = ({ onNext, onBack, updateFormData, formData }) => {
  const [nickname, setNickname] = useState(formData.nickname);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname) {
      setError('Please enter a nickname');
      return;
    }
    updateFormData({ nickname });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-center text-white mb-8">
          ニックネーム
        </h2>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-white">
            ニックネーム
          </label>
          <div className="mt-1">
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-secondary rounded-md shadow-sm placeholder-secondary focus:outline-none focus:ring-secondary focus:border-secondary bg-primary text-white"
            />
          </div>
        </div>
        {error && (
          <div className="text-white text-sm">
            {error}
          </div>
        )}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-2 px-4 border border-secondary rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
          >
            戻る
          </button>
          <button
            type="submit"
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
          >
            次へ
          </button>
        </div>
      </form>
    </div>
  );
};

export default Nickname; 