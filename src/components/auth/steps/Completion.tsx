import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Completion: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">登録完了</h2>
      <p className="text-gray-600 mb-8">
        ご登録ありがとうございます。<br />
        まもなくダッシュボードへ移動します。
      </p>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
    </div>
  );
};

export default Completion;