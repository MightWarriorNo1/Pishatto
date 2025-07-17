import React, { useState } from 'react';

const classOptions = [
    { name: 'ロイヤルVIP', color: 'bg-secondary', price: 12500 },
    { name: 'VIP', color: 'bg-primary', price: 7000 },
    { name: 'プレミアム', color: 'bg-primary', price: 4750 },
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
    const [selectedArea] = useState('東京 / 六本木');
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
            <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
                {/* Back and Title */}
                <div className="flex items-center px-4 pt-6 pb-2">
                    <button onClick={() => setPage('form')} className="mr-2 text-2xl text-white">&#60;</button>
                    <span className="text-2xl font-bold text-white">注文の最終確認</span>
                </div>
                {/* Order summary */}
                <div className="px-4 mt-4">
                    <div className="font-bold mb-2 text-white">注文内容</div>
                    <div className="flex items-center mb-1 text-sm">
                        <span className="w-6 text-white">🕒</span>
                        <span className="text-white mr-2">合流予定</span>
                        <span className="ml-auto font-bold text-white">今すぐ({selectedTime})</span>
                    </div>
                    <div className="flex items-center mb-1 text-sm">
                        <span className="w-6 text-white">📍</span>
                        <span className="text-white mr-2">合流エリア</span>
                        <span className="ml-auto font-bold text-white">{selectedArea}</span>
                    </div>
                    <div className="flex items-center mb-1 text-sm">
                        <span className="w-6 text-white">👥</span>
                        <span className="text-white mr-2">キャスト人数</span>
                        <span className="ml-auto font-bold text-white">ロイヤルVIP：{counts[0]}人<br />VIP：{counts[1]}人</span>
                    </div>
                    <div className="flex items-center mb-1 text-sm">
                        <span className="w-6 text-white">⏱️</span>
                        <span className="text-white mr-2">設定時間</span>
                        <span className="ml-auto font-bold text-white">{selectedDuration}</span>
                    </div>
                </div>
                {/* Change button */}
                <div className="px-4 mt-4">
                    <button className="w-full text-white font-bold py-2 border-b border-secondary" onClick={() => setPage('form')}>変更する</button>
                </div>
                {/* Ohineri and Coupon rows */}
                <div className="px-4 mt-4">
                    <div className="flex items-center py-3 border-b border-secondary">
                        <span className="w-6 text-white">🅿️</span>
                        <span className="text-white">おひねりコール</span>
                        <span className="ml-auto font-bold text-white">0P</span>
                        <span className="ml-2 text-white">&gt;</span>
                    </div>
                    <div className="flex items-center py-3 border-b border-secondary">
                        <span className="w-6 text-white">🎫</span>
                        <span className="text-white">クーポン</span>
                        <span className="ml-auto font-bold text-white">クーポン未所持</span>
                        <span className="ml-2 text-white">&gt;</span>
                    </div>
                </div>
                {/* Price breakdown */}
                <div className="px-4 mt-4">
                    <div className="bg-primary rounded-lg p-4 border border-secondary">
                        <div className="flex justify-between text-sm mb-1 text-white">
                            <span>ロイヤルVIP {counts[0]}人</span>
                            <span>{(25000 * counts[0]).toLocaleString()}P</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1 text-white">
                            <span>VIP {counts[1]}人</span>
                            <span>{(14000 * counts[1]).toLocaleString()}P</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg mt-2 text-white">
                            <span>小計</span>
                            <span>{(25000 * counts[0] + 14000 * counts[1]).toLocaleString()}P</span>
                        </div>
                    </div>
                    <div className="flex justify-between font-bold text-xl mt-4 text-white">
                        <span>合計</span>
                        <span>{(25000 * counts[0] + 14000 * counts[1]).toLocaleString()}P</span>
                    </div>
                </div>
                {/* Confirm button */}
                <div className="px-4 mt-8">
                    <button className="w-full bg-secondary text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition" onClick={() => { }}>
                        予約を確定する
                    </button>
                </div>
            </div>
        );
    }
    // Form page: OrderHistoryScreen + OrderDetailConditionsScreen in one scrollable screen
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-8 overflow-y-auto">
            {/* Back and Title */}
            <div className="flex items-center px-4 pt-6 pb-2">
                <button onClick={onBack} className="mr-2 text-2xl text-white">&#60;</button>
                <span className="text-2xl font-bold text-white">注文の確認</span>
            </div>
            {/* Time selection */}
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold mr-2 text-white">何分後に合流しますか？</span>
                    <span className="text-white text-sm ml-auto">*必須</span>
                </div>
                <div className="flex gap-2 mb-2">
                    {timeOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-2 rounded border ${selectedTime === opt ? 'bg-secondary text-white border-secondary' : 'bg-primary text-white border-gray-700'}`}
                            onClick={() => setSelectedTime(opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            {/* Area selection */}
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold text-white">どこに呼びますか?</span>
                </div>
                <button className="w-full border rounded px-4 py-2 text-left flex items-center border-secondary bg-primary text-white">
                    <span>{selectedArea}</span>
                    <span className="ml-auto text-white">&gt;</span>
                </button>
            </div>
            {/* People selection */}
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold text-white">何人呼びますか?</span>
                </div>
                <div className="bg-primary rounded-lg p-4 border border-secondary">
                    {classOptions.map((opt, idx) => (
                        <div key={opt.name} className="flex items-center mb-3 last:mb-0">
                            <span className={`inline-block w-4 h-4 rounded-full mr-2 ${opt.color}`}></span>
                            <span className="font-bold mr-2 text-white">{opt.name}</span>
                            <span className="text-xs text-white mr-2">{opt.price.toLocaleString()} P / 30分</span>
                            <button
                                className="w-8 h-8 rounded-full border border-secondary text-2xl text-white flex items-center justify-center mr-2"
                                onClick={() => setCounts(c => c.map((v, i) => i === idx ? Math.max(0, v - 1) : v))}
                            >－</button>
                            <span className="w-4 text-center font-bold text-white">{counts[idx]}</span>
                            <button
                                className="w-8 h-8 rounded-full border border-secondary text-2xl text-white flex items-center justify-center ml-2"
                                onClick={() => setCounts(c => c.map((v, i) => i === idx ? v + 1 : v))}
                            >＋</button>
                        </div>
                    ))}
                    <div className="flex items-center mt-2">
                        <span className="text-white text-sm mr-2">&#63;</span>
                        <span className="text-white text-sm underline cursor-pointer">クラスの説明</span>
                        <span className="ml-auto font-bold text-white">合計：<span className="text-white">{total}人</span></span>
                    </div>
                </div>
            </div>
            {/* Duration selection */}
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold mr-2 text-white">何時間利用しますか？</span>
                    <span className="text-white text-sm ml-auto">*必須</span>
                </div>
                <div className="flex gap-2 mb-2">
                    {durationOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-2 rounded border ${selectedDuration === opt ? 'bg-secondary text-white border-secondary' : 'bg-primary text-white border-gray-700'}`}
                            onClick={() => setSelectedDuration(opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            {/* --- OrderDetailConditionsScreen section --- */}
            <div className="px-4 pt-8 pb-2">
                <span className="text-xl font-bold text-white">その他詳細条件 <span className="bg-secondary text-xs px-2 py-1 rounded align-middle text-white">任意</span></span>
            </div>
            {/* シチュエーション */}
            <div className="px-4 mt-4">
                <div className="font-bold mb-2 text-white">シチュエーション</div>
                <div className="flex flex-wrap gap-2">
                    {situationOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-1 rounded-full border ${selectedSituations.includes(opt) ? 'bg-secondary border-secondary text-white' : 'bg-primary border-gray-700 text-white'}`}
                            onClick={() => toggle(selectedSituations, setSelectedSituations, opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            {/* キャストタイプ */}
            <div className="px-4 mt-6">
                <div className="font-bold mb-2 text-white">キャストタイプ</div>
                <div className="flex flex-wrap gap-2">
                    {castTypeOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-1 rounded-full border ${selectedCastTypes.includes(opt) ? 'bg-secondary border-secondary text-white' : 'bg-primary border-gray-700 text-white'}`}
                            onClick={() => toggle(selectedCastTypes, setSelectedCastTypes, opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            {/* キャストスキル */}
            <div className="px-4 mt-6">
                <div className="font-bold mb-2 text-white">キャストスキル</div>
                <div className="flex flex-wrap gap-2">
                    {castSkillOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-1 rounded-full border ${selectedCastSkills.includes(opt) ? 'bg-secondary border-secondary text-white' : 'bg-primary border-gray-700 text-white'}`}
                            onClick={() => toggle(selectedCastSkills, setSelectedCastSkills, opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            {/* Next button */}
            <div className="px-4 mt-12">
                <button className="w-full bg-secondary text-white py-3 rounded-lg font-bold text-lg" onClick={() => setPage('final')}>次に進む</button>
            </div>
        </div>
    );
}

export default Order; 