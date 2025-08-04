import React, { useState, useEffect } from 'react';
import TopNavigation from './TopNavigation';
import NewCastSection from './NewCastSection';
import UserSatisfactionSection from './UserSatisfactionSection';
import RankingSection from './RankingSection';
import BottomNavigation from './BottomNavigation';
import FavoritesSection from './FavoritesSection';
import RankingTabSection from './RankingTabSection';
import BestSatisfactionSection from './BestSatisfactionSection';
import MessageScreen from './MessageScreen';
import CallScreen from './CallScreen';
import Timeline from './Timeline';
import Profile from './Profile';
import FootprintsSection from './FootprintsSection';
import { useUser } from '../../contexts/UserContext';
import { markAllNotificationsRead } from '../../services/api';
import { useChatMessages, useTweets } from '../../hooks/useRealtime';

const Dashboard: React.FC = () => {
  const [activeBottomTab, setActiveBottomTab] = useState<'search' | 'message' | 'call' | 'tweet' | 'mypage'>('search');
  const [activeSearchTab, setActiveSearchTab] = useState<'home' | 'favorites' | 'footprints' | 'ranking'>('home');
  const [showChat, setShowChat] = useState<number | null>(null);
  const [showOrder, setShowOrder] = useState(false);
  const { user } = useUser();
  const [messageCount, setMessageCount] = useState(0);;
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [latestNotification] = useState<any>(null);
  const [tweetCount, setTweetCount] = useState(0);
  const [hasSearchResults, setHasSearchResults] = useState(false);
  const prevTab = React.useRef(activeBottomTab);

  // useEffect(() => {
  //   if (user) {
  //     getGuestChats(user.id).then((chats) => {
  //       const totalUnread = (chats || []).reduce((sum: any, chat: any) => sum + (chat.unread || 0), 0);
  //       setMessageCount(totalUnread);
  //     });
  //   }
  // }, []);

  // useNotifications(user?.id ?? '', (notification) => {
  //   if (notification.type === 'message') {
  //     setMessageCount((c) => c + 1);
  //   }
  //   console.log("messageCount", messageCount); 
  //   setLatestNotification(notification);
  //   setShowNotificationPopup(true);
  //   setLastNotificationId(notification.id);
  // });

  useTweets((tweet) => {
    if (activeBottomTab !== 'tweet') {
      setTweetCount((c) => c + 1);
    }
    console.log("Tweet count", tweetCount);
  });

  useChatMessages(user?.id || 0, (message) => {
    if(activeBottomTab !== 'message') {
      setMessageCount((c) => c + 1);
    }
  });

  useEffect(() => {
    // Clear tweetCount when switching to tweet tab
    if (activeBottomTab === 'tweet' && prevTab.current !== 'tweet') {
      setTweetCount(0);
    }

    if (activeBottomTab === 'message' && prevTab.current !== 'message') {
      // Mark all notifications as read when entering message tab
      setMessageCount(0); // Reset immediately for UI responsiveness
      if (user) {
        markAllNotificationsRead('guest', user.id).then(() => {
          // setMessageCount(0); // Already reset above
        });
      }
    }
  }, [activeBottomTab, user]);

  // Render content for the search tabs
  const renderSearchTabContent = () => {
    switch (activeSearchTab) {
      case 'home':
        return (
          <>
            {/* <PromotionalBanner /> */}
            <div className="px-4 py-4">
              <NewCastSection />
              <UserSatisfactionSection />
              <RankingSection />
              <BestSatisfactionSection />
            </div>
          </>
        );
      case 'favorites':
        return <FavoritesSection />;
      case 'footprints':
        return <FootprintsSection />;
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
        return <MessageScreen
          showChat={showChat}
          setShowChat={setShowChat}
          userId={user?.id || 0}
          activeBottomTab={activeBottomTab}
          // Only update messageCount if new notifications arrive (not on initial fetch)
          onNotificationCountChange={count => {
            if (activeBottomTab !== 'message') {
              setMessageCount(count);
            }
          }}
        />;
      case 'call':
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
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-primary via-primary to-secondary">
      {/* Show TopNavigation and search tabs only when in search mode */}
      {activeBottomTab === 'search' && (
        <>
          <TopNavigation 
            activeTab={activeSearchTab} 
            onTabChange={setActiveSearchTab}
          />
          <div className={`max-w-md mx-auto pb-16 ${hasSearchResults ? 'pt-4' : 'pt-28'}`}>
            {renderSearchTabContent()}
          </div>
        </>
      )}
      {/* Show other tab content when not in search mode */}
      {activeBottomTab !== 'search' && renderOtherTabContent()}
      {/* Only show BottomNavigation if not in chat detail or order flow */}
      {!showOrder && showChat === null && (
        <BottomNavigation
          activeTab={activeBottomTab}
          onTabChange={tab => {
            setActiveBottomTab(tab as 'search' | 'message' | 'call' | 'tweet' | 'mypage');
          }}
          messageCount={messageCount}
          tweetCount={tweetCount}
        />
      )}
      {showNotificationPopup && latestNotification && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-secondary text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="font-bold mb-1">新着通知</div>
          <div>{latestNotification.message}</div>
          <button className="mt-2 text-xs underline" onClick={async () => {
            setShowNotificationPopup(false)
          }}>閉じる</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 