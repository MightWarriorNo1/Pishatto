import React, { useState } from 'react';
import PaymentInfoRegisterPage from './PaymentInfoRegisterPage';

interface PointHistoryItem {
    avatar: string;
    date: string;
    desc: string;
}
const pointHistory = [
    {
        avatar: 'https://placehold.co/40x40',
        date: '2025年02月20日 13:32',
        desc: 'ギフト送付',
        amount: -100000,
    },
    {
        avatar: 'https://placehold.co/40x40?text=%F0%9F%A6%85',
        date: '2025年02月20日 13:32',
        desc: 'オートチャージ',
        amount: 99000,
        receipt: true,
    },
    {
        avatar: 'https://placehold.co/40x40',
        date: '2025年02月20日 13:32',
        desc: 'ギフト送付',
        amount: -50000,
    },
    {
        avatar: 'https://placehold.co/40x40?text=%F0%9F%A6%85',
        date: '2025年02月20日 13:32',
        desc: 'オートチャージ',
        amount: 51000,
        receipt: true,
    },
    {
        avatar: 'https://placehold.co/40x40',
        date: '2025年02月20日 03:24',
        desc: 'ギフト送付',
        amount: -50000,
    },
    {
        avatar: 'https://placehold.co/40x40?text=%F0%9F%A6%85',
        date: '2025年02月20日 03:24',
        desc: 'オートチャージ',
        amount: 51000,
        receipt: true,
    },
    {
        avatar: 'https://placehold.co/40x40',
        date: '2025年02月20日 03:24',
        desc: 'ギフト送付',
        amount: -50000,
    },
];

function parseDate(dateStr: string) {
    // Format: '2025年02月20日 13:32'
    return new Date(dateStr.replace(/年|月/g, '/').replace('日', ''));
}

function formatDate(dateStr: string) {
    const d = parseDate(dateStr);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
}

const sortedPointHistory = [...pointHistory].sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());

function groupByDate(items: PointHistoryItem[]) 
{
    return items.reduce((acc, item) => {
        const dateKey = formatDate(item.date);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
    }, {} as { [date: string]: any[] });
}

const groupedHistory = groupByDate(sortedPointHistory);
const dateKeys = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

const PointHistory: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [showPaymentInfo, setShowPaymentInfo] = useState(false);
    // const [receiptIndex, setReceiptIndex] = useState<number | null>(null);
    if (showPaymentInfo) return <PaymentInfoRegisterPage onBack={() => setShowPaymentInfo(false)} />;
    return (
        <div className="max-w-md mx-auto min-h-screen bg-white pb-4">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b">
                <button onClick={onBack} className="mr-2 text-2xl text-gray-500">&#60;</button>
                <span className="text-lg font-bold flex-1 text-center">ポイント履歴・領収書</span>
            </div>
            {/* Current points */}
            <div className="text-center mt-6">
                <div className="text-gray-500 text-sm mb-1">現在の所有ポイント</div>
                <div className="text-3xl font-bold mb-2">1,742P</div>
                <div className="text-xs text-gray-500">ポイントは3,000Pごとにオートチャージされます<br />またポイントの有効期限は購入・取得から180日です</div>
            </div>
            {/* History list */}
            <div className="mt-6 divide-y">
                {dateKeys.map((dateKey: string) => (
                    <div key={dateKey}>
                        <div className="bg-gray-100 text-xs text-gray-500 px-4 py-2">{dateKey}</div>
                        {groupedHistory[dateKey].map((item: any, idx: number) => (
                            <div
                                key={idx}
                                className="bg-white px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition"
                                onClick={() => setShowPaymentInfo(true)}
                            >
                                <img src={item.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover mt-1" />
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500">{item.date}</div>
                                    <div className="font-bold text-sm mb-1">{item.desc}</div>
                                </div>
                                <div className={`text-lg font-bold ${item.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>{item.amount < 0 ? '' : '+'}{item.amount.toLocaleString()}P</div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PointHistory; 