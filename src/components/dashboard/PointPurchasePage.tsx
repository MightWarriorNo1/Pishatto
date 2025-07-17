import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

interface PointPurchasePageProps {
    onBack: () => void;
}

const pointOptions = [
    { points: 1000, price: 1200 },
    { points: 3000, price: 3600 },
    { points: 5000, price: 6000 },
    { points: 10000, price: 12000 },
    { points: 30000, price: 36000 },
    { points: 50000, price: 60000 },
];

function calcPoints(amount: number) {
    return Math.floor(amount / 1.2);
}

const cardIcons = [
    'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
    'https://upload.wikimedia.org/wikipedia/commons/0/0e/Mastercard-logo.png',
    'https://upload.wikimedia.org/wikipedia/commons/6/6b/JCB_logo.svg',
    'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo_%282018%29.svg',
    'https://upload.wikimedia.org/wikipedia/commons/0/04/Diners_Club_Logo3.svg',
];

const PointPurchasePage: React.FC<PointPurchasePageProps> = ({ onBack }) => {
    const [tab, setTab] = useState<'card' | 'bank'>('card');
    const [furikomiName, setFurikomiName] = useState('');
    const [amount, setAmount] = useState('');
    const [showCardModal, setShowCardModal] = useState(false);
    const amountNum = parseInt(amount.replace(/[^0-9]/g, '')) || 0;
    const points = calcPoints(amountNum);
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
                <button onClick={onBack} className="mr-2 text-2xl text-white">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center text-white">ポイントを購入する</span>
            </div>
            {/* Point card */}
            <div className="bg-primary rounded-xl shadow px-6 py-6 mx-4 mt-6 mb-4 border border-secondary">
                <div className="text-sm text-white flex items-center gap-1">所持ポイント <span>🅿️</span></div>
                <div className="text-4xl font-bold mt-2 mb-2 text-white">0P</div>
                <div className="text-xs text-white">ポイントの有効期限は購入から180日です</div>
            </div>
            {/* Tabs */}
            <div className="flex items-center border-b mx-2 border-secondary">
                <button
                    className={`flex-1 py-3 font-bold text-lg ${tab === 'card' ? 'border-b-2 border-secondary text-white' : 'text-white'}`}
                    onClick={() => setTab('card')}
                >
                    クレジットカード
                </button>
                <button
                    className={`flex-1 py-3 font-bold text-lg flex items-center justify-center gap-2 ${tab === 'bank' ? 'border-b-2 border-secondary text-white' : 'text-white'}`}
                    onClick={() => setTab('bank')}
                >
                    銀行振込 <span className="bg-primary text-white text-xs rounded px-2 py-0.5 ml-1">NEW</span>
                </button>
            </div>
            {/* Point options or Bank Transfer */}
            {tab === 'card' && (
                <div className="divide-y">
                    {pointOptions.map(opt => (
                        <div
                            key={opt.points}
                            className="flex items-center justify-between px-4 py-4 bg-primary cursor-pointer"
                            onClick={() => setShowCardModal(true)}
                        >
                            <div className="flex items-center gap-2">
                                <span>🅿️</span>
                                <span className="font-bold text-lg">{opt.points.toLocaleString()}ポイント</span>
                            </div>
                            <span className="bg-secondary text-white font-bold rounded px-6 py-2 text-lg">￥{opt.price.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            )}
            {tab === 'bank' && (
                <div className="bg-primary px-0 pt-0 pb-8">
                    {/* Illustration and message */}
                    <div className="bg-primary mx-2 mt-4 rounded-xl flex flex-col items-center justify-center px-4 py-6 shadow border border-secondary">
                        {/* Placeholder SVG illustration */}
                        <div className="mb-2">
                            <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="30" y="20" width="60" height="50" rx="6" fill="#E5E7EB" />
                                <rect x="40" y="30" width="40" height="30" rx="3" fill="#F97316" />
                                <rect x="50" y="40" width="20" height="10" rx="2" fill="#fff" />
                                <rect x="60" y="60" width="10" height="5" rx="1" fill="#9CA3AF" />
                                <circle cx="40" cy="70" r="6" fill="#6B7280" />
                                <rect x="20" y="75" width="80" height="6" rx="3" fill="#D1D5DB" />
                            </svg>
                        </div>
                        <div className="text-white font-bold text-sm mb-1">明細を気にしなくてOK！</div>
                        <div className="text-xl font-bold mb-2">銀行振込で<br />ポイントを購入</div>
                    </div>
                    {/* Stepper */}
                    <div className="bg-primary px-2 pt-6 pb-4">
                        <div className="flex items-center justify-center gap-8 mb-2">
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center font-bold">1</div>
                                <div className="text-xs mt-1 font-bold text-white">振込申請</div>
                            </div>
                            <div className="w-8 h-1 bg-gray-300 rounded-full mt-3"></div>
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">2</div>
                                <div className="text-xs mt-1 text-gray-400">銀行振込</div>
                            </div>
                            <div className="w-8 h-1 bg-gray-300 rounded-full mt-3"></div>
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">3</div>
                                <div className="text-xs mt-1 text-gray-400">ポイントチャージ</div>
                            </div>
                        </div>
                        <div className="text-center text-gray-500 font-bold mt-2 mb-4">振込名義と金額を入力してください</div>
                        {/* Input fields */}
                        <div className="bg-primary rounded-lg shadow px-4 py-4 mx-2 border border-secondary">
                            <div className="flex items-center justify-between py-2 border-b">
                                <span className="text-sm text-gray-500">振込名義(全角カナ)</span>
                                <input
                                    className="text-right text-gray-700 font-bold bg-transparent outline-none"
                                    style={{ minWidth: 120 }}
                                    placeholder="フリコミ タロウ"
                                    value={furikomiName}
                                    onChange={e => setFurikomiName(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                                <span className="text-sm text-gray-500">振込金額</span>
                                <input
                                    className="text-right text-gray-700 font-bold bg-transparent outline-none"
                                    style={{ minWidth: 80 }}
                                    placeholder="0"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                                    inputMode="numeric"
                                />
                                <span className="ml-1">円</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-500">反映予定ポイント</span>
                                <span className="text-right text-gray-700 font-bold">{points}P</span>
                            </div>
                        </div>
                        {/* Notes */}
                        <div className="text-xs text-gray-500 mt-4 px-2">
                            ・ご利用者ご本人様の名義にてお振込ください。<br />
                            ・振込名義・金額をご確認の上ご申請ください。<br />
                            ・1P=1.2円となります。
                        </div>
                        {/* Button */}
                        <div className="flex justify-center mt-6 mb-2">
                            <button
                                className="w-full max-w-xs bg-gray-200 text-primary font-bold py-3 rounded text-lg cursor-not-allowed"
                                disabled
                            >
                                申請する
                            </button>
                        </div>
                        {/* Caution */}
                        <div className="text-xs text-gray-400 mt-2 px-2 pb-2">
                            ・振込申請時、本人確認書類の提出をお願いする場合がございます<br />
                            ・振込名義がご登録名義と異なって振込いただいた金額の払い戻しやポイント付与はできません<br />
                            ・ポイントを所持している場合、ご利用期限が最も早いポイントから消費されます。<br />
                            ・クレジットカード決済と銀行振込を併用してのポイント購入はできません。
                        </div>
                    </div>
                </div>
            )}
            {/* Card Register Modal */}
            {showCardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-400 bg-opacity-40">
                    <div className="bg-primary rounded-xl shadow-lg max-w-[90vw] w-[400px] mx-2 overflow-hidden relative border border-secondary">
                        {/* Top image */}
                        <div className="w-full h-32 bg-yellow-200 flex items-center justify-center relative">
                            <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" alt="card-bg" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                            <div className="absolute inset-0 bg-yellow-200 opacity-60" />
                        </div>
                        <div className="px-6 py-6 flex flex-col items-center">
                            <div className="text-xl font-bold mb-2 text-center">カードを登録してポイントを購入</div>
                            <div className="text-gray-500 text-center text-sm mb-4">ポイント購入後の返金はいかなる理由でも行えません。<br />予めご了承ください。</div>
                            <div className="flex gap-2 mb-4">
                                {cardIcons.map((src, i) => (
                                    <img key={i} src={src} alt="card" className="h-7" />
                                ))}
                            </div>
                            <button className="w-full bg-secondary text-white font-bold py-3 rounded text-lg mb-3">クレジットカードを登録する</button>
                            <button className="w-full bg-gray-400 text-primary font-bold py-2 rounded text-lg" onClick={() => setShowCardModal(false)}>あとで</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PointPurchasePage; 