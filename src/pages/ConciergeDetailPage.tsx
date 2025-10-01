/*eslint-disable */
import React, { useState, useEffect } from 'react';
import { FiGift, FiImage } from 'react-icons/fi';
import { useConcierge } from '../contexts/ConciergeContext';
import { useUser } from '../contexts/UserContext';
import { getConciergeInfo, ConciergeInfo } from '../services/api';
import { Bird, ChevronLeft, Send } from 'lucide-react';
import Spinner from '../components/ui/Spinner';

interface ConciergeDetailPageProps {
    onBack: () => void;
}

const ConciergeDetailPage: React.FC<ConciergeDetailPageProps> = ({ onBack }) => {
    const [selectedTab] = useState<'chat' | 'help' | 'services'>('chat');
    const [message, setMessage] = useState('');
    const { messages, markAsRead, loadMessages, sendMessage } = useConcierge();
    const { user } = useUser();
    const [conciergeInfo, setConciergeInfo] = useState<ConciergeInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sending] = useState(false);
    const [attachedFile] = useState<File | null>(null);

    // Load concierge info and messages on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                
                // Load concierge info
                const info = await getConciergeInfo();
                setConciergeInfo(info);
                
                // Load messages if user is available
                if (user?.id) {
                    const userType = localStorage.getItem('userType') as 'guest' | 'cast' || 'guest';
                    await loadMessages(user.id, userType);
                }
                
                // Mark messages as read
                await markAsRead();
            } catch (error) {
                console.error('Error loading concierge data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, [user?.id]); // Removed loadMessages and markAsRead from dependencies since they are now memoized

    const handleSendMessage = async () => {
        if (!message.trim() || !user?.id) return;
        
        const userType = localStorage.getItem('userType') as 'guest' | 'cast' || 'guest';
        
        try {
            await sendMessage(user.id, userType, message);
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const quickReplies = [
        'サービスについて教えて',
        'トラブルが発生しました',
        '予約について質問があります',
        '支払いについて教えて'
    ];

    // const services = [
    //     {
    //         title: '予約サポート',
    //         description: '予約の変更・キャンセルをお手伝いします',
    //         icon: '📅',
    //         color: 'bg-blue-500'
    //     },
    //     {
    //         title: '支払いサポート',
    //         description: '支払い方法や請求についてサポートします',
    //         icon: '💳',
    //         color: 'bg-green-500'
    //     },
    //     {
    //         title: '技術サポート',
    //         description: 'アプリの使い方や技術的な問題を解決します',
    //         icon: '🔧',
    //         color: 'bg-purple-500'
    //     },
    //     {
    //         title: 'その他サポート',
    //         description: 'その他のお問い合わせに対応します',
    //         icon: '❓',
    //         color: 'bg-orange-500'
    //     }
    // ];

    return (
        <div className="bg-gradient-to-b from-primary via-primary to-secondary min-h-screen flex flex-col relative">
            {/* Header */}
            <div className="fixed max-w-md mx-auto left-0 right-0 z-20 flex items-center px-4 py-3 border-b border-secondary bg-primary">
                <button onClick={onBack} className="mr-3">
                    <ChevronLeft className="w-6 h-6 text-white hover:text-secondary cursor-pointer" />
                </button>
                <div className="flex items-center flex-1">
                <Bird className="w-10 h-10 text-yellow-500 cursor-pointer mr-3" />
                    {/* <ConciergeAvatar size="sm" className="mr-3" /> */}
                    <div>
                        <div className="font-bold text-white text-lg">Pishattoコンシェルジュ</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            {/* <div className="flex items-center px-4 mt-2 py-20">
                <button
                    className={`px-4 py-2 rounded-full font-bold text-sm mr-2 flex items-center ${
                        selectedTab === 'chat' ? 'bg-secondary text-white' : 'bg-primary text-white border border-secondary'
                    }`}
                    onClick={() => setSelectedTab('chat')}
                >
                    <FiMessageSquare className="w-4 h-4 mr-1" />
                    チャット
                </button>
                <button
                    className={`px-4 py-2 rounded-full font-bold text-sm mr-2 flex items-center ${
                        selectedTab === 'help' ? 'bg-secondary text-white' : 'bg-primary text-white border border-secondary'
                    }`}
                    onClick={() => setSelectedTab('help')}
                >
                    <FiHelpCircle className="w-4 h-4 mr-1" />
                    ヘルプ
                </button>
                <button
                    className={`px-4 py-2 rounded-full font-bold text-sm flex items-center ${
                        selectedTab === 'services' ? 'bg-secondary text-white' : 'bg-primary text-white border border-secondary'
                    }`}
                    onClick={() => setSelectedTab('services')}
                >
                    <FiGift className="w-4 h-4 mr-1" />
                    サービス
                </button>
            </div> */}

            {/* Content */}
            <div className="flex-1 px-4 mt-4 overflow-y-auto py-20">
                {selectedTab === 'chat' && (
                    <div className="space-y-4">
                        {/* Loading state */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-white text-center">
                                    <Spinner />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Welcome message from concierge info */}
                                {conciergeInfo && messages.length === 0 && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[80%] rounded-lg px-4 py-3 bg-white/10 text-white border">
                                            {/* Welcome banner */}
                                            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-3 mb-3 text-white">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                                                        <div className="w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                                                            <div className="w-3 h-3 bg-black rounded-full"></div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-bold">{conciergeInfo.welcome_message.title}</div>
                                                        <div className="text-sm">{conciergeInfo.welcome_message.subtitle}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Welcome content */}
                                            <div className="text-sm space-y-1">
                                                {conciergeInfo.welcome_message.content.map((line, index) => (
                                                    <div key={index}>{line}</div>
                                                ))}
                                            </div>
                                            
                                            <div className="text-xs text-gray-500 mt-2">22:02</div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Messages */}
                                <div className="space-y-3">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.isConcierge ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                                msg.isConcierge 
                                                    ? 'bg-primary text-white border border-secondary' 
                                                    : 'bg-secondary text-white'
                                            }`}>
                                                <div className="text-sm whitespace-pre-wrap break-words">{msg.text}</div>
                                                <div className="text-xs text-gray-400 mt-1">{msg.timestamp}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Quick Replies */}
                        <div className="space-y-2">
                            <div className="text-white text-sm font-bold">クイックリプライ</div>
                            <div className="flex flex-wrap gap-2">
                                {quickReplies.map((reply, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setMessage(reply)}
                                        className="px-3 py-1 bg-primary text-white text-xs rounded-full border border-secondary hover:bg-secondary transition-colors"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {selectedTab === 'help' && (
                    <div className="space-y-4">
                        <div className="bg-primary rounded-lg p-4 border border-secondary">
                            <h3 className="text-white font-bold text-lg mb-2">よくある質問</h3>
                            <div className="space-y-3">
                                <div className="text-white text-sm">
                                    <div className="font-bold">Q: 予約の変更はできますか？</div>
                                    <div className="text-gray-300 mt-1">A: はい、予約の変更は可能です。詳細はチャットでお問い合わせください。</div>
                                </div>
                                <div className="text-white text-sm">
                                    <div className="font-bold">Q: 支払い方法は？</div>
                                    <div className="text-gray-300 mt-1">A: クレジットカード、銀行振込、コンビニ決済に対応しています。</div>
                                </div>
                                <div className="text-white text-sm">
                                    <div className="font-bold">Q: キャンセルポリシーは？</div>
                                    <div className="text-gray-300 mt-1">A: 24時間前までキャンセル可能です。詳細は利用規約をご確認ください。</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* {selectedTab === 'services' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {services.map((service, index) => (
                                <div key={index} className="bg-primary rounded-lg p-4 border border-secondary">
                                    <div className={`w-12 h-12 ${service.color} rounded-full flex items-center justify-center text-white text-xl mb-3`}>
                                        {service.icon}
                                    </div>
                                    <div className="text-white font-bold text-sm mb-1">{service.title}</div>
                                    <div className="text-gray-300 text-xs">{service.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )} */}
            </div>

            {/* Message Input */}
            {selectedTab === 'chat' && (
                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-primary border-t border-secondary flex flex-col px-4 py-2 z-20">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="メッセージを入力..."
                            className="flex-1 w-0 min-w-0 px-4 py-2 rounded-full border border-secondary bg-primary text-white text-sm placeholder-gray-400"
                        />
                        <button className="p-2 text-white hover:bg-secondary rounded-full transition-colors shrink-0">
                            <FiImage className="w-5 h-5" />
                        </button>
                        <button
                        onClick={handleSendMessage}
                        disabled={sending || (!message.trim() && !attachedFile)}
                        className={`ml-2 px-6 py-2 rounded-full text-sm disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 shrink-0`}
                    >
                        {sending ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                            </div>
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConciergeDetailPage; 