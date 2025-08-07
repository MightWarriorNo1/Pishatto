
import React from 'react';
import { Search, MessageCircle, Hand, Clock9, UserRound } from 'lucide-react'
interface BottomNavigationProps {
  activeTab: 'search' | 'message' | 'call' | 'tweet' | 'mypage';
  onTabChange: (tab: 'search' | 'message' | 'call' | 'tweet' | 'mypage') => void;
  messageCount?: number;
  tweetCount?: number;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange, messageCount = 0, tweetCount = 0 }) => {
  return (
    <div className="fixed max-w-md mx-auto bottom-0 left-0 right-0 z-50">
      <div className="shadow p-4 flex flex-row items-center bg-primary">
        <button
          className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors duration-150 ${activeTab === 'search' ? 'text-secondary font-bold' : 'text-white'}`}
          onClick={() => onTabChange('search')}
        >
          <span className="relative text-2xl mb-1">
            <Search />
          </span>
          <span>探す</span>
        </button>
        <button
          className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors duration-150 ${activeTab === 'message' ? 'text-secondary font-bold' : 'text-white'}`}
          onClick={() => onTabChange('message')}
        >
          <span className="relative text-2xl mb-1">
            <MessageCircle />
            {messageCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-secondary text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{messageCount}</span>
            )}
          </span>
          <span>メッセージ</span>
        </button>
        <button
          className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors duration-150 ${activeTab === 'call' ? 'text-secondary font-bold' : 'text-white'}`}
          onClick={() => onTabChange('call')}
        >
          <span className="relative text-2xl mb-1">
            <Hand />
          </span>
          <span>呼ぶ</span>
        </button>
        <button
          className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors duration-150 ${activeTab === 'tweet' ? 'text-secondary font-bold' : 'text-white'}`}
          onClick={() => onTabChange('tweet')}
        >
          <span className="relative text-2xl mb-1">
            <Clock9 />
            {tweetCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-secondary text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{tweetCount}</span>
            )}
          </span>
          <span>つぶやき</span>
        </button>
        <button
          className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors duration-150 ${activeTab === 'mypage' ? 'text-secondary font-bold' : 'text-white'}`}
          onClick={() => onTabChange('mypage')}
        >
          <span className="relative text-2xl mb-1">
            <UserRound />
          </span>
          <span>マイページ</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation; 