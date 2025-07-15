import React, { useState } from 'react';
import { BadgeQuestionMark, Bell, CircleQuestionMark, Gift, Pencil, QrCode, Settings, Users, ChartSpline, UserPlus, UserCheck, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const campaignImages = [
    "/assets/avatar/2.jpg",
    "/assets/avatar/AdobeStock_1067731649_Preview.jpeg",
    // Add more image paths as needed
];

const CastProfilePage: React.FC = () => {
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();

    return (
        <div className="max-w-md mx-auto bg-[#f7f8fa] min-h-screen pb-24">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 bg-white">
                <span className="text-2xl text-gray-700">
                    <Bell />
                </span>
                <span className="text-xl font-bold">マイページ</span>
                <div className="flex items-center space-x-2">
                    <span className="text-2xl text-gray-700">
                        <QrCode />
                    </span>
                    <span className="text-2xl text-gray-700">
                        <Settings />
                    </span>
                </div>
            </div>
            {/* Campaign/Event Banners */}
            <div className="px-4 pt-2 flex flex-col items-center">
                <div className="rounded-lg overflow-hidden mb-2 w-full">
                    <img
                        src={campaignImages[current]}
                        alt={`campaign-${current}`}
                        className="w-full h-16 object-cover"
                    />
                </div>
                {/* Dots */}
                <div className="flex justify-center items-center space-x-1 mt-1">
                    {campaignImages.map((_, idx) => (
                        <button
                            key={idx}
                            className={`w-2 h-2 rounded-full ${current === idx ? 'bg-gray-800' : 'bg-gray-300'}`}
                            onClick={() => setCurrent(idx)}
                            style={{ transition: 'background 0.2s' }}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
            {/* WhiteDay Event Card */}
            <div className="bg-white rounded-lg mx-4 my-2 p-3 flex flex-col">
                <div className="flex items-center mb-1">
                    <span className="text-gray-500 mr-2">
                        <Bell />
                    </span>
                    <span className="text-xs text-gray-700">WhiteDayイベントはアイテムを活用してギフトゲット！？</span>
                </div>
                <img src="/assets/icons/profile_number.png" />
            </div>
            {/* Top row: avatar, name, pencil */}
            <div className="flex items-center justify-between px-4 pt-6">
                <div className="flex items-center">
                    <img src="/assets/avatar/1.jpg" alt="profile" className="w-10 h-10 rounded-full mr-2" />
                    <span className="font-bold text-lg">◎ えま◎</span>
                </div>
                <button className="text-gray-400">
                    <Pencil />
                </button>
            </div>

            <div className="flex items-center justify-between px-4 pt-6">
                <Link to="/cast/grade-detail">
                    <img src="/assets/icons/profile_badge.png" alt="badge" />
                </Link>
            </div>
            {/* Points Section */}
            < div className="bg-white rounded-lg mx-4 my-2 p-4" >
                <div className="flex items-center mb-2">
                    <span className="text-xs font-medium text-gray-700 mr-2">今月の総売上ポイント</span>
                    <span className="text-xs text-gray-400">
                        <CircleQuestionMark />
                    </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">133,920P</div>
                <div className="flex space-x-2 mb-2">
                    <div className="flex-1 bg-gray-300 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-500">ギフト獲得ポイント</div>
                        <div className="font-bold text-lg">21,600p</div>
                    </div>
                    <div className="flex-1 bg-gray-300 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-500">今月のコパトバック率</div>
                        <div className="font-bold text-lg">78%</div>
                    </div>
                </div>
                <button className="w-full py-2 rounded-lg bg-purple-500 text-white font-bold" onClick={() => navigate('/cast/point-history')}>所持ポイント確認・精算</button>
            </div >
            {/* Copat-back Rate Section */}
            < div className="bg-white rounded-lg mx-4 my-2 p-4" >
                <div className="w-full flex items-center mb-2">
                    <span className="w-full bg-orange-200 text-orange-700 rounded px-2 py-1 text-lg font-bold mr-2 text-center h-10">アポに参加で最大コパトバック率90%</span>
                </div>
                <div className="flex flex-col justify-between mb-2">
                    <div>
                        コバトバック率ステップ
                    </div>
                    <div className='flex flex-row justify-between'>
                        <div>
                            <div className="text-xs text-gray-700">今月の累計参加時間</div>
                            <div className="font-bold text-lg">6時間</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-700">来月のコパトバック率</div>
                            <div className="font-bold text-lg">75%</div>
                        </div>
                    </div>
                </div>
                <div className="w-full h-2 bg-yellow-200 rounded mb-2">
                    <div className="h-2 bg-yellow-400 rounded" style={{ width: '60%' }} />
                </div>
                <div className="text-xs text-gray-500 text-center mb-2">次のステップまで4時間</div>
                {/* <div className="bg-white rounded-lg p-2 border flex items-center">
                    <span className="bg-gray-200 text-xs rounded px-2 py-1 mr-2">ステップ01</span>
                    <span className="font-bold text-orange-500 mr-2">5%アップ！</span>
                    <span className="text-xs text-gray-700">達成条件：累計1時間アポに参加</span>
                    <span className="ml-auto text-gray-400">✔️</span>
                </div> */}
            </div >
            {/* Passport/Partner Shop Cards */}
            < div className="bg-white rounded-lg mx-4 my-2 p-4" >
                <div className="font-bold text-base mb-2">pishattoパスポート</div>
                <div className="flex space-x-2 overflow-x-auto overflow-y-auto">
                    <div className="w-60 h-24 bg-gray-200 rounded-lg flex justify-center text-xs">
                        <img src="/assets/avatar/AdobeStock_1095142160_Preview.jpeg" />
                    </div>
                    <div className="w-60 h-24 bg-gray-200 rounded-lg flex justify-center text-xs">
                        <img src="/assets/avatar/AdobeStock_1067731649_Preview.jpeg" />
                    </div>
                    <div className="w-60 h-24 bg-gray-200 rounded-lg flex justify-center text-xs">
                        <img src="/assets/avatar/AdobeStock_1190678828_Preview.jpeg" />
                    </div>
                    <div className="w-60 h-24 bg-gray-200 rounded-lg flex justify-center text-xs">
                        <img src="/assets/avatar/AdobeStock_1537463438_Preview.jpeg" />
                    </div>
                    <div className="w-60 h-24 bg-gray-200 rounded-lg flex justify-center text-xs">
                        <img src="/assets/avatar/AdobeStock_1537463446_Preview.jpeg" />
                    </div>
                </div>
            </div >
            {/* Menu List */}
            < div className="bg-white rounded-lg mx-4 my-2 p-2 divide-y" >
                <div className="flex items-center py-3">
                    <span className="text-xl mr-3">
                        <Gift />
                    </span>ギフトボックス
                </div>
                <div className="flex items-center py-3">
                    <span className="text-xl mr-3">
                        <ChartSpline />
                    </span>活動実績
                </div>
                <div className="flex items-center py-3">
                    <span className="text-xl mr-3">
                        <Users />
                    </span>お友達キャスト管理
                </div>
                <div className="flex items-center py-3">
                    <span className="text-xl mr-3">
                        <UserPlus />
                    </span>お友達紹介
                </div>
                <div className="flex items-center py-3">
                    <span className="text-xl mr-3">
                        <UserCheck />
                    </span>本人認証
                </div>
                <div className="flex items-center py-3">
                    <span className="text-xl mr-3">
                        <BookOpen />
                    </span>pishattoパーフェクトマニュアル
                </div>
                <div className="flex items-center py-3">
                    <span className="text-xl mr-3">
                        <BadgeQuestionMark />
                    </span>ヘルプ
                </div>
            </div >
            {/* Info/Warning Box */}
            < div className="bg-gray-100 rounded-lg mx-4 my-2 p-4 text-xs text-gray-700" >
                <div className="mb-2">通報・クレーム・低評価など以外にも、以下の事例等が確認された場合、アカウントが凍結となりサービスの利用ができなくなります。</div>
                <ul className="list-disc pl-5 mb-2">
                    <li>中抜き、現金の授受行為</li>
                    <li>タイマーの虚偽報告</li>
                    <li>アポイントのドタキャン・遅刻</li>
                    <li>自宅やホテル等、鍵付き個室の利用</li>
                    <li>競合サービスの登録・利用</li>
                    <li>他ユーザーの情報開示・漏洩</li>
                    <li>その他規約違反行為を伴う合流</li>
                </ul>
                <div>残念ながら毎月一定のキャストが該当してしまっています。日本一笑顔を作り、日本一稼げるサービスを一緒につくっていきましょう。</div>
            </div >
            {/* Bottom bar space */}
            < div className="h-20" />
        </div >
    );
};

export default CastProfilePage; 