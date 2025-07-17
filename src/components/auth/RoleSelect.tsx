import React from 'react';
import { CircleUserRound, Sparkle } from 'lucide-react';

interface RoleSelectProps {
    onSelect: (role: 'guest' | 'cast') => void;
}

const RoleSelect: React.FC<RoleSelectProps> = ({ onSelect }) => {
    return (
        <div className="flex flex-col min-h-screen bg-primary">
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full px-4 space-y-6">
                    <div className="p-2 text-center text-xs text-white">
                        18歳以上全ての利用規約とプライバシーポリシーに同意し
                    </div>

                    <button
                        onClick={() => onSelect('guest')}
                        className="w-full flex items-center justify-center py-4 px-4 rounded-full bg-secondary text-white font-semibold relative shadow-lg hover:bg-red-700 transition-all duration-200"
                    >
                        <span className="absolute left-4">
                            <CircleUserRound />
                        </span>
                        ゲストとして始める
                    </button>

                    <button
                        onClick={() => onSelect('cast')}
                        className="w-full flex items-center justify-center py-4 px-4 rounded-full bg-primary text-white border-2 border-secondary font-semibold relative shadow-lg hover:bg-red-700 hover:text-white transition-all duration-200"
                    >
                        <span className="absolute left-4">
                            <Sparkle />
                        </span>
                        キャストとして始める
                    </button>
                </div>
            </div >
        </div >
    );
};

export default RoleSelect; 