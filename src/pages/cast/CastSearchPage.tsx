import React, { useState } from 'react';
import { Heart, SlidersHorizontal, Bell, MessageCircleQuestionMark, ChevronLeft } from 'lucide-react';
import { getRepeatGuests, RepeatGuest, getGuestProfileById, GuestProfile } from '../../services/api';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// GuestDetailPage component
type GuestDetailPageProps = { onBack: () => void; guest: RepeatGuest };
const GuestDetailPage: React.FC<GuestDetailPageProps> = ({ onBack, guest }) => {
    const [showEasyMessage, setShowEasyMessage] = useState(false);
    const [profile, setProfile] = useState<GuestProfile | null>(null);
    const [loading, setLoading] = useState(true);
    React.useEffect(() => {
        getGuestProfileById(guest.id).then(setProfile).finally(() => setLoading(false));
    }, [guest.id]);
    const avatarSrc = guest.avatar ? (guest.avatar.startsWith('http') ? guest.avatar : `${API_BASE_URL}/${guest.avatar}`) : '/assets/avatar/female.png';
    if (showEasyMessage) {
        return <EasyMessagePage onClose={() => setShowEasyMessage(false)} />
    }
    return (
        <div className="max-w-md  bg-primary min-h-screen pb-8 auto">
            {/* Header with back button */}
            <div className="flex items-center px-2 pt-2 pb-2">
                <button onClick={onBack} className="text-2xl text-white font-bold">
                    <ChevronLeft />
                </button>
            </div>
            {/* Main image */}
            <div className="w-full h-48 bg-primary flex items-center justify-center border-b border-secondary">
                <img src={avatarSrc} alt="guest_detail" className="object-contain h-full mx-auto" />
            </div>
            {/* Badge */}
            <div className="px-4 mt-2">
                <span className="inline-block bg-secondary text-white text-xs rounded px-2 py-0.5">最近入会</span>
            </div>
            {/* Profile card */}
            <div className="flex items-center px-4 py-2 mt-2 bg-primary rounded shadow border border-secondary">
                <img src={avatarSrc} alt="guest_thumb" className="w-10 h-10 rounded mr-2 border-2 border-secondary" />
                <div>
                    <div className="font-bold text-sm text-white">{profile ? profile.nickname : guest.nickname}</div>
                    <div className="text-xs text-white">{profile ? profile.occupation : ''}</div>
                </div>
            </div>
            {/* Profile details */}
            <div className="px-4 py-2">
                {loading ? (
                  <div className="text-white">ローディング...</div>
                ) : profile ? (
                <table className="w-full text-sm text-white">
                    <tbody>
                        <tr><td className="py-1">身長：</td><td>{profile.height || '-'}</td></tr>
                        <tr><td className="py-1">居住地：</td><td>{profile.residence || '-'}</td></tr>
                        <tr><td className="py-1">出身地：</td><td>{profile.birthplace || '-'}</td></tr>
                        <tr><td className="py-1">学歴：</td><td>{profile.education || '-'}</td></tr>
                        <tr><td className="py-1">年収：</td><td>{profile.annual_income || '-'}</td></tr>
                        <tr><td className="py-1">お仕事：</td><td>{profile.occupation || '-'}</td></tr>
                        <tr><td className="py-1">お酒：</td><td>{profile.alcohol || '-'}</td></tr>
                        <tr><td className="py-1">タバコ：</td><td>{profile.tobacco || '-'}</td></tr>
                        <tr><td className="py-1">兄弟姉妹：</td><td>{profile.siblings || '-'}</td></tr>
                    </tbody>
                </table>
                ) : (
                  <div className="text-white">データが見つかりません</div>
                )}
            </div>
            {/* Like button */}
            <div className="px-4 py-2">
                <button className="w-full border border-secondary text-white rounded py-2 flex items-center justify-center font-bold hover:bg-secondary hover:text-white transition" onClick={() => setShowEasyMessage(true)}>
                    <span className="mr-2">
                        <Heart /></span>
                    <span className="text-base">
                    </span>いいね
                </button>
            </div>
            {/* Recent post */}
            <div className="px-4 pt-4">
                <div className="font-bold text-sm mb-1 text-white">最近のつぶやき</div>
                <div className="flex items-center mb-1">
                    <img src={avatarSrc} alt="guest_thumb" className="w-6 h-6 rounded mr-2 border-2 border-secondary" />
                    <span className="text-xs font-bold text-white">まこちゃん</span>
                    <span className="text-xs text-white ml-2">弁護士・22.10</span>
                    <span className="ml-auto text-white text-lg">❤ 1</span>
                </div>
                <div className="text-xs text-white">よろしくお願いします！</div>
            </div>
        </div>
    );
};

