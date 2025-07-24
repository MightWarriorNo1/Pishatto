import React from 'react';
import { ChevronLeft } from 'lucide-react';
import CastDashboardLayout from '../../components/cast/dashboard/CastDashboardLayout';

const mockRecords = [
    {
        date: '2025年03月10日 16:01',
        desc: '合流ポイント',
        points: '+112,320P',
        avatar: '/assets/avatar/1.jpg',
        positive: true,
    },
    {
        date: '2025年03月06日 20:36',
        desc: 'ギフト受け取り',
        points: '+21,600P',
        avatar: '/assets/avatar/AdobeStock_1067731649_Preview.jpeg',
        positive: true,
    },
    {
        date: '2025年03月01日 00:01',
        desc: '振込手数料',
        points: '-654P',
        avatar: '/assets/icons/profile_badge.png',
        positive: false,
    },
    {
        date: '2025年03月01日 00:01',
        desc: '【3月定期振込】2月…',
        points: '-900,721P',
        avatar: '/assets/icons/profile_badge.png',
        positive: false,
    },
    {
        date: '2025年02月27日 16:00',
        desc: '合流ポイント',
        points: '+55,112P',
        avatar: '',
        positive: true,
    },
    {
        date: '2025年02月24日 16:09',
        desc: '合流ポイント',
        points: '+86,970P',
        avatar: '/assets/avatar/1.jpg',
        positive: true,
    },
    {
        date: '2025年02月22日 16:07',
        desc: '合流ポイント',
        points: '+35,362P',
        avatar: '',
        positive: true,
    },
    {
        date: '2025年02月22日 16:03',
        desc: '合流ポイント',
        points: '+126,107P',
        avatar: '/assets/avatar/AdobeStock_1190678828_Preview.jpeg',
        positive: true,
    },
    {
        date: '2025年02月21日 16:05',
        desc: '合流ポイント',
        points: '+56,550P',
        avatar: '/assets/avatar/AdobeStock_1537463438_Preview.jpeg',
        positive: true,
    },
    {
        date: '2025年02月18日 16:06',
        desc: '合流ポイント',
        points: '+69,498P',
        avatar: '/assets/avatar/AdobeStock_1537463446_Preview.jpeg',
        positive: true,
    },
];

const CastActivityRecordPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className='max-w-md  bg-primary min-h-screen pb-24'>
            {/* Top bar */}
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-secondary bg-primary">
                <button
                    className="mr-2 text-2xl text-white"
                    onClick={onBack}
                >
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center text-white">売上履歴一覧</span>
            </div>
            {/* List */}
            <div className="divide-y divide-red-600">
                {mockRecords.map((item, idx) => (
                    <div key={idx} className="flex items-center px-4 py-3 bg-primary">
                        {item.avatar ? (
                            <img src={item.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover mr-3 border border-secondary" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-secondary mr-3" />
                        )}
                        <div className="flex-1">
                            <div className="text-xs text-white">{item.date}</div>
                            <div className="text-base text-white">{item.desc}</div>
                        </div>
                        <div className={`text-lg font-bold ml-2 ${item.positive ? 'text-white' : 'text-white'}`}>{item.points}</div>
                    </div>
                ))}
            </div>
            {/* 明細書リンク */}
            <div className="px-4 py-4 text-center text-white font-bold border-b border-secondary cursor-pointer">支払い明細書を確認する</div>
        </div>
    );
};

export default CastActivityRecordPage; 