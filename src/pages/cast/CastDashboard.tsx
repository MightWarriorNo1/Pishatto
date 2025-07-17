import React, { useState } from 'react';
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

const sampleCalls = [
    {
        title: '心斎橋・なんば (大阪)',
        time: '23:47〜',
        type: 'プレミアム',
        people: 2,
        points: '9,000P〜',
        extra: '深夜料金込み: +4,000P',
        closed: false,
    },
    {
        title: '恵比寿 (東京)',
        time: '23:55〜',
        type: 'プレミアム',
        people: 1,
        points: '12,900P〜',
        extra: '深夜料金込み: +4,000P',
        closed: false,
    },
    {
        title: '日本橋[1名フリー一覧] (東京)',
        time: '',
        type: 'プレミアム',
        people: 3,
        points: '13,000P〜',
        closed: true,
    },
    {
        title: '六本木 (東京)',
        time: '18:00〜',
        type: 'プレミアム',
        people: 13,
        points: '13,000P〜',
        closed: true,
    },
    // Additional mock data
    {
        title: '渋谷 (東京)',
        time: '20:30〜',
        type: 'スタンダード',
        people: 4,
        points: '7,500P〜',
        extra: '初回割引: -1,000P',
        closed: false,
    },
    {
        title: '新宿 (東京)',
        time: '21:15〜',
        type: 'プレミアム',
        people: 2,
        points: '10,000P〜',
        extra: '深夜料金込み: +3,000P',
        closed: false,
    },
    {
        title: '梅田 (大阪)',
        time: '19:00〜',
        type: 'スタンダード',
        people: 1,
        points: '6,000P〜',
        extra: 'リピーター特典: +500P',
        closed: false,
    },
    {
        title: '池袋 (東京)',
        time: '22:00〜',
        type: 'プレミアム',
        people: 5,
        points: '15,000P〜',
        extra: '深夜料金込み: +5,000P',
        closed: true,
    },
    {
        title: '天王寺 (大阪)',
        time: '17:30〜',
        type: 'スタンダード',
        people: 2,
        points: '8,000P〜',
        extra: '初回割引: -500P',
        closed: false,
    },
    {
        title: '銀座 (東京)',
        time: '16:00〜',
        type: 'プレミアム',
        people: 3,
        points: '14,000P〜',
        extra: '深夜料金込み: +2,000P',
        closed: true,
    },
];

// Modal component for call details (unchanged)
const CallDetailModal = ({ call, onClose }: { call: any, onClose: () => void }) => {
    if (!call) return null;
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
                        <Clock3 />1時間</span>
                    <span className="flex items-center mr-4"><UserRound /> {call.people}名</span>
                </div>
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
                <button className="w-full py-3 rounded-lg bg-secondary text-white font-bold text-base mb-2">応募する</button>
                <button onClick={onClose} className="w-full py-2 text-black bg-gray-400 font-medium text-base">閉じる</button>
            </div>
        </div>
    );
};

const areaOptions = ['全国', '東京', '大阪', '名古屋', '福岡', '北海道'];
const sortOptions = ['新しい順', '古い順', '人気順', 'おすすめ順'];

const CastDashboard: React.FC = () => {
    const [selectedCall, setSelectedCall] = useState<any | null>(null);
    const [selectedTab, setSelectedTab] = useState(0); // 0: Home, 1: Search, 2: Message, 3: Timeline, 4: MyPage
    const [selectedArea, setSelectedArea] = useState<string>(areaOptions[0]);
    const [selectedSort, setSelectedSort] = useState<string>(sortOptions[0]);

    // Filtering by area
    const filteredByArea = selectedArea === '全国'
        ? sampleCalls
        : sampleCalls.filter(call => call.title.includes(selectedArea));

    // Sorting
    let sortedCalls = [...filteredByArea];
    if (selectedSort === '新しい順') {
        // For mock: reverse order
        sortedCalls = sortedCalls.slice().reverse();
    } else if (selectedSort === '古い順') {
        // As is
    } else if (selectedSort === '人気順') {
        // For mock: sort by people descending
        sortedCalls = sortedCalls.slice().sort((a, b) => b.people - a.people);
    } else if (selectedSort === 'おすすめ順') {
        // For mock: sort by points descending (parse int from points string)
        sortedCalls = sortedCalls.slice().sort((a, b) => {
            const getPoints = (call: any) => parseInt((call.points || '0').replace(/[^\d]/g, ''));
            return getPoints(b) - getPoints(a);
        });
    }

    return (
        <div className="min-h-screen bg-white">
            {selectedTab === 0 && (
                <div className="max-w-md mx-auto pb-20">
                    {/* Top Navigation Bar */}
                    <TopNavigationBar />
                    {/* Tab Bar */}
                    <TabBar />
                    {/* Filter Bar */}
                    <FilterBar
                        selectedArea={selectedArea}
                        selectedSort={selectedSort}
                        onAreaChange={setSelectedArea}
                        onSortChange={setSelectedSort}
                        totalCount={sortedCalls.length}
                    />
                    {/* Call Cards Grid */}
                    <div className="flex-1 grid grid-cols-2 gap-2 p-2 bg-primary">
                        {sortedCalls.map((call, idx) => (
                            <div key={idx} onClick={() => !call.closed && setSelectedCall(call)} className={call.closed ? '' : 'cursor-pointer'}>
                                <CallCard {...call} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {selectedTab === 1 && <CastSearchPage />}
            {selectedTab === 2 && <MessagePage />}
            {selectedTab === 3 && <CastTimelinePage />}
            {selectedTab === 4 && <CastProfilePage />}
            {/* Floating Action Button - only on Home */}
            {selectedTab === 0 && (
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30 pointer-events-none">
                    <div className="flex justify-end w-full pointer-events-auto pr-4">
                        <FloatingActionButton />
                    </div>
                </div>
            )}
            {/* Bottom Navigation Bar - fixed and centered */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-20">
                <BottomNavigationBar selected={selectedTab} onTabChange={setSelectedTab} />
            </div>
            {/* Call Detail Modal */}
            {selectedCall && <CallDetailModal call={selectedCall} onClose={() => setSelectedCall(null)} />}
        </div>
    );
};

export default CastDashboard; 