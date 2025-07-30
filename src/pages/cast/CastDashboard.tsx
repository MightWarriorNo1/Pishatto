/*eslint-disable */
import React, { useState, useEffect } from 'react';
import { Clock3, UserRound, MessageCircle } from 'lucide-react';
import TopNavigationBar from '../../components/cast/dashboard/TopNavigationBar';
import TabBar from '../../components/cast/dashboard/TabBar';
import FilterBar from '../../components/cast/dashboard/FilterBar';
import CallCard from '../../components/cast/dashboard/CallCard';
import BottomNavigationBar from '../../components/cast/dashboard/BottomNavigationBar';
// import FloatingActionButton from '../../components/cast/dashboard/FloatingActionButton';
import CastSearchPage from './CastSearchPage';
import CastTimelinePage from './CastTimelinePage';
import CastProfilePage from './CastProfilePage';
import MessagePage from '../../components/cast/dashboard/MessagePage';
import FeedbackForm from '../../components/feedback/FeedbackForm';
import { Reservation, getAllReservations, getAllChats, fetchRanking } from '../../services/api';
import { applyReservation, startReservation, stopReservation } from '../../services/api';
import { ChatRefreshProvider, useChatRefresh } from '../../contexts/ChatRefreshContext';
import { useTweets } from '../../hooks/useRealtime';
import echo from '../../services/echo';

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

// --- ReservationTimer (guest style, inline for now) ---
// const ReservationTimer: React.FC<{ started_at?: string; ended_at?: string; scheduled_at?: string; duration?: number; }> = ({ started_at, ended_at, scheduled_at, duration }) => {
//     const [currentTime, setCurrentTime] = React.useState<Date>(new Date());
//     React.useEffect(() => {
//         // Stop timer if both started_at and ended_at are present
//         if (started_at && ended_at) return;
        
//         const interval = setInterval(() => {
//             setCurrentTime(new Date());
//         }, 1000);
//         return () => clearInterval(interval);
//     }, [started_at, ended_at]);
//     const scheduled = scheduled_at ? new Date(scheduled_at) : undefined;
//     const plannedEnd = (scheduled && duration) ? new Date(scheduled.getTime() + duration * 60 * 60 * 1000) : undefined;
//     const started = started_at ? new Date(started_at) : undefined;
//     const ended = ended_at ? new Date(ended_at) : undefined;
//     const now = currentTime;
//     let state: 'before' | 'during' | 'after' = 'before';
    
//     // If both started_at and ended_at are present, the reservation is finished
//     if (started && ended) {
//         state = 'after';
//     } else if (started && !ended) {
//         // Reservation is in progress
//         if (now >= started) state = 'during';
//     } else if (plannedEnd && now > plannedEnd && !ended) {
//         // Past planned end time but not ended
//         state = 'during';
//     }
//     const format = (d: Date) => d.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
//     const diff = (a: Date, b: Date) => {
//         let ms = Math.abs(a.getTime() - b.getTime());
//         let h = Math.floor(ms / 3600000);
//         let m = Math.floor((ms % 3600000) / 60000);
//         let s = Math.floor((ms % 60000) / 1000);
//         return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
//     };
//     return (
//         <div className="text-primary text-lg mt-2 space-y-1">
//             {state === 'before' && scheduled && plannedEnd && (
//                 <>
//                     <div><b>現在時刻:</b> {format(now)}</div>
//                     <div><b>予約開始:</b> {format(scheduled)}</div>
//                     <div><b>予約終了:</b> {format(plannedEnd)}</div>
//                     <div className="font-mono text-blue-600">開始まで: {diff(scheduled, now)}</div>
//                 </>
//             )}
//             {state === 'during' && scheduled && plannedEnd && (
//                 <>
//                     <div><b>予約開始:</b> {format(scheduled)}</div>
//                     <div><b>予約終了:</b> {format(plannedEnd)}</div>
//                     <div><b>現在時刻:</b> {format(now)}</div>
//                     <div className="font-mono text-green-600">経過: {diff(now, scheduled)}</div>
//                 </>
//             )}
//             {state === 'after' && scheduled && plannedEnd && (
//                 <>
//                     <div><b>予約開始:</b> {format(scheduled)}</div>
//                     <div><b>予約終了:</b> {format(plannedEnd)}</div>
//                     {ended && <div><b>終了時刻:</b> {format(ended)}</div>}
//                 </>
//             )}
//         </div>
//     );
// };

