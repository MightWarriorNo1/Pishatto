import React from 'react';
import { FiSearch, FiCode } from 'react-icons/fi';

interface TopNavigationProps {
  activeTab: 'home' | 'favorites' | 'history' | 'ranking';
  // eslint-disable-next-line
  onTabChange: (tab: 'home' | 'favorites' | 'history' | 'ranking') => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ activeTab, onTabChange }) => {
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
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
          </div>
          <button className="ml-4">
            <FiCode className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="flex justify-between mt-3 text-sm">
          <button
            className={`font-medium pb-3 ${activeTab === 'home' ? 'text-white border-b-2 border-secondary' : 'text-white'}`}
            onClick={() => onTabChange('home')}
          >
            ホーム
          </button>
          <button
            className={`font-medium pb-3 ${activeTab === 'favorites' ? 'text-white border-b-2 border-secondary' : 'text-white'}`}
            onClick={() => onTabChange('favorites')}
          >
            お気に入り
          </button>
          <button
            className={`font-medium pb-3 ${activeTab === 'history' ? 'text-white border-b-2 border-secondary' : 'text-white'}`}
            onClick={() => onTabChange('history')}
          >
            足あとから
          </button>
          <button
            className={`font-medium pb-3 ${activeTab === 'ranking' ? 'text-white border-b-2 border-secondary' : 'text-white'}`}
            onClick={() => onTabChange('ranking')}
          >
            ランキング
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation; 