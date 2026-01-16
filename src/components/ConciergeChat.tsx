/* eslint-disable */
import React, { useEffect } from 'react';
import { useConcierge } from '../contexts/ConciergeContext';
import { useUser } from '../contexts/UserContext';

interface ConciergeChatProps {
    onClick: () => void;
}

const ConciergeChat: React.FC<ConciergeChatProps> = ({ onClick }) => {
    const { unreadCount, messages, loadMessages } = useConcierge();
    const { user } = useUser();
    const lastMessage = messages[messages.length - 1];
    const lastMessageTime = lastMessage ? lastMessage.timestamp : "22:02";

    // Load messages when component mounts
    useEffect(() => {
        if (user?.id) {
            const userType = localStorage.getItem('userType') as 'guest' | 'cast' || 'guest';
            loadMessages(user.id, userType);
        }
    }, [user?.id]); // Removed loadMessages from dependencies since it is now memoized
    
    return (
        <div className="relative">
            <button
                className="w-full"
                onClick={onClick}
            >
                <div className="flex items-center bg-white/10 rounded-lg shadow-sm p-3 relative border border-secondary">
                    {/* Concierge Avatar - favicon-cast.png */}
                    {/* <ConciergeAvatar size="md" className="mr-3" /> */}
                    <img 
                        src="/favicon-cast.png" 
                        alt="Concierge" 
                        className="w-10 h-10 cursor-pointer mr-3 rounded-full object-cover" 
                    />
                    
                    <div className="flex-1">
                        <div className="flex items-center">
                            <span className="font-bold text-white text-base mr-2">
                                Pishattoコンシェルジュ
                            </span>
                            {/* Pishatto status icon */}
                            <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center mr-1">
                                <span className="text-white text-xs font-bold">P</span>
                            </div>
                        </div>
                        <div className="text-sm text-white">
                            メッセージが届いています
                        </div>
                    </div>
                    
                    {/* Time and unread count */}
                    <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-400 mb-1">
                            {lastMessageTime}
                        </div>
                        {unreadCount > 0 && (
                            <div className="bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount > 99 ? '+99' : unreadCount}
                            </div>
                        )}
                    </div>
                </div>
            </button>
        </div>
    );
};

export default ConciergeChat; 