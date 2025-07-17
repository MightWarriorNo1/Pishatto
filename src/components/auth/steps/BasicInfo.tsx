import React, { useState } from 'react';

interface BasicInfoData {
  email: string;
  password: string;
}

interface BasicInfoProps {
  onNext: () => void;
  // eslint-disable-next-line 
  updateFormData: (data: BasicInfoData) => void;
  formData: BasicInfoData;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ onNext, updateFormData, formData }) => {
  const [email, setEmail] = useState(formData.email);
  const [password, setPassword] = useState(formData.password);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    updateFormData({ email, password });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-center text-white mb-8">
          基本情報入力
        </h2>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white">
            メールアドレス
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-secondary rounded-md shadow-sm placeholder-secondary focus:outline-none focus:ring-secondary focus:border-secondary bg-primary text-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white">
            パスワード
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-secondary rounded-md shadow-sm placeholder-secondary focus:outline-none focus:ring-secondary focus:border-secondary bg-primary text-white"
            />
          </div>
        </div>

        {error && (
          <div className="text-white text-sm">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
          >
            次へ
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicInfo; 