const ReservationTimerModal: React.FC<{
    timerCall: any;
    exitedInfo: { ended: Date; exceeded?: number } | null;
    onExit: (end: Date, exceeded?: number) => void;
    onClose: () => void;
}> = ({ timerCall, exitedInfo, onExit, onClose }) => {
    const [currentTime, setCurrentTime] = React.useState<Date>(new Date());
    React.useEffect(() => {
        // Stop timer if both started_at and ended_at are present or if exitedInfo exists
        if (exitedInfo || (timerCall.started_at && timerCall.ended_at)) {
            return;
        }
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, [exitedInfo, timerCall.started_at, timerCall.ended_at]);
    const started = timerCall.started_at ? new Date(timerCall.started_at) : undefined;
    const scheduled = timerCall.scheduled_at ? new Date(timerCall.scheduled_at) : undefined;
    const plannedEnd = (scheduled && timerCall.duration) ? new Date(scheduled.getTime() + timerCall.duration * 60 * 60 * 1000) : undefined;
    // const ended = exitedInfo ? exitedInfo.ended : plannedEnd;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-300 bg-opacity-40">
            <div className="bg-primary rounded-2xl shadow-xl max-w-md w-full mx-2 p-6 relative animate-fadeIn flex flex-col items-center border-4 border-secondary">
                <button onClick={onClose} className="absolute top-3 right-3 text-white text-xl font-bold bg-secondary rounded-full w-8 h-8 flex items-center justify-center">×</button>
                <div className="text-lg font-bold text-white mb-2">予約タイマー</div>
                <div className="w-full text-center text-white space-y-2">
                    {started && <div><b>開始時刻:</b> {started.toLocaleString('ja-JP')}</div>}
                    {plannedEnd && <div><b>予定終了:</b> {plannedEnd.toLocaleString('ja-JP')}</div>}
                    {!exitedInfo && <div><b>現在時刻:</b> {currentTime.toLocaleString('ja-JP')}</div>}
                </div>
                {!exitedInfo && (
                    <button
                        className="mt-4 px-6 py-2 rounded-lg bg-secondary text-white font-bold text-base shadow hover:bg-secondary-dark transition"
                        onClick={() => {
                            const end = new Date();
                            let exceeded: number | undefined = undefined;
                            if (plannedEnd && end > plannedEnd) exceeded = end.getTime() - plannedEnd.getTime();
                            onExit(end, exceeded);
                        }}
                    >
                        終了する
                    </button>
                )}
                {exitedInfo && (
                    <div className="mt-4 w-full text-center">
                        <div className="text-white font-bold">終了時刻: {exitedInfo.ended.toLocaleString('ja-JP')}</div>
                        {exitedInfo.exceeded && (
                            <div className="text-red-200 font-bold">超過: {Math.floor(exitedInfo.exceeded/60000)}分{Math.floor((exitedInfo.exceeded%60000)/1000)}秒</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const areaOptions = ['全国', '東京都','大阪府','愛知県','福岡県','北海道'];
const sortOptions = ['新しい順', '古い順', '人気順', 'おすすめ順'];

const CastDashboardInner: React.FC = () => {
    const [selectedCall, setSelectedCall] = useState<any | null>(null);
    const [mainPage, setMainPage] = useState(0);
    const [selectedTab, setSelectedTab] = useState(0); 
    const [selectedArea, setSelectedArea] = useState<string>(areaOptions[0]);
    const [selectedSort, setSelectedSort] = useState<string>(sortOptions[0]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showApplicationComplete, setShowApplicationComplete] = useState(false);
    const [chats, setChats] = useState<any[]>([]);
    const { refreshChats } = useChatRefresh();
    const [tweetBadgeCount, setTweetBadgeCount] = useState(0);
    const prevMainPage = React.useRef(mainPage);
    const [showTimerModal, setShowTimerModal] = useState(false);
    const [timerCall, setTimerCall] = useState<any | null>(null);
    const [exitedInfo, setExitedInfo] = useState<{ ended: Date; exceeded?: number } | null>(null);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [currentReservationId, setCurrentReservationId] = useState<number | null>(null);
    const [isMessageDetailOpen, setIsMessageDetailOpen] = useState(false);

    useTweets((tweet) => {
      if (mainPage !== 3) {
        setTweetBadgeCount((c) => c + 1);
      }
    });

    useEffect(() => {
      if (mainPage === 3 && prevMainPage.current !== 3) {
        setTweetBadgeCount(0);
      }
      prevMainPage.current = mainPage;
    }, [mainPage]);

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

        const interval = setInterval(fetchReservations, 5000);

        getAllChats()
            .then(chats => setChats(chats || []));

        return () => clearInterval(interval);
    }, []);
    
    React.useEffect(() => {
  const channels = reservations
    .filter(r => r.id)
    .map(r => {
      const channel = echo.channel(`reservation.${r.id}`);
      const handler = (e: any) => {
        setReservations(prev =>
          prev.map(res => res.id === e.reservation.id ? { ...res, ...e.reservation } : res)
        );
      };
      channel.listen("ReservationUpdated", handler);
      return { channel, handler };
    });

  return () => {
    channels.forEach(({ channel, handler }) => {
      channel.stopListening("ReservationUpdated", handler);
    });
  };
}, [reservations.map(r => r.id).join(",")]);

    const castId = Number(localStorage.getItem('castId'));

    const isReservationInChat = (reservationId: number | undefined) => {
        if (typeof reservationId !== 'number') return false;
        return chats.some(chat => chat.reservation_id === reservationId && chat.cast_id === castId);
    };

    type CallWithActive = Reservation & {
        title: string;
        time: string;
        typeLabel: string;
        people: number;
        points: string;
        extra: string;
        closed: boolean;
        active: boolean;
        cast_id?: number; 
    };

    const calls: CallWithActive[] = reservations
  .filter((r) => {
    // Check if reservation has started (has started_at but no ended_at)
    const hasStarted = r.started_at && r.started_at !== null && r.started_at !== '';
    const hasEnded = r.ended_at && r.ended_at !== null && r.ended_at !== '';
    const isInProgress = hasStarted && !hasEnded;
    const isCompleted = hasStarted && hasEnded;
    const castApplied = isReservationInChat(r.id);
    
    // Hide reservations that have started or ended if cast hasn't applied
    if ((isInProgress || isCompleted) && !castApplied) {
      return false;
    }
    
    return true;
  })
  .map((r) => {
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

    const filteredByArea: CallWithActive[] = selectedArea === '全国'
        ? calls
        : calls.filter(call => call.title.includes(selectedArea));

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
                                <div className="flex-1 bg-primary border-t border-secondary">
                                    <div className="grid grid-cols-2 gap-2 p-2 bg-primary">
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
                                                <CallCard
                                                    {...call}
                                                    location={call.location || ''}
                                                    duration={call.duration || 0}
                                                    type={call.type || ''}
                                                    greyedOut={call.closed || call.active === false}
                                                    started_at={call.started_at}
                                                    ended_at={call.ended_at}
                                                    points_earned={call.points_earned}
                                                    isOwnReservation={call.cast_id === castId}
                                                    onStart={call.cast_id === castId && !call.started_at && typeof call.id === 'number' ? async () => {
                                                        const updated = await startReservation(call.id as number, castId);
                                                        setReservations(prev => prev.map(r => r.id === call.id ? { ...r, ...updated } : r));
                                                    } : undefined}
                                                    onStop={call.cast_id === castId && call.started_at && !call.ended_at && typeof call.id === 'number' ? async () => {
                                                        const updated = await stopReservation(call.id as number, castId);
                                                        setReservations(prev => prev.map(r => r.id === call.id ? { ...r, ...updated } : r));
                                                    } : undefined}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                        {mainPage === 1 && <CastSearchPage />}
                        {mainPage === 2 && <MessagePage setIsMessageDetailOpen={setIsMessageDetailOpen} />}
                        {mainPage === 3 && <CastTimelinePage />}
                        {mainPage === 4 && <CastProfilePage />}
                    </>
                )}
                {/* Floating Action Button - only on Home */}
                {/* {mainPage === 0 && (
                    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30 pointer-events-none">
                        <div className="flex justify-end w-full pointer-events-auto pr-4">
                            <FloatingActionButton  />
                        </div>
                    </div>
                )} */}
                {timerCall && showTimerModal && (
                    <ReservationTimerModal
                        timerCall={timerCall}
                        exitedInfo={exitedInfo}
                        onExit={(end, exceeded) => {
                            setExitedInfo({ ended: end, exceeded });
                            setCurrentReservationId(timerCall.id);
                            setShowFeedbackForm(true);
                            setShowTimerModal(false);
                        }}
                        onClose={() => { setShowTimerModal(false); setTimerCall(null); setExitedInfo(null); }}
                    />
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
                                // Update the reservation's active status in local state immediately
                                setReservations(prev => prev.map(r => r.id === selectedCall.id ? { ...r, active: false } : r));
                                setSelectedCall((call: any) => call ? { ...call, active: false } : call);
                                // Refresh chats so the disabled state updates immediately
                                refreshChats();
                                const updatedChats = await getAllChats();
                                setChats(updatedChats || []);
                                setShowApplicationComplete(true);
                                // Refresh ranking after successful application
                                fetchRanking({
                                    userType: 'cast',
                                    timePeriod: 'current',
                                    category: 'reservation',
                                    area: '全国'
                                });
                            } catch (e) {
                                alert('マッチングに失敗しました');
                            }
                        }}
                    />
                )}
                {showApplicationComplete && (
                    <ApplicationCompletionModal onClose={() => {
                        setShowApplicationComplete(false);
                        setSelectedCall(null);
                    }} />
                )}
                {showFeedbackForm && currentReservationId && (
                    <FeedbackForm
                        reservationId={currentReservationId}
                        onBack={() => {
                            setShowFeedbackForm(false);
                            setCurrentReservationId(null);
                            setExitedInfo(null);
                        }}
                        onSuccess={() => {
                            setShowFeedbackForm(false);
                            setCurrentReservationId(null);
                            setExitedInfo(null);
                            // Refresh reservations to show updated status
                            getAllReservations().then(setReservations);
                        }}
                    />
                )}
            </div>
            {/* Bottom Navigation Bar - fixed and centered */}
            {(!isMessageDetailOpen) && (
                <div className="w-full max-w-md fixed bottom-0 left-1/2 -translate-x-1/2 z-20">
                    <BottomNavigationBar selected={mainPage} onTabChange={setMainPage} messageBadgeCount={unreadCount} tweetBadgeCount={tweetBadgeCount} />
                </div>
            )}
        </div>
    );
};

const CastDashboard: React.FC = () => (
  <ChatRefreshProvider>
    <CastDashboardInner />
  </ChatRefreshProvider>
);

export default CastDashboard; 