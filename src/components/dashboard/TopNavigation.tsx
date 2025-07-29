import React from 'react';
import { Search, QrCode } from 'lucide-react';

interface TopNavigationProps {
  activeTab: 'home' | 'favorites' | 'footprints' | 'ranking';
  // eslint-disable-next-line
  onTabChange: (tab: 'home' | 'favorites' | 'footprints' | 'ranking') => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: 'home', label: 'ホーム' },
    { key: 'favorites', label: 'お気に入り' },
    { key: 'footprints', label: '足あとから' },
    { key: 'ranking', label: 'ランキング' },
  ];

  return (
    <div className="fixed max-w-md mx-auto top-0 left-0 right-0 bg-primary z-50 border-b border-secondary">
      <div className="max-w-md mx-auto px-4 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="年齢,身長検索が可能になりました"
              className="w-full pl-10 pr-4 py-2 rounded-full bg-primary text-white text-sm border border-secondary placeholder-red-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
          </div>
          <button className="ml-4">
            <QrCode />
          </button>
        </div>
        <div className="flex justify-between mt-3 text-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`flex-1 py-3 px-2 text-center text-sm font-bold rounded-t-lg transition-colors ${activeTab === tab.key ? 'bg-secondary text-white' : 'bg-primary text-gray-400'}`}
              onClick={() => onTabChange(tab.key as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopNavigation; 