// RankingPage component (unchanged)
const RankingPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [mainTab, setMainTab] = useState<'cast' | 'guest'>('guest');
    const [region, setRegion] = useState('全国');
    const [category, setCategory] = useState('ギフト');
    const [dateTab, setDateTab] = useState('昨日');
    const rankingData: Record<string, Array<{ rank: number, name: string, age: number | null, avatar: string }>> = {
        "今月": [
            { rank: 1, name: "キンさん", age: 46, avatar: "/assets/avatar/avatar-1.png" },
            { rank: 2, name: "タケシ", age: null, avatar: "/assets/avatar/2.jpg" },
            { rank: 3, name: "リサ", age: 25, avatar: "/assets/avatar/avatar-2.png" },
            { rank: 4, name: "マイク", age: 40, avatar: "/assets/avatar/man.png" },
            { rank: 5, name: "エミ", age: 22, avatar: "/assets/avatar/female.png" },
        ],
        "昨日": [
            { rank: 1, name: "さくら", age: 28, avatar: "/assets/avatar/1.jpg" },
            { rank: 2, name: "ジョン", age: 32, avatar: "/assets/avatar/knight_3275232.png" },
            { rank: 3, name: "R491TBD", age: null, avatar: "/assets/avatar/avatar-2.png" },
            { rank: 4, name: "m(_ _)m", age: 34, avatar: "/assets/avatar/avatar-1.png" },
            { rank: 5, name: "スカイ", age: null, avatar: "/assets/avatar/francesco-ZxNKxnR32Ng-unsplash.jpg" },
        ],
        "先週": [
            { rank: 1, name: "リナ", age: 30, avatar: "/assets/avatar/ian-robinson-DfKZs6DOrw4-unsplash.jpg" },
            { rank: 2, name: "タケシ", age: null, avatar: "/assets/avatar/2.jpg" },
            { rank: 3, name: "R491TBD", age: null, avatar: "/assets/avatar/avatar-2.png" },
            { rank: 4, name: "マイク", age: 40, avatar: "/assets/avatar/man.png" },
            { rank: 5, name: "エミ", age: 22, avatar: "/assets/avatar/female.png" },
        ],
        "先月": [
            { rank: 1, name: "アキラ", age: 35, avatar: "/assets/avatar/jf-brou-915UJQaxtrk-unsplash.jpg" },
            { rank: 2, name: "ジョン", age: 32, avatar: "/assets/avatar/knight_3275232.png" },
            { rank: 3, name: "リサ", age: 25, avatar: "/assets/avatar/avatar-2.png" },
            { rank: 4, name: "m(_ _)m", age: 34, avatar: "/assets/avatar/avatar-1.png" },
            { rank: 5, name: "スカイ", age: null, avatar: "/assets/avatar/francesco-ZxNKxnR32Ng-unsplash.jpg" },
        ],
        "全期間": [
            { rank: 1, name: "ユウタ", age: 29, avatar: "/assets/avatar/harald-hofer-pKoKW6UQOuk-unsplash.jpg" },
            { rank: 2, name: "タケシ", age: null, avatar: "/assets/avatar/2.jpg" },
            { rank: 3, name: "リサ", age: 25, avatar: "/assets/avatar/avatar-2.png" },
            { rank: 4, name: "マイク", age: 40, avatar: "/assets/avatar/man.png" },
            { rank: 5, name: "エミ", age: 22, avatar: "/assets/avatar/female.png" },
        ],
    };
    const categories = ['総合', 'パトフリー一覧', 'コパト', 'ギフト'];
    const dateTabs = ['今月', '昨日', '先週', '先月', '全期間'];
    const ranking = rankingData[dateTab] || [];
    return (
        <div className="max-w-md mx-auto pb-8 bg-primary min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-secondary">
                <button onClick={onBack} className="text-2xl text-white font-bold">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold text-white">ランキング</span>
                <span></span>
            </div>
            {/* Main Tabs */}
            <div className="flex items-center space-x-2 px-4 py-3">
                <button onClick={() => setMainTab('cast')} className={`px-4 py-2 rounded-lg font-bold ${mainTab === 'cast' ? 'bg-secondary text-white' : 'bg-primary text-white border border-secondary'}`}>キャスト</button>
                <button onClick={() => setMainTab('guest')} className={`px-4 py-2 rounded-lg font-bold ${mainTab === 'guest' ? 'bg-secondary text-white' : 'bg-primary text-white border border-secondary'}`}>ゲスト</button>
                <div className="flex-1" />
                <div className="relative">
                    <select
                        className="flex items-center border border-secondary rounded px-3 py-1 text-white bg-primary"
                        value={region}
                        onChange={e => setRegion(e.target.value)}
                    >
                        <option value="全国">全国</option>
                        <option value="北海道">北海道</option>
                        <option value="東京都">東京都</option>
                        <option value="大阪府">大阪府</option>
                        <option value="愛知県">愛知県</option>
                        {/* Add more regions as needed */}
                    </select>
                </div>
            </div>
            {/* Category Buttons */}
            <div className="flex space-x-2 px-4 pb-2">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-1 rounded-lg font-bold border border-secondary ${category === cat ? 'bg-secondary text-white' : 'bg-primary text-white'}`}>{cat}</button>
                ))}
            </div>
            {/* Date Tabs */}
            <div className="px-4 mt-4 mx-auto w-full">
                <div className='flex text-sm w-full'>
                    {dateTabs.map(tab => (
                        <button key={tab} onClick={() => setDateTab(tab)} className={`${dateTab === tab ? 'flex-1 py-2 text-white border-b border-secondary' : 'flex-1 py-2 text-white'}`}>{tab}</button>
                    ))}
                </div>
            </div>
            {/* Ranking List */}
            <div className="pt-4">
                {ranking.map((user, idx) => (
                    user.rank === 1 ? (
                        <div key={user.rank} className="flex flex-col items-center px-4 py-4">
                            <div className="flex items-center mb-2 w-full">
                                <div className="w-6 h-6 bg-secondary text-white flex items-center justify-center rounded font-bold mr-2">{user.rank}</div>
                            </div>
                            <div className="flex flex-col items-center w-full">
                                <div className="w-28 h-28 rounded-full border-4 border-secondary overflow-hidden mb-2">
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="text-lg font-bold text-white">{user.name}{user.age && `　${user.age}歳`}</div>
                            </div>
                        </div>
                    ) : (
                        <div key={user.rank} className="flex items-center px-4 py-2 border-b border-secondary">
                            <div className={`flex items-center justify-center w-8 h-8 text-lg font-bold ${user.rank === 2 ? 'text-white bg-primary border border-secondary rounded' : user.rank === 3 ? 'text-white bg-secondary rounded' : 'text-white bg-primary border border-secondary rounded'}`}>{user.rank}</div>
                            <div className="mx-4">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-4 border-transparent" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl text-white">👤</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="text-base font-bold text-white">{user.name}{user.age && `　${user.age}歳`}</div>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

// Add EasyMessagePage component
const EasyMessagePage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="max-w-md mx-auto bg-primary min-h-screen pb-8 relative">
            {/* Header with close button */}
            <div className="flex items-center px-4 pt-4 pb-2">
                <button onClick={onClose} className="text-2xl text-white font-bold">×</button>
                <div className="flex-1 text-center text-lg font-bold -ml-8 text-white">らくらくメッセ</div>
                <div style={{ width: 32 }} /> {/* Spacer for symmetry */}
            </div>
            {/* Description */}
            <div className="px-4 text-sm text-white mb-4">
                らくらくメッセを使うと、おすすめのゲスト25~30人にメッセージが送れるよ♪簡単にアポゲット！
            </div>
            {/* Region select */}
            <div className="px-4 mb-2">
                <div className="flex items-center justify-between">
                    <span className="text-base font-bold mr-2 text-white">地域を選択</span>
                    <button className="border border-secondary rounded px-4 py-2 text-base font-bold flex items-center text-white bg-primary">
                        全国 <span className="ml-2">▼</span>
                    </button>
                </div>
                <div className="text-xs text-white mt-1">*地域を選択すると、その地域をよく利用するゲストに送信されます。</div>
            </div>
            {/* Message textarea */}
            <div className="px-4 mb-8">
                <textarea
                    className="w-full h-28 border border-secondary rounded bg-primary p-3 text-base resize-none focus:outline-none text-white"
                    placeholder="ここにメッセージを入力..."
                />
            </div>
            {/* Nickname note */}
            <div className="px-4 text-xs text-white mb-2">
                文中に“%”と入力すると、ゲストのニックネームが表示されます。 例）“%さん” → 「ゲストの名前」さん
            </div>
            {/* Checkbox for history */}
            <div className="px-4 flex items-center mb-8">
                <input type="checkbox" id="saveHistory" className="mr-2 w-4 h-4" />
                <label htmlFor="saveHistory" className="text-xs text-white">チェックを入れると次回以降、履歴として保存します</label>
            </div>
            <div className="px-4 text-xs text-white mb-8">※ 履歴として保存できるのは最大6個までとなります。</div>
            {/* No history message */}
            <div className="px-4 text-center text-white mb-8">履歴がまだありません。</div>
            {/* Send button */}
            <div className="px-4 mb-2">
                <button className="w-full bg-secondary text-white rounded py-3 font-bold text-base hover:bg-red-700 transition" disabled>
                    メッセージを送信する
                </button>
            </div>
            {/* Note about sending time */}
            <div className="px-4 text-xs text-white text-center">
                メッセージの送信に10秒ほどかかる場合があります
            </div>
        </div>
    );
};

const CastSearchPage: React.FC = () => {
    const [showRanking, setShowRanking] = useState(false);
    const [showGuestDetail, setShowGuestDetail] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<RepeatGuest | null>(null);
    const [repeatGuests, setRepeatGuests] = useState<RepeatGuest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEasyMessage, setShowEasyMessage] = useState(false);
    React.useEffect(() => {
        getRepeatGuests().then(setRepeatGuests).finally(() => setLoading(false));
    }, []);
    if (showGuestDetail && selectedGuest) {
        return <GuestDetailPage onBack={() => setShowGuestDetail(false)} guest={selectedGuest} />;
    }
    if (showRanking) {
        return <RankingPage onBack={() => setShowRanking(false)} />;
    }
    if (showEasyMessage) {
        return <EasyMessagePage onClose={() => setShowEasyMessage(false)} />;
    }
    return (
        <div className="flex-1 max-w-md pb-20 bg-primary">
            {/* Top bar with filter and crown */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="text-white">
                    <Bell />
                </span>
                <button className="flex items-center bg-secondary text-white rounded-full px-4 py-1 font-bold text-base"><span className="mr-2">
                    <SlidersHorizontal /></span>絞り込み中</button>
                <span className="text-2xl text-white cursor-pointer" onClick={() => setShowRanking(true)}>
                    <img src="/assets/icons/crown.png" alt='crown' />
                </span>
            </div>
            {/* Repeat guests */}
            <div className="px-4 pt-2 pb-1 flex items-center justify-between">
                <span className="text-base font-bold text-white">あなたにリピートしそうなゲスト <span className="text-xs text-white ml-1">i</span></span>
                <button className="text-xs text-white font-bold">すべて見る &gt;</button>
            </div>
            <div className="gap-3 px-4 pb-4 max-w-md mx-auto overflow-x-auto flex flex-row">
                {loading ? (
                  <div className="text-white col-span-2">ローディング...</div>
                ) : repeatGuests.length === 0 ? (
                  <div className="text-white col-span-2">該当ゲストなし</div>
                ) : repeatGuests.map((guest) => (
                    <div
                        key={guest.id}
                        className="bg-primary rounded-lg shadow relative cursor-pointer transition-transform hover:scale-105 border border-secondary flex flex-col items-center p-3"
                        onClick={() => {
                            setSelectedGuest(guest);
                            setShowGuestDetail(true);
                        }}
                    >
                        <div className="w-20 h-20 mb-2 relative">
                            <img
                                src={guest.avatar ? (guest.avatar.startsWith('http') ? guest.avatar : `${API_BASE_URL}/${guest.avatar}`) : '/assets/avatar/female.png'}
                                alt={guest.nickname}
                                className="w-full h-full object-cover rounded-lg border-2 border-secondary"
                            />
                        </div>
                        <div className="text-xs text-white font-bold truncate w-full text-center">{guest.nickname}</div>
                        <div className="text-xs text-white">{guest.reservations_count}回利用</div>
                    </div>
                ))}
            </div>
            {/* Previous search results */}
            <div className="px-4 pt-2 pb-1 text-base font-bold text-white">前回の検索結果</div>
            <div className="grid grid-cols-2 gap-4 px-4 ">
                {repeatGuests.map((guest) => (
                    <div
                        key={guest.id}
                        className="bg-primary rounded-lg shadow relative cursor-pointer transition-transform hover:scale-105 border border-secondary flex flex-col items-center p-3"
                        onClick={() => {
                            setSelectedGuest(guest);
                            setShowGuestDetail(true);
                        }}
                    >
                        <div className="w-32 h-32 mb-2 relative">
                            <img
                                src={guest.avatar ? (guest.avatar.startsWith('http') ? guest.avatar : `${API_BASE_URL}/${guest.avatar}`) : '/assets/avatar/female.png'}
                                alt={guest.nickname}
                                className="w-full h-full object-cover rounded-lg border-2 border-secondary"
                            />
                        </div>
                    </div>
                ))}
            </div>
            {/* Floating yellow button */}
            <button
                className="fixed left-1/2 -translate-x-1/2 bottom-20 z-30 bg-secondary text-white rounded-full px-8 py-4 shadow-lg font-bold text-lg flex items-center hover:bg-red-700 transition"
                onClick={() => setShowEasyMessage(true)}
            >
                <span className="mr-2">
                    <MessageCircleQuestionMark /></span>らくらく
            </button>
        </div>
    );
};

export default CastSearchPage; 