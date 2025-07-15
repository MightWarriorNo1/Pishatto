import React from 'react';
import { Search, MessageSquareMore, Hand, Clock4, User } from 'lucide-react'

interface BottomNavigationProps {
  activeTab: 'search' | 'message' | 'call' | 'tweet' | 'mypage';
  onTabChange: (tab: 'search' | 'message' | 'call' | 'tweet' | 'mypage') => void;
  messageCount?: number;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange, messageCount = 0 }) => {
  return (
    <div className="fixed max-w-md mx-auto bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          <button
            className={`flex flex-col items-center ${activeTab === 'search' ? 'text-blue-500' : 'text-gray-500'}`}
            onClick={() => onTabChange('search')}
          >
            <Search />
            <span className="text-xs mt-1">探す</span>
          </button>
          <button
            className={`relative flex flex-col items-center ${activeTab === 'message' ? 'text-blue-500' : 'text-gray-500'}`}
            onClick={() => onTabChange('message')}
          >
            <MessageSquareMore />
            {messageCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {messageCount}
              </span>
            )}
            <span className="text-xs mt-1">メッセージ</span>
          </button>
          <button
            className={`flex flex-col items-center ${activeTab === 'call' ? 'text-blue-500' : 'text-gray-500'}`}
            onClick={() => onTabChange('call')}
          >
            <Hand />
            <span className="text-xs mt-1">呼ぶ</span>
          </button>
          <button
            className={`flex flex-col items-center ${activeTab === 'tweet' ? 'text-blue-500' : 'text-gray-500'}`}
            onClick={() => onTabChange('tweet')}
          >
            <Clock4 />
            <span className="text-xs mt-1">つぶやき</span>
          </button>
          <button
            className={`flex flex-col items-center ${activeTab === 'mypage' ? 'text-blue-500' : 'text-gray-500'}`}
            onClick={() => onTabChange('mypage')}
          >
            <User />
            <span className="text-xs mt-1">マイページ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation; 