import { useState } from 'react';
import { ChevronLeft, Clock, Flag, HelpCircleIcon, MapPin, Ticket, Users, CircleParking } from 'lucide-react';
import StepRequirementScreen from './StepRequirementScreen';

const mockCasts = [
    { name: 'たまごちゃん', tag: 'ロイヤルVIP', age: '', desc: '', img: 'assets/icons/akiko.png', badge: '🌈' },
    { name: 'はいぼーる', tag: 'プレミアム', age: '24歳', desc: 'のみましょお', img: 'assets/icons/ayaka.png', badge: '' },
    { name: 'ゆゆ', tag: 'プレミアム', age: '21歳', desc: '', img: 'assets/icons/ayaka.png', badge: '' },
    { name: 'えり', tag: 'VIP', age: '22歳', desc: 'カラオケ大好き', img: 'assets/icons/haru.png', badge: '🎤' },
    { name: 'かな', tag: 'ロイヤルVIP', age: '25歳', desc: 'お酒強い', img: 'assets/icons/haruka.png', badge: '🍶' },
    { name: 'みき', tag: 'プレミアム', age: '23歳', desc: '英語OK', img: 'assets/icons/kaori.png', badge: '🇬🇧' },
    { name: 'ゆい', tag: 'VIP', age: '20歳', desc: 'ダンス得意', img: 'assets/icons/kotomi.png', badge: '💃' },
];

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

