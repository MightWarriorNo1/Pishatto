import React from 'react';
import { FiMessageSquare } from 'react-icons/fi';

interface HistoryProfile {
  id: number;
  name: string;
  age: number;
  imageUrl: string;
  message: string;
  timestamp: string;
  tags: string[];
  isPremium?: boolean;
}

const HistorySection: React.FC = () => {
  const [history] = React.useState<HistoryProfile[]>([
    {
      id: 1,
      name: 'もえこ',
      age: 29,
      imageUrl: '/assets/avatar/female.png',
      message: '初めまして！普段は不動産系の会社員でSNS関係や人材紹介の個人事業主としてます♪。普段は芸能活動もしてました🌟',
      timestamp: '59分前',
      tags: ['足あとがつきました']
    },
    {
      id: 2,
      name: 'なのは',
      age: 32,
      imageUrl: '/assets/avatar/man.png',
      message: '数多くのキャストさんから見つけていただき、ありがとうございます♪ ====★英語・中国語OK Sophiaさん👈個性的…',
      timestamp: '59分前',
      tags: ['足あとがつきました'],
      isPremium: true
    },
    {
      id: 3,
      name: 'あおい',
      age: 25,
      imageUrl: '/assets/avatar/female.png',
      message: '初めまして！普段は不動産系の会社員でSNS関係や人材紹介の個人事業主としてます♪。普段は芸能活動もしてました🌟',
      timestamp: '59分前',
      tags: ['足あとがつきました']
    },
    {
      id: 4,
      name: 'あおい',
      age: 25,
      imageUrl: '/assets/avatar/female.png',
      message: '初めまして！普段は不動産系の会社員でSNS関係や人材紹介の個人事業主としてます♪。普段は芸能活動もしてました🌟',
      timestamp: '59分前',
      tags: ['足あとがつきました']
    }
  ]);

  return (
    <div className="space-y-4 p-4">
      {history.map((profile) => (
        <div key={profile.id} className="bg-primary rounded-lg shadow p-4 border border-secondary">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 flex-shrink-0">
              <img
                src={profile.imageUrl}
                alt={profile.name}
                className="w-full h-full object-cover rounded border border-secondary"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white">{profile.timestamp}</span>
                <div className="flex items-center space-x-1">
                  {profile.tags.map((tag, index) => (
                    <span key={index} className="text-sm text-white">・{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center mt-1 space-x-2">
                <span className="font-medium text-white">👤 {profile.name}</span>
                <span className="text-sm text-white">
                  {profile.age}歳
                </span>
                {profile.isPremium && (
                  <span className="px-2 py-0.5 text-xs bg-secondary text-white rounded">
                    mpishatto
                  </span>
                )}
              </div>
              <p className="text-sm text-white mt-2 line-clamp-2">
                {profile.message}
              </p>
              <button className="w-full mt-3 flex items-center justify-center space-x-2 bg-secondary text-white py-2 rounded-lg">
                <FiMessageSquare className="w-4 h-4" />
                <span>メッセージを送る</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistorySection; 