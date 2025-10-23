/*eslint-disable */
// Ensure this file is treated as a module
export {};
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Flag, UserRound, HelpCircleIcon, MapPin, Users, CalendarArrowUp, ChevronRight, Minus, Plus, X, Calendar, CheckCircle } from 'lucide-react';
import StepRequirementScreen from './StepRequirementScreen';
import { createFreeCall, createFreeCallReservation, fetchRanking, getGuestChats, getCastCountsByLocation, getCastList, getPaymentInfo, getGuestProfileById } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { locationService } from '../../services/locationService';
import MyOrderPage from './MyOrderPage';
import OrderConfirmationPage from './OrderConfirmationPage';
import OrderCompletionPage from './OrderCompletionPage';
import InsufficientPointsModal from './InsufficientPointsModal';
import Spinner from '../ui/Spinner';

import React from 'react'; // Added for React.useEffect

// API base URL configuration
const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Utility function to get the first available avatar from comma-separated string
const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
    if (!avatarString) {
        return '/assets/avatar/female.png';
    }

    // Split by comma and get the first non-empty avatar
    const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);

    if (avatars.length === 0) {
        return '/assets/avatar/female.png';
    }

    return `${APP_BASE_URL}/${avatars[0]}`;
};

// Utility function to get category-specific styles
const getCategoryStyles = (category: string): string => {
    switch (category) {
        case 'プレミアム':
            return 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-2 py-1 rounded-md shadow-lg w-fit';
        case 'VIP':
            return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-md shadow-lg w-fit';
        case 'ロイヤルVIP':
            return 'bg-gradient-to-r from-red-600 to-pink-600 text-white px-2 py-1 rounded-md shadow-lg w-fit';
        default:
            return 'bg-gray-600 text-white px-2 py-1 rounded-md shadow-lg w-fit';
    }
};

// Helper to work with combined area values like "name/prefecture"
const getAreaNamePart = (area: string | undefined | null): string => {
    if (!area) return '';
    const parts = String(area).split('/');
    return parts[0] || '';
};

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
    { name: 'ロイヤルVIP', color: 'bg-gray-800', price: 18000 },
    { name: 'VIP', color: 'bg-yellow-300', price: 15000 },
    { name: 'プレミアム', color: 'bg-green-300', price: 12000 },
];

const timeOptions = ['30分後', '60分後', '90分後', 'それ以外'];
const durationOptions = ['1分', '1時間', '2時間', '3時間', '4時間以上'];

const ageOptions = [
    '20代前半', '20代後半', '30代前半', '30代後半'
]

const castTypeOptions = [
    '学生', '童顔', '綺麗系', 'ギャル', '清楚', 'スレンダー', 'グラマー', 'ハーフ', '小柄', 'プロ歓迎', '最近入会'
];

const massageIntensityOptions = [
    '弱め', '普通', '強め'
];  

const tiredAreasOptions = [
    'ふくらはぎ', '太もも', '足の裏', '肩', '腕', '背中'
];

const conversationOptions = [
    '多め', '普通', '少なめ', '無し'
];

