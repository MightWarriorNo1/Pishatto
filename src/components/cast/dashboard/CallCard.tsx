import React from 'react';
import { Clock3, UserRound } from "lucide-react";
interface CallCardProps {
    title: string;
    time: string;
    type: string;
    people: number;
    points: string;
    extra?: string;
    closed?: boolean;
}

const CallCard: React.FC<CallCardProps> = ({ title, time, type, people, points, extra, closed }) => {
    if (closed) {
        return (
            <div className="relative bg-gray-100 border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center opacity-60 min-h-[140px] shadow-sm">
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span className="bg-white border border-gray-400 text-gray-700 px-3 py-1 rounded text-sm font-bold rotate-[-8deg] shadow">募集を締め切りました</span>
                </div>
            </div>
        );
    }
    return (
        <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm p-3 flex flex-col min-h-[140px]">
            <div className="absolute top-0 left-0 w-full h-2 rounded-t-xl" style={{ background: '#3DD598' }} />
            <div className="text-xs text-gray-700 font-bold mb-1 mt-2">{title} {time}</div>
            <div className="flex items-center mb-1 space-x-1">
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-bold">{type}</span>
                {/* Add more badges here if needed */}
            </div>
            <div className="flex items-center text-xs text-gray-600 mb-1">
                <span className="flex items-center mr-2">
                    <Clock3 />1時間</span>
                <span className="flex items-center mr-2"><UserRound /> {people}名</span>
            </div>
            <div className="text-xs text-gray-500 mb-1">獲得予定ポイント</div>
            <div className="text-lg font-bold text-purple-600 mb-1">{points}</div>
            {extra && <div className="text-xs text-purple-500">{extra}</div>}
        </div>
    );
};

export default CallCard; 