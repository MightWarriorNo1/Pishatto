import React, { useState } from 'react';
import TopNavigation from './TopNavigation';
import PromotionalBanner from './PromotionalBanner';
import NewCastSection from './NewCastSection';
import UserSatisfactionSection from './UserSatisfactionSection';
import RankingSection from './RankingSection';
import BottomNavigation from './BottomNavigation';
import FavoritesSection from './FavoritesSection';
import HistorySection from './HistorySection';
import RankingTabSection from './RankingTabSection';
import BestSatisfactionSection from './BestSatisfactionSection';
import MessageScreen from './MessageScreen';
import CallScreen from './CallScreen';
import Order from './Order';
import Timeline from './Timeline';
import Profile from './Profile';

const Dashboard: React.FC = () => {
  // Bottom navigation: search, message, call, tweet, mypage
  const [activeBottomTab, setActiveBottomTab] = useState<'search' | 'message' | 'call' | 'tweet' | 'mypage'>('search');
  // Top navigation (search tabs): home, favorites, history, ranking
  const [activeSearchTab, setActiveSearchTab] = useState<'home' | 'favorites' | 'history' | 'ranking'>('home');
  // Chat detail state
  const [showChat, setShowChat] = useState(false);
  // Order flow state
  const [showOrder, setShowOrder] = useState(false);

  // Render content for the search tabs
  const renderSearchTabContent = () => {
    switch (activeSearchTab) {
      case 'home':
        return (
          <>
            <PromotionalBanner />
            <div className="px-4">
              <NewCastSection />
              <UserSatisfactionSection />
              <RankingSection />
              <BestSatisfactionSection />
            </div>
          </>
        );
      case 'favorites':
        return <FavoritesSection />;
      case 'history':
        return <HistorySection />;
      case 'ranking':
        return <RankingTabSection />;
      default:
        return null;
    }
  };

  // Render content for other bottom navigation tabs
  const renderOtherTabContent = () => {
    switch (activeBottomTab) {
      case 'message':
        return <MessageScreen showChat={showChat} setShowChat={setShowChat} />;
      case 'call':
        if (showOrder) {
          return <Order onBack={() => setShowOrder(false)} />;
        }
        return <CallScreen onStartOrder={() => setShowOrder(true)} />;
      case 'tweet':
        return <Timeline />;
      case 'mypage':
        return <Profile />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-primary">
      {/* Show TopNavigation and search tabs only when in search mode */}
      {activeBottomTab === 'search' && (
        <>
          <TopNavigation activeTab={activeSearchTab} onTabChange={setActiveSearchTab} />
          <div className="max-w-md mx-auto pb-16 pt-24">
            {renderSearchTabContent()}
          </div>
        </>
      )}
      {/* Show other tab content when not in search mode */}
      {activeBottomTab !== 'search' && renderOtherTabContent()}
      {/* Only show BottomNavigation if not in chat detail or order flow */}
      {!showOrder && !showChat && (
        <BottomNavigation
          activeTab={activeBottomTab}
          onTabChange={tab => {
            setActiveBottomTab(tab);
          }}
          messageCount={4}
        />
      )}
    </div>
  );
};

export default Dashboard; 