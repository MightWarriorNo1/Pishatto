/* eslint-disable */
import React, { useState } from 'react';
import { handleLineLogin } from '../../../utils/lineLogin';

interface LoginOptionsProps {
  onNext: () => void;
}


const LoginOptions: React.FC<LoginOptionsProps> = ({ onNext }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userType = 'guest';

  const handleLineLoginClick = () => {
    setIsLoading(true);
    setError(null);

    handleLineLogin({
      userType,
      useCastCallback: false, // Explicitly set to false for regular login
      onError: (errorMessage: string) => {
        setError(errorMessage);
      }
    }).finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-gray-800 to-secondary p-8 flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full px-4 space-y-4">
          <div className="p-2 text-center text-xs text-white">
           登録する方は18歳以上の方で、全ての <a href="/legal/terms" className="underline hover:text-white">利用規約</a> と <a href="/legal/privacy" className="underline hover:text-white">プライバシーポリシー</a> に同意した上でサービスを利用することとします。よろしいでしょうか。
          </div>

          <button
            onClick={onNext}
            aria-label="電話番号で始める"
            className="w-full flex items-center justify-center py-3 px-4 rounded-full bg-primary border border-secondary hover:bg-red-500 text-white font-medium relative focus:outline-none focus:ring-2 focus:ring-secondary/60"
          >
            <span className="absolute left-4">📞</span>
            電話番号で始める
          </button>

          <button
            onClick={handleLineLoginClick}
            aria-label="LINEで始める"
            className="w-full flex items-center justify-center py-3 px-4 rounded-full bg-secondary hover:bg-red-400 text-white border border-secondary font-medium relative focus:outline-none focus:ring-2 focus:ring-secondary/60"
          >
            <span className="absolute left-4">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.195 0-.384-.078-.525-.217l-2.461-2.461v2.051c0 .345-.282.63-.63.63-.345 0-.627-.285-.627-.63V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v2.051l2.461-2.461c.141-.142.33-.217.525-.217.066 0 .135.01.199.031.258.086.432.326.432.596v4.733zm-6.396 0c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.195 0-.384-.078-.525-.217l-2.461-2.461v2.051c0 .345-.282.63-.63.63-.345 0-.627-.285-.627-.63V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v2.051l2.461-2.461c.141-.142.33-.217.525-.217.066 0 .135.01.199.031.258.086.432.326.432.596v4.733z" />
              </svg>
            </span>
            LINEで始める
          </button>
{/* 
          <button className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-white"
            onClick={() => { window.location.href = "/"; }}>
            閉じる
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default LoginOptions; 