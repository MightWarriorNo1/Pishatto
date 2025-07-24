import React, { useState, useEffect } from 'react';
import { Clock3, UserRound, MessageCircle } from 'lucide-react';
import TopNavigationBar from '../../components/cast/dashboard/TopNavigationBar';
import TabBar from '../../components/cast/dashboard/TabBar';
import FilterBar from '../../components/cast/dashboard/FilterBar';
import CallCard from '../../components/cast/dashboard/CallCard';
import BottomNavigationBar from '../../components/cast/dashboard/BottomNavigationBar';
import FloatingActionButton from '../../components/cast/dashboard/FloatingActionButton';
import CastSearchPage from './CastSearchPage';
import CastTimelinePage from './CastTimelinePage';
import CastProfilePage from './CastProfilePage';
import MessagePage from '../../components/cast/dashboard/MessagePage';
import { Reservation, getAllReservations, getAllChats } from '../../services/api';
import { applyReservation } from '../../services/api';
import { ChatRefreshProvider, useChatRefresh } from '../../contexts/ChatRefreshContext';
import { useTweets } from '../../hooks/useRealtime';

// Modal component for call details (unchanged)
const CallDetailModal = ({ call, onClose, onApply }: { call: any, onClose: () => void, onApply: () => void }) => {
    if (!call) return null;
    // Calculate people from details string
    const people = call.details
        ? (call.details.match(/(\d+)人/g)?.map((s: string) => Number(s.replace('人', ''))).reduce((a: number, b: number) => a + b, 0) || 1)
        : 1;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-300 bg-opacity-40">
            <div className="bg-primary rounded-2xl shadow-xl max-w-md w-full mx-2 p-6 relative animate-fadeIn">
                <button onClick={onClose} className="absolute top-3 right-3 text-black text-xl font-bold">×</button>
                <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mr-3 border border-black">
                        <span className="text-3xl">🎩</span>
                    </div>
                    <span className="text-base font-medium text-white">匿名様</span>
                </div>
                <div className="text-lg font-bold text-white mb-2">{call.time} {call.title}</div>
                <div className="flex items-center text-sm text-white mb-2">
                    <span className="flex items-center mr-4">
                        <Clock3 />{call.duration || 1}時間</span>
                    <span className="flex items-center mr-4"><UserRound /> {people}名</span>
                    <span className="flex items-center mr-4">{call.type}</span>
                </div>
                <div className="text-xs text-white mb-2">場所: {call.location || '未設定'}</div>
                <div className="text-xs text-white mb-2">詳細: {call.details || '-'}</div>
                <div className="text-xs text-black mb-1">獲得予定ポイント</div>
                <div className="flex items-center mb-1">
                    <span className="text-2xl font-bold text-white mr-2">{call.points}</span>
                    <span className="bg-red-100 text-black text-xs px-2 py-0.5 rounded font-bold mr-2">延長時</span>
                    <span className="text-white font-bold text-lg">+ 10,850P</span>
                    <span className="text-xs text-black ml-1">/1時間</span>
                </div>
                <div className="text-xs text-white mb-2">{call.extra}</div>
                <div className="mb-4">
                    <label className="flex items-center text-sm font-medium text-black mb-1">
                        <span className="mr-2">
                            <MessageCircle /></span> コメント（任意）
                    </label>
                    <textarea
                        className="w-full border border-black rounded-lg p-2 text-sm text-black bg-primary resize-none"
                        rows={2}
                        placeholder="例）当選後10分で到着できます！or 5分くらい遅れます。（自由記述）"
                    />
                </div>
                <button
                    className={`w-full py-3 rounded-lg bg-secondary text-white font-bold text-base mb-2 ${call.active === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={call.active === false ? undefined : onApply}
                    disabled={call.active === false}
                >
                    応募する
                </button>
                <button onClick={onClose} className="w-full py-2 text-black bg-gray-400 font-medium text-base">閉じる</button>
            </div>
        </div>
    );
};

// Application completion modal
const ApplicationCompletionModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-300 bg-opacity-40">
        <div className="bg-primary rounded-2xl shadow-xl max-w-md w-full mx-2 p-6 relative animate-fadeIn flex flex-col items-center">
            <span className="text-3xl mb-4">🎉</span>
            <div className="text-lg font-bold text-white mb-2">応募が完了しました！</div>
            <div className="text-sm text-white mb-4">運営がマッチングを行います。<br/>マッチング後、メッセージ画面にグループが作成されます。</div>
            <button onClick={onClose} className="w-full py-3 rounded-lg bg-secondary text-white font-bold text-base mb-2">閉じる</button>
        </div>
    </div>
);

const areaOptions = ['全国', '東京', '大阪', '名古屋', '福岡', '北海道'];
const sortOptions = ['新しい順', '古い順', '人気順', 'おすすめ順'];

const CastDashboardInner: React.FC = () => {
    const [selectedCall, setSelectedCall] = useState<any | null>(null);
    const [mainPage, setMainPage] = useState(0); // 0: Home, 1: Search, 2: Message, 3: Timeline, 4: Profile
    const [selectedTab, setSelectedTab] = useState(0); // 0: All, 1: Today, 2: Future, 3: Joined (for TabBar)
    const [selectedArea, setSelectedArea] = useState<string>(areaOptions[0]);
    const [selectedSort, setSelectedSort] = useState<string>(sortOptions[0]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showApplicationComplete, setShowApplicationComplete] = useState(false);
    const [chats, setChats] = useState<any[]>([]);
    const { refreshChats } = useChatRefresh();
    const [tweetBadgeCount, setTweetBadgeCount] = useState(0);
    const prevMainPage = React.useRef(mainPage);

    useTweets((tweet) => {
      // Only increment if not on timeline page (mainPage !== 3)
      if (mainPage !== 3) {
        setTweetBadgeCount((c) => c + 1);
      }
    });

    useEffect(() => {
      // Clear tweetBadgeCount when switching to timeline page
      if (mainPage === 3 && prevMainPage.current !== 3) {
        setTweetBadgeCount(0);
      }
      prevMainPage.current = mainPage;
    }, [mainPage]);

    // Get castId from localStorage
    const castId = Number(localStorage.getItem('castId'));

    useEffect(() => {
        setLoading(true);

        const fetchReservations = () => {
            getAllReservations()
                .then((reservations) => {
                    setReservations(reservations || []);
                })
                .finally(() => setLoading(false));
        };
        fetchReservations();

        // Poll every 5 seconds
        const interval = setInterval(fetchReservations, 5000);

        // Fetch all chats using API function (once)
        getAllChats()
            .then(chats => setChats(chats || []));

        return () => clearInterval(interval);
    }, []);

    // Helper: check if reservation is already in chat for this cast
    const isReservationInChat = (reservationId: number | undefined) => {
        if (typeof reservationId !== 'number') return false;
        return chats.some(chat => chat.reservation_id === reservationId && chat.cast_id === castId);
    };

    // Define a type for the mapped call object
    type CallWithActive = Reservation & {
        title: string;
        time: string;
        typeLabel: string;
        people: number;
        points: string;
        extra: string;
        closed: boolean;
        active: boolean;
    };

    const calls: CallWithActive[] = reservations.map((r) => {
        const alreadyInChat = isReservationInChat(r.id); // Only disable if THIS cast has applied
        const inactive = (r as any).active === false || alreadyInChat;
        return {
            ...r,
            title: r.location || '未設定',
            time: r.scheduled_at ? new Date(r.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '〜' : '',
            typeLabel: r.type === 'pishatto' ? 'プレミアム' : 'スタンダード',
            people: r.details
                ? (r.details.match(/(\d+)人/g)?.map(s => Number(s.replace('人', ''))).reduce((a, b) => a + b, 0) || 1)
                : 1,
            points: r.duration ? `${r.duration*60/30 * 4750}P〜` : '0P〜',
            extra: '',
            closed: false,
            active: !inactive,
        };
    });

    // Filtering by area
    const filteredByArea: CallWithActive[] = selectedArea === '全国'
        ? calls
        : calls.filter(call => call.title.includes(selectedArea));

    // Sorting
    let sortedCalls: CallWithActive[] = [...filteredByArea];
    if (selectedSort === '新しい順') {
        sortedCalls = sortedCalls.slice().reverse();
    } else if (selectedSort === '古い順') {
        // As is
    } else if (selectedSort === '人気順') {
        sortedCalls = sortedCalls.slice().sort((a, b) => b.people - a.people);
    } else if (selectedSort === 'おすすめ順') {
        sortedCalls = sortedCalls.slice().sort((a, b) => {
            const getPoints = (call: CallWithActive) => parseInt((call.points || '0').replace(/[^\d]/g, ''));
            return getPoints(b) - getPoints(a);
        });
    }

    // TabBar filtering
    const now = new Date();
    const isToday = (dateStr: string | undefined) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();
    };
    const isFuture = (dateStr: string | undefined) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        // Tomorrow or later
        const tomorrow = new Date(now);
        tomorrow.setHours(0,0,0,0);
        tomorrow.setDate(now.getDate() + 1);
        return date >= tomorrow;
    };

    let tabFilteredCalls: CallWithActive[] = sortedCalls;
    if (selectedTab === 1) {
        tabFilteredCalls = sortedCalls.filter(call => isToday(call.scheduled_at));
    } else if (selectedTab === 2) {
        tabFilteredCalls = sortedCalls.filter(call => isFuture(call.scheduled_at));
    } else if (selectedTab === 3) {
        tabFilteredCalls = sortedCalls.filter(call => isReservationInChat(call.id));
    }

    // Calculate unread message count for badge
    const unreadCount = chats.reduce((acc, chat) => acc + (chat.unread ? 1 : 0), 0);

    

    return (
        <div className="min-h-screen bg-white flex flex-col items-center">
            <div className="w-full max-w-md flex flex-col flex-1 min-h-screen pb-20">
                {loading ? (
                    <div className="flex justify-center items-center h-40 text-lg">ローディング...</div>
                ) : (
                    <>
                        {/* Top Navigation Bar: Only show on Home */}
                        {mainPage === 0 && <TopNavigationBar />}
                        {/* Only show TabBar, FilterBar, and CallCards on Home */}
                        {mainPage === 0 && (
                            <>
                                <TabBar selected={selectedTab} onTabChange={setSelectedTab} />
                                <FilterBar
                                    selectedArea={selectedArea}
                                    selectedSort={selectedSort}
                                    onAreaChange={setSelectedArea}
                                    onSortChange={setSelectedSort}
                                    totalCount={tabFilteredCalls.length}
                                />
                                <div className="flex-1 grid grid-cols-2 gap-2 p-2 bg-primary">
                                    {tabFilteredCalls.map((call, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => !call.closed && call.active !== false && setSelectedCall(call)}
                                            className={
                                                call.closed || call.active === false
                                                    ?  'opacity-50 cursor-not-allowed'
                                                    : 'cursor-pointer'
                                            }
                                        >
                                            <CallCard {...call} location={call.location || ''} duration={call.duration || 0} type={call.type || ''} 
                                            greyedOut={call.closed || call.active === false}/>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {mainPage === 1 && <CastSearchPage />}
                        {mainPage === 2 && <MessagePage />}
                        {mainPage === 3 && <CastTimelinePage />}
                        {mainPage === 4 && <CastProfilePage />}
                    </>
                )}
                {/* Floating Action Button - only on Home */}
                {mainPage === 0 && (
                    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30 pointer-events-none">
                        <div className="flex justify-end w-full pointer-events-auto pr-4">
                            <FloatingActionButton />
                        </div>
                    </div>
                )}
                {/* Call Detail Modal */}
                {selectedCall && !showApplicationComplete && (
                    <CallDetailModal
                        call={selectedCall}
                        onClose={() => setSelectedCall(null)}
                        onApply={async () => {
                            // Immediately match reservation and create group
                            try {
                                await applyReservation(selectedCall.id, castId);
                                // Refresh chats so the disabled state updates immediately
                                refreshChats();
                                const updatedChats = await getAllChats();
                                setChats(updatedChats || []);
                                // Update the reservation's active status in local state
                                setReservations(prev => prev.map(r => r.id === selectedCall.id ? { ...r, active: false } : r));
                                setSelectedCall((call: any) => call ? { ...call, active: false } : call);
                            } catch (e) {
                                alert('マッチングに失敗しました');
                            }
                            setShowApplicationComplete(true);
                        }}
                    />
                )}
                {showApplicationComplete && (
                    <ApplicationCompletionModal onClose={() => {
                        setShowApplicationComplete(false);
                        setSelectedCall(null);
                    }} />
                )}
            </div>
            {/* Bottom Navigation Bar - fixed and centered */}
            <div className="w-full max-w-md fixed bottom-0 left-1/2 -translate-x-1/2 z-20">
                <BottomNavigationBar selected={mainPage} onTabChange={setMainPage} messageBadgeCount={unreadCount} tweetBadgeCount={tweetBadgeCount} />
            </div>
        </div>
    );
};

const CastDashboard: React.FC = () => (
  <ChatRefreshProvider>
    <CastDashboardInner />
  </ChatRefreshProvider>
);

export default CastDashboard; 