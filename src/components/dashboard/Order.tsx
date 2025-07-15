import React, { useState } from 'react';

const classOptions = [
    { name: 'ロイヤルVIP', color: 'bg-gray-800', price: 12500 },
    { name: 'VIP', color: 'bg-yellow-300', price: 7000 },
    { name: 'プレミアム', color: 'bg-green-300', price: 4750 },
];

const timeOptions = ['30分後', '60分後', '90分後', 'それ以外'];
const durationOptions = ['1時間', '2時間', '3時間', '4時間以上'];

const situationOptions = [
    'プライベート', '接待', 'わいわい', 'しっとり', 'カラオケ', 'タバコNG', 'マナー重視', 'ギフト大盤振る舞い', '誕生日会'
];
const castTypeOptions = [
    '20代前半', '20代後半', '30代', '学生', '童顔', '綺麗系', 'ギャル', '清楚', 'スレンダー', 'グラマー', 'ハーフ', '小柄', 'プロ歓迎', '最近入会'
];
const castSkillOptions = [
    'お酒好き', '英語が話せる', '中国語が話せる', '韓国語が話せる', '盛り上げ上手', '歌うま'
];

function Order({ onBack }: { onBack: () => void }) {
    // State for all order fields
    const [selectedTime, setSelectedTime] = useState('30分後');
    const [selectedArea, setSelectedArea] = useState('東京 / 六本木');
    const [counts, setCounts] = useState([1, 1, 0]);
    const [selectedDuration, setSelectedDuration] = useState('1時間');
    const [selectedSituations, setSelectedSituations] = useState<string[]>([]);
    const [selectedCastTypes, setSelectedCastTypes] = useState<string[]>([]);
    const [selectedCastSkills, setSelectedCastSkills] = useState<string[]>([]);
    const [page, setPage] = useState<'form' | 'final'>('form');
    const total = counts.reduce((a, b) => a + b, 0);
    const toggle = (arr: string[], setArr: (v: string[]) => void, value: string) => {
        setArr(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
    };
    if (page === 'final') {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-white pb-8">
                {/* Back and Title */}
                <div className="flex items-center px-4 pt-6 pb-2">
                    <button onClick={() => setPage('form')} className="mr-2 text-2xl text-gray-500">&#60;</button>
                    <span className="text-2xl font-bold">注文の最終確認</span>
                </div>
                {/* Order summary */}
                <div className="px-4 mt-4">
                    <div className="font-bold mb-2">注文内容</div>
                    <div className="flex items-center mb-1 text-sm">
                        <span className="w-6">🕒</span>
                        <span className="text-gray-500 mr-2">合流予定</span>
                        <span className="ml-auto font-bold">今すぐ({selectedTime})</span>
                    </div>
                    <div className="flex items-center mb-1 text-sm">
                        <span className="w-6">📍</span>
                        <span className="text-gray-500 mr-2">合流エリア</span>
                        <span className="ml-auto font-bold">{selectedArea}</span>
                    </div>
                    <div className="flex items-center mb-1 text-sm">
                        <span className="w-6">👥</span>
                        <span className="text-gray-500 mr-2">キャスト人数</span>
                        <span className="ml-auto font-bold">ロイヤルVIP：{counts[0]}人<br />VIP：{counts[1]}人</span>
                    </div>
                    <div className="flex items-center mb-1 text-sm">
                        <span className="w-6">⏱️</span>
                        <span className="text-gray-500 mr-2">設定時間</span>
                        <span className="ml-auto font-bold">{selectedDuration}</span>
                    </div>
                </div>
                {/* Change button */}
                <div className="px-4 mt-4">
                    <button className="w-full text-blue-500 font-bold py-2 border-b" onClick={() => setPage('form')}>変更する</button>
                </div>
                {/* Ohineri and Coupon rows */}
                <div className="px-4 mt-4">
                    <div className="flex items-center py-3 border-b">
                        <span className="w-6">🅿️</span>
                        <span className="text-gray-700">おひねりコール</span>
                        <span className="ml-auto font-bold">0P</span>
                        <span className="ml-2 text-gray-400">&gt;</span>
                    </div>
                    <div className="flex items-center py-3 border-b">
                        <span className="w-6">🎫</span>
                        <span className="text-gray-700">クーポン</span>
                        <span className="ml-auto font-bold text-gray-500">クーポン未所持</span>
                        <span className="ml-2 text-gray-400">&gt;</span>
                    </div>
                </div>
                {/* Price breakdown */}
                <div className="px-4 mt-4">
                    <div className="bg-gray-100 rounded-lg p-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span>ロイヤルVIP {counts[0]}人</span>
                            <span>{(25000 * counts[0]).toLocaleString()}P</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>VIP {counts[1]}人</span>
                            <span>{(14000 * counts[1]).toLocaleString()}P</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg mt-2">
                            <span>小計</span>
                            <span>{(25000 * counts[0] + 14000 * counts[1]).toLocaleString()}P</span>
                        </div>
                    </div>
                    <div className="flex justify-between font-bold text-xl mt-4">
                        <span>合計</span>
                        <span>{(25000 * counts[0] + 14000 * counts[1]).toLocaleString()}P</span>
                    </div>
                </div>
                {/* Confirm button */}
                <div className="px-4 mt-8">
                    <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold text-lg">予約を確定する</button>
                </div>
            </div>
        );
    }
    // Form page: OrderHistoryScreen + OrderDetailConditionsScreen in one scrollable screen
    return (
        <div className="max-w-md mx-auto min-h-screen bg-white pb-8 overflow-y-auto">
            {/* Back and Title */}
            <div className="flex items-center px-4 pt-6 pb-2">
                <button onClick={onBack} className="mr-2 text-2xl text-gray-500">&#60;</button>
                <span className="text-2xl font-bold">注文の確認</span>
            </div>
            {/* Time selection */}
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold mr-2">何分後に合流しますか？</span>
                    <span className="text-orange-500 text-sm ml-auto">*必須</span>
                </div>
                <div className="flex gap-2 mb-2">
                    {timeOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-2 rounded border ${selectedTime === opt ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300'}`}
                            onClick={() => setSelectedTime(opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            {/* Area selection */}
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold">どこに呼びますか?</span>
                </div>
                <button className="w-full border rounded px-4 py-2 text-left flex items-center">
                    <span>{selectedArea}</span>
                    <span className="ml-auto text-gray-400">&gt;</span>
                </button>
            </div>
            {/* People selection */}
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold">何人呼びますか?</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                    {classOptions.map((opt, idx) => (
                        <div key={opt.name} className="flex items-center mb-3 last:mb-0">
                            <span className={`inline-block w-4 h-4 rounded-full mr-2 ${opt.color}`}></span>
                            <span className="font-bold mr-2">{opt.name}</span>
                            <span className="text-xs text-gray-500 mr-2">{opt.price.toLocaleString()} P / 30分</span>
                            <button
                                className="w-8 h-8 rounded-full border border-gray-300 text-2xl text-gray-500 flex items-center justify-center mr-2"
                                onClick={() => setCounts(c => c.map((v, i) => i === idx ? Math.max(0, v - 1) : v))}
                            >－</button>
                            <span className="w-4 text-center font-bold">{counts[idx]}</span>
                            <button
                                className="w-8 h-8 rounded-full border border-gray-300 text-2xl text-orange-500 flex items-center justify-center ml-2"
                                onClick={() => setCounts(c => c.map((v, i) => i === idx ? v + 1 : v))}
                            >＋</button>
                        </div>
                    ))}
                    <div className="flex items-center mt-2">
                        <span className="text-orange-500 text-sm mr-2">&#63;</span>
                        <span className="text-orange-500 text-sm underline cursor-pointer">クラスの説明</span>
                        <span className="ml-auto font-bold">合計：<span className="text-orange-500">{total}人</span></span>
                    </div>
                </div>
            </div>
            {/* Duration selection */}
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold mr-2">何時間利用しますか？</span>
                    <span className="text-orange-500 text-sm ml-auto">*必須</span>
                </div>
                <div className="flex gap-2 mb-2">
                    {durationOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-2 rounded border ${selectedDuration === opt ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300'}`}
                            onClick={() => setSelectedDuration(opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            {/* --- OrderDetailConditionsScreen section --- */}
            <div className="px-4 pt-8 pb-2">
                <span className="text-xl font-bold">その他詳細条件 <span className="bg-gray-200 text-xs px-2 py-1 rounded align-middle">任意</span></span>
            </div>
            {/* シチュエーション */}
            <div className="px-4 mt-4">
                <div className="font-bold mb-2">シチュエーション</div>
                <div className="flex flex-wrap gap-2">
                    {situationOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-1 rounded-full border ${selectedSituations.includes(opt) ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
                            onClick={() => toggle(selectedSituations, setSelectedSituations, opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            {/* キャストタイプ */}
            <div className="px-4 mt-6">
                <div className="font-bold mb-2">キャストタイプ</div>
                <div className="flex flex-wrap gap-2">
                    {castTypeOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-1 rounded-full border ${selectedCastTypes.includes(opt) ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
                            onClick={() => toggle(selectedCastTypes, setSelectedCastTypes, opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            {/* キャストスキル */}
            <div className="px-4 mt-6">
                <div className="font-bold mb-2">キャストスキル</div>
                <div className="flex flex-wrap gap-2">
                    {castSkillOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-1 rounded-full border ${selectedCastSkills.includes(opt) ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
                            onClick={() => toggle(selectedCastSkills, setSelectedCastSkills, opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            {/* Next button */}
            <div className="px-4 mt-12">
                <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold text-lg" onClick={() => setPage('final')}>次に進む</button>
            </div>
        </div>
    );
}

export default Order; 