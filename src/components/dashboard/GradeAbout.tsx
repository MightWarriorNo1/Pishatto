import React from 'react';

const gradeIcons = [
    { label: 'シルバー', icon: '⬛️' },
    { label: 'ゴールド', icon: '🟨' },
    { label: 'プラチナ', icon: '⬣' },
    { label: 'センチュリオン', icon: '⬤' },
];

const GradeAbout: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="max-w-md mx-auto min-h-screen bg-white">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b">
                <button onClick={onBack} className="mr-2 text-2xl text-gray-500">&#60;</button>
                <span className="text-lg font-bold flex-1 text-center">ゲストグレードとは</span>
            </div>
            {/* Badges illustration */}
            <div className="flex justify-center py-6">
                {/* Replace with actual SVG or image if available */}
                <img src="https://placehold.co/320x90?text=Badges" alt="badges" className="w-80 h-24 object-contain" />
            </div>
            {/* Title and description */}
            <div className="text-center font-bold text-xl mb-2">ゲストグレード</div>
            <div className="text-center text-gray-700 text-sm mb-6 px-6 leading-relaxed">
                pishattoでは皆様の日頃のご愛顧に感謝し、<br />
                グレード制をご用意させていただいております。<br />
                ご利用ポイントや頻度、ご利用中のマナー等を総合的に判定し、各グレードへご招待させていただきます。
            </div>
            {/* Blue info box */}
            <div className="bg-blue-50 text-blue-700 rounded-lg px-4 py-3 text-center text-sm font-bold mb-6 mx-4">
                年４期のご利用ポイント算出期間<br />
                1月1日〜3月31日 / 4月1日〜6月30日 /<br />
                7月1日〜9月30日 / 10月1日〜12月31日 /
            </div>
            {/* Grade benefits table */}
            <div className="px-2 pb-8">
                <div className="text-center font-bold text-gray-700 mb-4">グレードごとの特典一覧</div>
                <div className="overflow-x-auto">
                    <table className="min-w-full border rounded-lg bg-white">
                        <thead>
                            <tr>
                                <th className="w-32"></th>
                                {gradeIcons.map((g, i) => (
                                    <th key={i} className="px-2 py-2 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-3xl mb-1">{g.icon}</span>
                                            <span className="text-xs text-gray-700">{g.label}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t">
                                <td className="px-2 py-3 text-sm text-gray-700 font-bold text-center">チャット背景</td>
                                {gradeIcons.map((_, i) => (
                                    <td key={i} className="text-center">
                                        <span className="inline-block w-6 h-6 rounded-full border-2 border-gray-300"></span>
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