import React, { useState } from 'react';
import { SlidersHorizontal, Bell, MessageCircleQuestionMark, ChevronLeft } from 'lucide-react';

// GuestDetailPage component
type GuestDetailPageProps = { onBack: () => void; avatarFilename: string };
const GuestDetailPage: React.FC<GuestDetailPageProps> = ({ onBack, avatarFilename }) => {
    const avatarSrc = `/assets/avatar/${avatarFilename}`;
    return (
        <div className="max-w-md mx-auto bg-white min-h-screen pb-8">
            {/* Header with back button */}
            <div className="flex items-center px-2 pt-2 pb-2">
                <button onClick={onBack} className="text-2xl text-gray-700 font-bold">
                    <ChevronLeft />
                </button>
            </div>
            {/* Main image */}
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <img src={avatarSrc} alt="guest_detail" className="object-contain h-full mx-auto" />
            </div>
            {/* Badge */}
            <div className="px-4 mt-2">
                <span className="inline-block bg-orange-500 text-white text-xs rounded px-2 py-0.5">最近入会</span>
            </div>
            {/* Profile card */}
            <div className="flex items-center px-4 py-2 mt-2 bg-white rounded shadow">
                <img src={avatarSrc} alt="guest_thumb" className="w-10 h-10 rounded mr-2" />
                <div>
                    <div className="font-bold text-sm">オフライン中  まこちゃん</div>
                    <div className="text-xs text-gray-500">弁護士 / お酒がすき</div>
                </div>
            </div>
            {/* Profile details */}
            <div className="px-4 py-2">
                <table className="w-full text-sm text-gray-700">
                    <tbody>
                        <tr><td className="py-1">身長：</td><td>175</td></tr>
                        <tr><td className="py-1">居住地：</td><td>東京都</td></tr>
                        <tr><td className="py-1">出身地：</td><td>北海道</td></tr>
                        <tr><td className="py-1">学歴：</td><td>大学卒</td></tr>
                        <tr><td className="py-1">年収：</td><td>400万〜600万</td></tr>
                        <tr><td className="py-1">お仕事：</td><td>弁護士</td></tr>
                        <tr><td className="py-1">お酒：</td><td>ときどき飲む</td></tr>
                        <tr><td className="py-1">タバコ：</td><td>ときどき吸う</td></tr>
                        <tr><td className="py-1">兄弟姉妹：</td><td>長男</td></tr>
                    </tbody>
                </table>
            </div>
            {/* Like button */}
            <div className="px-4 py-2">
                <button className="w-full border border-orange-400 text-orange-500 rounded py-2 flex items-center justify-center font-bold">
                    <span className="mr-2">🧡</span>いいね
                </button>
            </div>
            {/* Recent post */}
            <div className="px-4 pt-4">
                <div className="font-bold text-sm mb-1">最近のつぶやき</div>
                <div className="flex items-center mb-1">
                    <img src={avatarSrc} alt="guest_thumb" className="w-6 h-6 rounded mr-2" />
                    <span className="text-xs font-bold">まこちゃん</span>
                    <span className="text-xs text-gray-400 ml-2">弁護士・22.10</span>
                    <span className="ml-auto text-pink-500 text-lg">❤ 1</span>
                </div>
                <div className="text-xs text-gray-700">よろしくお願いします！</div>
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
    const categories = ['総合', 'パトコール', 'コパト', 'ギフト'];
    const dateTabs = ['今月', '昨日', '先週', '先月', '全期間'];
    const ranking = rankingData[dateTab] || [];
    return (
        <div className="max-w-md mx-auto pb-8 bg-white min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b">
                <button onClick={onBack} className="text-2xl text-gray-700 font-bold">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold">ランキング</span>
                <span></span>
            </div>
            {/* Main Tabs */}
            <div className="flex items-center space-x-2 px-4 py-3">
                <button onClick={() => setMainTab('cast')} className={`px-4 py-2 rounded-lg font-bold ${mainTab === 'cast' ? 'bg-gray-100 text-gray-700' : 'bg-white text-gray-400 border'}`}>キャスト</button>
                <button onClick={() => setMainTab('guest')} className={`px-4 py-2 rounded-lg font-bold ${mainTab === 'guest' ? 'bg-gray-900 text-white' : 'bg-white text-gray-400 border'}`}>ゲスト</button>
                <div className="flex-1" />
                <div className="relative">
                    <select
                        className="flex items-center border rounded px-3 py-1 text-gray-700 bg-white"
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
                    <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-1 rounded-lg font-bold border ${category === cat ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}>{cat}</button>
                ))}
            </div>
            {/* Date Tabs */}
            <div className="px-4 mt-4 mx-auto w-full">
                <div className='flex text-sm w-full'>
                    {dateTabs.map(tab => (
                        <button key={tab} onClick={() => setDateTab(tab)} className={`${dateTab === tab ? 'flex-1 py-2 text-black border-b border-black' : 'flex-1 py-2 text-gray-400'}`}>{tab}</button>
                    ))}
                </div>
            </div>
            {/* Ranking List */}
            <div className="pt-4">
                {ranking.map((user, idx) => (
                    user.rank === 1 ? (
                        <div key={user.rank} className="flex flex-col items-center px-4 py-4">
                            <div className="flex items-center mb-2 w-full">
                                <div className="w-6 h-6 bg-purple-500 text-white flex items-center justify-center rounded font-bold mr-2">{user.rank}</div>
                            </div>
                            <div className="flex flex-col items-center w-full">
                                <div className="w-28 h-28 rounded-full border-4 border-purple-500 overflow-hidden mb-2">
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="text-lg font-bold text-gray-900">{user.name}{user.age && `　${user.age}歳`}</div>
                            </div>
                        </div>
                    ) : (
                        <div key={user.rank} className="flex items-center px-4 py-2 border-b">
                            <div className={`flex items-center justify-center w-8 h-8 text-lg font-bold ${user.rank === 2 ? 'text-gray-700 bg-gray-200 rounded' : user.rank === 3 ? 'text-white bg-orange-400 rounded' : ''}`}>{user.rank}</div>
                            <div className="mx-4">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-4 border-transparent" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">👤</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="text-base font-bold text-gray-900">{user.name}{user.age && `　${user.age}歳`}</div>
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
        <div className="max-w-md mx-auto bg-white min-h-screen pb-8 relative">
            {/* Header with close button */}
            <div className="flex items-center px-4 pt-4 pb-2">
                <button onClick={onClose} className="text-2xl text-gray-700 font-bold">×</button>
                <div className="flex-1 text-center text-lg font-bold -ml-8">らくらくメッセ</div>
                <div style={{ width: 32 }} /> {/* Spacer for symmetry */}
            </div>
            {/* Description */}
            <div className="px-4 text-sm text-gray-700 mb-4">
                らくらくメッセを使うと、おすすめのゲスト25~30人にメッセージが送れるよ♪簡単にアポゲット！
            </div>
            {/* Region select */}
            <div className="px-4 mb-2">
                <div className="flex items-center">
                    <span className="text-base font-bold mr-2">地域を選択</span>
                    <button className="border rounded px-4 py-2 text-base font-bold flex items-center">
                        全国 <span className="ml-2">▼</span>
                    </button>
                </div>
                <div className="text-xs text-gray-400 mt-1">*地域を選択すると、その地域をよく利用するゲストに送信されます。</div>
            </div>
            {/* Message textarea */}
            <div className="px-4 mb-2">
                <textarea
                    className="w-full h-28 border rounded bg-gray-50 p-3 text-base resize-none focus:outline-none"
                    placeholder="ここにメッセージを入力..."
                />
            </div>
            {/* Nickname note */}
            <div className="px-4 text-xs text-gray-500 mb-2">
                文中に“%”と入力すると、ゲストのニックネームが表示されます。 例）“%さん” → 「ゲストの名前」さん
            </div>
            {/* Checkbox for history */}
            <div className="px-4 flex items-center mb-2">
                <input type="checkbox" id="saveHistory" className="mr-2 w-4 h-4" />
                <label htmlFor="saveHistory" className="text-xs text-gray-700">チェックを入れると次回以降、履歴として保存します</label>
            </div>
            <div className="px-4 text-xs text-gray-400 mb-4">※ 履歴として保存できるのは最大6個までとなります。</div>
            {/* No history message */}
            <div className="px-4 text-center text-gray-400 mb-8">履歴がまだありません。</div>
            {/* Send button */}
            <div className="px-4 mb-2">
                <button className="w-full bg-gray-200 text-white rounded py-3 font-bold text-base" disabled>
                    メッセージを送信する
                </button>
            </div>
            {/* Note about sending time */}
            <div className="px-4 text-xs text-gray-400 text-center">
                メッセージの送信に10秒ほどかかる場合があります
            </div>
        </div>
    );
};

const CastSearchPage: React.FC = () => {
    const [showRanking, setShowRanking] = useState(false);
    const [showGuestDetail, setShowGuestDetail] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<string>("");
    const [showEasyMessage, setShowEasyMessage] = useState(false);
    // Array of avatar image filenames
    const avatarImages = [
        "1.jpg",
        "2.jpg",
        "avatar-1.png",
        "avatar-2.png",
    ];

    const location = [
        "female.png",
        "man.png",
        "francesco-ZxNKxnR32Ng-unsplash.jpg",
        "harald-hofer-pKoKW6UQOuk-unsplash.jpg",
        "ian-robinson-DfKZs6DOrw4-unsplash.jpg",
        "jf-brou-915UJQaxtrk-unsplash.jpg",
        "jonatan-pie-xgTMSz6kegE-unsplash.jpg",
        "knight_3275232.png",
        "mathew-schwartz-O31kjYCHzPY-unsplash.jpg",
        "ray-hennessy-xUUZcpQlqpM-unsplash.jpg",
        "smit-patel-dGMcpbzcq1I-unsplash.jpg",
        "tof-mayanoff-CS5vT_Kin3E-unsplash.jpg",
        "uriel-soberanes-oMvtVzcFPlU-unsplash.jpg"
    ]
    if (showGuestDetail) {
        return <GuestDetailPage onBack={() => setShowGuestDetail(false)} avatarFilename={selectedAvatar || "1.jpg"} />;
    }
    if (showRanking) {
        return <RankingPage onBack={() => setShowRanking(false)} />;
    }
    if (showEasyMessage) {
        return <EasyMessagePage onClose={() => setShowEasyMessage(false)} />;
    }
    return (
        <div className="max-w-md mx-auto pb-20">
            {/* Top bar with filter and crown */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span>
                    <Bell />
                </span>
                <button className="flex items-center bg-purple-500 text-white rounded-full px-4 py-1 font-bold text-base"><span className="mr-2">
                    <SlidersHorizontal /></span>絞り込み中</button>
                <span className="text-2xl text-gray-400 cursor-pointer" onClick={() => setShowRanking(true)}>
                    <img src="/assets/icons/crown.png" alt="crown" />
                </span>
            </div>
            {/* Repeat guests */}
            <div className="px-4 pt-2 pb-1 flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">あなたにリピートしそうなゲスト <span className="text-xs text-gray-400 ml-1">i</span></span>
                <button className="text-xs text-purple-500 font-bold">すべて見る &gt;</button>
            </div>
            <div className="flex space-x-2 px-4 pb-4">
                {avatarImages.map((filename, idx) => (
                    <div
                        key={filename}
                        className={`w-32 h-40 bg-gray-200 cursor-pointer rounded-lg flex items-center justify-center`}
                        onClick={() => {
                            setSelectedAvatar(filename);
                            setShowGuestDetail(true);
                        }}
                    >
                        <img
                            src={`/assets/avatar/${filename}`}
                            alt={`cast_search_${idx}`}
                            className="w-16 h-20 object-cover rounded-lg"
                        />
                    </div>
                ))}
            </div>
            {/* Previous search results */}
            <div className="px-4 pt-2 pb-1 text-base font-bold text-gray-900">前回の検索結果</div>
            <div className="grid grid-cols-2 gap-4 px-4">
                {location.map((filename, idx) => (
                    <div
                        key={filename}
                        className="w-full h-60 bg-gray-100 rounded-lg flex flex-col items-center justify-end p-2"
                    >
                        <img
                            src={`/assets/avatar/${filename}`}
                            alt={`search_result_${idx}`}
                            className="w-40 h-40 object-cover rounded-lg mb-2"
                        />
                        <div className="text-xs text-gray-700">検索結果 {idx + 1}</div>
                    </div>
                ))}
            </div>
            {/* Floating yellow button */}
            <button
                className="fixed left-1/2 -translate-x-1/2 bottom-20 z-30 bg-yellow-400 text-white rounded-full px-8 py-4 shadow-lg font-bold text-lg flex items-center"
                onClick={() => setShowEasyMessage(true)}
            >
                <span className="mr-2">
                    <MessageCircleQuestionMark /></span>らくらく
            </button>
        </div>
    );
};

export default CastSearchPage; 