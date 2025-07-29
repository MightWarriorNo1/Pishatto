import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const history = [
    {
        icon: '/assets/avatar/1.jpg',
        date: '2025年03月10日 16:01',
        desc: '合流ポイント',
        point: '+112,320P',
        positive: true,
        detail: true,
    },
    {
        icon: '/assets/avatar/AdobeStock_1067731649_Preview.jpeg',
        date: '2025年03月06日 20:36',
        desc: 'ギフト受け取り',
        point: '+21,600P',
        positive: true,
        detail: false,
    },
    {
        icon: '/assets/avatar/knight_3275232.png',
        date: '2025年03月01日 00:01',
        desc: '振込手数料',
        point: '-654P',
        positive: false,
        detail: false,
    },
    {
        icon: '/assets/avatar/knight_3275232.png',
        date: '2025年03月01日 00:01',
        desc: '【3月定期振込】2月…',
        point: '-900,721P',
        positive: false,
        detail: false,
    },
    {
        icon: '',
        date: '2025年02月27日 16:00',
        desc: '合流ポイント',
        point: '+55,112P',
        positive: true,
        detail: true,
    },
    {
        icon: '/assets/avatar/1.jpg',
        date: '2025年02月24日 16:09',
        desc: '合流ポイント',
        point: '+86,970P',
        positive: true,
        detail: true,
    },
    {
        icon: '',
        date: '2025年02月22日 16:07',
        desc: '合流ポイント',
        point: '+35,362P',
        positive: true,
        detail: true,
    },
    {
        icon: '/assets/avatar/AdobeStock_1190678828_Preview.jpeg',
        date: '2025年02月22日 16:03',
        desc: '合流ポイント',
        point: '+126,107P',
        positive: true,
        detail: true,
    },
    {
        icon: '/assets/avatar/AdobeStock_1537463438_Preview.jpeg',
        date: '2025年02月21日 16:05',
        desc: '合流ポイント',
        point: '+56,550P',
        positive: true,
        detail: true,
    },
    {
        icon: '/assets/avatar/AdobeStock_1537463446_Preview.jpeg',
        date: '2025年02月18日 16:06',
        desc: '合流ポイント',
        point: '+69,498P',
        positive: true,
        detail: true,
    },
    {
        icon: '',
        date: '2025年02月18日 01:00',
        desc: '合流ポイント',
        point: '+9,000P',
        positive: true,
        detail: true,
    },
];

const CastPointHistoryPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="max-w-md min-h-screen bg-primary pb-8">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b border-secondary bg-primary">
                <button className="mr-2 text-2xl text-white" onClick={onBack}>
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center text-white">売上履歴一覧</span>
            </div>
            {/* History List */}
            <div className="divide-y divide-red-600 bg-primary">
                {history.map((item, i) => (
                    <div key={i} className="flex items-center px-4 py-3 bg-primary">
                        {item.icon ? (
                            <img src={item.icon} alt="icon" className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-secondary" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-secondary mr-3 flex items-center justify-center">
                                <span className="text-white text-xl">👤</span>
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="text-xs text-white">{item.date}</div>
                            <div className="text-base text-white truncate">{item.desc}</div>
                        </div>
                        <div className="flex flex-col items-end ml-2">
                            <div className={`font-bold text-lg ${item.positive ? 'text-white' : 'text-white'}`}>{item.point}</div>
                            {item.detail && <span className="text-white text-xl">&gt;</span>}
                        </div>
                    </div>
                ))}
            </div>
            {/* Payment details link */}
            <div className="bg-primary px-4 py-3 text-center text-sm text-white border-b border-secondary cursor-pointer">
                支払い明細書を確認する
            </div>
        </div>
    );
};

export default CastPointHistoryPage; 