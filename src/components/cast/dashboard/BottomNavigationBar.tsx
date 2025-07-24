import { House, Search, MessageCircle, Clock9, UserRound } from 'lucide-react';
import React from 'react';

const navs = [
    { label: 'ホーム', icon: < House />, aria: 'ホーム' },
    { label: '探す', icon: <Search />, aria: '探す' },
    { label: 'メッセージ', icon: <MessageCircle />, aria: 'メッセージ' },
    { label: 'つぶやき', icon: <Clock9 />, aria: 'つぶやき' },
    { label: 'マイページ', icon: <UserRound />, aria: 'マイページ' },
];

interface BottomNavigationBarProps {
    selected?: number;
    onTabChange?: (idx: number) => void;
    messageBadgeCount?: number;
    tweetBadgeCount?: number;
}

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ selected = 0, onTabChange, messageBadgeCount = 0, tweetBadgeCount = 0 }) => {
    return (
        <div className="rounded-b-3xl shadow p-4 flex flex-row items-center bg-secondary border-t border-secondary">
            {navs.map((nav, idx) => (
                <button
                    key={nav.label}
                    aria-label={nav.aria}
                    className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors duration-150 ${selected === idx ? 'text-primary font-bold' : 'text-white'}`}
                    onClick={() => onTabChange && onTabChange(idx)}
                >
                    <span className="relative text-2xl mb-1">
                        {nav.icon}
                        {nav.label === 'メッセージ' && messageBadgeCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-secondary text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{messageBadgeCount}</span>
                        )}
                        {nav.label === 'つぶやき' && tweetBadgeCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-secondary text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{tweetBadgeCount}</span>
                        )}
                    </span>
                    <span>{nav.label}</span>
                </button>
            ))}
        </div>
    );
};

export default BottomNavigationBar; 