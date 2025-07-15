import { Bell, Calendar, House, Mail, UserPlus } from 'lucide-react';
import React, { useState } from 'react';

const navItems = [
    { icon: <Bell size={28} />, label: 'お知らせ' },
    { icon: <UserPlus size={28} />, label: '今すぐコバト' },
    { icon: <House size={28} />, label: '待機所' },
    { icon: <Mail size={28} />, label: 'コンシェルジュ' },
    { icon: <Calendar size={28} />, label: '活動予定' },
];

const TopNavigationBar: React.FC = () => {
    const [activeIdx, setActiveIdx] = useState(0);
    return (
        <div className="bg-white rounded-b-3xl shadow-md pb-4 pt-3 flex flex-col items-center w-full">
            {/* Icon row */}
            <div className="flex justify-between w-full max-w-md px-2 mb-2">
                {navItems.map((item, idx) => (
                    <button
                        key={item.label}
                        className={`flex flex-col items-center flex-1 focus:outline-none hover:bg-gray-50 active:bg-gray-100 py-1 transition rounded-xl ${activeIdx === idx ? 'text-blue-600' : ''}`}
                        style={{ minWidth: 0 }}
                        onClick={() => setActiveIdx(idx)}
                    >
                        <span className={`mb-1 ${activeIdx === idx ? 'text-blue-600' : 'text-gray-700'}`}>{item.icon}</span>
                        <span className={`text-xs font-medium whitespace-nowrap leading-tight ${activeIdx === idx ? 'text-blue-600' : 'text-gray-500'}`}>{item.label}</span>
                    </button>
                ))}
            </div>
            {/* Dots indicator */}
            <div className="flex space-x-1 mt-1 justify-center">
                {navItems.map((_, idx) => (
                    <span
                        key={idx}
                        className={`w-2 h-2 rounded-full inline-block transition-colors duration-200 ${activeIdx === idx ? 'bg-blue-500' : 'bg-gray-200'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default TopNavigationBar; 