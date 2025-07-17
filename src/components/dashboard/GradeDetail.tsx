import React from 'react';
import GradeAbout from './GradeAbout';
import { ChevronLeft, ChevronRight, MessageSquareMore, FileText, Gift, Gem, Settings, UsersRound } from 'lucide-react';

const gradeNames = ['グリーン', 'オレンジ', 'ブロンズ', 'シルバー', 'ゴールド', 'プラチナ', '?'];
const benefits = [
    { icon: <MessageSquareMore color='orange' size={32} />, label: 'チャット背景' },
    { icon: <FileText color='orange' size={32} />, label: 'つぶやきグレード表示' },
    { icon: <Gift color='orange' size={32} />, label: 'グレードギフト' },
    { icon: <Gem color='orange' size={32} />, label: 'バースデーギフト' },
    { icon: <Settings color='orange' size={32} />, label: 'プライベート設定拡充' },
    { icon: <UsersRound color='orange' size={32} />, label: '専任コンシェルジュ' },
];

const GradeDetail: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [showAbout, setShowAbout] = React.useState(false);
    if (showAbout) return <GradeAbout onBack={() => setShowAbout(false)} />;
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b border-secondary bg-primary">
                <button onClick={onBack} className="mr-2 text-2xl text-white">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center text-white">ゲストグレード</span>
            </div>
            {/* Badge section */}
            <div className="bg-secondary p-0 pt-6 pb-8 relative">
                <div className="flex flex-col items-center">
                    {/* Badge */}
                    <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center shadow-lg mb-2 border-4 border-secondary">
                        <span className="text-6xl text-white">⬡</span>
                        <span className="absolute top-8 right-1/2 translate-x-1/2 text-xl text-white">👑</span>
                    </div>
                </div>
            </div>
            {/* Description */}
            <div className="text-center font-bold text-xl mb-2 text-white">グレード詳細</div>
            <div className="text-center text-white text-sm mb-6 px-6 leading-relaxed">
                グレードの詳細説明がここに入ります。
            </div>
            {/* Progress bar */}
            <div className="mt-8 px-4">
                <div className="flex justify-between text-xs text-white font-bold mb-2">
                    {gradeNames.map((g, i) => (
                        <span key={g} className={i === 5 ? 'text-white' : ''}>{g}</span>
                    ))}
                </div>
                <div className="relative h-3 flex items-center">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-primary/60 rounded-full" />
                    <div className="absolute left-0 w-[85%] top-1/2 -translate-y-1/2 h-1 bg-secondary rounded-full transition-all" />
                    <div className="flex justify-between w-full relative z-10">
                        {gradeNames.map((_, i) => (
                            <span key={i} className={`w-3 h-3 rounded-full border-2 ${i <= 5 ? 'bg-secondary border-secondary' : 'bg-primary border-white'}`}></span>
                        ))}
                    </div>
                </div>
            </div>
            {/* What is guest grade row */}
            <button className="w-full flex items-center px-4 py-4 border-b border-secondary" onClick={() => setShowAbout(true)}>
                <span className="flex-1 text-left font-bold text-white">ゲストグレードとは</span>
                <span className="text-white text-lg">
                    <ChevronRight />
                </span>
            </button>
            {/* Member benefits */}
            <div className="px-2 py-6">
                <div className="text-center font-bold text-white mb-4">会員特典一覧</div>
                <div className="grid grid-cols-3 gap-y-8 gap-x-2">
                    {benefits.map((b, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <span className="text-4xl mb-2 text-white">{b.icon}</span>
                            <span className="text-xs text-white text-center whitespace-pre-line leading-tight">{b.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GradeDetail; 