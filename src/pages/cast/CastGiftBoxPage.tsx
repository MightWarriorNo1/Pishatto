import React, { useEffect, useState } from 'react';
import { ChevronLeft, Gift } from 'lucide-react';
import { fetchCastReceivedGifts } from '../../services/api';
import { useCast } from '../../contexts/CastContext';
import Spinner from '../../components/ui/Spinner';

const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const IMAGE_BASE_URL = APP_BASE_URL.replace(/\/api$/, '');

const CastGiftBoxPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [gifts, setGifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { castId } = useCast() as any;

    useEffect(() => {
        if (!castId) return;
        fetchCastReceivedGifts(castId)
            .then(setGifts)
            .finally(() => setLoading(false));
    }, [castId]);

    return (    
        <div className='bg-gradient-to-b from-primary via-primary to-secondary min-h-screen pb-24'>
            {/* Top bar */}
            <div className="fixed max-w-md mx-auto top-0 left-0 right-0 z-50 flex items-center px-4 pt-4 pb-2 border-b border-secondary bg-primary">
                <button className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer" onClick={onBack}>
                    <ChevronLeft size={24} />
                </button>
                <span className="flex-1 text-center text-base font-bold text-white">ギフトボックス</span>
            </div>
            {/* Gift List */}
            <div className="divide-y divide-red-600 mt-16">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-white/50">
                        <Spinner />
                    </div>
                ) : gifts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-white/50">
                        <Gift className="w-12 h-12 mb-2" />
                        <div className="text-lg font-bold mb-1">まだギフトがありません</div>
                        <div className="text-sm">ギフトが届くとここに表示されます</div>
                    </div>
                ) : (
                    gifts.map(gift => (
                        <div key={gift.id} className="flex items-center px-4 py-4 bg-primary">
                            <img src={gift.sender_avatar ? `${IMAGE_BASE_URL}/storage/${gift.sender_avatar}` : '/assets/avatar/1.jpg'} alt={gift.sender} className="w-12 h-12 rounded-full object-cover mr-3 border border-secondary" />
                            <div className="flex-1">
                                <div className="flex items-center mb-1">
                                    <span className="font-bold text-base mr-2 text-white">{gift.sender}</span>
                                    <span className="text-xs text-white/50">{gift.date ? new Date(gift.date).toLocaleString('ja-JP') : ''}</span>
                                </div>
                                <div className="text-sm text-white flex items-center">
                                    {gift.gift_icon} {gift.gift_name}
                                </div>
                            </div>
                            <div className="text-white font-bold text-lg ml-2">+{Number(gift.points).toLocaleString()}P</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CastGiftBoxPage; 