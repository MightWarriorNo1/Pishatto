import React, { useState } from 'react';
import { ChevronLeft, Calendar, Image, Gift } from 'lucide-react';
import MessageProposalPage from './MessageProposalPage';

interface Message {
    id: string;
    avatar: string;
    name: string;
    lastMessage: string;
    timestamp: Date;
    unread: boolean;
}

interface MessageDetailProps {
    message: Message;
    onBack: () => void;
}


const MessageDetail: React.FC<MessageDetailProps> = ({ message, onBack }) => {
    const [messageProposal, setMessageProposal] = useState(false);

    if (messageProposal) return <MessageProposalPage />;
    return (
        <div className="fixed inset-0 z-50 max-w-md mx-auto min-h-screen bg-primary">
            {/* Header */}
            <div className="flex items-center px-4 py-3 border-b border-secondary">
                <button onClick={onBack} className="mr-2">
                    <ChevronLeft className="text-white" size={24} />
                </button>
                <div className="flex items-center">
                    <img src={message.avatar} alt={message.name} className="w-8 h-8 rounded-full mr-2" />
                    <span className="text-lg font-bold text-white">{message.name}</span>
                </div>
            </div>

            {/* Messages area */}
            <div className="h-[calc(100vh-132px)] overflow-y-auto p-4">
                <div className="flex justify-end mb-4">
                    <div className="bg-secondary text-white rounded-lg px-4 py-2 max-w-[80%]">
                        こんにちは！本日はどのようなご予定でしょうか？
                    </div>
                </div>
                <div className="flex mb-4">
                    <div className="bg-gray-200 text-black rounded-lg px-4 py-2 max-w-[80%]">
                        {message.lastMessage}
                    </div>
                </div>
            </div>

            {/* Input area */}
            <div className="w-full max-w-md flex items-center px-4 py-2 border-b border-secondary bg-primary">
                <span className="text-white mr-2" onClick={() => setMessageProposal(true)}>
                    <Calendar />
                </span>
                <input
                    className="flex-1 border-none outline-none text-lg bg-primary text-white placeholder-red-400"
                    placeholder="メッセージを入力..."
                />
                <span className="text-white ml-2">
                    <Image />
                </span>
                <span className="text-white ml-2">
                    <Gift />
                </span>
            </div>
        </div >
    );
};

const MessagePage: React.FC = () => {
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    const messages: Message[] = [
        {
            id: '1',
            avatar: '/assets/avatar/1.jpg',
            name: 'あや',
            lastMessage: '了解です！では、その時間で！',
            timestamp: new Date(),
            unread: true,
        },
        {
            id: '2',
            avatar: '/assets/avatar/2.jpg',
            name: 'まり',
            lastMessage: 'ありがとうございます。',
            timestamp: new Date(Date.now() - 3600000),
            unread: false,
        },
        {
            id: '3',
            avatar: '/assets/avatar/AdobeStock_1067731649_Preview.jpeg',
            name: 'さくら',
            lastMessage: '19時からでお願いできますか？',
            timestamp: new Date(Date.now() - 7200000), // 2 hours ago
            unread: true,
        },
        {
            id: '4',
            avatar: '/assets/avatar/AdobeStock_1095142160_Preview.jpeg',
            name: 'ゆき',
            lastMessage: '本日もよろしくお願いいたします！',
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
            unread: false,
        },
        {
            id: '5',
            avatar: '/assets/avatar/AdobeStock_1190678828_Preview.jpeg',
            name: 'はな',
            lastMessage: 'お疲れ様でした！また機会がありましたら！',
            timestamp: new Date(Date.now() - 172800000), // 2 days ago
            unread: false,
        },
        {
            id: '6',
            avatar: '/assets/avatar/AdobeStock_1198659405_Preview.jpeg',
            name: 'みく',
            lastMessage: 'ご予約ありがとうございます！',
            timestamp: new Date(Date.now() - 259200000), // 3 days ago
            unread: false,
        },
        {
            id: '7',
            avatar: '/assets/avatar/AdobeStock_1537463438_Preview.jpeg',
            name: 'れい',
            lastMessage: '申し訳ありません、その時間は予定が…',
            timestamp: new Date(Date.now() - 345600000), // 4 days ago
            unread: false,
        },
        {
            id: '8',
            avatar: '/assets/avatar/AdobeStock_1537463446_Preview.jpeg',
            name: 'かな',
            lastMessage: 'はい、承知いたしました！',
            timestamp: new Date(Date.now() - 432000000), // 5 days ago
            unread: false,
        }
    ];

    if (selectedMessage) {
        return <MessageDetail message={selectedMessage} onBack={() => setSelectedMessage(null)} />;
    }

    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-20">
            <div className="border-b border-secondary">
                <h1 className="text-lg font-bold text-center py-3 text-white">メッセージ</h1>
            </div>
            <div className="divide-y divide-secondary">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className="flex items-center p-4 cursor-pointer hover:bg-secondary/10"
                        onClick={() => setSelectedMessage(message)}
                    >
                        <img src={message.avatar} alt={message.name} className="w-12 h-12 rounded-full mr-4" />
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white">{message.name}</span>
                                <span className="text-xs text-gray-400">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <p className="text-sm text-gray-300 truncate">{message.lastMessage}</p>
                                {message.unread && (
                                    <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MessagePage;