const oilScentOptions = [
    '無香料', 'イランイラン', '柑橘系', 'ラベンダー'
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

// Modal for custom duration hours
function CustomDurationModal({ isOpen, onClose, onConfirm }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (hours: number) => void;
}) {
    const [selectedHours, setSelectedHours] = useState(4);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-primary border border-secondary rounded-lg p-6 w-80 max-w-[90%]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">利用時間を選択</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>
                <div className="mb-6">
                    <label className="block text-white mb-2">何時間利用しますか？</label>
                    <select
                        className="w-full border rounded px-4 py-2 text-left border-secondary bg-primary text-white appearance-none focus:outline-none focus:ring-2 focus:ring-secondary"
                        value={selectedHours}
                        onChange={e => setSelectedHours(Number(e.target.value))}
                    >
                        {Array.from({ length: 21 }, (_, i) => i + 4).map(hour => (
                            <option key={hour} value={hour}>{hour}時間</option>
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
                        onClick={() => { onConfirm(selectedHours); onClose(); }}
                        className="flex-1 bg-secondary text-white py-2 rounded hover:bg-red-700"
                    >
                        決定
                    </button>
                </div>
            </div>
        </div>
    );
}

// Add a simple Stepper component for progress indication
function Stepper({ step }: { step: number }) {
    const steps = ['内容入力', '詳細条件', '最終確認'];
    return (
        <div className="flex items-center justify-center gap-2 py-4">
            {steps.map((label, idx) => (
                <div key={label} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-200 ${idx < step ? 'bg-secondary border-secondary text-white' : idx === step ? 'bg-white border-secondary text-secondary' : 'bg-white border-gray-300 text-gray-400'
                        }`}>{idx + 1}</div>
                    {idx < steps.length - 1 && <div className="w-8 h-1 bg-gradient-to-r from-secondary to-gray-300 mx-1 rounded" />}
                </div>
            ))}
        </div>
    );
}

function OrderHistoryScreen({ onBack, onNext, selectedTime, setSelectedTime, selectedArea, setSelectedArea, counts, setCounts, selectedDuration, setSelectedDuration, customDurationHours, setCustomDurationHours }: {
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
    customDurationHours: number | null,
    setCustomDurationHours: (v: number | null) => void,
}) {
    const total = counts.reduce((a, b) => a + b, 0);
    const [showCustomTimeModal, setShowCustomTimeModal] = useState(false);
    const [showCustomDurationModal, setShowCustomDurationModal] = useState(false);
    const [areaOptions, setAreaOptions] = useState<{ name: string; prefecture: string }[]>([]);
    const [areasLoading, setAreasLoading] = useState<boolean>(false);
    const [areasError, setAreasError] = useState<string | null>(null);
    const [showAreaModal, setShowAreaModal] = useState<boolean>(false);

    // Fetch active locations and format as `prefecture/name`
    useEffect(() => {
        const loadAreas = async () => {
            try {
                setAreasLoading(true);
                setAreasError(null);
                // Use public API: name -> [prefecture]
                const mapping = await locationService.getPrefecturesByLocation();
                const pairs: { name: string; prefecture: string }[] = [];
                Object.entries(mapping || {}).forEach(([name, prefs]) => {
                    (prefs as string[]).forEach((pref) => {
                        if (pref && name) {
                            pairs.push({ name, prefecture: pref });
                        }
                    });
                });
                // Deduplicate by key `${prefecture}/${name}`
                const seen = new Set<string>();
                const unique = pairs.filter(p => {
                    const key = `${p.name}/${p.prefecture}`;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
                setAreaOptions(unique);
                // Initialize selection if current value is not present
                const combinedSet = new Set(unique.map(p => `${p.name}/${p.prefecture}`));
                const hasCombined = selectedArea && combinedSet.has(selectedArea);
                const hasNameOnly = unique.some(p => p.name === selectedArea);
                if ((!hasCombined && !hasNameOnly) && unique.length > 0) {
                    setSelectedArea(`${unique[0].name}/${unique[0].prefecture}`);
                }
            } catch (e) {
                console.error('Failed to load areas:', e);
                setAreasError('エリアの取得に失敗しました');
                setAreaOptions([]);
            } finally {
                setAreasLoading(false);
            }
        };
        loadAreas();
    }, []);

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

    const handleDurationSelection = (duration: string) => {
        if (duration === '4時間以上') {
            setShowCustomDurationModal(true);
        } else {
            setSelectedDuration(duration);
            setCustomDurationHours(null);
        }
    };

    const handleCustomDurationConfirm = (hours: number) => {
        setSelectedDuration(`${hours}時間`);
        setCustomDurationHours(hours);
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-primary to-secondary pb-8">
            <Stepper step={0} />
            <div className="flex items-center px-4 pt-2 pb-2">
                <button onClick={onBack} className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer transition-colors p-2 rounded-full hover:bg-white/10">
                    <ChevronLeft />
                </button>
                <span className="text-2xl font-bold text-white">注文の確認</span>
            </div>
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold mr-2 flex items-center text-white">
                        <Clock />
                        何分後に合流しますか？
                    </span>
                    <span className="text-white text-sm ml-auto">*必須</span>
                </div>
                <div className="flex gap-2 mb-6 flex-wrap">
                    {timeOptions.map(opt => {
                        const displayText = opt === 'それ以外' && selectedTime.includes('時間後') ? selectedTime : opt;
                        const isSelected = selectedTime === opt || (opt === 'それ以外' && selectedTime.includes('時間後'));
                        return (
                            <button
                                key={opt}
                                className={`px-4 py-2 rounded-full border shadow-sm font-semibold transition-all duration-200 ${isSelected ? 'bg-secondary text-white border-secondary scale-105' : 'bg-primary text-white border-gray-700 hover:bg-secondary/20 hover:scale-105'}`}
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
                <div className="bg-white/10 rounded-lg p-3 border border-white/20 shadow-sm">
                    <button
                        type="button"
                        className="w-full border rounded px-4 py-2 text-left border-secondary bg-primary text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                        onClick={() => setShowAreaModal(true)}
                    >
                        {(() => {
                            if (areasLoading) return '読み込み中...';
                            if (areasError) return 'エリア取得エラー';
                            if (selectedArea && selectedArea.includes('/')) {
                                const parts = selectedArea.split('/');
                                if (parts.length === 2) {
                                    const [name, prefecture] = parts;
                                    return `${name}/${prefecture}`;
                                }
                                return selectedArea;
                            }
                            const match = areaOptions.find(o => o.name === selectedArea || `${o.name}/${o.prefecture}` === selectedArea);
                            return match ? `${match.name}/${match.prefecture}` : (selectedArea || 'エリアを選択');
                        })()}
                    </button>
                </div>
                <AreaSelectModal
                    isOpen={showAreaModal}
                    onClose={() => setShowAreaModal(false)}
                    onSelect={(area: string) => {
                        // area format: name/prefecture (store combined)
                        setSelectedArea(area);
                        // Close modal and stay on Order History screen
                        setShowAreaModal(false);
                    }}
                    locations={areaOptions.map(o => `${o.name}/${o.prefecture}`)}
                    loading={areasLoading}
                />
            </div>
            {/* People selection */}
            <div className="px-4 mt-4">
                <div className="flex items-center mb-2">
                    <span className="font-bold flex items-center text-white">
                        <Users />
                        何人呼びますか?
                    </span>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-secondary shadow-sm">
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
                                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-2xl transition-all duration-200 ${counts[idx] === 0 ? 'border-gray-800 text-gray-700 bg-gray-900 cursor-not-allowed' : 'border-secondary text-white bg-primary hover:bg-secondary/20 hover:scale-110'}`}
                                    onClick={() => counts[idx] > 0 && setCounts(counts.map((v, i) => i === idx ? Math.max(0, v - 1) : v))}
                                    disabled={counts[idx] === 0}
                                >
                                    <Minus />
                                </button>
                                <span className={`w-4 text-center font-bold mx-1 ${counts[idx] > 0 ? 'text-white' : 'text-gray-400'}`}>{counts[idx]}</span>
                                <button
                                    className="w-8 h-8 rounded-full border border-secondary text-2xl text-white flex items-center justify-center bg-primary hover:bg-secondary/20 hover:scale-110 transition-all duration-200"
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
                <div className="flex gap-2 mb-2 flex-wrap">
                    {durationOptions.map(opt => {
                        let displayText = opt;
                        let isSelected = selectedDuration === opt;
                        if (opt === '4時間以上' && customDurationHours) {
                            displayText = `${customDurationHours}時間`;
                            isSelected = selectedDuration === `${customDurationHours}時間`;
                        }
                        return (
                            <button
                                key={opt}
                                className={`px-4 py-2 rounded-full border shadow-sm font-semibold transition-all duration-200 ${isSelected ? 'bg-secondary text-white border-secondary scale-105' : 'bg-primary text-white border-gray-700 hover:bg-secondary/20 hover:scale-105'}`}
                                onClick={() => handleDurationSelection(opt)}
                            >{displayText}</button>
                        );
                    })}
                </div>
            </div>
            {/* Next button sticky */}
            <div className="max-w-md mx-auto px-4 pt-8 pb-24">
                <button className="w-full bg-secondary text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition-all shadow-lg" onClick={onNext}>次に進む</button>
            </div>
            <CustomTimeModal
                isOpen={showCustomTimeModal}
                onClose={() => setShowCustomTimeModal(false)}
                onConfirm={handleCustomTimeConfirm}
            />
            <CustomDurationModal
                isOpen={showCustomDurationModal}
                onClose={() => setShowCustomDurationModal(false)}
                onConfirm={handleCustomDurationConfirm}
            />
        </div>
    );
}

function OrderDetailConditionsScreen({ onBack, onNext, selectedSituations, setSelectedSituations, selectedCastTypes, setSelectedCastTypes, selectedCastSkills, setSelectedCastSkills, selectedMassageIntensity, setSelectedMassageIntensity, selectedConversation, setSelectedConversation, selectedOilScent, setSelectedOilScent }: {
    onBack: () => void,
    onNext: () => void,
    selectedSituations: string[],
    setSelectedSituations: (v: string[]) => void,
    selectedCastTypes: string[],
    setSelectedCastTypes: (v: string[]) => void,
    selectedCastSkills: string[],
    setSelectedCastSkills: (v: string[]) => void,
    selectedMassageIntensity: string,
    setSelectedMassageIntensity: (v: string) => void,
    selectedConversation: string,
    setSelectedConversation: (v: string) => void,
    selectedOilScent: string,
    setSelectedOilScent: (v: string) => void,
}) {
    const toggle = (arr: string[], setArr: (v: string[]) => void, value: string) => {
        setArr(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
    };
    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-primary to-secondary pb-8">
            <Stepper step={1} />
            <div className="px-4 pt-2 pb-2 flex items-center">
                <button onClick={onBack} className="mr-2 text-2xl text-white hover:text-secondary transition-colors p-2 rounded-full cursor-pointer">
                    <ChevronLeft />
                </button>
                <span className="text-xl font-bold text-white">その他詳細条件 <span className="bg-secondary text-xs px-2 py-1 rounded align-middle text-white">任意</span></span>
            </div>
            {/* シチュエーション */}
            <div className="px-4 mt-8">
                <div className="font-bold mb-6 text-white">年代</div>
                <div className="flex flex-wrap gap-2">
                    {ageOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-1 rounded-full border shadow-sm font-semibold transition-all duration-200 ${selectedSituations.includes(opt) ? 'bg-secondary border-secondary text-white scale-105' : 'bg-primary border-gray-700 text-white hover:bg-secondary/20 hover:scale-105'}`}
                            onClick={() => toggle(selectedSituations, setSelectedSituations, opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            <div className="px-4 mt-8">
                <div className="font-bold mb-6 text-white">キャストタイプ</div>
                <div className="flex flex-wrap gap-2">
                    {castTypeOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-1 rounded-full border shadow-sm font-semibold transition-all duration-200 ${selectedCastTypes.includes(opt) ? 'bg-secondary border-secondary text-white scale-105' : 'bg-primary border-gray-700 text-white hover:bg-secondary/20 hover:scale-105'}`}
                            onClick={() => toggle(selectedCastTypes, setSelectedCastTypes, opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            {/* 指圧 - Single selection */}
            <div className="px-4 mt-4">
                <div className="font-bold mb-6 text-white">指圧</div>
                <div className="flex flex-wrap gap-2">
                    {massageIntensityOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-1 rounded-full border shadow-sm font-semibold transition-all duration-200 ${selectedMassageIntensity === opt ? 'bg-secondary border-secondary text-white scale-105' : 'bg-primary border-gray-700 text-white hover:bg-secondary/20 hover:scale-105'}`}
                            onClick={() => setSelectedMassageIntensity(opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            {/* キャストスキル */}
            <div className="px-4 mt-4">
                <div className="font-bold mb-6 text-white">お疲れ箇所</div>
                <div className="flex flex-wrap gap-2">
                    {tiredAreasOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-1 rounded-full border shadow-sm font-semibold transition-all duration-200 ${selectedCastSkills.includes(opt) ? 'bg-secondary border-secondary text-white scale-105' : 'bg-primary border-gray-700 text-white hover:bg-secondary/20 hover:scale-105'}`}
                            onClick={() => toggle(selectedCastSkills, setSelectedCastSkills, opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            {/* 会話 - Single selection */}
            <div className="px-4 mt-8">
                <div className="font-bold mb-6 text-white">会話</div>
                <div className="flex flex-wrap gap-2">
                    {conversationOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-1 rounded-full border shadow-sm font-semibold transition-all duration-200 ${selectedConversation === opt ? 'bg-secondary border-secondary text-white scale-105' : 'bg-primary border-gray-700 text-white hover:bg-secondary/20 hover:scale-105'}`}
                            onClick={() => setSelectedConversation(opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            {/* オイルの香り - Single selection */}
            <div className="px-4 mt-8">
                <div className="font-bold mb-6 text-white">オイルの香り</div>
                <div className="flex flex-wrap gap-2">
                    {oilScentOptions.map(opt => (
                        <button
                            key={opt}
                            className={`px-4 py-1 rounded-full border shadow-sm font-semibold transition-all duration-200 ${selectedOilScent === opt ? 'bg-secondary border-secondary text-white scale-105' : 'bg-primary border-gray-700 text-white hover:bg-secondary/20 hover:scale-105'}`}
                            onClick={() => setSelectedOilScent(opt)}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            {/* Next button sticky */}
            <div className="max-w-md mx-auto px-4 pt-8 pb-24">
                <button className="w-full bg-secondary text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition-all shadow-lg" onClick={onNext}>次に進む</button>
            </div>
        </div>
    );
}

function OrderAddressScreen({ onBack, onNext, reservationName, setReservationName, meetingLocation, setMeetingLocation }: {
    onBack: () => void,
    onNext: () => void,
    reservationName: string,
    setReservationName: (v: string) => void,
    meetingLocation: string,
    setMeetingLocation: (v: string) => void,
}) {
    const canProceed = (meetingLocation?.trim() || '').length > 0 && (reservationName?.trim() || '').length > 0;
    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-primary to-secondary pb-8">
            <Stepper step={2} />
            <div className="px-4 pt-2 pb-2 flex items-center">
                <button onClick={onBack} className="mr-2 text-2xl text-white hover:text-secondary transition-colors p-2 rounded-full cursor-pointer">
                    <ChevronLeft />
                </button>
                <span className="text-xl font-bold text-white">住所とお名前</span>
            </div>
            <div className="px-4 mt-8 pb-24">
                <div className="font-bold mb-3 text-white">住所</div>
                <input
                    type="text"
                    value={meetingLocation}
                    onChange={(e) => {
                        console.log('Setting meetingLocation to:', e.target.value);
                        setMeetingLocation(e.target.value);
                    }}
                    placeholder="住所（ホテル名・部屋番号等）"
                    className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <div className="font-bold mb-3 mt-6 text-white">お名前</div>
                <input
                    type="text"
                    value={reservationName}
                    onChange={(e) => {
                        console.log('Setting reservationName to:', e.target.value);
                        setReservationName(e.target.value);
                    }}
                    placeholder="お名前"
                    className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <p className="text-sm text-white mt-4">
                    ※キャストが伺う先は、ご自宅かホテルのみになります。飲食店等ではご利用できませんので、ご留意ください。
                </p>
            </div>
            <div className="max-w-md mx-auto px-4 pt-8 pb-24">
                <button
                    className={`w-full text-white py-3 rounded-lg font-bold text-lg transition-all shadow-lg ${canProceed ? 'bg-secondary hover:bg-red-700' : 'bg-gray-500 cursor-not-allowed opacity-60'}`}
                    onClick={onNext}
                    disabled={!canProceed}
                >次に進む</button>
            </div>
        </div>
    );
}

function PishattoCallScreen({ onBack, onNext, isProcessingFreeCall, defaultSelectedArea }: {
    onBack: () => void,
    onNext: (selectedLoc?: string, selectedPrefecture?: string) => void,
    isProcessingFreeCall: boolean,
    defaultSelectedArea: string,
}) {
    const [locations, setLocations] = useState<string[]>([]);
    const [locationCastCounts, setLocationCastCounts] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(defaultSelectedArea);
    const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);


    useEffect(() => {
        const fetchLocationsAndCounts = async () => {
            try {
                setError(null);
                const activeLocations = await locationService.getActiveLocations();
                
                // Remove duplicates from locations to prevent React key warnings
                const uniqueLocations = Array.from(new Set(activeLocations));
                setLocations(uniqueLocations);
                
                // Additional safety check - ensure no duplicates remain
                if (uniqueLocations.length !== activeLocations.length) {
                    console.warn('Duplicate locations detected and removed:', {
                        original: activeLocations,
                        unique: uniqueLocations
                    });
                }

                console.log("ACTIVE LOCATIONS", uniqueLocations);
                
                // Fetch cast counts by location
                const countsData = await getCastCountsByLocation();
                setLocationCastCounts(countsData);
                
                // Fetch prefectures data from database
                const prefecturesData = await locationService.getPrefecturesByLocation();
                setLocationToPrefectures(prefecturesData);
                
                console.log("PREFECTURES DATA FROM DATABASE", prefecturesData);
            } catch (error) {
                console.error('Error fetching locations and counts:', error);
                setError('場所の読み込みに失敗しました。しばらく待ってから再度お試しください。');
                setLocations([]);
                setLocationCastCounts({});
                setLocationToPrefectures({});
            } finally {
                setLoading(false);
            }
        };
        fetchLocationsAndCounts();
    }, []);

    // Set default selected area when component mounts
    useEffect(() => {
        if (defaultSelectedArea && locations.includes(defaultSelectedArea)) {
            setSelectedLocation(defaultSelectedArea);
        }
    }, [defaultSelectedArea, locations]);

    // State for prefectures data from database
    const [locationToPrefectures, setLocationToPrefectures] = useState<Record<string, string[]>>({});

    const handleLocationSelect = (location: string) => {
        setSelectedLocation(location);
        setSelectedPrefecture(null);
    };



    const handleNext = () => {
        if (selectedLocation) {
            onNext(selectedLocation, selectedPrefecture || undefined);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-secondary flex flex-col pb-20">
            {/* Enhanced Header */}
            <div className="fixed max-w-md mx-auto left-0 right-0 bg-gradient-to-r from-primary to-blue-900 backdrop-blur-md border-b border-white/10 shadow-lg">
                <div className="flex items-center px-4 pt-4 pb-2">
                    <button onClick={onBack} className="mr-3 text-2xl text-white hover:text-secondary cursor-pointer transition-colors p-2 rounded-full">
                        <ChevronLeft />
                    </button>
                    <div className="flex-1">
                        <span className="text-2xl font-bold text-white">エリア選択</span>
                        <div className="text-white/70 text-sm mt-1">お好みのエリアを選択してください</div>
                    </div>
                </div>
            </div>

            {/* Enhanced Main Content */}
            <div className="flex-1 px-4 py-3 mt-20">
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-b from-secondary to-red-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                            <MapPin className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xl font-bold text-white">エリアを選択</span>
                            <p className="text-white/70 text-sm">お好みのエリアを選択して、キャストを探しましょう</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <Spinner />
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                            <span className="text-red-400 text-3xl">⚠️</span>
                        </div>
                        <div className="text-red-400 text-center mb-6 text-lg">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 bg-gradient-to-r from-secondary to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg font-semibold"
                        >
                            再試行
                        </button>
                    </div>
                ) : (
                    <>
                        <div className='grid grid-cols-2 gap-4'>
                            {locations.map((location, index) => (
                                <div key={`${location}-${index}`} className="space-y-3">
                                    {/* Main Location Card */}
                                    <div
                                        className={`relative p-6 flex flex-col items-center justify-between rounded-2xl cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl ${selectedLocation === location
                                            ? 'bg-gradient-to-b from-secondary to-red-600 text-white border-2 border-white transform scale-105'
                                            : 'bg-gradient-to-b from-white/15 to-white/5 text-white hover:bg-secondary/20 hover:scale-105 border border-white/20'
                                            }`}
                                        onClick={() => handleLocationSelect(location)}
                                    >
                                        <div className="text-center mb-4">
                                            <span className="text-lg font-bold mb-2 block">{location}</span>
                                            <div className="flex items-center justify-center">
                                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                                <span className="text-xs opacity-80">アクティブ</span>
                                            </div>
                                        </div>

                                        <div className={`px-4 py-2 rounded-full font-bold text-sm ${selectedLocation === location
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gradient-to-r from-secondary to-red-500 text-white'
                                            }`}>
                                            {locationCastCounts[location] || 0}人
                                        </div>

                                        {selectedLocation === location && (
                                            <div className="absolute top-2 right-2">
                                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                                    <span className="text-secondary text-xs font-bold">✓</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Prefectures Section - Display below all locations */}
                        {selectedLocation && locationToPrefectures[selectedLocation] && (
                            <div className="mt-8">
                                <div className="bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold text-white mb-2">{selectedLocation}の主要エリア</h3>
                                        <p className="text-white/70 text-sm">選択されたエリアの詳細情報</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                                        {locationToPrefectures[selectedLocation].map((prefecture, idx) => (
                                            <div
                                                key={idx}
                                                className={`text-sm px-3 py-2 rounded-lg text-center truncate transition-all duration-200 hover:scale-105 cursor-pointer ${selectedPrefecture === prefecture ? 'bg-secondary text-white' : 'bg-white/20 text-white/90 hover:bg-white/30'}`}
                                                onClick={() => setSelectedPrefecture(prev => prev === prefecture ? null : prefecture)}
                                            >
                                                {prefecture}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="text-center mt-4">
                                        <div className="text-white/60 text-sm">
                                            合計 {locationToPrefectures[selectedLocation].length} エリア
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loading state for prefectures */}
                        {selectedLocation && !locationToPrefectures[selectedLocation] && (
                            <div className="mt-8">
                                <div className="bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                                        <div className="text-white/70 text-sm">エリア情報を読み込み中...</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Enhanced Fixed Bottom Button */}
            <div className="px-4 py-6">
                <button
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl ${selectedLocation
                        ? 'bg-gradient-to-r from-secondary to-red-600 text-white hover:from-red-600 hover:to-red-700 transform hover:scale-105 active:scale-95'
                        : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        }`}
                    onClick={handleNext}
                    disabled={!selectedLocation || isProcessingFreeCall}
                    type="button"
                >
                    {isProcessingFreeCall ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                            処理中...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <span>次に進む</span>
                            <ChevronRight className="ml-2" size={20} />
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}

function CastSelectionScreen({ onBack, selectedLocation, selectedPrefecture, onNext, onCastSelect }: {
    onBack: () => void,
    selectedLocation: string,
    selectedPrefecture?: string | null,
    onNext: () => void,
    onCastSelect: (cast: any) => void,
}) {
    const [casts, setCasts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [currentCastIndex, setCurrentCastIndex] = useState(0);
    const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);
    const [selectedCasts] = useState<number[]>([]);

    useEffect(() => {
        const fetchCastsForLocation = async () => {
            try {
                setError(null);
                console.log("SELECTED LOCATION", selectedLocation);
                const response = await getCastList({ area: selectedLocation });
                console.log("API Response:", response);
                console.log("Raw casts data:", response.casts);
                let list = response.casts || [];
                if (selectedPrefecture) {
                    // Filter by selected prefecture, handling both 'residence' and 'residence/prefecture' formats
                    const normalize = (s: string) => (s || '').replace(/\s+/g, '').toLowerCase();
                    const matchesPrefecture = (residence: string | null | undefined, pref: string) => {
                        if (!residence) return false;
                        const normResidence = normalize(residence);
                        const normPref = normalize(pref);
                        
                        // Handle 'residence/prefecture' format
                        if (normResidence.includes('/')) {
                            const parts = normResidence.split('/');
                            // Check if any part contains the prefecture
                            return parts.some(part => part.includes(normPref));
                        }
                        
                        // Handle 'residence' format (when residence name is the same as prefecture)
                        if (normResidence === normPref) {
                            return true;
                        }
                        
                        // Check if residence contains the prefecture
                        return normResidence.includes(normPref);
                    };
                    list = list.filter((c: any) => matchesPrefecture(c.residence, selectedPrefecture));
                } else {
                    // If no prefecture selected, filter by location (residence should match the selected location)
                    const normalize = (s: string) => (s || '').replace(/\s+/g, '').toLowerCase();
                    const matchesLocation = (residence: string | null | undefined, location: string) => {
                        if (!residence) {
                            console.log("Residence is null/undefined for cast");
                            return false;
                        }
                        const normResidence = normalize(residence);
                        const normLocation = normalize(location);
                        
                        console.log(`Checking residence: "${residence}" (normalized: "${normResidence}") against location: "${location}" (normalized: "${normLocation}")`);
                        
                        // Handle 'residence/prefecture' format - check if residence part matches location
                        if (normResidence.includes('/')) {
                            const parts = normResidence.split('/');
                            const residencePart = parts[0]; // First part is the residence
                            const matches = residencePart.includes(normLocation) || normLocation.includes(residencePart);
                            console.log(`Residence has '/' format. Parts: [${parts.join(', ')}]. Residence part: "${residencePart}". Matches: ${matches}`);
                            return matches;
                        }
                        
                        // Handle 'residence' format - check if residence matches location
                        const matches = normResidence.includes(normLocation) || normLocation.includes(normResidence);
                        console.log(`Residence format. Matches: ${matches}`);
                        return matches;
                    };
                    list = list.filter((c: any) => matchesLocation(c.residence, selectedLocation));
                }
                console.log("Filtered casts list:", list);
                console.log("Original count:", response.casts?.length || 0);
                console.log("Filtered count:", list.length);
                setCasts(list);
            } catch (error) {
                setError('キャストの読み込みに失敗しました。しばらく待ってから再度お試しください。');
                setCasts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCastsForLocation();
    }, [selectedLocation, selectedPrefecture]);

    console.log("SelectedLocation", selectedLocation, selectedPrefecture);

    const handlePreviousCast = () => {
        if (currentCastIndex > 0) {
            setCurrentCastIndex(prev => prev - 1);
            setCurrentAvatarIndex(0); // Reset avatar index when changing cast
        }
    };

    const handleNextCast = () => {
        if (currentCastIndex < casts.length - 1) {
            setCurrentCastIndex(prev => prev + 1);
            setCurrentAvatarIndex(0); // Reset avatar index when changing cast
        }
    };

    const handleMeetNow = () => {
        const currentCast = casts[currentCastIndex];
        if (currentCast) {
            // Set the selected cast for order confirmation
            onCastSelect(currentCast);
            // Navigate to order confirmation page
            onNext();
        }
    };

    // Function to get all avatars for a cast
    const getAllAvatars = (avatarString: string | null | undefined): string[] => {
        if (!avatarString) {
            return ['/assets/avatar/female.png'];
        }

        const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);

        if (avatars.length === 0) {
            return ['/assets/avatar/female.png'];
        }

        return avatars.map(avatar => `${APP_BASE_URL}/${avatar}`);
    };

    // Function to get current avatar URL
    const getCurrentAvatarUrl = (avatarString: string | null | undefined): string => {
        const avatars = getAllAvatars(avatarString);
        return avatars[currentAvatarIndex] || avatars[0];
    };

    // Function to handle avatar navigation
    const handlePreviousAvatar = () => {
        const currentCast = casts[currentCastIndex];
        if (currentCast) {
            const avatars = getAllAvatars(currentCast.avatar);
            setCurrentAvatarIndex(prev => prev > 0 ? prev - 1 : avatars.length - 1);
        }
    };

    const handleNextAvatar = () => {
        const currentCast = casts[currentCastIndex];
        if (currentCast) {
            const avatars = getAllAvatars(currentCast.avatar);
            setCurrentAvatarIndex(prev => prev < avatars.length - 1 ? prev + 1 : 0);
        }
    };

    // Get current cast data
    const currentCast = casts[currentCastIndex];
    const currentAvatars = currentCast ? getAllAvatars(currentCast.avatar) : [];
    const hasMultipleAvatars = currentAvatars.length > 1;

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-secondary flex flex-col pb-20">
            {/* Enhanced Fixed Header */}
            <div className="bg-gradient-to-r from-primary to-blue-900 backdrop-blur-md border-b border-white/10 shadow-lg">
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <div className="flex items-center">
                        <button onClick={onBack} className="mr-3 text-2xl text-white hover:text-secondary transition-colors p-2 rounded-full cursor-pointer">
                            <ChevronLeft />
                        </button>
                        <div>
                            <span className="text-2xl font-bold text-white">キャスト選択</span>
                            <div className="text-white/70 text-sm mt-1">お気に入りのキャストを見つけましょう</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white/70 text-sm">オンライン</span>
                    </div>
                </div>

                {/* Enhanced Location Display */}
                <div className="px-4 py-4 border-t border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-b from-secondary to-red-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                                <MapPin className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-white font-bold text-lg">{selectedLocation}{selectedPrefecture ? `・${selectedPrefecture}` : ''}</span>
                                <div className="text-white/70 text-xs">
                                    利用可能なキャスト: {casts.length}人
                                    {selectedPrefecture && (
                                        <span className="ml-2 text-white/50">({selectedPrefecture}エリア限定)</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-white/50 text-xs">アクティブ</div>
                            <div className="text-white font-bold">{casts.length}人</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Main Content */}
            <div className="flex-1 px-6 py-6 overflow-y-auto pt-4">
                {loading ? (
                    <Spinner />
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                            <span className="text-red-400 text-3xl">⚠️</span>
                        </div>
                        <div className="text-red-400 text-center mb-6 text-lg">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 bg-gradient-to-r from-secondary to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg font-semibold"
                        >
                            再試行
                        </button>
                    </div>
                ) : casts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
                            <span className="text-white/50 text-4xl">👥</span>
                        </div>
                        <div className="text-white text-center mb-3 font-medium text-lg">このエリアにはキャストがいません</div>
                        <p className="text-white/70 text-sm text-center">他のエリアを選択してください</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center max-w-lg mx-auto pt-8">
                        {/* Enhanced Cast Counter */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-full px-8 py-4 border border-white/20 shadow-lg">
                                <span className="text-white font-bold text-xl">
                                    {currentCastIndex + 1} / {casts.length}
                                </span>
                                <span className="text-white/60 text-sm ml-3">キャスト</span>
                            </div>
                        </div>

                        {/* Enhanced Single Cast Display */}
                        {currentCast && (
                            <div className="w-full">
                                <div className="relative bg-gradient-to-b from-white/20 to-white/5 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border border-white/20 hover:border-white/30">
                                    {/* Enhanced Profile Image with Avatar Navigation */}
                                    <div className="relative h-80 bg-gradient-to-b from-transparent via-transparent to-black/60">
                                        <img
                                            src={getCurrentAvatarUrl(currentCast.avatar)}
                                            alt={currentCast.nickname}
                                            className="w-full h-full object-cover"
                                            onError={e => (e.currentTarget.src = '/assets/avatar/female.png')}
                                        />

                                        {/* Enhanced Avatar Navigation Buttons */}
                                        {hasMultipleAvatars && (
                                            <>
                                                <button
                                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg"
                                                    onClick={handlePreviousAvatar}
                                                >
                                                    <ChevronLeft className="w-6 h-6 hover:text-secondary cursor-pointer" />
                                                </button>
                                                <button
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg"
                                                    onClick={handleNextAvatar}
                                                >
                                                    <ChevronRight className="w-6 h-6" />
                                                </button>
                                                {/* Enhanced Avatar Indicator Dots */}
                                                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-3">
                                                    {currentAvatars.map((_, index) => (
                                                        <div
                                                            key={index}
                                                            className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentAvatarIndex
                                                                ? 'bg-white shadow-lg'
                                                                : 'bg-white/50'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {/* Enhanced Profile Info Overlay */}
                                        <div className="absolute bottom-4 left-4 right-4 text-primary">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center">
                                                    <span className="text-3xl font-bold mr-4">{currentCast.nickname}</span>
                                                    <span className="text-sm bg-white/30 px-4 py-2 rounded-full backdrop-blur-sm font-semibold">
                                                        {currentCast.birth_year ? new Date().getFullYear() - currentCast.birth_year + '歳' : ''}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-lg font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                                        {currentCast.grade_points ? Number(currentCast.grade_points).toLocaleString() : '15,000'}P
                                                    </span>
                                                    <div className="text-xs opacity-80">/30分</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Card Content */}
                                    <div className="p-8">
                                        {/* Enhanced Profile View Button */}
                                        <div className="flex items-center justify-between bg-gradient-to-r from-white/15 to-white/10 hover:bg-secondary/20 text-white px-6 py-4 rounded-2xl mb-6 shadow-lg cursor-pointer transition-all duration-200" onClick={() => {
                                            navigate(`/cast/${currentCast.id}`);
                                        }}>
                                            <div className="flex items-center space-x-3">
                                                <UserRound className="w-5 h-5" />
                                                <span className="text-sm font-semibold">プロフィールを見る</span>
                                            </div>
                                            <ChevronRight className="w-5 h-5" />
                                        </div>

                                        {/* Enhanced Message Preview */}
                                        <div className="bg-gradient-to-r from-gray-700/80 to-gray-800/80 text-white px-6 py-4 rounded-2xl mb-8 shadow-lg border border-white/10">
                                            <div className="flex items-center">
                                                <span className="text-2xl mr-4">💬</span>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium mb-2">メッセージ</div>
                                                    <div className="text-sm opacity-90 leading-relaxed">
                                                        {currentCast.profile_text || 'すぐにいきます!よろしくお願いいたします✨'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Enhanced Navigation Buttons */}
                                        <div className="flex items-center justify-between mb-6">
                                            {/* Enhanced Left Button */}
                                            <button
                                                className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg hover:scale-110 active:scale-95 ${currentCastIndex > 0
                                                    ? 'bg-gradient-to-r from-secondary to-blue-600 hover:from-blue-600 hover:to-blue-700'
                                                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                                                    }`}
                                                onClick={handlePreviousCast}
                                                disabled={currentCastIndex === 0}
                                            >
                                                <ChevronLeft className="w-8 h-8 hover:text-secondary cursor-pointer" />
                                            </button>

                                            {/* Enhanced Meet Now Button */}
                                            <button
                                                className={`px-10 py-5 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 font-bold text-lg ${selectedCasts.includes(currentCast.id)
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                                                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-red-600'
                                                    }`}
                                                onClick={handleMeetNow}
                                            >
                                                <span>
                                                    {selectedCasts.includes(currentCast.id) ? '✓ 選択済み' : '今すぐ会う!'}
                                                </span>
                                            </button>

                                            {/* Enhanced Right Button */}
                                            <button
                                                className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg hover:scale-110 active:scale-95 ${currentCastIndex < casts.length - 1
                                                    ? 'bg-gradient-to-r from-secondary to-blue-600 hover:from-blue-600 hover:to-blue-700'
                                                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                                                    }`}
                                                onClick={handleNextCast}
                                                disabled={currentCastIndex === casts.length - 1}
                                            >
                                                <ChevronRight className="w-8 h-8" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}


// Add Reservation Completion Modal Component for Free Call
function FreeCallReservationCompletionModal({ isOpen, onClose, onNavigateToMessage }: {
    isOpen: boolean;
    onClose: () => void;
    onNavigateToMessage: () => void;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-primary to-blue-900 border border-white/20 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-secondary to-red-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">予約完了</h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-all duration-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-green-400 animate-bounce" />
                        </div>
                    </div>

                    {/* Message */}
                    <div className="text-center mb-6">
                        <h4 className="text-white font-bold text-lg mb-3">予約完了しました</h4>
                        <p className="text-white/80 text-base leading-relaxed">
                            メッセージ画面に移動してマッチングまで少々お待ちください。
                        </p>
                    </div>

                    {/* Action Buttons */}
                    {/* <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-200 font-semibold"
                        >
                            閉じる
                        </button>
                        <button
                            onClick={() => {
                                onNavigateToMessage();
                                onClose();
                            }}
                            className="flex-1 bg-gradient-to-r from-secondary to-red-500 text-white py-3 rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-200 font-semibold shadow-lg"
                        >
                            メッセージ画面へ
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
}

function OrderFinalConfirmationScreen({
    onBack,
    onConfirmed,
    onNext,
    selectedTime,
    selectedArea,
    counts,
    selectedDuration,
    selectedSituations,
    selectedCastTypes,
    selectedCastSkills,
    selectedMassageIntensity,
    selectedConversation,
    selectedOilScent,
    customDurationHours,
    reservationName,
    meetingLocation,
    onShowInsufficientPointsModal,
}: {
    onBack: () => void;
    onConfirmed: () => void;
    onNext: () => Promise<void>;
    selectedTime: string;
    selectedArea: string;
    counts: number[];
    selectedDuration: string;
    selectedSituations: string[];
    selectedCastTypes: string[];
    selectedCastSkills: string[];
    selectedMassageIntensity: string;
    selectedConversation: string;
    selectedOilScent: string;
    customDurationHours: number | null;
    reservationName: string;
    meetingLocation: string;
    onShowInsufficientPointsModal: () => void;
}) {
    const [showInsufficientPointsModal, setShowInsufficientPointsModal] = useState(false);
    const [requiredPointsForModal, setRequiredPointsForModal] = useState(0);
    const { user, refreshUser } = useUser();
    const navigate = useNavigate();
    const [reservationMessage, setReservationMessage] = useState<string | null>(null);
    const [showReservationModal, setShowReservationModal] = useState(false);

    // Map selected options into explicit categories for display
    const pickSelections = (source: string[], options: string[]) => source.filter(v => options.includes(v));
    const selectedAges = pickSelections(selectedSituations, ageOptions);
    // Use single selection values for these categories
    const selectedConversations = selectedConversation ? [selectedConversation] : [];
    const selectedOils = selectedOilScent ? [selectedOilScent] : [];
    const selectedTypes = pickSelections(selectedCastTypes, castTypeOptions);
    const selectedPressures = selectedMassageIntensity ? [selectedMassageIntensity] : [];
    const selectedTiredAreas = pickSelections(selectedCastSkills, tiredAreasOptions);

    const handleNavigateToMessage = () => {
        // Navigate to message screen and close modal
        navigate('/messages');
        setShowReservationModal(false);
    };

    // Calculate scheduled time based on selectedTime format
    const now = new Date();
    let scheduledTime: Date;
    if (selectedTime.includes('時間後')) {
        const customHours = parseInt(selectedTime.replace('時間後', ''));
        scheduledTime = new Date(now.getTime() + customHours * 60 * 60 * 1000);
    } else {
        const minutes = parseInt(selectedTime.replace('分後', ''));
        scheduledTime = new Date(now.getTime() + minutes * 60 * 1000);
    }

    // Check if scheduled time falls within night time (12:00 AM - 6:00 AM)
    const scheduledHour = scheduledTime.getHours();
    const isNightTime = scheduledHour >= 0 && scheduledHour < 6;
    const nightTimeFeePerHour = 4000; // Fixed 4000P per hour for night time

    // Calculate total cost using customDurationHours if present
    const durationHours = customDurationHours || (selectedDuration.includes('以上') ? 4 : selectedDuration === '1分' ? 1/60 : Number(selectedDuration.replace('時間', '')));
    const baseCost = 18000 * counts[0] * durationHours * 60 / 30 +
        15000 * counts[1] * durationHours * 60 / 30 +
        12000 * counts[2] * durationHours * 60 / 30;
    const nightTimeFee = isNightTime ? nightTimeFeePerHour * durationHours * (counts[0] + counts[1] + counts[2]) : 0;
    const totalCost = baseCost + nightTimeFee;

    // Point validation is now handled by the backend

    const handleReservation = async () => {
        if (!user) return;

        // Format date as MySQL DATETIME string
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        // const toMysqlDatetime = (date: Date) =>
        //     `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        const hours = durationHours;
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

            console.log('scheduledTime', scheduledTime);
            const response = await createFreeCallReservation({
                guest_id: user.id,
                scheduled_at: scheduledTime.toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Send user's timezone
                // Store combined as shown in frontend
                location: selectedArea,
                address: meetingLocation,
                name: reservationName,
                duration: hours, // always a number, 4 if '4時間以上'
                details: `フリーコール: VIP:${counts[1]}人, ロイヤルVIP:${counts[0]}人, プレミアム:${counts[2]}人, 合計ポイント: ${totalCost.toLocaleString()}P, シチュ: ${selectedSituations.join(',')}, タイプ: ${selectedCastTypes.join(',')}, スキル: ${selectedCastSkills.join(',')}`,
                total_cost: totalCost,
                time: selectedTime, // store the selected time
                cast_counts: {
                    royal_vip: counts[0],
                    vip: counts[1],
                    premium: counts[2]
                }
            });

            // Update user points after successful reservation
            if (response.points_deducted && response.remaining_points) {
                // Refresh user data to get updated point balance
                await refreshUser();
            }

            setReservationMessage(`予約が完了しました (${response.points_deducted?.toLocaleString()}P 消費)`);

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
            
            // Show reservation completion modal
            setShowReservationModal(true);
            // Navigate back to call screen shortly after displaying modal
            setTimeout(() => {
                onConfirmed();
            }, 1200);
        } catch (error: any) {
            console.error('Reservation error:', error);
            
            // Handle specific backend errors
            if (error.response?.status === 400 && error.response?.data?.message === 'ポイントが不足しています') {
                const requiredPoints = error.response.data.required_points;
                const availablePoints = error.response.data.available_points;
                const insufficientAmount = Number(requiredPoints) - Number(availablePoints);
                setRequiredPointsForModal(insufficientAmount);
                setReservationMessage(`ポイントが不足しています。必要ポイント: ${Number(requiredPoints).toLocaleString()}P、現在のポイント: ${Number(availablePoints).toLocaleString()}P`);
            } else {
                setReservationMessage('注文の処理中にエラーが発生しました。もう一度お試しください。');
            }
        }
    };


    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-primary to-secondary pb-24">
            <Stepper step={2} />
            {/* Back and Title */}
            <div className="flex items-center px-4 pt-2 pb-2">
                <button onClick={onBack} className="mr-2 text-2xl cursor-pointer text-white hover:text-secondary transition-colors p-2 rounded-full">
                    <ChevronLeft />
                </button>
                <span className="text-2xl font-bold text-white">注文の最終確認</span>
            </div>
            {/* Order summary */}
            <div className="px-4 mt-4">
                <div className="font-bold mb-2 text-white">注文内容</div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20 shadow-sm">
                    <div className="flex items-center mb-1 text-sm">
                        <span className="w-6">
                            <Clock />
                        </span>
                        <span className="text-white mr-2">合流予定</span>
                        <div className="ml-auto text-right">
                            <span className="font-bold text-white">{selectedTime}</span>
                            <div className="text-xs text-white/70">
                                {scheduledTime.toLocaleString('ja-JP', {
                                    month: 'numeric',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }).replace(/\//g, '-')}
                                {isNightTime && <span className="text-orange-300 ml-1">(深夜)</span>}
                            </div>
                        </div>
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
                    <div className="flex items-center mb-4 text-sm">
                        <span className="w-6">
                            <Clock />
                        </span>
                        <span className="text-white mr-2">設定時間</span>
                        <span className="ml-auto font-bold text-white">{selectedDuration}</span>
                    </div>
                    {/* Detailed category breakdown */}
                    {selectedAges.length > 0 && (
                        <div className="text-white text-sm mb-1">年代: {selectedAges.join(', ')}</div>
                    )}
                    {selectedTypes.length > 0 && (
                        <div className="text-white text-sm mb-1">キャストタイプ: {selectedTypes.join(', ')}</div>
                    )}
                    {selectedPressures.length > 0 && (
                        <div className="text-white text-sm mb-1">指圧: {selectedPressures.join(', ')}</div>
                    )}
                    {selectedTiredAreas.length > 0 && (
                        <div className="text-white text-sm mb-1">お疲れ箇所: {selectedTiredAreas.join(', ')}</div>
                    )}
                    {selectedConversations.length > 0 && (
                        <div className="text-white text-sm mb-1">会話: {selectedConversations.join(', ')}</div>
                    )}
                    {selectedOils.length > 0 && (
                        <div className="text-white text-sm mb-1">オイルの香り: {selectedOils.join(', ')}</div>
                    )}
                </div>
            </div>
            {/* Price breakdown */}
            <div className="px-4 mt-8">
                <div className="bg-white/10 rounded-lg p-4 border border-secondary shadow-sm">
                    <div className="flex justify-between text-sm mb-1 text-white">
                        <span>ロイヤルVIP {counts[0]}人</span>
                        <span>{(18000 * counts[0] * durationHours * 60 / 30).toLocaleString()}P</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1 text-white">
                        <span>VIP {counts[1]}人</span>
                        <span>{(15000 * counts[1] * durationHours * 60 / 30).toLocaleString()}P</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1 text-white">
                        <span>プレミアム {counts[2]}人</span>
                        <span>{(12000 * counts[2] * durationHours * 60 / 30).toLocaleString()}P</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2 text-white">
                        <span>小計</span>
                        <span>{baseCost.toLocaleString()}P</span>
                    </div>
                    {isNightTime && (
                        <div className="flex justify-between text-sm mt-2 text-white">
                            <span className="text-orange-300">深夜料金 ({nightTimeFeePerHour.toLocaleString()}P/時間)</span>
                            <span className="text-orange-300">+{nightTimeFee.toLocaleString()}P</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-xl mt-4 text-white">
                        <span>合計</span>
                        <span>{totalCost.toLocaleString()}P</span>
                    </div>
                    {isNightTime && (
                        <div className="text-orange-300 text-xs mt-2 text-center">
                            深夜時間帯 (12:00 AM - 6:00 AM) のため、{nightTimeFeePerHour.toLocaleString()}P/時間の深夜料金が適用されます
                        </div>
                    )}
                </div>
            </div>
            {/* Confirm button sticky */}
            <div className="max-w-md mx-auto px-4 pt-8 pb-8">
                <button
                    className="w-full py-3 rounded-lg font-bold text-lg transition shadow-lg bg-secondary text-white hover:bg-red-700"
                    onClick={handleReservation}
                >
                    予約を確定する
                </button>
                {reservationMessage && (
                    <div className={`text-center mt-2 text-sm ${reservationMessage.includes('不足') ? 'text-red-400' : 'text-white'
                        }`}>
                        {reservationMessage}
                        {reservationMessage.includes('ポイントが不足') && (
                            <div className="mt-2">
                                <button
                                    className="underline text-blue-500 hover:text-blue-600 transition-colors"
                                    onClick={() => setShowInsufficientPointsModal(true)}
                                >
                                    簡単ポイント購入
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Free Call Reservation Completion Modal */}
            <FreeCallReservationCompletionModal
                isOpen={showReservationModal}
                onClose={() => setShowReservationModal(false)}
                onNavigateToMessage={handleNavigateToMessage}
            />

            {/* Insufficient Points Modal */}
            <InsufficientPointsModal
                isOpen={showInsufficientPointsModal}
                onClose={() => setShowInsufficientPointsModal(false)}
                requiredPoints={requiredPointsForModal}
                onPointsPurchased={() => {
                    setShowInsufficientPointsModal(false);
                    // Clear error message
                    setReservationMessage('');
                    // Refresh user data to get updated points
                    refreshUser();
                }}
            />
        </div>
    );
}

// Add modal component for displaying all available casts
function AvailableCastsModal({ isOpen, onClose, casts, onCastClick }: {
    isOpen: boolean;
    onClose: () => void;
    casts: AppliedCast[];
    onCastClick: (castId: number) => void;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed max-w-md mx-auto inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-primary to-blue-900 border border-white/20 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden">
                {/* Enhanced Header */}
                <div className="bg-gradient-to-r from-secondary to-red-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Users className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">今日会えるキャスト</h3>
                            <p className="text-white/80 text-sm">オンラインキャスト一覧</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-all duration-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Enhanced Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {casts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
                                <span className="text-white/50 text-4xl">👥</span>
                            </div>
                            <div className="text-white text-center mb-3 font-medium text-lg">まだキャストからの応募はありません</div>
                            <p className="text-white/70 text-sm text-center">フリーコールでキャストを呼んでみましょう</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {casts.map((cast) => (
                                <div
                                    key={cast.id}
                                    className="bg-gradient-to-b from-white/15 to-white/5 rounded-2xl p-4 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer group"
                                    onClick={() => onCastClick(cast.cast_id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src={getFirstAvatarUrl(cast.avatar)}
                                                alt={cast.cast_nickname}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-secondary shadow-lg group-hover:border-white transition-all duration-200"
                                                onError={e => (e.currentTarget.src = '/assets/avatar/female.png')}
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-xs font-bold ${getCategoryStyles('プレミアム')}`}>プレミアム</span>
                                                <span className="text-white/60 text-xs">25歳</span>
                                            </div>
                                            <div className="text-white font-semibold text-lg mb-1 truncate">{cast.cast_nickname}</div>
                                            {cast.last_message && (
                                                <div className="text-white/60 text-sm truncate">
                                                    {cast.last_message}
                                                </div>
                                            )}
                                            {cast.updated_at && (
                                                <div className="text-white/40 text-xs mt-1">
                                                    {new Date(cast.updated_at).toLocaleString('ja-JP', {
                                                        month: 'numeric',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }).replace(/\//g, '-')}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {cast.unread && cast.unread > 0 && (
                                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">{cast.unread}</span>
                                                </div>
                                            )}
                                            <ChevronRight className="text-white/40 w-5 h-5 group-hover:text-white transition-colors duration-200" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Enhanced Footer */}
                <div className="bg-white/5 px-6 py-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="text-white/70 text-sm">
                            合計: <span className="text-white font-semibold">{casts.length}人</span> のキャスト
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-gradient-to-r from-secondary to-red-500 text-white px-6 py-2 rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-200 font-semibold shadow-lg"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add prop type
type CallScreenProps = {
    onStartOrder?: () => void;
    onNavigateToMessage?: () => void;
};

const CallScreen: React.FC<CallScreenProps> = ({ onStartOrder, onNavigateToMessage }) => {
    // Add state to pass order data between steps
    const [selectedTime, setSelectedTime] = useState('30分後');
    const [selectedArea, setSelectedArea] = useState('六本木/東京都');
    const [counts, setCounts] = useState([1, 1, 0]);
    const navigate = useNavigate()
    const [locations, setLocations] = useState<string[]>([]);
    const [locationCastCounts, setLocationCastCounts] = useState<{ [key: string]: number }>({});
    const [selectedDuration, setSelectedDuration] = useState('1時間');
    const [selectedSituations, setSelectedSituations] = useState<string[]>([]);
    const [selectedCastTypes, setSelectedCastTypes] = useState<string[]>([]);
    const [selectedCastSkills, setSelectedCastSkills] = useState<string[]>([]);
    // Single selection states for specific categories
    const [selectedMassageIntensity, setSelectedMassageIntensity] = useState<string>('');
    const [selectedConversation, setSelectedConversation] = useState<string>('');
    const [selectedOilScent, setSelectedOilScent] = useState<string>('');
    const [customDurationHours, setCustomDurationHours] = useState<number | null>(null);
    const [reservationName, setReservationName] = useState<string>("");
    const [meetingLocation, setMeetingLocation] = useState<string>("");
    const [page, setPage] = useState<'main' | 'orderHistory' | 'orderDetail' | 'orderAddress' | 'orderFinal' | 'stepRequirement' | 'freeCall' | 'castSelection' | 'orderConfirmation' | 'orderCompletion'>('main');
    const [showAreaModal, setShowAreaModal] = useState(false);
    const [showMyOrder, setShowMyOrder] = useState(false);
    const [showStepRequirement, setShowStepRequirement] = useState(false);
    const [showInsufficientPointsModal, setShowInsufficientPointsModal] = useState(false);
    // Setup/verification states for showing top banner conditionally
    const { user, refreshUser } = useUser();
    const [hasRegisteredCard, setHasRegisteredCard] = useState<boolean | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
    const [isSetupLoading, setIsSetupLoading] = useState<boolean>(false);

    const refreshSetupStatuses = async () => {
        if (!user?.id) return;
        setIsSetupLoading(true);
        try {
            const paymentInfo = await getPaymentInfo('guest', user.id);
            setHasRegisteredCard(!!paymentInfo?.card_count);
        } catch (e) {
            setHasRegisteredCard(false);
        }
        try {
            const res = await getGuestProfileById(user.id);
            setVerificationStatus(res.identity_verification_completed ?? null);
        } catch (e) {
            // keep previous
        } finally {
            setIsSetupLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            refreshSetupStatuses();
        }
    }, [user?.id]);

    useEffect(() => {
        const onVis = () => {
            if (!document.hidden && user?.id) {
                refreshSetupStatuses();
            }
        };
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, [user?.id]);
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);

    // Add state for applied casts
    const [appliedCasts, setAppliedCasts] = useState<AppliedCast[]>([]);
    const [loadingAppliedCasts, setLoadingAppliedCasts] = useState(false);

    // Add state for free call results
    const [freeCallResult, setFreeCallResult] = useState<any>(null);
    const [selectedCasts, setSelectedCasts] = useState<any[]>([]);
    const [isProcessingFreeCall, setIsProcessingFreeCall] = useState(false);

    // Add state for order confirmation
    const [selectedCastForOrder, setSelectedCastForOrder] = useState<any>(null);
    const [reservationId, setReservationId] = useState<number>(0);
    const [chatId, setChatId] = useState<number>(0);

    const [showAvailableCastsModal, setShowAvailableCastsModal] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        const fetchLocationsAndCounts = async () => {
            try {
                const activeLocations = await locationService.getActiveLocations();
                
                // Remove duplicates from locations to prevent React key warnings
                const uniqueLocations = Array.from(new Set(activeLocations));
                setLocations(uniqueLocations);
                
                // Additional safety check - ensure no duplicates remain
                if (uniqueLocations.length !== activeLocations.length) {
                    console.warn('Duplicate locations detected and removed:', {
                        original: activeLocations,
                        unique: uniqueLocations
                    });
                }

                // Fetch cast counts by location (real data)
                const countsData = await getCastCountsByLocation();
                setLocationCastCounts(countsData);
            } catch (error) {
                console.error('Error fetching locations and counts:', error);
                setLocationCastCounts({});
            }
        };
        fetchLocationsAndCounts();
    }, []);

    const handleCastClick = (castId: number) => {
        navigate(`/cast/${castId}`)
    }

    const handleFreeCall = async () => {
        if (!user) return;

        setIsProcessingFreeCall(true);
        try {
            // Calculate scheduled time based on selectedTime format
            const now = new Date();
            let scheduledTime: Date;
            if (selectedTime.includes('時間後')) {
                const customHours = parseInt(selectedTime.replace('時間後', ''));
                scheduledTime = new Date(now.getTime() + customHours * 60 * 60 * 1000);
            } else {
                const minutes = parseInt(selectedTime.replace('分後', ''));
                scheduledTime = new Date(now.getTime() + minutes * 60 * 1000);
            }

            const hours = selectedDuration.includes('以上') ? 4 : selectedDuration === '1分' ? 1/60 : Number(selectedDuration.replace('時間', ''));

            const requestData = {
                guest_id: user.id,
                scheduled_at: scheduledTime.toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Send user's timezone
                // Store combined as shown in frontend
                location: selectedArea,
                duration: hours,
                custom_duration_hours: customDurationHours || undefined,
                details: `Free call - VIP:${counts[1]}人, ロイヤルVIP:${counts[0]}人, プレミアム:${counts[2]}人, ${meetingLocation ? ` / 住所:${meetingLocation}` : ''}, ${reservationName ? ` / お名前:${reservationName}` : ''}`,
                time: selectedTime,
                address: meetingLocation || undefined,
                name: reservationName || undefined,
                cast_counts: {
                    royal_vip: counts[0],
                    vip: counts[1],
                    premium: counts[2]
                }
            };

            // Debug: Log the request data being sent
            console.log('Free call request data:', requestData);
            console.log('State values - meetingLocation:', meetingLocation, 'reservationName:', reservationName);
            console.log('Address field in request:', requestData.address);
            console.log('Name field in request:', requestData.name);

            const response = await createFreeCall(requestData);

            setFreeCallResult(response);
            // Set empty array for selected casts since no casts are initially selected
            setSelectedCasts([]);

            // Refresh user data to get updated point balance
            await refreshUser();

        } catch (error: any) {
            console.error('Free call failed:', error);
            alert('フリーコールに失敗しました。もう一度お試しください。');
        } finally {
            setIsProcessingFreeCall(false);
        }
    };
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
            customDurationHours={customDurationHours}
            setCustomDurationHours={setCustomDurationHours}
        />
    );
    if (page === 'orderDetail') return (
        <OrderDetailConditionsScreen
            onBack={() => setPage('orderHistory')}
            onNext={() => setPage('orderAddress')}
            selectedSituations={selectedSituations}
            setSelectedSituations={setSelectedSituations}
            selectedCastTypes={selectedCastTypes}
            setSelectedCastTypes={setSelectedCastTypes}
            selectedCastSkills={selectedCastSkills}
            setSelectedCastSkills={setSelectedCastSkills}
            selectedMassageIntensity={selectedMassageIntensity}
            setSelectedMassageIntensity={setSelectedMassageIntensity}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            selectedOilScent={selectedOilScent}
            setSelectedOilScent={setSelectedOilScent}
        />
    );
    if (page === 'orderAddress') return (
        <OrderAddressScreen
            onBack={() => setPage('orderDetail')}
            onNext={() => setPage('orderFinal')}
            reservationName={reservationName}
            setReservationName={setReservationName}
            meetingLocation={meetingLocation}
            setMeetingLocation={setMeetingLocation}
        />
    );
    if (page === 'orderFinal') return (
        <OrderFinalConfirmationScreen
            onBack={() => setPage('orderDetail')}
            onConfirmed={() => {
                setPage('main');
            }}
            onNext={handleFreeCall}
            selectedTime={selectedTime}
            selectedArea={selectedArea}
            counts={counts}
            selectedDuration={selectedDuration}
            selectedSituations={selectedSituations}
            selectedCastTypes={selectedCastTypes}
            selectedCastSkills={selectedCastSkills}
            selectedMassageIntensity={selectedMassageIntensity}
            selectedConversation={selectedConversation}
            selectedOilScent={selectedOilScent}
            customDurationHours={customDurationHours}
            reservationName={reservationName}
            meetingLocation={meetingLocation}
            onShowInsufficientPointsModal={() => {}}
        />
    );
    if (page === 'freeCall') return (
        <PishattoCallScreen
            onBack={() => setPage('main')}
            onNext={(selectedLoc?: string, selectedPrefectureArg?: string) => {
                if (selectedLoc) {
                    setSelectedLocation(selectedLoc);
                    setSelectedPrefecture(selectedPrefectureArg || null);
                    setPage('castSelection');
                }
            }}
            isProcessingFreeCall={isProcessingFreeCall}
            defaultSelectedArea={getAreaNamePart(selectedArea)}
        />
    );
    if (page === 'castSelection') return (
        <CastSelectionScreen
            onBack={() => setPage('freeCall')}
            selectedLocation={selectedLocation}
            selectedPrefecture={selectedPrefecture}
            onNext={() => {
                // Navigate to order confirmation page
                setPage('orderConfirmation');
            }}
            onCastSelect={(cast) => setSelectedCastForOrder(cast)}
        />
    );

    if (page === 'orderConfirmation') return (
        <OrderConfirmationPage
            onBack={() => setPage('castSelection')}
            onConfirm={(reservationId: number, chatId: number, confirmedTime?: string, updatedDuration?: string) => {
                if (updatedDuration) setSelectedDuration(updatedDuration);
                setPage('orderCompletion');
                setReservationId(reservationId);
                setChatId(chatId);
            }}
            selectedCast={selectedCastForOrder}
            meetingArea={selectedLocation}
            scheduledTime={selectedTime}
            duration={selectedDuration}
        />
    );

    if (page === 'orderCompletion') return (
        <OrderCompletionPage
            onViewChat={() => {
                if (onNavigateToMessage) {
                    onNavigateToMessage();
                }
                setPage('main');
            }}
            onBackToHome={() => setPage('main')}
            reservationId={reservationId}
            selectedCast={selectedCastForOrder}
            meetingArea={selectedLocation}
            scheduledTime={selectedTime}
            duration={selectedDuration}
        />
    );

    if (showStepRequirement) return <StepRequirementScreen onBack={() => { setShowStepRequirement(false); setTimeout(refreshSetupStatuses, 0); }} />;

    // Check if both requirements are met
    const isSetupComplete = hasRegisteredCard && verificationStatus === 'success';
    
    // Show StepRequirementScreen if requirements are not met
    if (user?.id && !isSetupLoading && !isSetupComplete) {
        return <StepRequirementScreen onBack={() => { setShowStepRequirement(false); setTimeout(refreshSetupStatuses, 0); }} />;
    }

    // Show loading state until verification and card statuses are loaded
    if (user?.id && isSetupLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-secondary flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-secondary pb-20">
            {/* Enhanced Header */}
            <div className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-gradient-to-r from-secondary to-red-600 text-white px-4 py-6 text-lg font-bold shadow-lg opacity-100 z-50">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        今すぐ呼ぶ
                    </span>
                    <div className="text-sm opacity-90">24/7 対応</div>
                </div>
            </div>

            {/* Enhanced Warning Banner - show only if setup incomplete */}
            {!(hasRegisteredCard && verificationStatus === 'success') && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 flex items-center justify-between shadow-lg pt-20">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold">ご利用準備が完了していません</span>
                    </div>
                    <button
                        onClick={() => setShowStepRequirement(true)}
                        className="flex items-center gap-1 hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                    >
                        <span className="text-xs">設定</span>
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Enhanced Area Selection */}
            <div className={`bg-gradient-to-r from-primary to-blue-900 px-4 pb-4 ${hasRegisteredCard && verificationStatus === 'success' ? 'pt-24' : 'pt-4'} flex flex-col gap-3 border-b border-white/10 shadow-lg`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="text-secondary" size={20} />
                        <span className="text-white font-medium">選択中のエリア</span>
                    </div>
                    <button
                        className="text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-sm transition-all duration-200"
                        onClick={() => setShowAreaModal(true)}
                    >
                        変更
                    </button>
                </div>
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <span className="text-white font-bold text-lg">{selectedArea}</span>
                    {/* <div className="text-white/70 text-xs mt-1">現在のキャスト数: {locationCastCounts[getAreaNamePart(selectedArea)] ?? 0}人</div> */}
                </div>
                <AreaSelectModal
                    isOpen={showAreaModal}
                    onClose={() => setShowAreaModal(false)}
                    onSelect={setSelectedArea}
                    locations={locations}
                />
            </div>

            {/* Enhanced Service Cards */}
            <div className="px-4 py-6 space-y-4">
                {/* Enhanced Free Call Card */}
                <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-b from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">無</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">フリーコール</h3>
                                <p className="text-white/70 text-sm">自動マッチング</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center mb-4">
                        <div className="flex -space-x-2 mr-4">
                            <img src="assets/avatar/woman.png" alt="VIP" className="w-8 h-8 rounded-full border-2 border-secondary shadow-lg" />
                            <img src="assets/avatar/woman.png" alt="Premium" className="w-8 h-8 rounded-full border-2 border-secondary shadow-lg" />
                            <img src="assets/avatar/woman.png" alt="Royal VIP" className="w-8 h-8 rounded-full border-2 border-secondary shadow-lg" />
                        </div>
                        <span className="text-white/80 text-sm">即座にマッチング</span>
                    </div>

                    <button
                        className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg ${
                            isSetupComplete 
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl transform hover:scale-105 active:scale-95' 
                                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        }`}
                        onClick={() => isSetupComplete && setPage('orderHistory')}
                        disabled={!isSetupComplete}
                    >
                        人数を決める
                    </button>
                </div>

                {/* Enhanced Pishatto Card */}
                <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">選</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">ピシャット（指名で）呼ぶ</h3>
                                <p className="text-white/70 text-sm">キャスト選択</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center mb-4">
                        <img src="assets/avatar/woman.png" alt="cast" className="w-8 h-8 rounded-full border-2 border-secondary shadow-lg mr-4" />
                        <span className="text-white/80 text-sm">お気に入りキャストを選択</span>
                    </div>

                    <button
                        className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg ${
                            isSetupComplete 
                                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 hover:shadow-xl transform hover:scale-105 active:scale-95' 
                                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        }`}
                        onClick={() => isSetupComplete && setPage("freeCall")}
                        disabled={!isSetupComplete}
                    >
                        キャストを選ぶ
                    </button>
                </div>
            </div>

            {/* Enhanced Order History Button */}
            <div className="px-4 mb-6">
                <button
                    className="w-full flex items-center justify-between bg-gradient-to-r from-secondary to-red-600 text-white px-6 py-4 rounded-2xl shadow-xl hover:shadow-2xl font-bold text-lg focus:outline-none transition-all duration-200 hover:scale-[1.02] active:scale-95"
                    onClick={() => setShowMyOrder(true)}
                >
                    <span className="flex items-center gap-3">
                        <CalendarArrowUp size={24} />
                        注文履歴の確認
                    </span>
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Calendar Button */}
            {/* <div className="px-4 mb-6">
                <button
                    className="w-full flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-2xl shadow-xl hover:shadow-2xl font-bold text-lg focus:outline-none transition-all duration-200 hover:scale-[1.02] active:scale-95"
                    onClick={() => setShowCalendar(true)}
                >
                    <span className="flex items-center gap-3">
                        <Calendar size={24} />
                        カレンダー
                    </span>
                    <ChevronRight size={20} />
                </button>
            </div> */}

            {/* Enhanced Available Casts Section */}
            <div className="px-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="font-bold text-lg text-white">今日会えるキャスト</span>
                    </div>
                    <button
                        className="text-white/80 text-sm hover:text-white transition-colors flex items-center gap-1 group"
                        onClick={() => setShowAvailableCastsModal(true)}
                    >
                        <span>すべて見る</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                </div>

                {loadingAppliedCasts ? (
                    <Spinner />
                ) : appliedCasts.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {appliedCasts.slice(0, 4).map((cast, idx) => (
                            <div
                                key={cast.id}
                                className="bg-gradient-to-b from-white/15 to-white/5 rounded-xl p-4 min-w-[140px] text-center flex-shrink-0 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer group"
                                onClick={() => handleCastClick(cast.cast_id)}
                            >
                                <div className="relative mb-3">
                                    <img
                                        src={getFirstAvatarUrl(cast.avatar)}
                                        alt={cast.cast_nickname}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-secondary mx-auto shadow-lg group-hover:border-white transition-all duration-200"
                                        onError={e => (e.currentTarget.src = '/assets/avatar/female.png')}
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                                </div>
                                <div className="mb-2">
                                    <span className={`text-xs font-bold ${getCategoryStyles('プレミアム')}`}>プレミアム</span>
                                </div>
                                <div className="text-white font-semibold text-sm mb-1">{cast.cast_nickname}</div>
                                <div className="text-white/60 text-xs">25歳</div>
                            </div>
                        ))}
                        {appliedCasts.length > 4 && (
                            <div
                                className="bg-gradient-to-b from-white/15 to-white/5 rounded-xl p-4 min-w-[140px] text-center flex-shrink-0 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer flex flex-col items-center justify-center"
                                onClick={() => setShowAvailableCastsModal(true)}
                            >
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                                    <span className="text-white/50 text-2xl">+{appliedCasts.length - 4}</span>
                                </div>
                                <div className="text-white/60 text-xs">もっと見る</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white/10 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-white/50 text-2xl">
                                <Users className="w-10 h-10" />
                            </span>
                        </div>
                        <div className="text-white/70 text-sm">まだキャストからの応募はありません</div>
                        <div className="text-white/50 text-xs mt-1">フリーコールでキャストを呼んでみましょう</div>
                    </div>
                )}
            </div>

            {/* Available Casts Modal */}
            <AvailableCastsModal
                isOpen={showAvailableCastsModal}
                onClose={() => setShowAvailableCastsModal(false)}
                casts={appliedCasts}
                onCastClick={handleCastClick}
            />

        </div>
    );
};

// Enhanced Area selection modal
function AreaSelectModal({ isOpen, onClose, onSelect, locations, loading }: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (area: string) => void;
    locations: string[];
    loading?: boolean;
}) {
    const areaOptions = locations;
    const [area, setArea] = useState<string>('');

    // Keep modal in sync with prop
    React.useEffect(() => { setArea(''); }, [isOpen]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-b from-primary to-blue-900 border border-white/20 rounded-3xl w-96 max-w-[90%] h-[70%] shadow-2xl flex flex-col">
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-8 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-b from-secondary to-red-500 rounded-full flex items-center justify-center">
                            <MapPin className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">エリアを選択</h3>
                            <p className="text-white/70 text-sm">お好みのエリアを選択してください</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-all duration-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Areas Options */}
                <div className="flex-1 px-8 overflow-y-auto scrollbar-hidden">
                    <label className="block text-white mb-4 font-semibold">エリア</label>
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <Spinner />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {areaOptions.length === 0 ? (
                                <div className="text-white/70 text-sm text-center py-8">エリアがありません</div>
                            ) : (
                                areaOptions.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setArea(opt)}
                                        className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${area === opt
                                            ? 'bg-gradient-to-r from-secondary to-red-500 text-white border-secondary shadow-lg'
                                            : 'bg-white/10 text-white border-white/20 hover:border-white/40 hover:bg-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">{opt}</span>
                                            {area === opt && (
                                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                                    <span className="text-secondary text-xs font-bold">✓</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Fixed Footer */}
                <div className="p-8 pt-6">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 border border-white/20 text-white rounded-2xl hover:bg-white/10 transition-all duration-200 font-semibold"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={() => { onSelect(area); onClose(); }}
                            disabled={loading || !area}
                            className={`flex-1 py-4 rounded-2xl transition-all duration-200 font-semibold shadow-lg ${loading || !area
                                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-secondary to-red-500 text-white hover:from-red-500 hover:to-red-600'
                            }`}
                        >
                            決定
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add Calendar Popup Window Component
function CalendarPopupWindow({ isOpen, onClose }: {
    isOpen: boolean;
    onClose: () => void;
}) {
    if (!isOpen) return null;

    // Get current date and time for display
    const now = new Date();
    const currentDate = now.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    }).replace(/\//g, '-');
    const currentTime = now.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Mock data for demonstration - in real implementation, this would come from props or API
    const occurrencePoints = 18000; // Example points

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-primary to-blue-900 border border-white/20 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-secondary to-red-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Calendar className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">予約カレンダー</h3>
                            <p className="text-white/80 text-sm">予約詳細情報</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-all duration-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Date Section */}
                    <div className="bg-white/10 rounded-2xl p-4 mb-4 border border-white/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                <Calendar className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold text-lg">予約日時</h4>
                                <p className="text-white/70 text-sm">Reservation Date & Time</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-white text-2xl font-bold mb-2">{currentDate}</div>
                            <div className="text-white/80 text-lg">{currentTime}</div>
                        </div>
                    </div>

                    {/* Cast Members Section */}
                    <div className="bg-white/10 rounded-2xl p-4 mb-4 border border-white/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                                <Users className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold text-lg">キャスト人数</h4>
                                <p className="text-white/70 text-sm">Number of Cast Members</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-white text-3xl font-bold mb-2">1</div>
                            <div className="text-white/80 text-sm">固定 (Fixed for Chat Screen)</div>
                        </div>
                    </div>

                    {/* Time Section */}
                    <div className="bg-white/10 rounded-2xl p-4 mb-4 border border-white/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-b from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                <Clock className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold text-lg">利用時間</h4>
                                <p className="text-white/70 text-sm">Duration</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-white text-2xl font-bold mb-2">1時間</div>
                            <div className="text-white/80 text-sm">1 Hour (Variable)</div>
                        </div>
                    </div>

                    {/* Occurrence Points Section */}
                    <div className="bg-white/10 rounded-2xl p-4 mb-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <div>
                                <h4 className="text-white font-semibold text-lg">発生ポイント</h4>
                                <p className="text-white/70 text-sm">Occurrence Points</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-white text-3xl font-bold mb-2">{occurrencePoints.toLocaleString()}P</div>
                            <div className="text-white/80 text-sm">30分あたり</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-200 font-semibold"
                        >
                            閉じる
                        </button>
                        <button
                            className="flex-1 bg-gradient-to-r from-secondary to-red-500 text-white py-3 rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-200 font-semibold shadow-lg"
                        >
                            予約する
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CallScreen; 