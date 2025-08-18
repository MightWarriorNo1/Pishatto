/*eslint-disable */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { applyReservation, startReservation, stopReservation, getAllCastApplications } from '../../services/api';
import { ChatRefreshProvider, useChatRefresh } from '../../contexts/ChatRefreshContext';
import { useTweets, useUnreadMessageCount, useNotifications } from '../../hooks/useRealtime';
import echo from '../../services/echo';
import { getCastProfileById } from '../../services/api';
import { useCast } from '../../contexts/CastContext';
import Spinner from '../../components/ui/Spinner';
import { useCastData } from '../../hooks/useCastData';
import { useCastReservations, useCastApplications, useApplyReservation, useStartReservation, useStopReservation } from '../../hooks/useQueries';

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
                    <span className="text-xs text-black ml-1">/1時間</span>
                </div>
                <div className="text-xs text-white mb-2">{call.extra}</div>
                {/* <div className="mb-4">
                    <label className="flex items-center text-sm font-medium text-white mb-1">
                        <span className="mr-2">
                            <MessageCircle /></span> コメント（任意）
                    </label>
                    <textarea
                        className="w-full border border-white rounded-lg p-2 text-sm text-white bg-primary resize-none"
                        rows={2}
                        placeholder="例）当選後10分で到着できます！or 5分くらい遅れます。（自由記述）"
                    />
                </div> */}
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
    const [showApplicationComplete, setShowApplicationComplete] = useState(false);
    const [tweetBadgeCount, setTweetBadgeCount] = useState(0);
    const [messageBadgeCount, setMessageBadgeCount] = useState(0);
    const prevMainPage = React.useRef(mainPage);
    const [showTimerModal, setShowTimerModal] = useState(false);
    const [timerCall, setTimerCall] = useState<any>(null);
    const [exitedInfo, setExitedInfo] = useState<{ ended: Date; exceeded?: number } | null>(null);
    const [latestNotification, setLatestNotification] = useState<any>(null);
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [currentReservationId, setCurrentReservationId] = useState<number | null>(null);
    const [isMessageDetailOpen, setIsMessageDetailOpen] = useState(false);
    const [showConcierge, setShowConcierge] = useState(false);

    const { cast, castId, loading: castLoading } = useCast();
    const navigate = useNavigate();
    const location = useLocation();

    // Use React Query hooks for data fetching
    const {
        chats,
        notifications,
        isLoading: castDataLoading,
        error: castDataError
    } = useCastData(castId || 0);

    const {
        data: reservations = [],
        isLoading: reservationsLoading,
        error: reservationsError
    } = useCastReservations(castId || 0);

    const {
        data: reservationApplications = [],
        isLoading: applicationsLoading,
        error: applicationsError
    } = useCastApplications(castId || 0);

    // Use mutation hooks
    const applyReservationMutation = useApplyReservation();
    const startReservationMutation = useStartReservation();
    const stopReservationMutation = useStopReservation();

    // Combined loading state
    const loading = castDataLoading || reservationsLoading || applicationsLoading;

    // Redirect unauthenticated casts to the first page
    useEffect(() => {
        if (!castLoading && !cast) {
            navigate('/cast/login');
        }
    }, [castLoading, cast, navigate]);

    // If navigated with an openChatId, switch to Message page and open that chat
    useEffect(() => {
        const state = location.state as any;
        if (state && state.openChatId) {
            setMainPage(2);
            const event = new CustomEvent('open-cast-chat', { detail: { chatId: state.openChatId } });
            window.dispatchEvent(event);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    // Fetch cast profile to get category
    useEffect(() => {
        if (castId && !cast) {
            getCastProfileById(castId)
                .then(castData => {
                    // Cast data will be handled by the context
                })
                .catch(error => {
                    console.error('Failed to fetch cast profile:', error);
                });
        }
    }, [castId, cast]);

    useUnreadMessageCount(castId || 0, 'cast', (count) => {
        if (mainPage !== 2) { // Not on message page
            if (count === 0) {
                setMessageBadgeCount(0);
            } else {
                setMessageBadgeCount((prev) => prev + count);
            }
        }
    });

    useNotifications(castId || 0, (notification) => {
        if (notification.type === 'message' && mainPage !== 2) {
            setMessageBadgeCount((c) => c + 1);
        }
        setLatestNotification(notification);
        setShowNotificationPopup(true);
    });

    useTweets((tweet) => {
      if (mainPage !== 3) {
        setTweetBadgeCount((c) => c + 1);
      }
    });

    useEffect(() => {
      if (mainPage === 3 && prevMainPage.current !== 3) {
        setTweetBadgeCount(0);
      }
      if (mainPage === 2 && prevMainPage.current !== 2) {
        setMessageBadgeCount(0);
      }
      prevMainPage.current = mainPage;
    }, [mainPage]);

    // Update message badge count when chats change
    useEffect(() => {
        if (chats && chats.length > 0) {
            const unreadCount = chats.reduce((acc: number, chat: any) => acc + (chat.unread || 0), 0);
            setMessageBadgeCount(unreadCount);
        }
    }, [chats]);

    React.useEffect(() => {
        const channels = reservations
            .filter((r: any) => r.id)
            .map((r: any) => {
            const channel = echo.channel(`reservation.${r.id}`);
            const handler = (e: any) => {
                // React Query will handle the update automatically
                // No need to manually update state
            };
            channel.listen("ReservationUpdated", handler);
            return { channel, handler };
            });

        return () => {
            channels.forEach(({ channel, handler }: { channel: any; handler: any }) => {
            channel.stopListening("ReservationUpdated", handler);
            });
        };
    }, [reservations.map((r: any) => r.id).join(",")]);

    const isReservationInChat = (reservationId: number | undefined) => {
        if (typeof reservationId !== 'number' || !castId) return false;
        return chats.some((chat: any) => chat.reservation_id === reservationId && chat.cast_id === castId);
    };

    const isReservationApplied = (reservationId: number | undefined) => {
        if (typeof reservationId !== 'number') return false;
        return reservationApplications.some((app: any) => app.reservation_id === reservationId && app.status === 'pending');
    };

    const isReservationApproved = (reservationId: number | undefined) => {
        if (typeof reservationId !== 'number') return false;
        return reservationApplications.some((app: any) => app.reservation_id === reservationId && app.status === 'approved');
    };

    const getReservationApplicationStatus = (reservationId: number | undefined) => {
        if (typeof reservationId !== 'number') return null;
        const application = reservationApplications.find((app: any) => app.reservation_id === reservationId);
        return application ? application.status : null;
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
        isApplied?: boolean;
        isApproved?: boolean;
        isInProgress?: boolean;
        isCompleted?: boolean;
        statusText?: string;
    };

    const parseLocalDateTime = (dateTimeString: string): Date => {
        if (!dateTimeString || typeof dateTimeString !== 'string') return new Date();
        
        // Split the date and time parts
        const parts = dateTimeString.split(' ');
        if (parts.length < 2) return new Date();
        
        const [datePart, timePart] = parts;
        if (!datePart || !timePart) return new Date();
        
        const dateComponents = datePart.split('-');
        const timeComponents = timePart.split(':');
        
        if (dateComponents.length < 3 || timeComponents.length < 3) return new Date();
        
        const [year, month, day] = dateComponents.map(Number);
        const [hour, minute, second] = timeComponents.map(Number);
        
        // Validate that all components are valid numbers
        if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second)) {
            return new Date();
        }
        
        // Create date in local time (month is 0-based in JS)
        return new Date(year, month - 1, day, hour, minute, second);
    };

    const calls: CallWithActive[] = reservations
        .filter((r: any) => {
            // Only show free type reservations
            if (r.type !== 'free') {
                return false;
            }
            // Only show reservations that are not in chat and not applied
            return true;
        })
        .map((r: any) => {
            const alreadyInChat = isReservationInChat(r.id); // Only disable if THIS cast has applied
            const isApplied = isReservationApplied(r.id); // Check if cast has applied (pending)
            const isApproved = isReservationApproved(r.id); // Check if cast has been approved
            const applicationStatus = getReservationApplicationStatus(r.id);
            
            const hasStarted = r.started_at && r.started_at !== null && r.started_at !== '';
            const hasEnded = r.ended_at && r.ended_at !== null && r.ended_at !== '';
            const isInProgress = Boolean(hasStarted && !hasEnded);
            const isCompleted = Boolean(hasStarted && hasEnded);
            
            // Also consider reservations past their scheduled end time as completed
            const now = new Date();
            const scheduledEnd = r.scheduled_at && r.duration ? 
                new Date(new Date(r.scheduled_at).getTime() + r.duration * 60 * 60 * 1000) : null;
            const isPastScheduledEnd = Boolean(scheduledEnd && now > scheduledEnd);
            const isActuallyCompleted = Boolean(isCompleted || isPastScheduledEnd);
            const inactive = (r as any).active === false || isApplied || isApproved || isInProgress || isActuallyCompleted;
            
            // Determine status text
            let statusText = '';
            if (isApproved) {
                statusText = '承認済み';
            } else if (isApplied) {
                statusText = '承認を待つ';
            } else if (isInProgress) {
                statusText = '進行中';
            } else if (isActuallyCompleted) {
                statusText = '終了';
            }
            
            return {
                ...r,
                title: r.location || '未設定',
                time: r.scheduled_at ? parseLocalDateTime(r.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '〜' : '',
                typeLabel: r.type === 'pishatto' ? 'プレミアム' : 'スタンダード',
                people: r.details
                    ? (r.details.match(/(\d+)人/g)?.map((s: any) => Number(s.replace('人', ''))).reduce((a: any, b: any) => a + b, 0) || 1)
                    : 1,
                points:  r.duration ? `${r.duration * 60 / 30 * (cast?.category === 'VIP' ? 12000 : cast?.category === 'ロイヤルVIP' ? 15000 : 9000)}P〜` : '0P〜',
                extra: '',
                active: !inactive,
                statusText,
                isInProgress,
                isActuallyCompleted
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
        tabFilteredCalls = sortedCalls.filter(call => isReservationInChat(call.id) || isReservationApplied(call.id));
    }

    const handleApply = async (call: any) => {
        if (!castId || !call.id) return;
        
        try {
            await applyReservationMutation.mutateAsync({ 
                reservationId: call.id, 
                castId: castId 
            });
            setShowApplicationComplete(true);
            // React Query will automatically refetch data
        } catch (error) {
            console.error('Failed to apply for reservation:', error);
            alert('応募に失敗しました');
        }
    };

    const handleStartReservation = async (reservationId: number) => {
        if (!castId) return;
        
        try {
            await startReservationMutation.mutateAsync({ 
                reservationId, 
                castId 
            });
            // React Query will automatically refetch data
        } catch (error) {
            console.error('Failed to start reservation:', error);
            alert('予約の開始に失敗しました');
        }
    };

    const handleStopReservation = async (reservationId: number) => {
        if (!castId) return;
        
        try {
            await stopReservationMutation.mutateAsync({ 
                reservationId, 
                castId 
            });
            // React Query will automatically refetch data
        } catch (error) {
            console.error('Failed to stop reservation:', error);
            alert('予約の停止に失敗しました');
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center">
            <div className="w-full max-w-md mx-auto flex flex-col flex-1 min-h-screen bg-gradient-to-b from-primary via-primary to-secondary">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Spinner />
                    </div>
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
                                <div className="flex-1 bg-gradient-to-b from-primary via-primary to-secondary border-t border-secondary pb-24">
                                    <div className="grid grid-cols-2 gap-2 p-2">
                                        {tabFilteredCalls.map((call, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => !call.closed && call.active !== false && !call.isApplied && !call.isApproved && !call.isInProgress && !call.isCompleted && setSelectedCall(call)}
                                                className={
                                                    call.closed || call.active === false || call.isApplied || call.isApproved || call.isInProgress || call.isCompleted
                                                        ?  'opacity-50 cursor-not-allowed'
                                                        : 'cursor-pointer'
                                                }
                                            >
                                                <CallCard
                                                    {...call}
                                                    location={call.location || ''}
                                                    duration={call.duration || 0}
                                                    points={call.points || '0'}
                                                    type={call.type || ''}
                                                    greyedOut={call.closed || call.active === false || call.isApplied || call.isApproved || call.isInProgress || call.isCompleted}
                                                    started_at={call.started_at}
                                                    ended_at={call.ended_at}
                                                    points_earned={call.points_earned}
                                                    isOwnReservation={castId ? call.cast_id === castId : false}
                                                    statusText={call.statusText}
                                                    onStart={castId && call.cast_id === castId && !call.started_at && typeof call.id === 'number' ? async () => {
                                                        const updated = await startReservationMutation.mutateAsync({ 
                                                            reservationId: call.id as number, 
                                                            castId: castId 
                                                        });
                                                        // React Query will handle the update automatically
                                                    } : undefined}
                                                    onStop={castId && call.cast_id === castId && call.started_at && !call.ended_at && typeof call.id === 'number' ? async () => {
                                                        const updated = await stopReservationMutation.mutateAsync({ 
                                                            reservationId: call.id as number, 
                                                            castId: castId 
                                                        });
                                                        // React Query will handle the update automatically
                                                    } : undefined}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                        {mainPage === 1 && <CastSearchPage />}
                        {mainPage === 2 && <MessagePage setIsMessageDetailOpen={setIsMessageDetailOpen} onConciergeStateChange={setShowConcierge} />}
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
                            // Apply for reservation (pending admin approval)
                            if (!castId) {
                                alert('キャストIDが見つかりません');
                                return;
                            }
                            try {
                                await applyReservationMutation.mutateAsync({ 
                                    reservationId: selectedCall.id, 
                                    castId: castId 
                                });
                                // Don't set reservation as inactive - allow multiple casts to apply
                                setSelectedCall(null);
                                setShowApplicationComplete(true);
                                
                                // Refresh reservation applications
                                // React Query will handle the update automatically
                                
                                // Refresh ranking after successful application
                                fetchRanking({
                                    userType: 'cast',
                                    timePeriod: 'current',
                                    category: 'reservation',
                                    area: '全国'
                                });
                            } catch (e) {
                                alert('応募に失敗しました');
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
                            // React Query will handle the update automatically
                        }}
                    />
                )}
            </div>
            {/* Bottom Navigation Bar - fixed and centered */}
            {(!isMessageDetailOpen && !showConcierge) && (  
                <div className="w-full max-w-md fixed bottom-0 left-1/2 -translate-x-1/2 z-20">
                    <BottomNavigationBar selected={mainPage} onTabChange={setMainPage} messageBadgeCount={messageBadgeCount} tweetBadgeCount={tweetBadgeCount} />
                </div>
            )}
            {/* Notification popup */}
            {showNotificationPopup && latestNotification && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-secondary text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in">
                    <div className="font-bold mb-1">新着通知</div>
                    <div>{latestNotification.message}</div>
                    <button className="mt-2 text-xs underline" onClick={() => {
                        setShowNotificationPopup(false)
                    }}>閉じる</button>
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