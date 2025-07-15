import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const featureIcons = [
    { src: '/assets/icons/heart.png', label: 'らくらく\nメッセ' },
    { src: '/assets/icons/card-1.png', label: '休会制度' },
    { src: '/assets/icons/card-2.png', label: '自動おかえり\nメッセ' },
    { src: '/assets/icons/wave.png', label: '初回ウェルカムメッセ' },
    { src: '/assets/icons/gold-cup.png', label: '振込手数料\n割引' },
];

const CastGradeDetailPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="max-w-md mx-auto min-h-screen bg-[#f7f8fa] pb-8">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3">
                <button className="mr-2 text-2xl text-gray-500" onClick={() => navigate('/cast/dashboard')}>
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center">キャストグレード</span>
                <span className="text-gray-400 text-xl">?</span>
            </div>
            {/* Badge and FP */}
            <div className="flex flex-col items-center bg-[#e7d7b7] py-8 relative">
                <img src="/assets/icons/profile_badge.png" alt="badge" className="w-24 h-24 mb-2" />
                <div className="text-[#bfa14a] font-bold text-xl">ゴールドキャスト</div>
                <div className="text-3xl font-bold text-[#6c5c2a]">3,567,961 FP</div>
                {/* Grade progress bar */}
                <div className="flex justify-between w-full px-8 mt-6 mb-2 text-xs font-bold text-[#bfa14a]">
                    <span>ビギナー</span>
                    <span>グリーン</span>
                    <span>オレンジ</span>
                    <span>ブロンズ</span>
                    <span>シルバー</span>
                    <span>ゴールド</span>
                </div>
                <div className="w-5/6 h-2 bg-[#f3e9d2] rounded-full relative mb-2">
                    <div className="absolute left-0 top-0 h-2 bg-[#bfa14a] rounded-full" style={{ width: '65%' }} />
                </div>
                <div className="bg-white rounded-full px-6 py-2 shadow text-[#bfa14a] font-bold mt-2">
                    あと <span className="text-lg">5,432,039FP</span> でグレードアップ！
                </div>
            </div>
            {/* Features */}
            <div className="bg-white rounded-xl shadow px-4 py-6 mx-4 mt-6 mb-4">
                <div className="font-bold text-gray-700 mb-4">pishatto内特典</div>
                <div className="flex justify-between items-center">
                    {featureIcons.map((f, i) => (
                        <div key={i} className="flex flex-col items-center w-1/5">
                            <img src={f.src} alt={f.label} className="w-10 h-10 mb-1" />
                            <span className="text-xs text-gray-700 text-center whitespace-pre-line leading-tight">{f.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            {/* FP Details */}
            <div className="bg-white rounded-xl shadow px-4 py-6 mx-4 mb-4">
                <div className="font-bold text-gray-700 mb-4">FP詳細</div>
                {/* Repeat Point */}
                <div className="flex items-center mb-2">
                    <img src="/assets/icons/heart.png" alt="repeat" className="w-6 h-6 mr-2" />
                    <span className="font-bold text-[#e57373] mr-2">リピートポイント</span>
                    <span className="text-2xl font-bold text-[#bfa14a]">1,900,795P</span>
                    <span className="ml-2 text-xs text-gray-400">グレードアップ目安: <span className="font-bold text-[#bfa14a]">3,200,000P</span></span>
                </div>
                <div className="w-full h-2 bg-[#f3e9d2] rounded-full mb-2">
                    <div className="h-2 bg-[#bfa14a] rounded-full" style={{ width: '59%' }} />
                </div>
                <div className="text-xs text-gray-500 mb-4">20位 / 111位</div>
                {/* Gift Point */}
                <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">🎁</span>
                    <span className="font-bold text-[#f6a623] mr-2">ギフト獲得ポイント</span>
                    <span className="text-2xl font-bold text-[#bfa14a]">391,226P</span>
                    <span className="ml-2 text-xs text-gray-400">グレードアップ目安: <span className="font-bold text-[#bfa14a]">900,000P</span></span>
                </div>
                <div className="w-full h-2 bg-[#f3e9d2] rounded-full mb-2">
                    <div className="h-2 bg-[#bfa14a] rounded-full" style={{ width: '43%' }} />
                </div>
                <div className="text-xs text-gray-500 mb-4">27位 / 111位</div>
                {/* 60min+ Extension */}
                <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">⏰</span>
                    <span className="font-bold text-[#7ed957] mr-2">60分以上延長獲得数</span>
                    <span className="text-2xl font-bold text-[#bfa14a]">23回</span>
                    <span className="ml-2 text-xs text-gray-400">グレードアップ目安: <span className="font-bold text-[#bfa14a]">36回</span></span>
                </div>
                <div className="w-full h-2 bg-[#f3e9d2] rounded-full mb-2">
                    <div className="h-2 bg-[#bfa14a] rounded-full" style={{ width: '64%' }} />
                </div>
                <div className="text-xs text-gray-500 mb-4">26位 / 111位</div>
                {/* Want to meet again */}
                <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">👍</span>
                    <span className="font-bold text-[#4fc3f7] mr-2">また会いたいをもらった数</span>
                    <span className="text-2xl font-bold text-[#bfa14a]">12回</span>
                    <span className="ml-2 text-xs text-gray-400">グレードアップ目安: <span className="font-bold text-[#bfa14a]">36回</span></span>
                </div>
                <div className="w-full h-2 bg-[#f3e9d2] rounded-full mb-2">
                    <div className="h-2 bg-[#bfa14a] rounded-full" style={{ width: '33%' }} />
                </div>
                {/* New guest join count */}
                <div className="flex items-center mb-2 mt-4">
                    <span className="text-2xl mr-2">🧑‍🤝‍🧑</span>
                    <span className="font-bold text-[#a78bfa] mr-2">新規ゲストとの合流回数</span>
                    <span className="text-2xl font-bold text-[#bfa14a]">13回</span>
                    <span className="ml-2 text-xs text-gray-400">グレードアップ目安: <span className="font-bold text-[#bfa14a]">20回</span></span>
                </div>
                <div className="w-full h-2 bg-[#f3e9d2] rounded-full mb-2">
                    <div className="h-2 bg-[#bfa14a] rounded-full" style={{ width: '65%' }} />
                </div>
                <div className="text-xs text-gray-500 mb-4">75位 / 111位</div>
                {/* Grade calculation period */}
                <div className="bg-[#f7f8fa] rounded-lg px-4 py-2 text-center text-xs text-gray-700 mb-4">
                    グレード算出期間<br />2024/12/17 ~ 2025/03/17
                </div>
                {/* Repeaters */}
                <div className="bg-[#f7f8fa] rounded-lg px-4 py-2 text-center text-base font-bold text-gray-700">
                    リピーター数<br />
                    <span className="text-2xl font-bold text-[#bfa14a]">593人</span>
                </div>
            </div>
        </div>
    );
};

export default CastGradeDetailPage; 