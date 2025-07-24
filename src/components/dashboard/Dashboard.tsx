import React, { useState, useEffect } from 'react';
import TopNavigation from './TopNavigation';
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
import { useUser } from '../../contexts/UserContext';
import { getGuestChats, markNotificationRead, markAllNotificationsRead } from '../../services/api';
import { useNotifications } from '../../hooks/useRealtime';
import { useTweets } from '../../hooks/useRealtime';

const Dashboard: React.FC = () => {
  // Bottom navigation: search, message, call, tweet, mypage
  const [activeBottomTab, setActiveBottomTab] = useState<'search' | 'message' | 'call' | 'tweet' | 'mypage'>('search');
  // Top navigation (search tabs): home, favorites, history, ranking
  const [activeSearchTab, setActiveSearchTab] = useState<'home' | 'favorites' | 'history' | 'ranking'>('home');
  // Chat detail state
  const [showChat, setShowChat] = useState<number | null>(null);
  // Order flow state
  const [showOrder, setShowOrder] = useState(false);
  const { user } = useUser();
  const [messageCount, setMessageCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastNotificationId, setLastNotificationId] = useState<number | null>(null);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [latestNotification, setLatestNotification] = useState<any>(null);
  const [tweetCount, setTweetCount] = useState(0);
  const prevTab = React.useRef(activeBottomTab);

  useEffect(() => {
    if (user) {
      getGuestChats(user.id).then((chats) => {
        const totalUnread = (chats || []).reduce((sum: any, chat: any) => sum + (chat.unread || 0), 0);
        setMessageCount(totalUnread);
      });
    }
  }, [user]);

  useNotifications(user?.id ?? '', (notification) => {
    setNotificationCount((c) => c + 1);
    setLatestNotification(notification);
    setShowNotificationPopup(true);
    setLastNotificationId(notification.id);
  });

  useTweets((tweet) => {
    // Only increment if not on tweet tab
    if (activeBottomTab !== 'tweet') {
      setTweetCount((c) => c + 1);
    }
  });

  useEffect(() => {
    // Clear tweetCount when switching to tweet tab
    if (activeBottomTab === 'tweet' && prevTab.current !== 'tweet') {
      setTweetCount(0);
    }

    if (activeBottomTab === 'message' && prevTab.current !== 'message') {
      // Mark all notifications as read when entering message tab
      if (user) {
        markAllNotificationsRead('guest', user.id).then(() => {
          setMessageCount(0);
        });
      } else {
        setMessageCount(0);
      }
    }
  }, [activeBottomTab, user]);

  console.log('messageCount', messageCount);
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
        return <MessageScreen
          showChat={showChat}
          setShowChat={setShowChat}
          userId={user?.id || 0}
          // Only update messageCount if new notifications arrive (not on initial fetch)
          onNotificationCountChange={count => {
            if (activeBottomTab !== 'message') {
              setMessageCount(count);
            }
          }}
        />;
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
            setShowNotificationPopup(false);
            if (latestNotification.id) {
              await markNotificationRead(latestNotification.id);
              setNotificationCount((c) => Math.max(0, c - 1));
            }
          }}>閉じる</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 