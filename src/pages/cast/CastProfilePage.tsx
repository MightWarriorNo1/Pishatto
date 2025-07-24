import React, { useState } from 'react';
import { Bell, CircleQuestionMark, Gift, Pencil, QrCode, Settings, Users, ChartSpline, UserPlus, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CastGiftBoxPage from './CastGiftBoxPage';
import CastActivityRecordPage from './CastActivityRecordPage';
import CastFriendReferralPage from './CastFriendReferralPage';
import CastImmediatePaymentPage from './CastImmediatePaymentPage';

const campaignImages = [
    "/assets/avatar/2.jpg",
    "/assets/avatar/AdobeStock_1067731649_Preview.jpeg",
    // Add more image paths as needed
];

const CastProfilePage: React.FC = () => {
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();
    const [showGiftBox, setShowGiftBox] = useState(false);
    const [showActivityRecord, setShowActivityRecord] = useState(false);
    const [showFriendReferral, setShowFriendReferral] = useState(false);
    const [showImmediatePayment, setShowImmediatePayment] = useState(false);
    const castId = Number(localStorage.getItem('castId'));

    if (showGiftBox) return <CastGiftBoxPage onBack={() => setShowGiftBox(false)} />;
    if (showActivityRecord) return <CastActivityRecordPage onBack={() => setShowActivityRecord(false)} />;
    if (showFriendReferral) return <CastFriendReferralPage onBack={() => setShowFriendReferral(false)} />;
    if (showImmediatePayment) return <CastImmediatePaymentPage onBack={() => setShowImmediatePayment(false)} />;

    return (
        <div className="max-w-md mx-auto bg-primary min-h-screen pb-24">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 bg-primary border-b border-secondary">
                <span className="text-2xl text-white">
                    <Bell />
                </span>
                <span className="text-xl font-bold text-white">マイページ</span>
                <div className="flex items-center space-x-2">
                    <span className="text-2xl text-white">
                        <QrCode />
                    </span>
                    <span className="text-2xl text-white">
                        <Settings />
                    </span>
                </div>
            </div>
            {/* Campaign/Event Banners */}
            <div className="px-4 pt-2 flex flex-col items-center">
                <div className="rounded-lg overflow-hidden mb-2 w-full border-2 border-secondary">
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
                            className={`w-2 h-2 rounded-full ${current === idx ? 'bg-secondary' : 'bg-gray-700'}`}
                            onClick={() => setCurrent(idx)}
                            style={{ transition: 'background 0.2s' }}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
            {/* WhiteDay Event Card */}
            <div className="bg-primary border border-secondary rounded-lg mx-4 my-2 p-3 flex flex-col">
                <div className="flex items-center mb-1">
                    <span className="text-white mr-2">
                        <Bell />
                    </span>
                    <span className="text-xs text-white">WhiteDayイベントはアイテムを活用してギフトゲット！？</span>
                </div>
                <img src="/assets/icons/profile_number.png" alt='profile_number' />
            </div>
            {/* Top row: avatar, name, pencil */}
            <div className="flex items-center justify-between px-4 pt-6">
                <div className="flex items-center">
                    <img src="/assets/avatar/1.jpg" alt="profile" className="w-10 h-10 rounded-full mr-2 border-2 border-secondary" />
                    <span className="font-bold text-lg text-white">◎ えま◎</span>
                </div>
                <button className="text-white">
                    <Pencil />
                </button>
            </div>

            <div className="flex items-center justify-between px-4 pt-6">
                <Link to="/cast/grade-detail">
                    <img src="/assets/icons/profile_badge.png" alt="badge" className="border-2 border-secondary rounded-lg" />
                </Link>
            </div>
            {/* Points Section */}
            <div className="bg-primary border border-secondary rounded-lg mx-4 my-2 p-4">
                <div className="flex items-center mb-2">
                    <span className="text-xs font-medium text-white mr-2">今月の総売上ポイント</span>
                    <span className="text-xs text-white">
                        <CircleQuestionMark />
                    </span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">133,920P</div>
                <div className="flex space-x-2 mb-2">
                    <div className="flex-1 bg-gray-900 rounded-lg p-2 text-center border border-secondary">
                        <div className="text-xs text-gray-400">ギフト獲得ポイント</div>
                        <div className="font-bold text-lg text-white">21,600p</div>
                    </div>
                    <div className="flex-1 bg-gray-900 rounded-lg p-2 text-center border border-secondary">
                        <div className="text-xs text-gray-400">今月のコパトバック率</div>
                        <div className="font-bold text-lg text-white">78%</div>
                    </div>
                </div>
                <button className="w-full py-2 rounded-lg bg-secondary text-white font-bold hover:bg-red-700 transition" onClick={() => navigate('/cast/point-history')}>所持ポイント確認・精算</button>
            </div>
            {/* Copat-back Rate Section */}
            <div className="bg-primary border border-secondary rounded-lg mx-4 my-2 p-4">
                <div className="w-full flex items-center mb-2">
                    <span className="w-full bg-secondary text-white rounded px-2 py-1 text-lg font-bold mr-2 text-center h-10">アポに参加で最大コパトバック率90%</span>
                </div>
                <div className="flex flex-col justify-between mb-2">
                    <div className="text-white">
                        コバトバック率ステップ
                    </div>
                    <div className='flex flex-row justify-between'>
                        <div>
                            <div className="text-xs text-gray-400">今月の累計参加時間</div>
                            <div className="font-bold text-lg text-white">6時間</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400">来月のコパトバック率</div>
                            <div className="font-bold text-lg text-white">75%</div>
                        </div>
                    </div>
                </div>
                <div className="w-full h-2 bg-gray-900 rounded mb-2">
                    <div className="h-2 bg-secondary rounded" style={{ width: '60%' }} />
                </div>
                <div className="text-xs text-gray-400 text-center mb-2">次のステップまで4時間</div>
            </div>
            {/* Passport/Partner Shop Cards */}
            <div className="bg-primary border border-secondary rounded-lg mx-4 my-2 p-4">
                <div className="font-bold text-base mb-2 text-white">pishattoパスポート</div>
                <div className="flex space-x-2 overflow-x-auto overflow-y-auto">
                    <div className="w-60 h-24 bg-gray-900 rounded-lg min-w-[120px] flex justify-center text-xs border border-secondary">
                        <img src="/assets/avatar/AdobeStock_1095142160_Preview.jpeg" alt='img1' />
                    </div>
                    <div className="w-60 h-24 bg-gray-900 rounded-lg min-w-[120px] flex justify-center text-xs border border-secondary">
                        <img src="/assets/avatar/AdobeStock_1067731649_Preview.jpeg" alt='img1' />
                    </div>
                    <div className="w-60 h-24 bg-gray-900 rounded-lg  min-w-[120px] flex justify-center text-xs border border-secondary">
                        <img src="/assets/avatar/AdobeStock_1190678828_Preview.jpeg" alt='img1' />
                    </div>
                    <div className="w-60 h-24 bg-gray-900 rounded-lg min-w-[120px] flex justify-center text-xs border border-secondary">
                        <img src="/assets/avatar/AdobeStock_1537463438_Preview.jpeg" alt='img1' />
                    </div>
                    <div className="w-60 h-24 bg-gray-900 rounded-lg flex min-w-[120px] justify-center text-xs border border-secondary">
                        <img src="/assets/avatar/AdobeStock_1537463446_Preview.jpeg" alt='img1' />
                    </div>
                </div>
            </div>
            {/* Menu List */}
            <div className="bg-primary border border-secondary rounded-lg mx-4 my-2 p-2 divide-y divide-gray-800">
                {/* <div className="w-full flex items-center px-4 py-4 text-left cursor-pointer hover:bg-gray-900 transition" onClick={() => setShowPointHistory(true)}>
                    <span className="text-xl mr-3 text-white">
                        <ChartSpline />
                    </span>
                    <span className='flex-1 text-white'>ポイント履歴</span>
                    <span className="text-gray-400">
                        <ChevronRight />
                    </span>
                </div>
                <div className="w-full flex items-center px-4 py-4 text-left cursor-pointer hover:bg-gray-900 transition" onClick={() => setShowReceipts(true)}>
                    <span className="text-xl mr-3 text-white">
                        <Gift />
                    </span>
                    <span className='flex-1 text-white'>領収書</span>
                    <span className="text-gray-400">
                        <ChevronRight />
                    </span>
                </div>
                <div className="w-full flex items-center px-4 py-4 text-left cursor-pointer hover:bg-gray-900 transition" onClick={() => setShowPaymentInfo(true)}>
                    <span className="text-xl mr-3 text-white">
                        <Pencil />
                    </span>
                    <span className='flex-1 text-white'>お支払い情報</span>
                    <span className="text-gray-400">
                        <ChevronRight />
                    </span>
                </div> */}
                <div className="w-full flex items-center px-4 py-4 text-left cursor-pointer hover:bg-secondary transition" onClick={() => setShowGiftBox(true)}>
                    <span className="text-xl mr-3 text-white">
                        <Gift />
                    </span>
                    <span className='flex-1 text-white'>ギフトボックス</span>
                    <span className="text-gray-400">
                        <ChevronRight />
                    </span>
                </div>
                <div className="w-full flex items-center px-4 py-4 text-left cursor-pointer hover:bg-secondary transition" onClick={() => setShowActivityRecord(true)}>
                    <span className="text-xl mr-3 text-white">
                        <ChartSpline />
                    </span>
                    <span className='flex-1 text-white'>活動実績</span>
                    <span className="text-gray-400">
                        <ChevronRight />
                    </span>
                </div>
                <div className="w-full flex items-center px-4 py-4 text-left cursor-pointer hover:bg-secondary transition" onClick={() => setShowFriendReferral(true)}>
                    <span className="text-xl mr-3 text-white">
                        <Users />
                    </span>
                    <span className='flex-1 text-white'>お友達紹介</span>
                    <span className="text-gray-400">
                        <ChevronRight />
                    </span>
                </div>
                <div className="w-full flex items-center px-4 py-4 text-left cursor-pointer hover:bg-secondary transition" onClick={() => setShowImmediatePayment(true)}>
                    <span className="text-xl mr-3 text-white">
                        <UserPlus />
                    </span>
                    <span className='flex-1 text-white'>すぐ入金</span>
                    <span className="text-gray-400">
                        <ChevronRight />
                    </span>
                </div>
            </div>
            {/* Info/Warning Box */}
            <div className="bg-gray-900 border border-secondary rounded-lg mx-4 my-2 p-4 text-xs text-white">
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
            </div>
            {/* Bottom bar space */}
            <div className="h-20" />
        </div>
    );
};

export default CastProfilePage; 