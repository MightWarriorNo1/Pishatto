/* eslint-disable */
import React, { useMemo, useState } from 'react';
import { CastProfile } from '../../services/api';
import { useSearch } from '../../contexts/SearchContext';

interface SearchFilterPageProps {
    onClose: () => void;
    onApply?: (results: CastProfile[], filters: any) => void;
    casts?: CastProfile[];
}

const classes = ['プレミアム', 'VIP', 'ロイヤルVIP'];

const SearchFilterPage: React.FC<SearchFilterPageProps> = ({ onClose, onApply, casts = [] }) => {
    const { setSearchQuery, setIsSearchActive, setFilterResults } = useSearch();
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [keyword, setKeyword] = useState('');
    const [detailedProfile, setDetailedProfile] = useState(false);
    const [recentJoin, setRecentJoin] = useState(false);
    const [birthMonth, setBirthMonth] = useState(false);
    const [pointsPer30Min, setPointsPer30Min] = useState<[number, number]>([7500, 30000]);
    const [age, setAge] = useState<[number, number]>([20, 35]);
    const [height, setHeight] = useState<[number, number]>([155, 250]);
    const [activityArea, setActivityArea] = useState<string>('未選択');
    const [birthPlace, setBirthPlace] = useState<string>('未選択');
    const [showAreaPicker, setShowAreaPicker] = useState(false);
    const [showBirthPicker, setShowBirthPicker] = useState(false);

    const AREA_OPTIONS = ['未選択', '全国', '北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州・沖縄'];
    const PREF_OPTIONS = ['未選択', '北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島', '茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川', '新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知', '三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山', '鳥取', '島根', '岡山', '広島', '山口', '徳島', '香川', '愛媛', '高知', '福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'];

    const toggleClass = (c: string) => {
        setSelectedClasses(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    };

    const filters = useMemo(() => ({
        selectedClasses,
        keyword,
        detailedProfile,
        recentJoin,
        birthMonth,
        pointsPer30Min,
        age,
        height,
        activityArea,
        birthPlace,
    }), [selectedClasses, keyword, detailedProfile, recentJoin, birthMonth, pointsPer30Min, age, height, activityArea, birthPlace]);

    const filterCasts = (list: CastProfile[]) => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const createdCutoff = new Date();
        createdCutoff.setDate(createdCutoff.getDate() - 30);

        return list.filter((c: any) => {
            // keyword in nickname or profile_text
            if (keyword.trim()) {
                const kw = keyword.trim().toLowerCase();
                const nick = (c.nickname || '').toLowerCase();
                const profile = (c.profile_text || '').toLowerCase();
                if (!nick.includes(kw) && !profile.includes(kw)) return false;
            }

            // points
            if (c.grade_points != null) {
                const p = Number(c.grade_points);
                if (p < pointsPer30Min[0] || p > pointsPer30Min[1]) return false;
            }

            // age from birth_year
            if (c.birth_year) {
                const currentYear = new Date().getFullYear();
                const a = currentYear - Number(c.birth_year);
                if (a < age[0] || a > age[1]) return false;
            }

            // height
            if (c.height) {
                const h = Number(String(c.height).toString().replace('cm', ''));
                if (!Number.isNaN(h) && (h < height[0] || h > height[1])) return false;
            }

            // detailed profile toggle
            if (detailedProfile && !c.profile_text) return false;

            // recent join toggle
            if (recentJoin) {
                const createdAt = c.created_at || c.createdAt;
                if (createdAt) {
                    const d = new Date(createdAt);
                    if (d < createdCutoff) return false;
                }
            }

            // birth month toggle - since we only have birth_year, we'll skip this filter
            // as we can't determine birth month from just birth year
            if (birthMonth) {
                // Skip this filter as birth month is not available in the data
                return false;
            }

            // activity area filter (maps to residence field)
            if (activityArea !== '未選択') {
                const residence = (c.residence || '').toLowerCase();
                if (!residence.includes(activityArea.toLowerCase())) return false;
            }

            // birth place filter (maps to birthplace field)
            if (birthPlace !== '未選択') {
                const birthplace = (c.birthplace || '').toLowerCase();
                if (!birthplace.includes(birthPlace.toLowerCase())) return false;
            }

            // classes (if profile has a category)
            if (selectedClasses.length > 0) {
                const category = (c.category || '').toString();
                if (category) {
                    const hit = selectedClasses.some(s => category.includes(s));
                    if (!hit) return false;
                }
            }

            return true;
        });
    };

    const apply = () => {
        const results = filterCasts(casts);
        const payload = {
            selectedClasses,
            keyword,
            detailedProfile,
            recentJoin,
            birthMonth,
            pointsPer30Min,
            age,
            height,
        };
        
        // Set filter results in context
        setFilterResults(results);
        
        // Update search context with the keyword and activate search
        if (keyword.trim()) {
            setSearchQuery(keyword.trim());
            setIsSearchActive(true);
        } else {
            // If no keyword, create a search query from other filters
            const filterQuery = [
                selectedClasses.length > 0 ? selectedClasses.join(',') : '',
                age[0] !== 20 || age[1] !== 35 ? `年齢${age[0]}-${age[1]}歳` : '',
                height[0] !== 155 || height[1] !== 250 ? `身長${height[0]}-${height[1]}cm` : '',
                pointsPer30Min[0] !== 7500 || pointsPer30Min[1] !== 30000 ? `${pointsPer30Min[0]}-${pointsPer30Min[1]}P` : '',
                activityArea !== '未選択' ? activityArea : '',
                birthPlace !== '未選択' ? birthPlace : '',
                detailedProfile ? '詳細プロフィール' : '',
                recentJoin ? '最近入会' : ''
                // Removed birthMonth as it's not available in the data
            ].filter(Boolean).join(' ');
            
            if (filterQuery.trim()) {
                setSearchQuery(filterQuery.trim());
                setIsSearchActive(true);
            }
        }
        
        onApply && onApply(results, payload);
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 max-w-md mx-auto bg-gradient-to-b from-primary via-primary to-secondary z-[60]">
                <div className="sticky top-0 bg-primary/95 backdrop-blur border-b border-secondary z-10">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button className="text-white text-xl" onClick={onClose}>×</button>
                        <div className="text-white font-bold">絞り込み検索</div>
                        <button className="text-secondary font-bold" onClick={() => { setSelectedClasses([]); setKeyword(''); setDetailedProfile(false); setRecentJoin(false); setBirthMonth(false); setPointsPer30Min([7500, 30000]); setAge([20, 35]); setHeight([155, 250]); setActivityArea('未選択'); setBirthPlace('未選択'); }}>クリア</button>
                    </div>
                    <div className="px-4 pb-3 flex flex-wrap gap-2">
                        {activityArea !== '未選択' && <span className="px-2 py-1 text-xs rounded-full bg-secondary/20 border border-secondary text-white">{activityArea}</span>}
                        {birthPlace !== '未選択' && <span className="px-2 py-1 text-xs rounded-full bg-secondary/20 border border-secondary text-white">{birthPlace}</span>}
                        {(age[0] !== 20 || age[1] !== 35) && <span className="px-2 py-1 text-xs rounded-full bg-secondary/20 border border-secondary text-white">年齢 {age[0]}-{age[1]}</span>}
                        {(height[0] !== 155 || height[1] !== 250) && <span className="px-2 py-1 text-xs rounded-full bg-secondary/20 border border-secondary text-white">身長 {height[0]}-{height[1]}</span>}
                        {(pointsPer30Min[0] !== 7500 || pointsPer30Min[1] !== 30000) && <span className="px-2 py-1 text-xs rounded-full bg-secondary/20 border border-secondary text-white">{pointsPer30Min[0].toLocaleString()}〜{pointsPer30Min[1].toLocaleString()}P</span>}
                        {selectedClasses.map(c => (
                            <span key={`sel-${c}`} className="px-2 py-1 text-xs rounded-full bg-secondary/20 border border-secondary text-white">{c}</span>
                        ))}
                    </div>
                </div>

                <div className="px-4 pt-4 pb-32 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-hidden">
                    {/* 基本プロフィール */}
                    <div className="text-white text-sm font-bold">基本プロフィール</div>
                    <div className="divide-y divide-secondary/60 rounded-lg border border-secondary">
                        <button className="w-full flex items-center justify-between px-4 py-3 text-white" onClick={() => setShowAreaPicker(true)}>
                            <span>活動エリア</span>
                            <span className="text-secondary font-bold">{activityArea}</span>
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-3 text-white" onClick={() => setShowBirthPicker(true)}>
                            <span>出身地</span>
                            <span className="text-secondary font-bold">{birthPlace}</span>
                        </button>
                        <div className="px-4 py-4">
                            <div className="flex items-center justify-between">
                                <span className="text-white">年齢</span>
                                <div className="flex items-center gap-3 text-white text-sm">
                                    <span>{age[0]}歳</span>
                                    <input type="range" min={18} max={80} value={age[0]} onChange={(e) => setAge([parseInt(e.target.value, 10), age[1]])} />
                                    <input type="range" min={18} max={80} value={age[1]} onChange={(e) => setAge([age[0], parseInt(e.target.value, 10)])} />
                                    <span>{age[1]}歳</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-6">
                                <span className="text-white">身長</span>
                                <div className="flex items-center gap-3 text-white text-sm">
                                    <span>{height[0]}cm</span>
                                    <input type="range" min={155} max={250} value={height[0]} onChange={(e) => setHeight([parseInt(e.target.value, 10), height[1]])} />
                                    <input type="range" min={155} max={250} value={height[1]} onChange={(e) => setHeight([height[0], parseInt(e.target.value, 10)])} />
                                    <span>{height[1]}cm</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-x-2 flex flex-wrap">
                        {classes.map(c => (
                            <button 
                                key={c}
                                onClick={() => toggleClass(c)}
                                className={`px-3 py-1 rounded-full text-sm border transition-colors mb-2 ${selectedClasses.includes(c) ? 'bg-secondary text-white border-secondary' : 'bg-primary text-white hover:bg-white/10 border-secondary/70'}`}
                                aria-pressed={selectedClasses.includes(c)}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    <div className="text-xs text-white/80 space-y-2">
                        <div>「プレミアム」合格率10%の面談を通過した厳選キャスト</div>
                        <div>「VIP」厳選キャストの中でも更に10%しかいない特別なキャスト</div>
                        <div>「ロイヤルVIP」 キャストの中でも1%しかいない最上級キャスト</div>
                    </div>

                    <div>
                        <label className="block text-white text-sm mb-2">フリーワード</label>
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="フリーワードを入力してください"
                            className="w-full px-3 py-2 rounded-lg bg-primary text-white border border-secondary placeholder-white/50"
                        />
                        <div className="text-xs text-white/60 mt-1">キャストのプロフィールをフリーワードで検索できます。例: 海外旅行、お酒、寿司、趣味、スポーツ観戦 など</div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-white">詳細プロフィール</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-white">最近入会</span>
                            <input type="checkbox" checked={recentJoin} onChange={(e) => setRecentJoin(e.target.checked)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-white">今月誕生日</span>
                            <input type="checkbox" checked={birthMonth} onChange={(e) => setBirthMonth(e.target.checked)} disabled />
                        </div>
                        <div className="text-xs text-white/60 mt-1">※誕生日フィルターは現在利用できません</div>
                    </div>

                    <div className="px-4">
                        <label className="block text-white text-sm mb-2">30分あたりのポイント</label>
                        <div className="flex items-center gap-3 text-white text-sm">
                            <span>{pointsPer30Min[0].toLocaleString()}P</span>
                            <input type="range" min={7500} max={30000} step={500} value={pointsPer30Min[0]} onChange={(e) => setPointsPer30Min([parseInt(e.target.value, 10), pointsPer30Min[1]])} className="flex-1" />
                            <input type="range" min={7500} max={30000} step={500} value={pointsPer30Min[1]} onChange={(e) => setPointsPer30Min([pointsPer30Min[0], parseInt(e.target.value, 10)])} className="flex-1" />
                            <span>{pointsPer30Min[1].toLocaleString()}P</span>
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 p-4 pb-24">
                    <button onClick={apply} className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-secondary to-secondary/80 text-white shadow-lg active:scale-[0.99] transition">この条件で検索する</button>
                </div>
            </div>

            {/* Pickers */}
            {showAreaPicker && (
                <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-end">
                    <div className="w-full bg-primary border-t border-secondary max-w-md mx-auto rounded-t-2xl overflow-hidden shadow-2xl">
                        <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mt-2" />
                        <div className="flex items-center justify-between px-4 py-3 border-b border-secondary text-white"><span>活動エリア</span><button onClick={() => setShowAreaPicker(false)} className="text-secondary font-bold">閉じる</button></div>
                        <div className="max-h-80 overflow-y-auto scrollbar-hidden">
                            {AREA_OPTIONS.map(opt => (
                                <button key={opt} className={`w-full text-left px-4 py-3 border-b border-secondary text-white ${activityArea === opt ? 'bg-secondary/30' : ''}`} onClick={() => { setActivityArea(opt); setShowAreaPicker(false); }}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {showBirthPicker && (
                <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-end">
                    <div className="w-full bg-primary border-t border-secondary max-w-md mx-auto rounded-t-2xl overflow-hidden shadow-2xl">
                        <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mt-2" />
                        <div className="flex items-center justify-between px-4 py-3 border-b border-secondary text-white"><span>出身地</span><button onClick={() => setShowBirthPicker(false)} className="text-secondary font-bold">閉じる</button></div>
                        <div className="max-h-80 overflow-y-auto scrollbar-hidden">
                            {PREF_OPTIONS.map(opt => (
                                <button key={opt} className={`w-full text-left px-4 py-3 border-b border-secondary text-white ${birthPlace === opt ? 'bg-secondary/30' : ''}`} onClick={() => { setBirthPlace(opt); setShowBirthPicker(false); }}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SearchFilterPage;


