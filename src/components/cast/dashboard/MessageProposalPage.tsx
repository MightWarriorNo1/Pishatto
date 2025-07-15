import React, { useState } from 'react';
import { Calendar, Ellipsis, Heart, Video, Gift, Image } from 'lucide-react';

function formatJPDate(date: Date) {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const w = days[date.getDay()];
    return `${y}年${m}月${d}日(${w})`;
}
function formatTime(date: Date) {
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${min}`;
}

function formatJPDateTimeInput(value: string) {
    if (!value) return '';
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const date = new Date(value);
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const w = days[date.getDay()];
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${m}月${d}日 (${w}) ${h}:${min}`;
}

const parsePeople = (val: string) => {
    const match = val.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
};
const parseDuration = (val: string) => {
    // Handles "2時間", "1.5時間", "90分" etc.
    if (val.includes('時間')) {
        const match = val.match(/([\d.]+)時間/);
        if (match) return parseFloat(match[1]) * 60;
    }
    if (val.includes('分')) {
        const match = val.match(/([\d.]+)分/);
        if (match) return parseFloat(match[1]);
    }
    return 60; // default 1 hour
};
const calcPoints = (people: string, duration: string) => {
    const numPeople = parsePeople(people);
    const minutes = parseDuration(duration);
    const units = Math.ceil(minutes / 30);
    return 9000 * numPeople * units;
};

const MessageProposalPage: React.FC = () => {
    const [date, setDate] = useState('');
    const [people, setPeople] = useState('1名');
    const [duration, setDuration] = useState('2時間');
    const now = new Date();
    const jpDate = formatJPDate(now);
    const jpTime = formatTime(now);

    const totalPoints = calcPoints(people, duration);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center pb-24">
            {/* Top Bar */}
            <div className="w-full max-w-md flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex items-center">
                    <img src="/assets/avatar/1.jpg" alt="avatar" className="w-9 h-9 rounded-full mr-2" />
                    <span className="font-semibold text-lg flex flex-row">あや <span className="text-gray-400">
                        <Heart />
                    </span></span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="inline-block w-6 h-6 rounded">
                        <Video />
                    </span> {/* Placeholder for video icon */}
                    <span className="inline-block w-6 h-6 rounded">
                        <Ellipsis />
                    </span> {/* Placeholder for menu icon */}
                </div>
            </div>
            {/* Banner */}
            <div className="w-full max-w-md bg-red-700 text-white text-xs text-center py-1">コラボイベント実施中!! pishatto × SUPER GT</div>
            {/* Info Bar */}
            <div className="w-full max-w-md bg-gray-100 text-xs text-gray-700 px-4 py-1 flex items-center">日程調整後、合流ができます</div>
            {/* Chat Area */}
            <div className="w-full max-w-md flex flex-col items-center px-4 py-6 bg-[#cdb6e6] relative">
                <span className="text-xs text-gray-100 mb-4 text-center w-full">{jpDate}</span>
                <div className="flex items-center justify-center w-full mt-2">
                    <span className="w-14 h-14 rounded-full bg-yellow-200 flex items-center justify-center">
                        <img src='/assets/avatar/avatar-2.png' className="w-12 h-12 rounded-full object-cover" alt="avatar" />
                    </span>
                </div>
                <span className="text-xs text-gray-100 mt-2">{jpTime}</span>
            </div>
            {/* Message Input */}
            <div className="w-full max-w-md flex items-center px-4 py-2 border-b border-gray-200 bg-white">
                <span className="text-yellow-500 mr-2">
                    <Calendar />
                </span>
                <input
                    className="flex-1 border-none outline-none text-sm bg-transparent"
                    placeholder="メッセージを入力..."
                />
                <span className="text-gray-400 ml-2">
                    <Image />
                </span>
                <span className="text-gray-400 ml-2">
                    <Gift />
                </span>
            </div>
            {/* Schedule Proposal Form */}
            <div className="w-full max-w-md bg-gray-50 px-4 py-6 flex flex-col gap-3">
                <div className="text-xs font-bold text-gray-700 mb-1">日程</div>
                <input
                    type="datetime-local"
                    className="w-full border rounded-lg p-2 text-sm mb-2"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                />
                {date && (
                    <div className="text-sm text-gray-700 mb-2">{formatJPDateTimeInput(date)}</div>
                )}
                <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                        <div className="text-xs font-bold text-gray-700 mb-1">キャスト人数</div>
                        <input
                            className="w-full border rounded-lg p-2 text-sm"
                            value={people}
                            onChange={e => setPeople(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-bold text-gray-700 mb-1">時間</div>
                        <input
                            className="w-full border rounded-lg p-2 text-sm"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                        />
                    </div>
                </div>
                <div className="text-sm text-gray-700 font-bold mt-2 mb-1">
                    9,000 (キャストP/30分) × {parsePeople(people)}名 × {Math.ceil(parseDuration(duration) / 60)}時間 <span className="float-right">{totalPoints.toLocaleString()}P</span>
                </div>
                <div className="text-xs text-gray-500 mb-2 text-right w-full">※延長15分につきpが発生します</div>
                <div className="text-xs text-gray-700 flex justify-between text-center font-bold mb-2">実際に合流するまでポイントは消費されません</div>
                <div className="flex justify-center w-full">
                    <button className="py-3 rounded-lg bg-orange-500 text-white font-bold text-base mt-2 w-3/4">日程と人数を提案する</button>
                </div>
            </div>
        </div>
    );
};

export default MessageProposalPage; 