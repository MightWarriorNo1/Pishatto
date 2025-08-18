 import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { useGuestChats, useSatisfactionCasts, useRanking, useMarkNotificationsRead } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/react-query';
import { useChatMessages, useTweets, useNotifications, useUnreadMessageCount } from '../../hooks/useRealtime';
import { formatPoints } from '../../utils/formatters';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

// Add Modal component above Dashboard
const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-gradient-to-b from-primary via-primary to-secondary rounded-2xl p-0 max-w-md w-full mx-4 relative shadow-xl border border-secondary"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/80 hover:text-white text-2xl"
          aria-label="閉じる"
        >
          ×
        </button>
        <div className="max-h-[80vh] overflow-y-auto p-6 text-white">{children}</div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [activeBottomTab, setActiveBottomTab] = useState<'search' | 'message' | 'call' | 'tweet' | 'mypage'>('search');
  const [activeSearchTab, setActiveSearchTab] = useState<'home' | 'favorites' | 'footprints' | 'ranking'>('home');
  const [showChat, setShowChat] = useState<number | null>(null);
  const [showOrder, setShowOrder] = useState(false);
  const [showConcierge, setShowConcierge] = useState(false);
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Set up auto-refresh for dashboard data every 30 seconds
  useAutoRefresh({
    interval: 30 * 1000, // 30 seconds
    enabled: true,
    queryKeys: [
      queryKeys.guest.profile(user?.id || 0),
      queryKeys.guest.chats(user?.id || 0),
      queryKeys.guest.notifications(user?.id || 0),
      queryKeys.guest.favorites(user?.id || 0),
      queryKeys.guest.footprints(user?.id || 0),
      queryKeys.cast.all(),
      queryKeys.cast.new(),
      queryKeys.tweets.all()
    ]
  });

  // Set up global auto-refresh for all queries every 50 seconds
  useAutoRefresh({
    interval: 50 * 1000, // 50 seconds
    enabled: true
  });


  // Redirect unauthenticated guests to the first page
  useEffect(() => {
    if (!loading && !user) {
      navigate('/register');
    }
  }, [loading, user, navigate]);

  // Open specific chat when navigated with state
  useEffect(() => {
    const state = location.state as any;
    if (state && state.openChatId) {
      setActiveBottomTab('message');
      setShowChat(state.openChatId as number);
      // Clear the navigation state so back/forward doesn't re-open
      navigate(location.pathname, { replace: true, state: {} });
    } else if (state && state.openMessageTab) {
      setActiveBottomTab('message');
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { isNotificationEnabled } = useNotificationSettings();
  const { refreshChats } = useChatRefresh();
  const [messageCount, setMessageCount] = useState(0);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [latestNotification, setLatestNotification] = useState<any>(null);
  const [tweetCount, setTweetCount] = useState(0);
  const [hasSearchResults] = useState(false);
  const prevTab = React.useRef(activeBottomTab);
  const [modalType, setModalType] = useState<null | 'satisfaction' | 'ranking'>(null);
  const [satisfactionSearch, setSatisfactionSearch] = useState('');
  const [satisfactionSort, setSatisfactionSort] = useState<'rating' | 'feedback' | 'price' | 'name'>('rating');
  const [rankingFilters] = useState<{ timePeriod: 'today' | 'yesterday' | 'week' | 'month'; category: 'gift' | 'points' }>({
    timePeriod: 'yesterday',
    category: 'gift',
  });
  const queryClient = useQueryClient();

  // React Query hooks for data fetching
  const { data: allSatisfactionCasts = [], isLoading: satisfactionLoading } = useSatisfactionCasts();
  const { data: rankingData, isLoading: rankingLoading } = useRanking({
    userType: 'cast',
    timePeriod: rankingFilters.timePeriod,
    category: rankingFilters.category,
    area: '全国',
  });
  const allRankings = rankingData?.data || [];

  const filteredAndSortedSatisfactionCasts = useMemo(() => {
    let list = allSatisfactionCasts || [];
    const query = satisfactionSearch.trim().toLowerCase();
    if (query) {
      list = list.filter((cast: any) => (cast.nickname || '').toLowerCase().includes(query));
    }
    const sorted = [...list].sort((a: any, b: any) => {
      switch (satisfactionSort) {
        case 'rating': {
          const ar = Number(a.average_rating || 0);
          const br = Number(b.average_rating || 0);
          return br - ar; // desc
        }
        case 'feedback': {
          const af = Number(a.feedback_count || 0);
          const bf = Number(b.feedback_count || 0);
          return bf - af; // desc
        }
        case 'price': {
          const ap = Number(a.grade_points || 0);
          const bp = Number(b.grade_points || 0);
          return ap - bp; // asc
        }
        case 'name':
        default: {
          const an = (a.nickname || '').toLowerCase();
          const bn = (b.nickname || '').toLowerCase();
          return an.localeCompare(bn);
        }
      }
    });
    return sorted;
  }, [allSatisfactionCasts, satisfactionSearch, satisfactionSort]);

  // React Query hook for guest chats
  const { data: guestChats = [] } = useGuestChats(user?.id || 0);

  // Initialize message count from existing chats
  useEffect(() => {
    if (guestChats.length > 0) {
      const totalUnread = guestChats.reduce((sum: any, chat: any) => sum + (chat.unread || 0), 0);
      setMessageCount(totalUnread);
    }
  }, [guestChats]);

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
    // Invalidate tweet caches when new tweets arrive
    queryClient.invalidateQueries({ queryKey: queryKeys.tweets.all() });
    if (user) {
      queryClient.invalidateQueries({ queryKey: queryKeys.tweets.user('guest', user.id) });
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
        markNotificationsReadMutation.mutate({ userType: 'guest', userId: user.id });
      }
    }
    
    // Update prevTab ref
    prevTab.current = activeBottomTab;
  }, [activeBottomTab, user]);

  // React Query mutation for marking notifications as read
  const markNotificationsReadMutation = useMarkNotificationsRead();

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
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-primary to-secondary">
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
          <div className="p-0">
            <h2 className="text-lg font-bold mb-2">ユーザー満足度の高いキャスト一覧</h2>
            <p className="text-sm text-white/80 mb-4">検索・並び替えで目的のキャストを見つけましょう。</p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={satisfactionSearch}
                onChange={(e) => setSatisfactionSearch(e.target.value)}
                placeholder="名前で検索"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary text-primary"
              />
              <select
                value={satisfactionSort}
                onChange={(e) => setSatisfactionSort(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-primary"
              >
                <option value="rating">評価が高い順</option>
                <option value="feedback">レビュー数が多い順</option>
                <option value="price">料金が安い順</option>
                <option value="name">名前順</option>
              </select>
            </div>

            {satisfactionLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredAndSortedSatisfactionCasts.length === 0 ? (
              <div className="text-center text-white/80 py-6">該当するキャストが見つかりませんでした。</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredAndSortedSatisfactionCasts.map((cast: any) => (
                  <div key={cast.id} className="bg-primary rounded-lg shadow p-3 border border-secondary cursor-pointer relative">
                    <img
                      src={cast.avatar ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/${cast.avatar}` : '/assets/avatar/female.png'}
                      alt={cast.nickname}
                      onClick={()=>navigate(`/cast/${cast.id}`)}  
                      className="w-full h-32 object-cover rounded-lg border border-secondary mb-2"
                    />
                    <div className="font-medium text-white text-sm truncate">{cast.nickname}</div>
                    <div className="text-xs text-white mt-1">{(cast.average_rating || 0).toFixed(1)} ★ / {cast.feedback_count || 0}件</div>
                    <div className="text-xs text-white mt-1">{formatPoints(cast.grade_points)}/30分</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
      {modalType === 'ranking' && (
        <Modal onClose={() => setModalType(null)}>
          <div className="p-0">
            <h2 className="text-lg font-bold mb-2">ランキング</h2>
            <p className="text-sm text-white/80 mb-4">期間とカテゴリを選択して表示します。</p>

            {rankingLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />)
                )}
              </div>
            ) : allRankings.length === 0 ? (
              <div className="text-center text-white/80 py-6">ランキングはまだありません。</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {allRankings.map((profile: any, index: number) => (
                  <div key={profile.id} className="bg-primary rounded-lg shadow p-3 border border-secondary cursor-pointer relative">
                    <img
                      src={profile.avatar ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/${profile.avatar}` : '/assets/avatar/female.png'}
                      alt={profile.name}
                      onClick={()=>navigate(`/cast/${profile.id}`)}  
                      className="w-full h-32 object-cover rounded-lg border border-secondary mb-2"
                    />
                    <div className="font-medium text-white text-sm truncate">{profile.name}</div>
                    <div className="text-xs text-white mt-1">{profile.points}ポイント {profile.gift_count && `(${profile.gift_count}件)`}</div>
                    <div className="absolute top-2 left-2 bg-secondary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">{index + 1}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard; 