import React, { useState, useRef, useEffect } from 'react';
import { FiChevronLeft, FiGift, FiImage, FiCamera, FiFolder } from 'react-icons/fi';

interface ChatScreenProps {
    onBack: () => void;
}

const messages = [
    {
        id: 1,
        name: 'pishattoコンシェルジュ 11歳',
        avatar: '/assets/avatar/1.jpg',
        time: '22:02',
        content: (
            <div className="bg-[#f3f8fc] border border-[#e3e8ee] rounded-2xl p-4 max-w-[80%]">
                <div className="flex items-center mb-2">
                    <img src="/assets/pishatto-welcome.png" alt="pishatto" className="w-32 h-20 rounded mr-2 object-contain" />
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-yellow-600">pishatto</span>
                        <span className="text-xs text-orange-500">へ ようこそ</span>
                    </div>
                </div>
                <div className="text-gray-700 text-sm mb-2">はじめまして。<br />pishattoコンシェルジュのパットくんと申します。</div>
                <div className="text-gray-700 text-sm mb-2">「お問い合わせ窓口」として24時間体制でサポートさせていただきます。お困りの際はお気軽にご連絡ください。</div>
                <div className="text-gray-700 text-sm">↓ 合流方法は2種類✨</div>
            </div>
        ),
    },
    {
        id: 2,
        name: 'pishattoコンシェルジュ 11歳',
        avatar: '/assets/avatar/1.jpg',
        time: '22:02',
        content: <span>��</span>,
    },
];

const ChatScreen: React.FC<ChatScreenProps> = ({ onBack }) => {
    const [showGift, setShowGift] = useState(false);
    const [showFile, setShowFile] = useState(false);
    const [input, setInput] = useState('');
    const attachBtnRef = useRef<HTMLButtonElement>(null);
    const [attachPopoverStyle, setAttachPopoverStyle] = useState<React.CSSProperties>({});

    // Position the attach popover above the attach button
    useEffect(() => {
        if (showFile && attachBtnRef.current) {
            const rect = attachBtnRef.current.getBoundingClientRect();
            setAttachPopoverStyle({
                position: 'fixed',
                left: rect.left + rect.width / 2 - 270, // 160 = popover width / 2
                top: rect.top - 160, // popover height + margin
                zIndex: 100,
            });
        }
    }, [showFile]);

    return (
        <div className="bg-white min-h-screen flex flex-col relative">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b border-gray-200">
                <button onClick={onBack} className="mr-2">
                    <FiChevronLeft className="w-6 h-6 text-gray-500" />
                </button>
                <img
                    src="/assets/avatar/1.jpg"
                    alt="avatar"
                    className="w-8 h-8 rounded-full mr-2 border border-gray-200"
                />
                <span className="font-bold text-gray-700 text-base truncate">pishattoコンシェルジュ 11歳</span>
            </div>
            {/* Date separator */}
            <div className="flex justify-center my-4">
                <span className="bg-gray-100 text-gray-400 text-xs px-3 py-1 rounded-full">02月20日(木)</span>
            </div>
            {/* Chat history */}
            <div className="flex-1 overflow-y-auto px-4 pb-32">
                {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start mb-4">
                        <img
                            src={msg.avatar}
                            alt="avatar"
                            className="w-8 h-8 rounded-full mr-2 border border-gray-200 mt-1"
                        />
                        <div>
                            <div className="flex items-center mb-1">
                                <span className="font-bold text-gray-700 text-sm mr-2">{msg.name}</span>
                                <span className="text-xs text-gray-400">{msg.time}</span>
                            </div>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>
            {/* Input bar (always fixed at bottom) */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 flex items-center px-4 py-2 z-20">
                <input
                    type="text"
                    className="flex-1 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-700 text-sm mr-2"
                    placeholder="メッセージを入力..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
                <button ref={attachBtnRef} className="text-gray-400 mr-2 relative" onClick={() => setShowFile(v => !v)}>
                    <FiImage className="w-7 h-7" />
                </button>
                <button className="text-gray-400" onClick={() => setShowGift(v => !v)}>
                    <FiGift className="w-7 h-7" />
                </button>
            </div>
            {/* Gift window (fixed below input bar, does not move input bar) */}
            {showGift && (
                <div className="fixed left-0 right-0 bottom-14 max-w-md mx-auto bg-white rounded-lg border shadow-lg p-0 overflow-hidden animate-fade-in z-10 h-80">
                    <div className="flex flex-col items-center relative h-full">
                        <div className="flex w-full border-b">
                            <button className="flex-1 py-3 text-gray-400 font-bold">定番</button>
                            <button className="flex-1 py-3 text-gray-400 font-bold">ご当地</button>
                            <button className="flex-1 py-3 text-gray-400 font-bold">グレード</button>
                            <button className="flex-1 py-3 text-blue-600 font-bold border-b-2 border-blue-600">Myギフト</button>
                        </div>
                        <div className="py-8 text-center flex-1 flex flex-col justify-center">
                            <div className="mb-4">一部ゲストだけの特別なギフト</div>
                            <img src="/assets/gift-cards.png" alt="gifts" className="mx-auto mb-4 w-48" />
                            <div className="font-bold text-lg mb-2">ギフトイベントで上位にランクインして<br />Myギフトを獲得しましょう！</div>
                            <div className="text-xs text-gray-500">Myギフトを手に入れると、イベント限定ギフトが期間終了後も贈ることができます</div>
                        </div>
                        <button className="absolute top-2 right-2 text-gray-400 text-2xl" onClick={() => setShowGift(false)}>&times;</button>
                    </div>
                </div>
            )}
            {/* Attach Popover */}
            {showFile && (
                <div style={attachPopoverStyle} className="w-80 bg-white rounded-xl shadow-lg border z-50 animate-fade-in">
                    <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 text-gray-700 text-base border-b last:border-b-0">
                        <span>写真ライブラリ</span>
                        <FiImage className="ml-3 w-6 h-6" />
                    </button>
                    <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 text-gray-700 text-base border-b last:border-b-0">
                        <span>写真またはビデオを撮る</span>
                        <FiCamera className="ml-3 w-6 h-6" />
                    </button>
                    <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 text-gray-700 text-base">
                        <span>ファイルを選択</span>
                        <FiFolder className="ml-3 w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatScreen; 