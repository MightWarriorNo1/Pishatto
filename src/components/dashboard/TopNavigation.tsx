import React from 'react';
import { FiSearch, FiCode } from 'react-icons/fi';

interface TopNavigationProps {
  activeTab: 'home' | 'favorites' | 'history' | 'ranking';
  // eslint-disable-next-line
  onTabChange: (tab: 'home' | 'favorites' | 'history' | 'ranking') => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed max-w-md mx-auto top-0 left-0 right-0 bg-white z-50">
      <div className="max-w-md mx-auto px-4 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="年齢,身長検索が可能になりました"
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 text-sm"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button className="ml-4">
            <FiCode className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="flex justify-between mt-3 text-sm">
          <button
            className={`font-medium pb-3 ${activeTab === 'home' ? 'text-black border-b-2 border-black' : 'text-gray-600'}`}
            onClick={() => onTabChange('home')}
          >
            ホーム
          </button>
          <button
            className={`font-medium pb-3 ${activeTab === 'favorites' ? 'text-black border-b-2 border-black' : 'text-gray-600'}`}
            onClick={() => onTabChange('favorites')}
          >
            お気に入り
          </button>
          <button
            className={`font-medium pb-3 ${activeTab === 'history' ? 'text-black border-b-2 border-black' : 'text-gray-600'}`}
            onClick={() => onTabChange('history')}
          >
            足あとから
          </button>
          <button
            className={`font-medium pb-3 ${activeTab === 'ranking' ? 'text-black border-b-2 border-black' : 'text-gray-600'}`}
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