import { House, Search, MessageCircle, Clock9, UserRound } from 'lucide-react';
import React from 'react';

const navs = [
    { label: 'ホーム', icon: < House />, aria: 'ホーム' },
    { label: '探す', icon: <Search />, aria: '探す' },
    { label: 'メッセージ', icon: <MessageCircle />, badge: 13, aria: 'メッセージ' },
    { label: 'つぶやき', icon: <Clock9 />, aria: 'つぶやき' },
    { label: 'マイページ', icon: <UserRound />, aria: 'マイページ' },
];

interface BottomNavigationBarProps {
    selected?: number;
    onTabChange?: (idx: number) => void;
}

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ selected = 0, onTabChange }) => {
    return (
        <div className="rounded-b-3xl shadow p-4 flex flex-row items-center bg-white">
            {navs.map((nav, idx) => (
                <button
                    key={nav.label}
                    aria-label={nav.aria}
                    className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors duration-150 ${selected === idx ? 'text-purple-600 font-bold' : 'text-gray-500'}`}
                    onClick={() => onTabChange && onTabChange(idx)}
                >
                    <span className="relative text-2xl mb-1">
                        {nav.icon}
                        {nav.badge && (
                            <span className="absolute -top-1 -right-2 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{nav.badge}</span>
                        )}
                    </span>
                    <span>{nav.label}</span>
                </button>
            ))}
        </div>
    );
};

export default BottomNavigationBar; 