import React, { useState, useRef, useEffect } from 'react';
import { Image, Camera, FolderClosed } from 'lucide-react';
import { FiChevronLeft, FiGift, FiImage } from 'react-icons/fi';

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
                    <img src="/assets/icons/card-1.png" alt="pishatto" className="w-32 h-20 rounded mr-2 object-contain" />
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
    const [giftTab, setGiftTab] = useState<'standard' | 'local' | 'grade' | 'mygift'>('mygift');
    const [attachedImages, setAttachedImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        <div className="bg-primary min-h-screen flex flex-col relative">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b border-secondary bg-primary">
                <button onClick={onBack} className="mr-2">
                    <FiChevronLeft className="w-6 h-6 text-white" />
                </button>
                <img
                    src="/assets/avatar/1.jpg"
                    alt="avatar"
                    className="w-8 h-8 rounded-full mr-2 border border-secondary"
                />
                <span className="font-bold text-white text-base truncate">pishattoコンシェルジュ 11歳</span>
            </div>
            {/* Date separator */}
            <div className="flex justify-center my-4">
                <span className="bg-primary text-white text-xs px-3 py-1 rounded-full border border-secondary">02月20日(木)</span>
            </div>
            {/* Chat history */}
            <div className="flex-1 overflow-y-auto px-4 pb-32">
                {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start mb-4">
                        <img
                            src={msg.avatar}
                            alt="avatar"
                            className="w-8 h-8 rounded-full mr-2 border border-secondary mt-1"
                        />
                        <div>
                            <div className="flex items-center mb-1">
                                <span className="font-bold text-white text-sm mr-2">{msg.name}</span>
                                <span className="text-xs text-white">{msg.time}</span>
                            </div>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {/* Render attached images as chat bubbles */}
                {attachedImages.map((img, idx) => (
                    <div key={idx} className="flex items-start mb-4">
                        <img
                            src="/assets/avatar/2.jpg"
                            alt="avatar"
                            className="w-8 h-8 rounded-full mr-2 border border-secondary mt-1"
                        />
                        <div className="bg-primary border border-secondary rounded-2xl p-2 max-w-[60%]">
                            <img src={img} alt="attachment" className="max-w-full max-h-40 rounded" />
                        </div>
                    </div>
                ))}
            </div>
            {/* Input bar (always fixed at bottom) */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-primary border-t border-secondary flex flex-col px-4 py-2 z-20">
                {/* Show attached image previews */}
                {attachedImages.length > 0 && (
                    <div className="flex gap-2 mb-2">
                        {attachedImages.map((img, idx) => (
                            <div key={idx} className="relative">
                                <img src={img} alt="preview" className="w-12 h-12 object-cover rounded border border-secondary bg-primary" />
                                <button
                                    className="absolute -top-2 -right-2 bg-primary border border-secondary rounded-full w-5 h-5 flex items-center justify-center text-xs text-white"
                                    onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                                    type="button"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex items-center w-full">
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 rounded-full border border-secondary bg-primary text-white text-sm mr-2"
                        placeholder="メッセージを入力..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                    <button ref={attachBtnRef} className="text-white mr-2 relative" onClick={() => setShowFile(v => !v)}>
                        <FiImage className="w-7 h-7" />
                    </button>
                    <button className="text-white" onClick={() => setShowGift(v => !v)}>
                        <FiGift className="w-7 h-7" />
                    </button>
                </div>
            </div>
            {/* Gift window (fixed below input bar, does not move input bar) */}
            {showGift && (
                <div className="fixed left-0 right-0 bottom-14 max-w-md mx-auto bg-primary rounded-lg border border-secondary shadow-lg p-0 overflow-hidden animate-fade-in z-10 h-80">
                    <div className="flex flex-col items-center relative h-full">
                        <div className="flex w-full border-b border-secondary">
                            <button className={`flex-1 py-3 font-bold ${giftTab === 'standard' ? 'text-white border-b-2 border-secondary' : 'text-white'}`} onClick={() => setGiftTab('standard')}>定番</button>
                            <button className={`flex-1 py-3 font-bold ${giftTab === 'local' ? 'text-white border-b-2 border-secondary' : 'text-white'}`} onClick={() => setGiftTab('local')}>ご当地</button>
                            <button className={`flex-1 py-3 font-bold ${giftTab === 'grade' ? 'text-white border-b-2 border-secondary' : 'text-white'}`} onClick={() => setGiftTab('grade')}>グレード</button>
                            <button className={`flex-1 py-3 font-bold ${giftTab === 'mygift' ? 'text-white border-b-2 border-secondary' : 'text-white'}`} onClick={() => setGiftTab('mygift')}>Myギフト</button>
                        </div>
                        <div className="py-8 text-center flex-1 flex flex-col justify-center w-full">
                            {giftTab === 'standard' && (
                                <div>
                                    <div className="mb-4 text-white">定番ギフト一覧</div>
                                    <img src="/assets/icons/card-2.png" alt="standard gifts" className="mx-auto mb-4 w-10" />
                                    <div className="font-bold text-lg mb-2 text-white">人気の定番ギフトを贈ろう！</div>
                                    <div className="text-xs text-white">ここに定番ギフトの説明やリストを表示</div>
                                </div>
                            )}
                            {giftTab === 'local' && (
                                <div>
                                    <div className="mb-4 text-white">ご当地ギフト一覧</div>
                                    <img src="/assets/icons/card-1.png" alt="local gifts" className="mx-auto mb-4 w-10" />
                                    <div className="font-bold text-lg mb-2 text-white">地域限定のギフトをチェック！</div>
                                    <div className="text-xs text-white">ここにご当地ギフトの説明やリストを表示</div>
                                </div>
                            )}
                            {giftTab === 'grade' && (
                                <div>
                                    <div className="mb-4 text-white">グレードギフト一覧</div>
                                    <img src="/assets/icons/crown.png" alt="grade gifts" className="mx-auto mb-4 w-10" />
                                    <div className="font-bold text-lg mb-2 text-white">グレード限定ギフトを贈ろう！</div>
                                    <div className="text-xs text-white">ここにグレードギフトの説明やリストを表示</div>
                                </div>
                            )}
                            {giftTab === 'mygift' && (
                                <div>
                                    <div className="mb-4 text-white">一部ゲストだけの特別なギフト</div>
                                    <img src="/assets/icons/card-1.png" alt="gifts" className="mx-auto mb-4 w-6" />
                                    <div className="font-bold text-lg mb-2 text-white">ギフトイベントで上位にランクインして<br />Myギフトを獲得しましょう！</div>
                                    <div className="text-xs text-white">Myギフトを手に入れると、イベント限定ギフトが期間終了後も贈ることができます</div>
                                </div>
                            )}
                        </div>
                        <button className="absolute top-2 right-2 text-white text-2xl" onClick={() => setShowGift(false)}>&times;</button>
                    </div>
                </div>
            )}
            {/* Attach Popover */}
            {showFile && (
                <div style={attachPopoverStyle} className="w-80 bg-primary rounded-xl shadow-lg border border-secondary z-50 animate-fade-in">
                    <button
                        className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary text-white text-base border-b border-secondary"
                        onClick={() => {
                            setShowFile(false);
                            fileInputRef.current?.click();
                        }}
                    >
                        <span>写真ライブラリ</span>
                        <Image />
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = ev => {
                                    if (typeof ev.target?.result === 'string') {
                                        setAttachedImages(prev => [...prev, ev.target!.result as string]);
                                    }
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary text-white text-base border-b border-secondary">
                        <span>写真またはビデオを撮る</span>
                        <Camera />
                    </button>
                    <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary text-white text-base">
                        <span>ファイルを選択</span>
                        <FolderClosed />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatScreen; 