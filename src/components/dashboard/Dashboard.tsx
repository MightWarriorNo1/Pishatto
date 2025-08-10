import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useNotificationSettings } from '../../contexts/NotificationSettingsContext';
import { useChatRefresh } from '../../contexts/ChatRefreshContext';
import { markAllNotificationsRead, getGuestChats } from '../../services/api';
import { useChatMessages, useTweets, useNotifications, useUnreadMessageCount } from '../../hooks/useRealtime';// Assume a simple Modal component exists or will be created

// Add Modal component above Dashboard
const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl">×</button>
      {children}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [activeBottomTab, setActiveBottomTab] = useState<'search' | 'message' | 'call' | 'tweet' | 'mypage'>('search');
  const [activeSearchTab, setActiveSearchTab] = useState<'home' | 'favorites' | 'footprints' | 'ranking'>('home');
  const [showChat, setShowChat] = useState<number | null>(null);
  const [showOrder, setShowOrder] = useState(false);
  const [showConcierge, setShowConcierge] = useState(false);
  const { user, loading } = useUser();
  const navigate = useNavigate();


  // Redirect unauthenticated guests to the first page
  useEffect(() => {
    if (!loading && !user) {
      navigate('/register');
    }
  }, [loading, user, navigate]);
  const { isNotificationEnabled } = useNotificationSettings();
  const { refreshChats } = useChatRefresh();
  const [messageCount, setMessageCount] = useState(0);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [latestNotification, setLatestNotification] = useState<any>(null);
  const [tweetCount, setTweetCount] = useState(0);
  const [hasSearchResults] = useState(false);
  const prevTab = React.useRef(activeBottomTab);
  const [modalType, setModalType] = useState<null | 'satisfaction' | 'ranking'>(null);
  const [allSatisfactionCasts, setAllSatisfactionCasts] = useState<any[]>([]);
  const [allRankings, setAllRankings] = useState<any[]>([]);

  // Initialize message count from existing chats
  useEffect(() => {
    if (user) {
      getGuestChats(user.id, 'guest').then((chats) => {
        const totalUnread = (chats || []).reduce((sum: any, chat: any) => sum + (chat.unread || 0), 0);
        setMessageCount(totalUnread);
      });
    }
  }, [user]);

  // Real-time unread message count updates
  useUnreadMessageCount(user?.id || 0, 'guest', (count) => {
    if (activeBottomTab !== 'message') {
      if (count === 0) {
        setMessageCount(0);
      } else {
        setMessageCount((prev) => prev + count);
      }
    }
  });

  // Real-time notification updates
  useNotifications(user?.id || 0, (notification) => {
    if (notification.type === 'message' && activeBottomTab !== 'message') {
      setMessageCount((c) => c + 1);
    }
    setLatestNotification(notification);
    setShowNotificationPopup(true);
  });

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
    
    // Update prevTab ref
    prevTab.current = activeBottomTab;
  }, [activeBottomTab, user]);

  // Fetch all data for modals
  useEffect(() => {
    if (modalType === 'satisfaction') {
      import('../../services/api').then(api => {
        api.getAllSatisfactionCasts().then(setAllSatisfactionCasts);
      });
    } else if (modalType === 'ranking') {
      import('../../services/api').then(api => {
        api.fetchRanking({ userType: 'cast', timePeriod: 'yesterday', category: 'gift', area: '全国' }).then(res => setAllRankings(res.data || []));
      });
    }
  }, [modalType]);

  // Handle footprints tab being disabled
  useEffect(() => {
    if (activeSearchTab === 'footprints' && !isNotificationEnabled('footprints')) {
      setActiveSearchTab('home');
    }
  }, [activeSearchTab, isNotificationEnabled]);

  // Render content for the search tabs
  const renderSearchTabContent = () => {
    switch (activeSearchTab) {
      case 'home':
        return (
          <>
            {/* <PromotionalBanner /> */}
            <div className="px-4 py-4">
              <NewCastSection />
              <UserSatisfactionSection onSeeAll={() => setModalType('satisfaction')} />
              <RankingSection onSeeRanking={() => setModalType('ranking')} />
              <BestSatisfactionSection />
            </div>
          </>
        );
      case 'favorites':
        return <FavoritesSection />;
      case 'footprints':
        // If footprints are disabled, show home content instead
        if (!isNotificationEnabled('footprints')) {
          return (
            <>
              <div className="px-4 py-4">
                <NewCastSection />
                <UserSatisfactionSection />
                <RankingSection />
                <BestSatisfactionSection />
              </div>
            </>
          );
        }
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
          onConciergeStateChange={setShowConcierge}
        />;
      case 'call':
        return <CallScreen 
          onStartOrder={() => setShowOrder(true)} 
          onNavigateToMessage={() => {
            setActiveBottomTab('message');
            refreshChats(); // Refresh chat list to show new chat
          }}
        />;
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
      {/* Only show BottomNavigation if not in chat detail, order flow, or concierge detail */}
      {!showOrder && showChat === null && !showConcierge && (
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
      {/* Modal rendering */}
      {modalType === 'satisfaction' && (
        <Modal onClose={() => setModalType(null)}>
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">ユーザー満足度の高いキャスト一覧</h2>
            <div className="grid grid-cols-2 gap-4">
              {allSatisfactionCasts.map((cast: any) => (
                <div key={cast.id} className="bg-primary rounded-lg shadow p-3 border border-secondary cursor-pointer">
                  <img src={cast.avatar ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/${cast.avatar}` : '/assets/avatar/female.png'} alt={cast.nickname} className="w-full h-32 object-cover rounded-lg border border-secondary mb-2" />
                  <div className="font-medium text-white text-sm">{cast.nickname}</div>
                  <div className="text-xs text-white mt-1">{cast.average_rating?.toFixed(1)} ★ / {cast.feedback_count}件</div>
                  <div className="text-xs text-white mt-1">{cast.grade_points}円/30分</div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
      {modalType === 'ranking' && (
        <Modal onClose={() => setModalType(null)}>
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">昨日のランキングTOP10</h2>
            <div className="grid grid-cols-2 gap-4">
              {allRankings.map((profile: any, index: number) => (
                <div key={profile.id} className="bg-primary rounded-lg shadow p-3 border border-secondary cursor-pointer">
                  <img src={profile.avatar ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/${profile.avatar}` : '/assets/avatar/female.png'} alt={profile.name} className="w-full h-32 object-cover rounded-lg border border-secondary mb-2" />
                  <div className="font-medium text-white text-sm">{profile.name}</div>
                  <div className="text-xs text-white mt-1">{profile.points}ポイント {profile.gift_count && `(${profile.gift_count}件)`}</div>
                  <div className="absolute top-2 left-2 bg-secondary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">{index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard; 