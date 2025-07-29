
import { useState, useEffect } from 'react';
import { ChevronLeft, Clock, Flag, HelpCircleIcon, MapPin, Users, CalendarArrowUp, ChevronRight, Minus, Plus, X } from 'lucide-react';
import StepRequirementScreen from './StepRequirementScreen';
import { createReservation, fetchRanking, getGuestChats } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import MyOrderPage from './MyOrderPage';
import React from 'react'; // Added for React.useEffect

const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
// Add interface for applied cast data
interface AppliedCast {
    id: number;
    cast_id: number;
    cast_nickname: string;
    avatar?: string;
    last_message?: string;
    updated_at?: string;
    unread?: number;
}




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

// Add modal component for custom time selection
function CustomTimeModal({ isOpen, onClose, onConfirm }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (hours: number) => void;
}) {
    const [selectedHours, setSelectedHours] = useState(1);

    const handleConfirm = () => {
        onConfirm(selectedHours);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-primary border border-secondary rounded-lg p-6 w-80 max-w-[90%]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">合流時間を選択</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-white mb-2">何時間後に合流しますか？</label>
                    <select
                        className="w-full border rounded px-4 py-2 text-left border-secondary bg-primary text-white appearance-none focus:outline-none focus:ring-2 focus:ring-secondary"
                        value={selectedHours}
                        onChange={e => setSelectedHours(Number(e.target.value))}
                    >
                        {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i + 1}>{i + 1}時間後</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 border border-gray-700 text-white rounded hover:bg-gray-700"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 bg-secondary text-white py-2 rounded hover:bg-red-700"
                    >
                        確定
                    </button>
                </div>
            </div>
        </div>
    );
}

