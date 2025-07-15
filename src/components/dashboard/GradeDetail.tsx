import React from 'react';
import GradeAbout from './GradeAbout';

const gradeNames = ['グリーン', 'オレンジ', 'ブロンズ', 'シルバー', 'ゴールド', 'プラチナ', '?'];
const benefits = [
    { icon: '💬', label: 'チャット背景' },
    { icon: '📋', label: 'つぶやきグレード表示' },
    { icon: '🎁', label: 'グレードギフト' },
    { icon: '🎂', label: 'バースデーギフト' },
    { icon: '⚙️', label: 'プライベート設定拡充' },
    { icon: '🧑‍💼', label: '専任コンシェルジュ' },
];

const GradeDetail: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [showAbout, setShowAbout] = React.useState(false);
    if (showAbout) return <GradeAbout onBack={() => setShowAbout(false)} />;
    return (
        <div className="max-w-md mx-auto min-h-screen bg-white">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b">
                <button onClick={onBack} className="mr-2 text-2xl text-gray-500">&#60;</button>
                <span className="text-lg font-bold flex-1 text-center">ゲストグレード</span>
            </div>
            {/* Purple gradient section */}
            <div className="bg-gradient-to-br from-purple-300 to-purple-500 p-0 pt-6 pb-8 relative">
                <div className="flex flex-col items-center">
                    {/* Badge */}
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gray-200 to-purple-300 flex items-center justify-center shadow-lg mb-2">
                        {/* Placeholder for badge SVG */}
                        <span className="text-6xl">⬡</span>
                        <span className="absolute top-8 right-1/2 translate-x-1/2 text-xl">👑</span>
                    </div>
                    <span className="bg-[#6C4AB6] text-white rounded-full px-4 py-1 text-sm font-bold mt-2">プラチナ</span>
                </div>
                {/* Progress bar */}
                <div className="mt-8 px-4">
                    <div className="flex justify-between text-xs text-gray-700 font-bold mb-2">
                        {gradeNames.map((g, i) => (
                            <span key={g} className={i === 5 ? 'text-[#6C4AB6]' : ''}>{g}</span>
                        ))}
                    </div>
                    <div className="relative h-3 flex items-center">
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-white/60 rounded-full" />
                        <div className="absolute left-0 w-[85%] top-1/2 -translate-y-1/2 h-1 bg-[#6C4AB6] rounded-full transition-all" />
                        <div className="flex justify-between w-full relative z-10">
                            {gradeNames.map((_, i) => (
                                <span key={i} className={`w-3 h-3 rounded-full border-2 ${i <= 5 ? 'bg-[#6C4AB6] border-[#6C4AB6]' : 'bg-white border-white'}`}></span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* What is guest grade row */}
            <button className="w-full flex items-center px-4 py-4 border-b" onClick={() => setShowAbout(true)}>
                <span className="flex-1 text-left font-bold text-gray-800">ゲストグレードとは</span>
                <span className="text-gray-400 text-lg">&gt;</span>
            </button>
            {/* Member benefits */}
            <div className="px-2 py-6">
                <div className="text-center font-bold text-gray-700 mb-4">会員特典一覧</div>
                <div className="grid grid-cols-3 gap-y-8 gap-x-2">
                    {benefits.map((b, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <span className="text-4xl mb-2">{b.icon}</span>
                            <span className="text-xs text-gray-700 text-center whitespace-pre-line leading-tight">{b.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GradeDetail; 