import React from 'react';
import { Ellipsis, Gift, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const quickReplies = [
    'こんにちは！',
    'よろしくです♪',
    'お会いしてみたいです♪',
    'ご飯でもどうですか？',
];

const CastMessageDetailPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col bg-white max-w-md mx-auto relative">
            {/* Header */}
            <div className="flex items-center px-4 py-3 border-b border-secondary bg-primary sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="mr-2">
                    <img src="/assets/avatar/female.png" alt="avatar" className="w-8 h-8 rounded-full" />
                </button>
                <span className="font-bold text-white text-base flex-1 truncate">なの🐱</span>
                <span className="ml-2 text-white">
                    <Ellipsis />
                </span>
            </div>
            {/* Banner */}
            <div className="bg-secondary text-white text-xs text-center py-1">10,000Pクーポンで初回のご利用がお得に！</div>
            {/* Schedule/Info Bar */}
            <div className="bg-primary text-xs text-white px-4 py-1 flex items-center">日程未定　日程調整後、合流ができます</div>
            {/* Date Separator */}
            <div className="flex justify-center my-4">
                <span className="bg-primary text-white text-xs px-3 py-1 rounded-full border border-secondary">02月20日(木)</span>
            </div>
            {/* Chat Content */}
            <div className="flex-1 flex flex-col items-center px-4 pb-32">
                <div className="flex flex-col items-center w-full">
                    <img src="/assets/avatar/avatar-2.png" alt="sticker" className="w-32 h-32 mx-auto" />
                    <span className="text-white font-bold text-lg mt-2" style={{ position: 'absolute', left: '44%', top: '32%' }}>いいね</span>
                    <span className="text-xs text-white mt-2">22:09</span>
                </div>
            </div>
            {/* Input Bar */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-primary border-t border-secondary flex flex-col px-4 py-2 z-20">
                <div className="flex items-center w-full mb-2">
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 rounded-full border border-secondary bg-primary text-white text-sm mr-2"
                        placeholder="メッセージを入力..."
                    />
                    <button className="text-white mr-2">
                        <Image />
                    </button>
                    <button className="text-white text-2xl">
                        <span role="img" aria-label="gift">
                            <Gift />
                        </span>
                    </button>
                </div>
                {/* Quick Replies */}
                <div className="grid grid-cols-2 gap-2 bg-primary p-2 rounded-xl">
                    {quickReplies.map((reply, idx) => (
                        <button
                            key={idx}
                            className="border border-secondary rounded-lg py-2 text-sm text-white bg-primary hover:bg-secondary hover:text-white"
                        >
                            {reply}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CastMessageDetailPage; 