function OrderHistoryScreen({ onBack, onNext, selectedTime, setSelectedTime, selectedArea, setSelectedArea, counts, setCounts, selectedDuration, setSelectedDuration }: {
    onBack: () => void,
    onNext: () => void,
    selectedTime: string,
    setSelectedTime: (v: string) => void,
    selectedArea: string,
    setSelectedArea: (v: string) => void,
    counts: number[],
    setCounts: (v: number[]) => void,
    selectedDuration: string,
    setSelectedDuration: (v: string) => void,
}) {
    const total = counts.reduce((a, b) => a + b, 0);
    const [showCustomTimeModal, setShowCustomTimeModal] = useState(false);

    const handleTimeSelection = (time: string) => {
        if (time === 'それ以外') {
            setShowCustomTimeModal(true);
        } else {
            setSelectedTime(time);
        }
    };

    const handleCustomTimeConfirm = (hours: number) => {
        setSelectedTime(`${hours}時間後`);
    };

    return (
        <div>
            <div className="flex items-center px-4 pt-6 pb-2">
                <button onClick={onBack} className="mr-2 text-2xl text-white">
                    <ChevronLeft />
                </button>
                <span className="text-2xl font-bold text-white">注文の確認</span>
            </div>
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold mr-2 flex items-center text-white">
                        <Flag />
                        何分後に合流しますか？
                    </span>
                    <span className="text-white text-sm ml-auto">*必須</span>
                </div>
                <div className="flex gap-2 mb-6">
                    {timeOptions.map(opt => {
                        const displayText = opt === 'それ以外' && selectedTime.includes('時間後') ? selectedTime : opt;
                        const isSelected = selectedTime === opt || (opt === 'それ以外' && selectedTime.includes('時間後'));

                        return (
                            <button
                                key={opt}
                                className={`px-4 py-2 rounded border ${isSelected ? 'bg-secondary text-white border-secondary' : 'bg-primary text-white border-gray-700'}`}
                                onClick={() => handleTimeSelection(opt)}
                            >{displayText}</button>
                        );
                    })}
                </div>
            </div>
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold flex items-center text-white">
                        <MapPin />
                        どこに呼びますか?
                    </span>
                </div>
                <select
                    className="w-full border rounded px-4 py-2 text-left border-secondary bg-primary text-white appearance-none focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={selectedArea}
                    onChange={e => setSelectedArea(e.target.value)}
                >
                    <option value="東京都">東京都</option>
                    <option value="大阪府">大阪府</option>
                    <option value="愛知県">愛知県</option>
                    <option value="福岡県">福岡県</option>
                    <option value="北海道">北海道</option>
                </select>
            </div>
            {/* People selection */}
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold flex items-center text-white">
                        <Users />
                        何人呼びますか?
                    </span>
                </div>
                <div className="bg-primary rounded-lg p-4 border border-secondary">
                    {classOptions.map((opt, idx) => (
                        <div key={opt.name} className="flex items-center mb-4 last:mb-0 justify-between">
                            <div className="flex flex-col min-w-[110px]">
                                <div className="flex items-center">
                                    <span className={`inline-block w-4 h-4 rounded-full mr-2 ${opt.name === 'ロイヤルVIP' ? 'bg-secondary' : opt.name === 'VIP' ? 'bg-red-400' : 'bg-gray-700'}`}></span>
                                    <span className={`font-bold text-white`}>{opt.name}</span>
                                </div>
                                <span className="text-xs text-white ml-6 mt-0.5">{opt.price.toLocaleString()} P / 30分</span>
                            </div>
                            <div className="flex items-center">
                                <button
                                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-2xl ${counts[idx] === 0 ? 'border-gray-800 text-gray-700 bg-gray-900 cursor-not-allowed' : 'border-secondary text-white bg-primary'}`}
                                    onClick={() => counts[idx] > 0 && setCounts(counts.map((v, i) => i === idx ? Math.max(0, v - 1) : v))}
                                    disabled={counts[idx] === 0}
                                >
                                    <Minus />
                                </button>
                                <span className={`w-4 text-center font-bold mx-1 ${counts[idx] > 0 ? 'text-white' : 'text-gray-400'}`}>{counts[idx]}</span>
                                <button
                                    className="w-8 h-8 rounded-full border border-secondary text-2xl text-white flex items-center justify-center bg-primary"
                                    onClick={() => setCounts(counts.map((v, i) => i === idx ? v + 1 : v))}
                                >
                                    <Plus />
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center mt-2">
                        <span className="text-white text-sm mr-2 flex items-center"><HelpCircleIcon className="w-4 h-4" /></span>
                        <span className="text-white text-sm underline cursor-pointer">クラスの説明</span>
                        <span className="ml-auto font-bold text-white">合計：<span className="text-white">{total}人</span></span>
                    </div>
                </div>
            </div>
            {/* Duration selection */}
            <div className="px-4 mt-4">
                <div className="flex items-center mb-8">
                    <span className="font-bold mr-2 flex items-center text-white">
                        <Clock />
                        何時間利用しますか？
                    </span>
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
            {/* Next button */}
            <div className="px-4 mt-4">
                <button className="w-full bg-secondary text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition" onClick={onNext}>次に進む</button>
            </div>
            <CustomTimeModal
                isOpen={showCustomTimeModal}
                onClose={() => setShowCustomTimeModal(false)}
                onConfirm={handleCustomTimeConfirm}
            />
        </div>
    );
}

function OrderDetailConditionsScreen({ onBack, onNext, selectedSituations, setSelectedSituations, selectedCastTypes, setSelectedCastTypes, selectedCastSkills, setSelectedCastSkills }: {
    onBack: () => void,
    onNext: () => void,
    selectedSituations: string[],
    setSelectedSituations: (v: string[]) => void,
    selectedCastTypes: string[],
    setSelectedCastTypes: (v: string[]) => void,
    selectedCastSkills: string[],
    setSelectedCastSkills: (v: string[]) => void,
}) {
    const toggle = (arr: string[], setArr: (v: string[]) => void, value: string) => {
        setArr(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
    };
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
            <div className="px-4 pt-6 pb-2">
                <span className="text-xl font-bold text-white">その他詳細条件 <span className="bg-secondary text-xs px-2 py-1 rounded align-middle text-white">任意</span></span>
            </div>
            {/* シチュエーション */}
            <div className="px-4 mt-8">
                <div className="font-bold mb-6 text-white">シチュエーション</div>
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
            <div className="px-4 mt-4">
                <div className="font-bold mb-6 text-white">キャストタイプ</div>
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
            <div className="px-4 mt-4">
                <div className="font-bold mb-6 text-white">キャストスキル</div>
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
            <div className="px-4 mt-8">
                <button className="w-full bg-secondary text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition" onClick={onNext}>次に進む</button>
            </div>
        </div>
    );
}

function OrderFinalConfirmationScreen({
    onBack,
    onConfirmed,
    selectedTime,
    selectedArea,
    counts,
    selectedDuration,
    selectedSituations,
    selectedCastTypes,
    selectedCastSkills,
    // onReservationSuccess,
}: {
    onBack: () => void;
    onConfirmed: () => void;
    selectedTime: string;
    selectedArea: string;
    counts: number[];
    selectedDuration: string;
    selectedSituations: string[];
    selectedCastTypes: string[];
    selectedCastSkills: string[];
    // onReservationSuccess: () => void;
}) {
    const { user } = useUser();
    const [reservationMessage, setReservationMessage] = useState<string | null>(null);

    // Calculate total cost
    const totalCost = 12500 * counts[0] * (selectedDuration.includes('以上') ? 4 : Number(selectedDuration.replace('時間', ''))) * 60 / 30 +
        7000 * counts[1] * (selectedDuration.includes('以上') ? 4 : Number(selectedDuration.replace('時間', ''))) * 60 / 30 +
        4750 * counts[2] * (selectedDuration.includes('以上') ? 4 : Number(selectedDuration.replace('時間', ''))) * 60 / 30;

    // Check if user has enough points
    const hasEnoughPoints = user && user.points && user.points >= totalCost;
    const handleReservation = async () => {
        if (!user) return;

        // Check if user has enough points
        if (!hasEnoughPoints) {
            setReservationMessage('ポイントが不足しているため、予約を作成できません。');
            return;
        }

        // Format date as MySQL DATETIME string
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const toMysqlDatetime = (date: Date) =>
            `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        const hours = selectedDuration.includes('以上') ? 4 : Number(selectedDuration.replace('時間', ''));
        try {
            // Calculate scheduled time based on selectedTime format
            let scheduledTime: Date;
            if (selectedTime.includes('時間後')) {
                const customHours = parseInt(selectedTime.replace('時間後', ''));
                scheduledTime = new Date(now.getTime() + customHours * 60 * 60 * 1000);
            } else {
                const minutes = parseInt(selectedTime.replace('分後', ''));
                scheduledTime = new Date(now.getTime() + minutes * 60 * 1000);
            }

            await createReservation({
                guest_id: user.id,
                scheduled_at: toMysqlDatetime(scheduledTime),
                location: selectedArea,
                duration: hours, // always a number, 4 if '4時間以上'
                details: `VIP:${counts[1]}人, ロイヤルVIP:${counts[0]}人, プレミアム:${counts[2]}人, シチュ: ${selectedSituations.join(',')}, タイプ: ${selectedCastTypes.join(',')}, スキル: ${selectedCastSkills.join(',')}`,
                time: selectedTime, // store the selected time
            });
            setReservationMessage('予約が完了しました');

            // Trigger ranking update by fetching current rankings
            try {
                await fetchRanking({
                    userType: 'guest',
                    timePeriod: 'current',
                    category: 'reservation',
                    area: '全国'
                });
            } catch (error) {
                console.log('Ranking refresh failed:', error);
            }

            // Navigate to main call screen after reservation
            // onReservationSuccess();
            onConfirmed();
        } catch {
            setReservationMessage('予約に失敗しました');
        }
    };
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
            {/* Back and Title */}
            <div className="flex items-center px-4 pt-6 pb-2">
                <button onClick={onBack} className="mr-2 text-2xl text-white">
                    <ChevronLeft />
                </button>
                <span className="text-2xl font-bold text-white">注文の最終確認</span>
            </div>
            {/* Order summary */}
            <div className="px-4 mt-4">
                <div className="font-bold mb-2 text-white">注文内容</div>
                <div className="flex items-center mb-1 text-sm">
                    <span className="w-6">
                        <Clock />
                    </span>
                    <span className="text-white mr-2">合流予定</span>
                    <span className="ml-auto font-bold text-white">{selectedTime}</span>
                </div>
                <div className="flex items-center mb-1 text-sm">
                    <span className="w-6">
                        <MapPin />
                    </span>
                    <span className="text-white mr-2">合流エリア</span>
                    <span className="ml-auto font-bold text-white">{selectedArea}</span>
                </div>
                <div className="flex mb-1 text-sm">
                    <span className="w-6">
                        <Users />
                    </span>
                    <span className="text-white mr-2">キャスト人数</span>
                    <span className="ml-auto font-bold text-white">ロイヤルVIP：{counts[0]}人<br />VIP：{counts[1]}人<br />プレミアム：{counts[2]}人</span>
                </div>
                <div className="flex items-center mb-10 text-sm">
                    <span className="w-6">
                        <Clock />
                    </span>
                    <span className="text-white mr-2">設定時間</span>
                    <span className="ml-auto font-bold text-white">{selectedDuration}</span>
                </div>
                {/* Show selected situations, cast types, and skills if any */}
                {selectedSituations.length > 0 && (
                    <div className="text-white text-sm mb-1">シチュエーション: {selectedSituations.join(', ')}</div>
                )}
                {selectedCastTypes.length > 0 && (
                    <div className="text-white text-sm mb-1">キャストタイプ: {selectedCastTypes.join(', ')}</div>
                )}
                {selectedCastSkills.length > 0 && (
                    <div className="text-white text-sm mb-1">キャストスキル: {selectedCastSkills.join(', ')}</div>
                )}
            </div>
            {/* Change button */}
            <div className="px-4 mt-4">
                <button className="w-full font-bold py-2 border-t border-secondary text-white">変更する</button>
            </div>
            {/* Ohineri and Coupon rows */}
            {/* <div className="px-4 mt-4">
                <div className="flex items-center py-3 border-b border-secondary">
                    <span className="w-6">
                        <CircleParking />
                    </span>
                    <span className="text-white">おひねりフリー一覧</span>
                    <span className="ml-auto font-bold text-white">0P</span>
                    <span className="ml-2 text-white">&gt;</span>
                </div>
                <div className="flex items-center py-3 border-b border-secondary">
                    <span className="w-6">
                        <Ticket />
                    </span>
                    <span className="text-white">クーポン</span>
                    <span className="ml-auto font-bold text-white">クーポン未所持</span>
                    <span className="ml-2 text-white">&gt;</span>
                </div>
            </div> */}
            {/* Price breakdown */}
            <div className="px-4 mt-8">
                <div className="bg-primary rounded-lg p-4 border border-secondary">
                    <div className="flex justify-between text-sm mb-1 text-white">
                        <span>ロイヤルVIP {counts[0]}人</span>
                        <span>{12500 * counts[0] * (selectedDuration.includes('以上') ? 4 : Number(selectedDuration.replace('時間', ''))) * 60 / 30}P</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1 text-white">
                        <span>VIP {counts[1]}人</span>
                        <span>{7000 * counts[1] * (selectedDuration.includes('以上') ? 4 : Number(selectedDuration.replace('時間', ''))) * 60 / 30}P</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1 text-white">
                        <span>プレミアム {counts[2]}人</span>
                        <span>{4750 * counts[2] * (selectedDuration.includes('以上') ? 4 : Number(selectedDuration.replace('時間', ''))) * 60 / 30}P</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2 text-white">
                        <span>小計</span>
                        <span>{12500 * counts[0] * (selectedDuration.includes('以上') ? 4 : Number(selectedDuration.replace('時間', ''))) * 60 / 30 + 7000 * counts[1] * (selectedDuration.includes('以上') ? 4 : Number(selectedDuration.replace('時間', ''))) * 60 / 30 + 4750 * counts[2] * (selectedDuration.includes('以上') ? 4 : Number(selectedDuration.replace('時間', ''))) * 60 / 30}P</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl mt-4 text-white">
                        <span>合計</span>
                        <span>{12500 * counts[0] * (selectedDuration.includes('以上') ? 4 : Number(selectedDuration.replace('時間', ''))) * 60 / 30 + 7000 * counts[1] * (selectedDuration.includes('以上') ? 4 : Number(selectedDuration.replace('時間', ''))) * 60 / 30 + 4750 * counts[2] * (selectedDuration.includes('以上') ? 4 : Number(selectedDuration.replace('時間', ''))) * 60 / 30}P</span>
                    </div>
                </div>
            </div>
            {/* Confirm button */}
            <div className="px-4 mt-4">
                <button
                    className={`w-full py-3 rounded-lg font-bold text-lg transition ${hasEnoughPoints
                            ? 'bg-secondary text-white hover:bg-red-700'
                            : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        }`}
                    onClick={handleReservation}
                    disabled={!hasEnoughPoints}
                >
                    予約を確定する
                </button>
                {!hasEnoughPoints && (
                    <div className="text-red-400 text-center mt-2 text-sm">
                        ポイントが不足しているため、予約を作成できません。
                    </div>
                )}
                {reservationMessage && (
                    <div className={`text-center mt-2 text-sm ${reservationMessage.includes('不足') ? 'text-red-400' : 'text-white'
                        }`}>
                        {reservationMessage}
                    </div>
                )}
            </div>
        </div>
    );
}

// Add prop type
type CallScreenProps = {
    onStartOrder?: () => void;
};

const CallScreen: React.FC<CallScreenProps> = ({ onStartOrder }) => {
    // Add state to pass order data between steps
    const [selectedTime, setSelectedTime] = useState('30分後');
    const [selectedArea, setSelectedArea] = useState('東京都');
    const [counts, setCounts] = useState([1, 1, 0]);
    const [selectedDuration, setSelectedDuration] = useState('1時間');
    const [selectedSituations, setSelectedSituations] = useState<string[]>([]);
    const [selectedCastTypes, setSelectedCastTypes] = useState<string[]>([]);
    const [selectedCastSkills, setSelectedCastSkills] = useState<string[]>([]);
    const [page, setPage] = useState<'main' | 'orderHistory' | 'orderDetail' | 'orderFinal' | 'stepRequirement'>('main');
    const [showAreaModal, setShowAreaModal] = useState(false);
    const [showMyOrder, setShowMyOrder] = useState(false);
    const [showStepRequirement, setShowStepRequirement] = useState(false);

    // Add state for applied casts
    const [appliedCasts, setAppliedCasts] = useState<AppliedCast[]>([]);
    const [loadingAppliedCasts, setLoadingAppliedCasts] = useState(false);
    const { user } = useUser();

    // Fetch applied casts when component mounts
    useEffect(() => {
        const fetchAppliedCasts = async () => {
            if (!user?.id) return;

            setLoadingAppliedCasts(true);
            try {
                const chats = await getGuestChats(user.id, 'guest');
                // Transform chat data to get cast information and remove duplicates
                const castMap = new Map();

                chats.forEach((chat: any) => {
                    const castId = chat.cast_id;
                    if (castId && !castMap.has(castId)) {
                        castMap.set(castId, {
                            id: chat.id,
                            cast_id: chat.cast_id,
                            cast_nickname: chat.cast_nickname,
                            avatar: chat.avatar,
                            last_message: chat.last_message,
                            updated_at: chat.updated_at,
                            unread: chat.unread
                        });
                    }
                });

                const uniqueCasts = Array.from(castMap.values());
                setAppliedCasts(uniqueCasts);
            } catch (error) {
                console.error('Failed to fetch applied casts:', error);
                setAppliedCasts([]);
            } finally {
                setLoadingAppliedCasts(false);
            }
        };

        fetchAppliedCasts();
    }, [user?.id]);

    if (showMyOrder) return <MyOrderPage onBack={() => setShowMyOrder(false)} />;
    if (page === 'orderHistory') return (
        <OrderHistoryScreen
            onBack={() => setPage('main')}
            onNext={() => setPage('orderDetail')}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
            counts={counts}
            setCounts={setCounts}
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
        />
    );
    if (page === 'orderDetail') return (
        <OrderDetailConditionsScreen
            onBack={() => setPage('orderHistory')}
            onNext={() => setPage('orderFinal')}
            selectedSituations={selectedSituations}
            setSelectedSituations={setSelectedSituations}
            selectedCastTypes={selectedCastTypes}
            setSelectedCastTypes={setSelectedCastTypes}
            selectedCastSkills={selectedCastSkills}
            setSelectedCastSkills={setSelectedCastSkills}
        />
    );
    if (page === 'orderFinal') return (
        <OrderFinalConfirmationScreen
            onBack={() => setPage('orderDetail')}
            onConfirmed={() => {
                setPage('main');
            }}
            selectedTime={selectedTime}
            selectedArea={selectedArea}
            counts={counts}
            selectedDuration={selectedDuration}
            selectedSituations={selectedSituations}
            selectedCastTypes={selectedCastTypes}
            selectedCastSkills={selectedCastSkills}
        // onReservationSuccess={() => setPage('main')}
        />
    );
    if (showStepRequirement) return <StepRequirementScreen onBack={() => setShowStepRequirement(false)} />;
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-20">
            <div className="bg-secondary text-white px-4 py-2 text-lg font-bold">今すぐ呼ぶ</div>
            <div className="flex flex-row items-center justify-between text-white px-4 py-2 text-md font-bold">
                <div>
                    ! ご利用準備が完了していません !
                </div>
                <div onClick={() => setShowStepRequirement(true)} className='cursor-pointer'>
                    <ChevronRight />
                </div>
            </div>
            <div className="bg-primary px-4 py-2 flex flex-col gap-2 border-b border-secondary">
                <div className="rounded-lg p-2 flex items-center justify-between">
                    <img src="/assets/icons/logo_call.png" alt="call logo" className="border-2 border-secondary bg-primary" />
                </div>
                {/* Area selection */}
                <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-white">選択中のエリア：<span className="font-bold text-white">{selectedArea}</span></span>
                    <button className="text-white" onClick={() => setShowAreaModal(true)}>選択</button>
                </div>
                <AreaSelectModal
                    isOpen={showAreaModal}
                    onClose={() => setShowAreaModal(false)}
                    onSelect={setSelectedArea}
                    selectedArea={selectedArea}
                />
            </div>
            {/* Quick Call */}
            <div className="bg-primary mt-3 px-4 py-4 rounded-lg mx-2 border border-secondary">
                <div className="font-bold text-lg mb-2 text-white">フリー</div>
                <div className="flex items-center mb-2">
                    <div className="flex -space-x-2">
                        <img src="assets/icons/akiko.png" alt="VIP" className="w-10 h-10 rounded-full border-2 border-secondary" />
                        <img src="assets/icons/akiko.png" alt="Premium" className="w-10 h-10 rounded-full border-2 border-secondary" />
                        <img src="assets/icons/akiko.png" alt="Royal VIP" className="w-10 h-10 rounded-full border-2 border-secondary" />
                    </div>
                    <span className="ml-4 text-white text-sm">待機キャスト数</span>
                </div>
                <button className="w-full bg-secondary text-white py-2 rounded-lg font-bold mt-2 hover:bg-red-700 transition" onClick={() => onStartOrder && onStartOrder()}>人数を決める</button>
            </div>
            {/* Choose Call */}
            <div className="bg-primary mt-3 px-4 py-4 rounded-lg mx-2 border border-secondary">
                <div className="font-bold text-lg mb-2 text-white">ピシャット</div>
                <div className="flex items-center mb-2">
                    <img src="assets/icons/ayaka.png" alt="cast" className="w-10 h-10 rounded-full border-2 border-secondary" />
                    <span className="ml-4 text-white text-sm">現在のキャスト数</span>
                </div>
                <button className="w-full border border-secondary text-white py-2 rounded-lg font-bold mt-2 hover:bg-red-600 hover:text-white transition" onClick={() => setPage("orderHistory")}>キャストを選ぶ</button>
            </div>
            {/* Order history - styled as in the second image */}
            <div className="mx-2 mt-3">
                <button
                    className="w-full flex items-center justify-between bg-gradient-to-r bg-secondary text-white px-4 py-3 rounded-lg shadow font-bold text-base focus:outline-none"
                    onClick={() => setShowMyOrder(true)}
                >
                    <span className="flex items-center">
                        <CalendarArrowUp />
                        注文履歴の確認
                    </span>
                    <span className="ml-2">
                        <ChevronRight />
                    </span>
                </button>
            </div>
            {/* 今日会えるキャスト */}
            <div className="mt-4 px-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-base text-white">今日会えるキャスト</span>
                    <button className="text-white text-sm">すべて見る &gt;</button>
                </div>
                <div className="flex overflow-x-auto">
                    {loadingAppliedCasts ? (
                        <div className="text-white text-sm">読み込み中...</div>
                    ) : appliedCasts.length > 0 ? (
                        appliedCasts.map((cast, idx) => (
                            <div key={cast.id} className="bg-primary rounded-lg shadow p-2 min-w-[120px] flex-shrink-0 border border-secondary mr-2">
                                <img
                                    src={`${APP_BASE_URL}/${cast.avatar}`}
                                    alt={cast.cast_nickname}
                                    className="w-20 h-20 rounded-lg object-cover mb-1 border-2 border-secondary"
                                />
                                <div className="text-xs font-bold mb-1">
                                    <span className="bg-secondary text-white px-1 rounded">プレミアム</span>
                                </div>
                                <div className="text-xs font-bold text-white">{cast.cast_nickname}</div>
                            </div>
                        ))
                    ) : (
                        <div className="text-white text-sm">まだキャストからの応募はありません</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Area selection modal
function AreaSelectModal({ isOpen, onClose, onSelect, selectedArea }: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (area: string) => void;
    selectedArea: string;
}) {
    const areaOptions = [
        '東京都', '大阪府', '愛知県', '福岡県', '北海道'
    ];
    const [area, setArea] = useState(selectedArea);

    // Keep modal in sync with prop
    React.useEffect(() => { setArea(selectedArea); }, [selectedArea, isOpen]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-primary border border-secondary rounded-lg p-6 w-80 max-w-[90%]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">エリアを選択</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>
                <div className="mb-6">
                    <select
                        className="w-full border rounded px-4 py-2 text-left border-secondary bg-primary text-white appearance-none focus:outline-none focus:ring-2 focus:ring-secondary"
                        value={area}
                        onChange={e => setArea(e.target.value)}
                    >
                        {areaOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 border border-gray-700 text-white rounded hover:bg-gray-700"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={() => { onSelect(area); onClose(); }}
                        className="flex-1 bg-secondary text-white py-2 rounded hover:bg-red-700"
                    >
                        決定
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CallScreen; 