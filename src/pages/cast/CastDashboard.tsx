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
import MessageProposalPage from '../../components/cast/dashboard/MessageProposalPage';

interface Call {
    title: string;
    time: string;
    type: string;
    people: number;
    points: string;
    extra?: string;
    closed?: boolean;
}
    
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
        title: '日本橋[1名コール] (東京)',
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
];

// Modal component for call details (unchanged)
const CallDetailModal = ({ call, onClose }: { call: Call, onClose: () => void }) => {
    if (!call) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-2 p-6 relative animate-fadeIn">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 text-xl font-bold">×</button>
                <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                        <span className="text-3xl">🎩</span>
                    </div>
                    <span className="text-base font-medium text-gray-700">匿名様</span>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-2">{call.time} {call.title}</div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="flex items-center mr-4">
                        <Clock3 />1時間</span>
                    <span className="flex items-center mr-4"><UserRound /> {call.people}名</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">獲得予定ポイント</div>
                <div className="flex items-center mb-1">
                    <span className="text-2xl font-bold text-purple-600 mr-2">{call.points}</span>
                    <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded font-bold mr-2">延長時</span>
                    <span className="text-purple-500 font-bold text-lg">+ 10,850P</span>
                    <span className="text-xs text-gray-500 ml-1">/1時間</span>
                </div>
                <div className="text-xs text-purple-500 mb-2">{call.extra}</div>
                <div className="mb-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <span className="mr-2">
                            <MessageCircle /></span> コメント（任意）
                    </label>
                    <textarea
                        className="w-full border rounded-lg p-2 text-sm text-gray-700 bg-gray-50 resize-none"
                        rows={2}
                        placeholder="例）当選後10分で到着できます！or 5分くらい遅れます。（自由記述）"
                    />
                </div>
                <button className="w-full py-3 rounded-lg bg-gradient-to-r from-green-300 to-green-400 text-white font-bold text-base mb-2">応募する</button>
                <button onClick={onClose} className="w-full py-2 rounded-lg text-gray-500 font-medium text-base">閉じる</button>
            </div>
        </div>
    );
};

const CastDashboard: React.FC = () => {
    const [selectedCall, setSelectedCall] = useState<any | null>(null);
    const [selectedTab, setSelectedTab] = useState(0); // 0: Home, 1: Search, 2: Message, 3: Timeline, 4: MyPage
    return (
        <div className="min-h-screen bg-gray-50">
            {selectedTab === 0 && (
                <div className="max-w-md mx-auto pb-20">
                    {/* Top Navigation Bar */}
                    <TopNavigationBar />
                    {/* Tab Bar */}
                    <TabBar />
                    {/* Filter Bar */}
                    <FilterBar />
                    {/* Call Cards Grid */}
                    <div className="flex-1 grid grid-cols-2 gap-2 p-2 bg-gray-50">
                        {sampleCalls.map((call, idx) => (
                            <div key={idx} onClick={() => !call.closed && setSelectedCall(call)} className={call.closed ? '' : 'cursor-pointer'}>
                                <CallCard {...call} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {selectedTab === 1 && <CastSearchPage />}
            {selectedTab === 2 && <MessageProposalPage />}
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