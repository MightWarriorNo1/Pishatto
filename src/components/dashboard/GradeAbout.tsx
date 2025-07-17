import { ChevronLeft } from 'lucide-react';
import React from 'react';

const gradeIcons = [
    { label: 'シルバー', icon: '⬛️' },
    { label: 'ゴールド', icon: '🟨' },
    { label: 'プラチナ', icon: '⬣' },
    { label: 'センチュリオン', icon: '⬤' },
];

const GradeAbout: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
                <button onClick={onBack} className="mr-2 text-2xl text-white">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center text-white">ゲストグレードとは</span>
            </div>
            {/* Badges illustration */}
            <div className="flex justify-center py-6">
                <img src="https://placehold.co/320x90?text=Badges" alt="badges" className="w-80 h-24 object-contain" />
            </div>
            {/* Title and description */}
            <div className="text-center font-bold text-xl mb-2 text-white">ゲストグレード</div>
            <div className="text-center text-white text-sm mb-6 px-6 leading-relaxed">
                pishattoでは皆様の日頃のご愛顧に感謝し、<br />
                グレード制をご用意させていただいております。<br />
                ご利用ポイントや頻度、ご利用中のマナー等を総合的に判定し、各グレードへご招待させていただきます。
            </div>
            {/* Info box */}
            <div className="bg-secondary text-white rounded-lg px-4 py-3 text-center text-sm font-bold mb-6 mx-4">
                年４期のご利用ポイント算出期間<br />
            </div>
            {/* Grade benefits table */}
            <div className="px-2 pb-8">
                <div className="text-center font-bold text-white mb-4">グレードごとの特典一覧</div>
                <div className="overflow-x-auto">
                    <table className="min-w-full border rounded-lg bg-primary border-secondary">
                        <thead>
                            <tr>
                                <th className="w-32"></th>
                                {gradeIcons.map((g, i) => (
                                    <th key={i} className="px-2 py-2 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-3xl mb-1 text-white">{g.icon}</span>
                                            <span className="text-xs text-white">{g.label}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t border-secondary">
                                <td className="px-2 py-3 text-sm text-white font-bold text-center">チャット背景</td>
                                {gradeIcons.map((_, i) => (
                                    <td key={i} className="text-center">
                                        <span className="inline-block w-6 h-6 rounded-full border-2 border-secondary"></span>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GradeAbout; 