import { ChevronLeft, Medal, Star, Gift, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';

// Enhanced grade data with detailed information
const gradeData = [
    {
        key: 'green',
        label: 'グリーン',
        icon: <Medal color='#4CAF50' size={32} />,
        color: 'bg-green-500',
        detailIcon: '🥇',
        requirement: '正会員',
        description: '基本グレード',
        benefits: [
            { name: '基本サービス利用', available: true, description: 'チャット・通話・メッセージ' },
            { name: 'ポイント獲得', available: true, description: '通常ポイントレート' },
        ],
        incentives: [
            '新規登録特典',
            '初回利用割引',
        ]
    },
    {
        key: 'orange',
        label: 'オレンジ',
        icon: <Medal color='#FF9800' size={32} />,
        color: 'bg-orange-500',
        detailIcon: '🥇',
        requirement: '100,000P',
        description: 'アクティブユーザー',
        benefits: [
            { name: '基本サービス利用', available: true, description: 'チャット・通話・メッセージ' },
            { name: 'ポイント獲得', available: true, description: '通常ポイントレート' },
            { name: '優先表示', available: true, description: '検索結果で優先表示' },
        ],
        incentives: [
            '月次ボーナスポイント',
            '特別イベント参加権',
        ]
    },
    {
        key: 'bronze',
        label: 'ブロンズ',
        icon: <Medal color='#CD7F32' size={32} />,
        color: 'bg-amber-700',
        detailIcon: '🥉',
        requirement: '300,000P',
        description: 'レギュラーユーザー',
        benefits: [
            { name: '基本サービス利用', available: true, description: 'チャット・通話・メッセージ' },
            { name: 'ポイント獲得', available: true, description: '通常ポイントレート' },
            { name: '優先表示', available: true, description: '検索結果で優先表示' },
            { name: 'カスタムプロフィール', available: true, description: '詳細プロフィール設定' },
        ],
        incentives: [
            '月次ボーナスポイント',
            '特別イベント参加権',
            '専用サポート',
        ]
    },
    {
        key: 'silver',
        label: 'シルバー',
        icon: <Medal color='#C0C0C0' size={32} />,
        color: 'bg-gray-400',
        detailIcon: '🥈',
        requirement: '500,000P',
        description: 'プレミアムユーザー',
        benefits: [
            { name: 'チャット背景', available: true, description: 'カスタムチャット背景' },
            { name: 'つぶやきグレード表示', available: true, description: 'グレードバッジ表示' },
            { name: 'グレードギフト', available: true, description: '特別ギフト配布' },
            { name: '優先表示', available: true, description: '検索結果で最優先表示' },
            { name: 'カスタムプロフィール', available: true, description: '詳細プロフィール設定' },
        ],
        incentives: [
            '月次ボーナスポイント',
            '特別イベント参加権',
            '専用サポート',
            '早期予約権',
        ]
    },
    {
        key: 'gold',
        label: 'ゴールド',
        icon: <Medal color='#FFD700' size={32} />,
        color: 'bg-yellow-500',
        detailIcon: '🥇',
        requirement: '1,000,000P',
        description: 'VIPユーザー',
        benefits: [
            { name: 'チャット背景', available: true, description: 'カスタムチャット背景' },
            { name: 'つぶやきグレード表示', available: true, description: 'グレードバッジ表示' },
            { name: 'グレードギフト', available: true, description: '特別ギフト配布' },
            { name: 'バースデーギフト', available: true, description: '誕生日特別ギフト' },
            { name: 'プライベート設定拡充', available: true, description: '詳細プライバシー設定' },
            { name: '優先表示', available: true, description: '検索結果で最優先表示' },
        ],
        incentives: [
            '月次ボーナスポイント',
            '特別イベント参加権',
            '専用サポート',
            '早期予約権',
            'VIP専用ルーム',
        ]
    },
    {
        key: 'platinum',
        label: 'プラチナ',
        icon: <Medal color='#9C27B0' size={32} />,
        color: 'bg-purple-500',
        detailIcon: '🏅',
        requirement: '6,000,000P',
        description: 'エクスクルーシブユーザー',
        benefits: [
            { name: 'チャット背景', available: true, description: 'カスタムチャット背景' },
            { name: 'つぶやきグレード表示', available: true, description: 'グレードバッジ表示' },
            { name: 'グレードギフト', available: true, description: '特別ギフト配布' },
            { name: 'バースデーギフト', available: true, description: '誕生日特別ギフト' },
            { name: 'プライベート設定拡充', available: true, description: '詳細プライバシー設定' },
            { name: '専任コンシェルジュ', available: true, description: '24時間専任サポート' },
            { name: 'クラスアップ権', available: true, description: '特別昇格権限' },
        ],
        incentives: [
            '月次ボーナスポイント',
            '特別イベント参加権',
            '専用サポート',
            '早期予約権',
            'VIP専用ルーム',
            '専任コンシェルジュ',
            '特別昇格権限',
        ]
    },
    {
        key: 'centurion',
        label: 'センチュリオン',
        icon: <Medal color='#000000' size={32} />,
        color: 'bg-gray-900',
        detailIcon: '🏆',
        requirement: '30,000,000P',
        description: 'レジェンドユーザー',
        benefits: [
            { name: 'チャット背景', available: true, description: 'カスタムチャット背景' },
            { name: 'つぶやきグレード表示', available: true, description: 'グレードバッジ表示' },
            { name: 'グレードギフト', available: true, description: '特別ギフト配布' },
            { name: 'バースデーギフト', available: true, description: '誕生日特別ギフト' },
            { name: 'プライベート設定拡充', available: true, description: '詳細プライバシー設定' },
            { name: '専任コンシェルジュ', available: true, description: '24時間専任サポート' },
            { name: 'クラスアップ権', available: true, description: '特別昇格権限' },
        ],
        incentives: [
            '月次ボーナスポイント',
            '特別イベント参加権',
            '専用サポート',
            '早期予約権',
            'VIP専用ルーム',
            '専任コンシェルジュ',
            '特別昇格権限',
            'レジェンド専用サービス',
        ]
    },
];

const GradeAbout: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

    // Add custom animations via style tag
    const customAnimations = `
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up-delayed {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        @keyframes progress-flow {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        @keyframes arrow-flow {
            0% { opacity: 0.3; transform: translateX(-5px); }
            50% { opacity: 0.8; transform: translateX(0); }
            100% { opacity: 0.3; transform: translateX(5px); }
        }
        
        @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
        }
        
        @keyframes selected-pulse {
            0%, 100% { transform: scale(1.1); }
            50% { transform: scale(1.15); }
        }
        
        @keyframes icon-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-1px); }
        }
        
        @keyframes float-up {
            0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
            50% { transform: translateY(-10px) scale(1.2); opacity: 0.8; }
        }
        
        @keyframes float-down {
            0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
            50% { transform: translateY(10px) scale(0.8); opacity: 0.6; }
        }
        
        @keyframes float-sideways {
            0%, 100% { transform: translateX(0) scale(1); opacity: 1; }
            50% { transform: translateX(5px) scale(1.1); opacity: 0.7; }
        }
        
        @keyframes tooltip-fade {
            0% { opacity: 0; transform: translateY(5px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes text-glow {
            0%, 100% { text-shadow: 0 0 5px rgba(255,255,255,0.3); }
            50% { text-shadow: 0 0 10px rgba(255,255,255,0.6); }
        }
        
        @keyframes selected-text {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes slide-in {
            0% { opacity: 0; transform: translateY(-5px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-subtle {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        
        @keyframes text-shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
        }
        
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-slide-up-delayed { animation: slide-up-delayed 0.8s ease-out 0.5s both; }
        .animate-fade-in-delayed { animation: fade-in 1s ease-out 0.8s both; }
        .animate-gradient-shift { animation: gradient-shift 8s ease-in-out infinite; }
        .animate-progress-flow { animation: progress-flow 3s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-arrow-flow { animation: arrow-flow 2s ease-in-out infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }
        .animate-selected-pulse { animation: selected-pulse 1.5s ease-in-out infinite; }
        .animate-icon-float { animation: icon-float 2s ease-in-out infinite; }
        .animate-float-up { animation: float-up 2s ease-in-out infinite; }
        .animate-float-down { animation: float-down 2.5s ease-in-out infinite; }
        .animate-float-sideways { animation: float-sideways 1.8s ease-in-out infinite; }
        .animate-tooltip-fade { animation: tooltip-fade 0.3s ease-out; }
        .animate-text-glow { animation: text-glow 2s ease-in-out infinite; }
        .animate-selected-text { animation: selected-text 1s ease-in-out infinite; }
        .animate-slide-in { animation: slide-in 0.4s ease-out; }
        .animate-pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }
        .animate-text-shimmer { 
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            background-size: 200% 100%;
            animation: text-shimmer 3s ease-in-out infinite;
        }
    `;

    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-20">
            <style>{customAnimations}</style>
            {/* Enhanced Top bar */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-primary via-primary to-secondary border-b border-secondary shadow-xl backdrop-blur-sm">
                <div className="flex items-center justify-between px-4 py-4">
                    <button 
                        onClick={onBack} 
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-orange-400 transition-all duration-300 transform hover:scale-105"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex-1 text-center">
                        <h1 className="text-xl font-bold text-white drop-shadow-lg">ゲストグレードとは</h1>
                        <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-purple-500 rounded-full mx-auto mt-2"></div>
                    </div>
                    <div className="w-10 h-10"></div> {/* Spacer for symmetry */}
                </div>
            </div>

            {/* Hero Section with animated gradient */}
            <div className="relative py-16 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-blue-500/20 animate-pulse"></div>
                <div className="relative z-10">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-white mb-2">ゲストグレードシステム</h1>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            pishattoでは皆様の日頃のご愛顧に感謝し、<br />
                            グレード制をご用意させていただいております。
                        </p>
                    </div>
                    
                    {/* Grade progression visualization */}
                    <div className="relative mb-8 animate-fade-in">
                        {/* Background gradient for visual appeal */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-purple-500/5 to-blue-500/5 rounded-2xl animate-gradient-shift"></div>
                        
                        {/* Progress line with enhanced styling */}
                        <div className="absolute top-6 left-4 right-4 h-2 bg-gradient-to-r from-green-500 via-orange-500 to-purple-600 rounded-full opacity-40 shadow-lg overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-400 to-orange-400 rounded-full animate-progress-flow"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </div>
                        
                        {/* Grade badges with improved layout */}
                        <div className="relative z-10 px-2">
                            <div className="flex justify-between items-start">
                                {gradeData.map((grade, index) => (
                                    <div 
                                        key={grade.key} 
                                        className="flex flex-col items-center group relative animate-slide-up"
                                        style={{ animationDelay: `${index * 200}ms` }}
                                    >
                                        {/* Connection arrows for progression */}
                                        {index < gradeData.length - 1 && (
                                            <div className="absolute top-6 left-full w-8 h-0.5 bg-gradient-to-r from-white/30 to-transparent transform -translate-y-1/2 z-0 animate-arrow-flow"></div>
                                        )}
                                        
                                        {/* Grade badge with enhanced interactions */}
                                        <div 
                                            className={`relative w-14 h-14 rounded-full ${grade.color} flex items-center justify-center text-white text-xl font-bold shadow-2xl transform hover:scale-125 transition-all duration-300 cursor-pointer border-3 border-white/30 hover:border-white/50 animate-bounce-subtle ${
                                                selectedGrade === grade.key 
                                                    ? 'ring-4 ring-orange-400 ring-opacity-60 scale-110 shadow-orange-500/50 animate-selected-pulse' 
                                                    : 'hover:shadow-orange-500/30 hover:shadow-lg'
                                            }`}
                                            onClick={() => setSelectedGrade(selectedGrade === grade.key ? null : grade.key)}
                                        >
                                            <div className="animate-icon-float">
                                                {grade.detailIcon}
                                            </div>
                                            
                                            {/* Enhanced glow effect when selected */}
                                            {selectedGrade === grade.key && (
                                                <>
                                                    <div className="absolute inset-0 rounded-full bg-orange-400/30 animate-pulse"></div>
                                                    <div className="absolute -inset-2 rounded-full bg-orange-400/10 animate-ping"></div>
                                                    <div className="absolute -inset-4 rounded-full bg-orange-400/5 animate-ping delay-300"></div>
                                                </>
                                            )}
                                            
                                            {/* Floating particles when selected */}
                                            {selectedGrade === grade.key && (
                                                <>
                                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-float-up"></div>
                                                    <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-orange-400 rounded-full animate-float-down"></div>
                                                    <div className="absolute top-1/2 -right-2 w-1 h-1 bg-purple-400 rounded-full animate-float-sideways"></div>
                                                </>
                                            )}
                                            
                                            {/* Hover tooltip effect */}
                                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none animate-tooltip-fade">
                                                <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                                    クリックして詳細表示
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Grade label with improved typography */}
                                        <div className="mt-4 text-center max-w-16">
                                            <span className={`text-sm font-bold transition-all duration-300 animate-text-glow ${
                                                selectedGrade === grade.key 
                                                    ? 'text-orange-400 drop-shadow-lg animate-selected-text' 
                                                    : 'text-white/90 group-hover:text-white'
                                            }`}>
                                                {grade.label}
                                            </span>
                                            
                                            {/* Requirement hint with better visibility */}
                                            <div className={`text-xs text-gray-300 mt-1 transition-all duration-300 ${
                                                selectedGrade === grade.key 
                                                    ? 'opacity-100 transform translate-y-0 animate-slide-in' 
                                                    : 'opacity-0 transform -translate-y-1'
                                            }`}>
                                                {grade.requirement}
                                            </div>
                                            
                                            {/* Points indicator */}
                                            <div className={`text-xs text-gray-400 mt-1 transition-opacity duration-300 ${
                                                selectedGrade === grade.key ? 'opacity-100' : 'opacity-0'
                                            }`}>
                                                {grade.requirement}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Enhanced progress indicator */}
                        <div className="mt-8 text-center animate-slide-up-delayed">
                            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-white/10 to-white/5 rounded-full px-6 py-3 backdrop-blur-sm border border-white/20 animate-pulse-subtle">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-100"></div>
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                                </div>
                                <span className="text-sm text-white/90 font-medium animate-text-shimmer">グレード進行状況</span>
                                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-blue-500 animate-spin"></div>
                            </div>
                        </div>
                        
                        {/* Interactive hint */}
                        <div className="mt-4 text-center animate-fade-in-delayed">
                            <p className="text-xs text-white/60 italic animate-bounce-subtle">
                                💡 グレードをタップして詳細を確認
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Point calculation periods with enhanced styling */}
            <div className="mx-4 mb-6">
                <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl px-4 py-4 shadow-lg border border-gray-600">
                    <div className="text-center font-bold text-sm mb-2">📅 年4期のご利用ポイント算出期間</div>
                    <div className="text-xs text-gray-300 text-center leading-relaxed">
                        1月1日~3月31日 / 4月1日~6月30日 /<br />
                        7月1日~9月30日 / 10月1日~12月31日
                    </div>
                </div>
            </div>

            {/* Grade Details Section */}
            {selectedGrade && (
                <div className="mx-4 mb-6">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg border border-gray-600">
                        {(() => {
                            const grade = gradeData.find(g => g.key === selectedGrade);
                            if (!grade) return null;
                            
                            return (
                                <div className="space-y-4">
                                    {/* Grade Header */}
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-12 h-12 rounded-lg ${grade.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                                            {grade.detailIcon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{grade.label}</h3>
                                            <p className="text-sm text-gray-400">{grade.description}</p>
                                        </div>
                                    </div>

                                    {/* Requirement */}
                                    <div className="bg-gray-700 rounded-lg p-3">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <TrendingUp size={16} className="text-orange-400" />
                                            <span className="text-sm font-bold text-white">昇格条件</span>
                                        </div>
                                        <p className="text-orange-400 font-bold">{grade.requirement}</p>
                                    </div>

                                    {/* Benefits */}
                                    <div>
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Gift size={16} className="text-green-400" />
                                            <span className="text-sm font-bold text-white">利用可能サービス</span>
                                        </div>
                                        <div className="space-y-2">
                                            {grade.benefits.map((benefit, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <div className={`w-4 h-4 rounded-full ${benefit.available ? 'bg-green-500' : 'bg-gray-600'} flex items-center justify-center`}>
                                                        {benefit.available && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                    </div>
                                                    <span className="text-sm text-white">{benefit.name}</span>
                                                    <span className="text-xs text-gray-400">({benefit.description})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Incentives */}
                                    <div>
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Star size={16} className="text-yellow-400" />
                                            <span className="text-sm font-bold text-white">特別特典</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {grade.incentives.map((incentive, index) => (
                                                <div key={index} className="bg-gray-700 rounded-lg px-3 py-2">
                                                    <span className="text-sm text-yellow-400">✨ {incentive}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Quick Grade Overview */}
            <div className="px-4 pb-8">
                <div className="text-center font-bold text-white mb-4">グレード別特典一覧</div>
                <div className="space-y-3">
                    {gradeData.map((grade, index) => (
                        <div 
                            key={grade.key}
                            className={`bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-3 border border-gray-600 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg ${selectedGrade === grade.key ? 'ring-2 ring-orange-400' : ''}`}
                            onClick={() => setSelectedGrade(selectedGrade === grade.key ? null : grade.key)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-lg ${grade.color} flex items-center justify-center text-white text-sm font-bold`}>
                                        {grade.detailIcon}
                                    </div>
                                    <div>
                                        <div className="text-white font-bold">{grade.label}</div>
                                        <div className="text-xs text-gray-400">{grade.requirement}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400">特典数</div>
                                    <div className="text-white font-bold">{grade.benefits.filter(b => b.available).length}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="text-xs text-gray-400 text-center mt-4 p-3 bg-gray-800 rounded-lg">
                    💡 グレードをタップすると詳細情報が表示されます
                </div>
            </div>
        </div>
    );
};

export default GradeAbout; 