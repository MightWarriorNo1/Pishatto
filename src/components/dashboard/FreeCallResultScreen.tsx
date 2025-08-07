import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GroupChatScreen from './GroupChatScreen';

const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Utility function to get the first available avatar from comma-separated string
const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
    if (!avatarString) {
        return '/assets/avatar/female.png';
    }
    
    // Split by comma and get the first non-empty avatar
    const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
    
    if (avatars.length === 0) {
        return '/assets/avatar/avatar-1.png';
    }
    
    return `${APP_BASE_URL}/${avatars[0]}`;
};

interface FreeCallResultScreenProps {
    onBack: () => void;
    selectedCasts: any[];
    reservation: any;
    castCounts?: {
        royal_vip: number;
        vip: number;
        premium: number;
    };
}

const FreeCallResultScreen: React.FC<FreeCallResultScreenProps> = ({ 
    onBack, 
    selectedCasts, 
    reservation, 
    castCounts 
}) => {
    const navigate = useNavigate();
    const [showGroupChat, setShowGroupChat] = useState(false);
    const [groupChatData, setGroupChatData] = useState<{
        groupId: number;
        groupName: string;
    } | null>(null);

    // Check if this reservation has a chat group
    useEffect(() => {
        if (reservation?.chat_group) {
            setGroupChatData({
                groupId: reservation.chat_group.id,
                groupName: reservation.chat_group.name
            });
        }
    }, [reservation]);

    if (showGroupChat && groupChatData) {
        return (
            <GroupChatScreen
                groupId={groupChatData.groupId}
                groupName={groupChatData.groupName}
                onBack={() => setShowGroupChat(false)}
            />
        );
    }

    return (
        <div>
            <div className="flex items-center px-4 pt-6 pb-2">
                <button onClick={onBack} className="mr-2 text-2xl text-white">
                    <ChevronLeft />
                </button>
                <span className="text-2xl font-bold text-white">フリーコール結果</span>
            </div>
            <div className="px-4 mt-4">
                <div className="bg-primary rounded-lg p-4 border border-secondary mb-4">
                    <div className="text-white text-center mb-4">
                        <div className="text-lg font-bold mb-2">フリーコールが完了しました！</div>
                        <div className="text-sm text-gray-300">以下のキャストが選ばれました</div>
                    </div>
                    
                    {/* Display cast counts summary */}
                    {castCounts && (
                        <div className="bg-secondary rounded-lg p-3 mb-4">
                            <div className="text-white text-center mb-2">
                                <div className="text-sm font-bold">注文したキャスト数</div>
                            </div>
                            <div className="flex justify-center space-x-4 text-white text-sm">
                                {castCounts.royal_vip > 0 && (
                                    <div className="text-center">
                                        <div className="font-bold">{castCounts.royal_vip}人</div>
                                        <div className="text-xs text-gray-300">ロイヤルVIP</div>
                                    </div>
                                )}
                                {castCounts.vip > 0 && (
                                    <div className="text-center">
                                        <div className="font-bold">{castCounts.vip}人</div>
                                        <div className="text-xs text-gray-300">VIP</div>
                                    </div>
                                )}
                                {castCounts.premium > 0 && (
                                    <div className="text-center">
                                        <div className="font-bold">{castCounts.premium}人</div>
                                        <div className="text-xs text-gray-300">プレミアム</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Display casts in grid */}
                    {selectedCasts && selectedCasts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {selectedCasts.map((cast, index) => {
                                // Determine cast type based on index and counts
                                let castType = 'プレミアム';
                                let castTypeColor = 'text-gray-300';
                                
                                if (castCounts) {
                                    const royalVipCount = castCounts.royal_vip || 0;
                                    const vipCount = castCounts.vip || 0;
                                    
                                    if (index < royalVipCount) {
                                        castType = 'ロイヤルVIP';
                                        castTypeColor = 'text-yellow-300';
                                    } else if (index < royalVipCount + vipCount) {
                                        castType = 'VIP';
                                        castTypeColor = 'text-red-300';
                                    } else {
                                        castType = 'プレミアム';
                                        castTypeColor = 'text-gray-300';
                                    }
                                }
                                
                                return (
                                    <div key={`${cast.id}-${index}`} className="bg-secondary rounded-lg p-3 text-center">
                                        <img
                                            src={getFirstAvatarUrl(cast.avatar)}
                                            alt={cast.nickname}
                                            className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-white"
                                            onError={e => (e.currentTarget.src = '/assets/avatar/female.png')}
                                        />
                                        <div className="text-white font-bold text-sm">{cast.nickname}</div>
                                        <div className={`text-xs ${castTypeColor}`}>{castType}</div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-red-600 rounded-lg p-3 text-center">
                            <div className="text-white font-bold">キャストが選択されていません</div>
                            <div className="text-white text-sm">システムエラーが発生しました</div>
                        </div>
                    )}
                </div>
                
                {/* Chat Options */}
                <div className="space-y-3">
                    {groupChatData && (
                        <button 
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-700 transition"
                            onClick={() => setShowGroupChat(true)}
                        >
                            グループチャットを開始
                        </button>
                    )}
                    <button 
                        className="w-full bg-secondary text-white py-3 px-6 rounded-lg font-bold hover:bg-red-700 transition"
                        onClick={() => navigate('/chat')}
                    >
                        個別チャットを開始
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FreeCallResultScreen; 