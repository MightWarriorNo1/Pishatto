import React from 'react';

interface RoleSelectProps {
    onSelect: (role: 'guest' | 'cast') => void;
}

const RoleSelect: React.FC<RoleSelectProps> = ({ onSelect }) => {
    return (
        <div className="flex flex-col min-h-screen bg-black">
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full px-4 space-y-4">
                    {/* <div className="p-2 text-center text-xs text-gray-400">
                        ロールを選択してください
                    </div> */}
                    <div className="p-2 text-center text-xs text-gray-400">
                        18歳以上全ての利用規約とプライバシーポリシーに同意し
                    </div>

                    <button
                        onClick={() => onSelect('guest')}
                        className="w-full flex items-center justify-center py-3 px-4 rounded-full bg-[#FF6B00] text-white font-medium relative"
                    >
                        <span className="absolute left-4">👤</span>
                        ゲストとして始める
                    </button>

                    <button
                        onClick={() => onSelect('cast')}
                        className="w-full flex items-center justify-center py-3 px-4 rounded-full bg-[#00B900] text-white font-medium relative"
                    >
                        <span className="absolute left-4">⭐</span>
                        キャストとして始める
                    </button>
                </div>
            </div >
        </div >
    );
};

export default RoleSelect; 