function OrderHistoryScreen({ onBack, onNext }: { onBack: () => void, onNext: () => void }) {
    const [selectedTime, setSelectedTime] = useState('30分後');
    const [selectedArea, setSelectedArea] = useState('東京 / 六本木');
    const [counts, setCounts] = useState([1, 1, 0]);
    const [selectedDuration, setSelectedDuration] = useState('1時間');
    const total = counts.reduce((a, b) => a + b, 0);
    return (
        <div className="max-w-md mx-auto min-h-screen bg-white pb-8">
            <div className="flex items-center px-4 pt-6 pb-2">
                <button onClick={onBack} className="mr-2 text-2xl text-gray-500">
                    <ChevronLeft />
                </button>
                <span className="text-2xl font-bold">注文の確認</span>
            </div>
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold mr-2 flex items-center">
                        <Flag />
                        何分後に合流しますか？
                    </span>
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
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold flex items-center">
                        <MapPin />
                        どこに呼びますか?
                    </span>
                </div>
                <button className="w-full border rounded px-4 py-2 text-left flex items-center">
                    <span>{selectedArea}</span>
                    <span className="ml-auto text-gray-400">&gt;</span>
                </button>
            </div>
            {/* People selection */}
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold flex items-center">
                        <Users />
                        何人呼びますか?
                    </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                    {classOptions.map((opt, idx) => (
                        <div key={opt.name} className="flex items-center mb-3 last:mb-0 justify-between">
                            <div className="flex flex-col min-w-[110px]">
                                <div className="flex items-center">
                                    <span className={`inline-block w-4 h-4 rounded-full mr-2 ${opt.name === 'ロイヤルVIP' ? 'bg-gray-800' : opt.name === 'VIP' ? 'bg-yellow-300' : 'bg-green-300'}`}></span>
                                    <span className={`font-bold ${opt.name === 'ロイヤルVIP' ? 'text-black' : opt.name === 'VIP' ? 'text-yellow-600' : 'text-green-600'}`}>{opt.name}</span>
                                </div>
                                <span className="text-xs text-gray-500 ml-6 mt-0.5">{opt.price.toLocaleString()} P / 30分</span>
                            </div>
                            <div className="flex items-center">
                                <button
                                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-2xl ${counts[idx] === 0 ? 'border-gray-200 text-gray-300 bg-gray-100 cursor-not-allowed' : 'border-gray-300 text-gray-500 bg-white'}`}
                                    onClick={() => counts[idx] > 0 && setCounts(c => c.map((v, i) => i === idx ? Math.max(0, v - 1) : v))}
                                    disabled={counts[idx] === 0}
                                >－</button>
                                <span className={`w-4 text-center font-bold mx-1 ${counts[idx] > 0 ? 'text-orange-500' : 'text-gray-400'}`}>{counts[idx]}</span>
                                <button
                                    className="w-8 h-8 rounded-full border border-gray-300 text-2xl text-orange-500 flex items-center justify-center bg-white"
                                    onClick={() => setCounts(c => c.map((v, i) => i === idx ? v + 1 : v))}
                                >＋</button>
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center mt-2">
                        <span className="text-orange-500 text-sm mr-2 flex items-center"><HelpCircleIcon className="w-4 h-4" /></span>
                        <span className="text-orange-500 text-sm underline cursor-pointer">クラスの説明</span>
                        <span className="ml-auto font-bold">合計：<span className="text-orange-500">{total}人</span></span>
                    </div>
                </div>
            </div>
            {/* Duration selection */}
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold mr-2 flex items-center">
                        <Clock />
                        何時間利用しますか？
                    </span>
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
            {/* Next button */}
            <div className="px-4 mt-32">
                <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold text-lg" onClick={onNext}>次に進む</button>
            </div>
        </div>
    );
}

function OrderDetailConditionsScreen({ onBack, onNext }: { onBack: () => void, onNext: () => void }) {
    const [selectedSituations, setSelectedSituations] = useState<string[]>([]);
    const [selectedCastTypes, setSelectedCastTypes] = useState<string[]>([]);
    const [selectedCastSkills, setSelectedCastSkills] = useState<string[]>([]);
    const toggle = (arr: string[], setArr: (v: string[]) => void, value: string) => {
        setArr(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
    };
    return (
        <div className="max-w-md mx-auto min-h-screen bg-white pb-8">
            <div className="px-4 pt-6 pb-2">
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
            <div className="px-4 mt-32">
                <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold text-lg" onClick={onNext}>次に進む</button>
            </div>
        </div>
    );
}

function OrderFinalConfirmationScreen({ onBack, onConfirmed }: { onBack: () => void, onConfirmed: () => void }) {
    // Static/mock data for now
    return (
        <div className="max-w-md mx-auto min-h-screen bg-white pb-8">
            {/* Back and Title */}
            <div className="flex items-center px-4 pt-6 pb-2">
                <button onClick={onBack} className="mr-2 text-2xl text-gray-500">
                    <ChevronLeft />
                </button>
                <span className="text-2xl font-bold">注文の最終確認</span>
            </div>
            {/* Order summary */}
            <div className="px-4 mt-4">
                <div className="font-bold mb-2">注文内容</div>
                <div className="flex items-center mb-1 text-sm">
                    <span className="w-6">
                        <Clock />
                    </span>
                    <span className="text-gray-500 mr-2">合流予定</span>
                    <span className="ml-auto font-bold">今すぐ(30分後)</span>
                </div>
                <div className="flex items-center mb-1 text-sm">
                    <span className="w-6">
                        <MapPin />
                    </span>
                    <span className="text-gray-500 mr-2">合流エリア</span>
                    <span className="ml-auto font-bold">東京 / 六本木</span>
                </div>
                <div className="flex mb-1 text-sm">
                    <span className="w-6">
                        <Users />
                    </span>
                    <span className="text-gray-500 mr-2">キャスト人数</span>
                    <span className="ml-auto font-bold">ロイヤルVIP：1人<br />VIP：1人</span>
                </div>
                <div className="flex items-center mb-10 text-sm">
                    <span className="w-6">
                        <Clock />
                    </span>
                    <span className="text-gray-500 mr-2">設定時間</span>
                    <span className="ml-auto font-bold">1時間</span>
                </div>
            </div>
            {/* Change button */}
            <div className="px-4 mt-4">
                <button className="w-full font-bold py-2 border-t">変更する</button>
            </div>
            {/* Ohineri and Coupon rows */}
            <div className="px-4 mt-4">
                <div className="flex items-center py-3 border-b">
                    <span className="w-6">
                        <CircleParking />
                    </span>
                    <span className="text-gray-700">おひねりコール</span>
                    <span className="ml-auto font-bold">0P</span>
                    <span className="ml-2 text-gray-400">&gt;</span>
                </div>
                <div className="flex items-center py-3 border-b">
                    <span className="w-6">
                        <Ticket />
                    </span>
                    <span className="text-gray-700">クーポン</span>
                    <span className="ml-auto font-bold text-gray-500">クーポン未所持</span>
                    <span className="ml-2 text-gray-400">&gt;</span>
                </div>
            </div>
            {/* Price breakdown */}
            <div className="px-4 mt-8">
                <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span>ロイヤルVIP 1人</span>
                        <span>25,000P</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>VIP 1人</span>
                        <span>14,000P</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                        <span>小計</span>
                        <span>39,000P</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl mt-4">
                        <span>合計</span>
                        <span>39,000P</span>
                    </div>
                </div>

            </div>
            {/* Confirm button */}
            <div className="px-4 mt-24">
                <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold text-lg" onClick={onConfirmed}>予約を確定する</button>
            </div>
        </div>
    );
}

// Add prop type
type CallScreenProps = {
    onStartOrder?: () => void;
};

const CallScreen: React.FC<CallScreenProps> = ({ onStartOrder }) => {
    const [page, setPage] = useState<'main' | 'orderHistory' | 'orderDetail' | 'orderFinal' | 'stepRequirement'>('main');
    if (page === 'orderHistory') return <OrderHistoryScreen onBack={() => setPage('main')} onNext={() => setPage('orderDetail')} />;
    if (page === 'orderDetail') return <OrderDetailConditionsScreen onBack={() => setPage('orderHistory')} onNext={() => setPage('orderFinal')} />;
    if (page === 'orderFinal') return <OrderFinalConfirmationScreen onBack={() => setPage('orderDetail')} onConfirmed={() => setPage('stepRequirement')} />;
    if (page === 'stepRequirement') return <StepRequirementScreen />;
    return (
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
            {/* Top status bar */}
            <div className="bg-black text-white flex items-center px-4 py-2 text-sm">
                <span className="mr-2">&#x26A0;</span>
                <span>ご利用準備が完了していません</span>
                <span className="ml-auto text-orange-400 font-bold">1/3 完了</span>
                <span className="ml-2">&gt;</span>
            </div>
            {/* Campaign banner */}
            <div className="bg-orange-500 text-white px-4 py-2 text-lg font-bold">今すぐ呼ぶ</div>
            <div className="bg-white px-4 py-2 flex flex-col gap-2">
                <div className=" rounded-lg p-2 flex items-center justify-between">
                    <img src="/assets/icons/logo_call.png" alt="call logo" className=" border-2 border-orange-400 bg-white" />
                </div>
                {/* Area selection */}
                <div className="flex items-center justify-between text-sm mt-2">
                    <span>選択中のエリア：<span className="font-bold">東京 / 六本木</span></span>
                    <button className="text-blue-600">選択</button>
                </div>
            </div>
            {/* Quick Call */}
            <div className="bg-white mt-3 px-4 py-4 rounded-lg mx-2">
                <div className="font-bold text-lg mb-2">おまかせで呼ぶ</div>
                <div className="flex items-center mb-2">
                    <div className="flex -space-x-2">
                        <img src="assets/icons/akiko.png" alt="VIP" className="w-10 h-10 rounded-full border-2 border-yellow-400" />
                        <img src="assets/icons/akiko.png" alt="Premium" className="w-10 h-10 rounded-full border-2 border-green-400" />
                        <img src="assets/icons/akiko.png" alt="Royal VIP" className="w-10 h-10 rounded-full border-2 border-gray-400" />
                    </div>
                    <span className="ml-4 text-gray-500 text-sm">待機キャスト数</span>
                    <span className="ml-2 font-bold text-xl">308人</span>
                </div>
                <button className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold mt-2" onClick={() => onStartOrder && onStartOrder()}>人数を決める</button>
            </div>
            {/* Choose Call */}
            <div className="bg-white mt-3 px-4 py-4 rounded-lg mx-2">
                <div className="font-bold text-lg mb-2">選んで呼ぶ</div>
                <div className="flex items-center mb-2">
                    <img src="assets/icons/ayaka.png" alt="cast" className="w-10 h-10 rounded-full border-2 border-orange-400" />
                    <span className="ml-4 text-gray-500 text-sm">現在のキャスト数</span>
                    <span className="ml-2 font-bold text-xl">6人</span>
                </div>
                <button className="w-full border border-orange-500 text-orange-500 py-2 rounded-lg font-bold mt-2" onClick={() => onStartOrder && onStartOrder()}>キャストを選ぶ</button>
            </div>
            {/* Order history - styled as in the second image */}
            <div className="mx-2 mt-3">
                <button
                    className="w-full flex items-center justify-between bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-3 rounded-lg shadow font-bold text-base focus:outline-none"
                    onClick={() => setPage('orderHistory')}
                >
                    <span className="flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M9 7h6" stroke="currentColor" strokeWidth="2" /><path d="M9 11h6" stroke="currentColor" strokeWidth="2" /><path d="M9 15h2" stroke="currentColor" strokeWidth="2" /></svg>
                        注文履歴の確認
                    </span>
                    <span className="ml-2">&gt;</span>
                </button>
            </div>
            {/* 今日会えるキャスト */}
            <div className="mt-4 px-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-base">今日会えるキャスト</span>
                    <button className="text-orange-500 text-sm">すべて見る &gt;</button>
                </div>
                <div className="flex overflow-x-auto">
                    {mockCasts.map((cast, idx) => (
                        <div key={idx} className="bg-white rounded-lg shadow p-2 min-w-[120px] flex-shrink-0">
                            <img src={cast.img} alt={cast.name} className="w-20 h-20 rounded-lg object-cover mb-1" />
                            <div className="text-xs font-bold mb-1">
                                <span className={cast.tag === 'ロイヤルVIP' ? 'bg-yellow-400 text-white px-1 rounded' : cast.tag === 'プレミアム' ? 'bg-green-400 text-white px-1 rounded' : 'bg-gray-400 text-white px-1 rounded'}>{cast.tag}</span>
                            </div>
                            <div className="text-xs font-bold">{cast.name} {cast.badge}</div>
                            {cast.age && <div className="text-xs text-gray-500">{cast.age} {cast.desc}</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CallScreen; 