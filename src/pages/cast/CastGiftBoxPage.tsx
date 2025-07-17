import React from 'react';
import { ChevronLeft, Gift } from 'lucide-react';

const mockGifts = [
    {
        id: 1,
        sender: 'まこちゃん',
        avatar: '/assets/avatar/1.jpg',
        date: '2025年03月10日 16:01',
        giftName: 'バラの花束',
        points: 5000,
    },
    {
        id: 2,
        sender: 'さくら',
        avatar: '/assets/avatar/AdobeStock_1067731649_Preview.jpeg',
        date: '2025年03月06日 20:36',
        giftName: 'チョコレート',
        points: 1200,
    },
    {
        id: 3,
        sender: 'ゲストA',
        avatar: '/assets/avatar/AdobeStock_1190678828_Preview.jpeg',
        date: '2025年03月01日 00:01',
        giftName: 'ぬいぐるみ',
        points: 3000,
    },
];

const CastGiftBoxPage: React.FC = () => {
    return (
        <div className="max-w-md mx-auto min-h-screen bg-white">
            {/* Top bar */}
            <div className="flex items-center px-4 pt-4 pb-2 border-b bg-primary border-secondary">
                <button className="mr-2 text-2xl text-white" onClick={() => window.history.back()}>
                    <ChevronLeft />
                </button>
                <span className="flex-1 text-center text-base font-bold text-white">ギフトボックス</span>
            </div>
            {/* Gift List */}
            <div className="divide-y divide-red-600">
                {mockGifts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-white/50">
                        <Gift className="w-12 h-12 mb-2" />
                        <div className="text-lg font-bold mb-1">まだギフトがありません</div>
                        <div className="text-sm">ギフトが届くとここに表示されます</div>
                    </div>
                ) : (
                    mockGifts.map(gift => (
                        <div key={gift.id} className="flex items-center px-4 py-4 bg-primary">
                            <img src={gift.avatar} alt={gift.sender} className="w-12 h-12 rounded-full object-cover mr-3 border border-secondary" />
                            <div className="flex-1">
                                <div className="flex items-center mb-1">
                                    <span className="font-bold text-base mr-2 text-white">{gift.sender}</span>
                                    <span className="text-xs text-white/50">{gift.date}</span>
                                </div>
                                <div className="text-sm text-white">{gift.giftName}</div>
                            </div>
                            <div className="text-white font-bold text-lg ml-2">+{gift.points}P</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CastGiftBoxPage; 