import { ChevronLeft, HelpCircle, MessageCircle, Lock, CreditCard, Monitor } from 'lucide-react';
import React, { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
    icon: React.ReactNode;
}

const HelpPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    const faqItems: FAQItem[] = [
        {
            question: "サービスの使い方は？",
            answer: "画面の案内に従ってご利用ください。各機能には詳細な説明が付いていますので、初めての方でも安心してご利用いただけます。",
            icon: <HelpCircle className="w-5 h-5" />
        },
        {
            question: "問い合わせ先は？",
            answer: "サポート窓口までご連絡ください。お電話またはメールでお気軽にお問い合わせください。通常24時間以内にご返信いたします。",
            icon: <MessageCircle className="w-5 h-5" />
        },
        {
            question: "パスワードを忘れた場合は？",
            answer: "ログイン画面の「パスワードを忘れた方はこちら」から再設定できます。メールアドレスを入力していただければ、パスワードリセット用のリンクをお送りします。",
            icon: <Lock className="w-5 h-5" />
        },
        {
            question: "利用料金はかかりますか？",
            answer: "基本的なサービスは無料でご利用いただけます。一部有料機能もございますが、詳細は料金プランページでご確認いただけます。",
            icon: <CreditCard className="w-5 h-5" />
        },
        {
            question: "対応ブラウザは？",
            answer: "最新のChrome、Firefox、Edge、Safariに対応しています。推奨ブラウザはChromeです。古いバージョンのブラウザでは一部機能が制限される場合があります。",
            icon: <Monitor className="w-5 h-5" />
        }
    ];

    const toggleItem = (index: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedItems(newExpanded);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-secondary">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
                <div className="flex items-center px-4 py-4">
                    {onBack && (
                        <button 
                            onClick={onBack} 
                            className="mr-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 text-white hover:scale-105"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <h1 className="text-xl font-bold text-white flex-1 text-center">ヘルプセンター</h1>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-6 max-w-2xl mx-auto">
                {/* Welcome Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                        <HelpCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">よくある質問</h2>
                    <p className="text-white/80 text-sm">お客様からよくいただく質問と回答をご紹介します</p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqItems.map((item, index) => (
                        <div 
                            key={index}
                            className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden transition-all duration-300 hover:bg-white/15"
                        >
                            <button
                                onClick={() => toggleItem(index)}
                                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="text-white/80">
                                        {item.icon}
                                    </div>
                                    <span className="font-semibold text-white text-left">
                                        {item.question}
                                    </span>
                                </div>
                                <div className={`text-white/60 transition-transform duration-300 ${
                                    expandedItems.has(index) ? 'rotate-180' : ''
                                }`}>
                                    <ChevronLeft className="w-5 h-5" />
                                </div>
                            </button>
                            
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                expandedItems.has(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                                <div className="px-6 pb-4">
                                    <div className="text-white/90 text-sm leading-relaxed">
                                        {item.answer}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                {/* <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">お困りの際は</h3>
                    <p className="text-white/80 text-sm mb-4">
                        上記の質問で解決しない場合は、お気軽にお問い合わせください。
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button className="flex-1 bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105">
                            お問い合わせ
                        </button>
                        <button className="flex-1 bg-transparent border border-white/30 hover:bg-white/10 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200">
                            サポートページ
                        </button>
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default HelpPage;