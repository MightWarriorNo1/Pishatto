import React, { useState, useEffect } from 'react';
import GradeAbout from './GradeAbout';
import { ChevronLeft, ChevronRight, MessageSquareMore, FileText, Gift, Gem, Settings, UsersRound, Medal, Star} from 'lucide-react';
import { getGuestGrade, GradeInfo } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import Spinner from '../ui/Spinner';

const GradeDetail: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [showAbout, setShowAbout] = useState(false);
    const [gradeInfo, setGradeInfo] = useState<GradeInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        const fetchGradeInfo = async () => {
            if (user?.id) {
                try {
                    setLoading(true);
                    const data = await getGuestGrade(user.id);
                    setGradeInfo(data);
                } catch (error) {
                    console.error('Error fetching grade info:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchGradeInfo();
    }, [user?.id]);

    const getGradeIcon = (grade: string) => {
        switch (grade) {
            case 'green':
                return <Medal color='#4CAF50' size={64} />;
            case 'orange':
                return <Medal color='#FF9800' size={64} />;
            case 'bronze':
                return <Medal color='#CD7F32' size={64} />;
            case 'silver':
                return <Medal color='#C0C0C0' size={64} />;
            case 'gold':
                return <Medal color='#FFD700' size={64} />;
            case 'platinum':
                return <Medal color='#E5E4E2' size={64} />;
            case 'centurion':
                return <Medal color='#B8860B' size={64} />;
            default:
                return <Medal color='#4CAF50' size={64} />; // Default to green (lowest level)
        }
    };

    const getProgressPercentage = () => {
        if (!gradeInfo) return 0;
        
        const currentPoints = gradeInfo.grade_points;
        const nextGradeThreshold = gradeInfo.next_grade ? 
            (gradeInfo as any).thresholds?.[gradeInfo.next_grade] || 0 : 0;
        const currentGradeThreshold = (gradeInfo as any).thresholds?.[gradeInfo.current_grade] || 0;
        
        if (nextGradeThreshold === 0) return 100;
        
        const progress = ((currentPoints - currentGradeThreshold) / (nextGradeThreshold - currentGradeThreshold)) * 100;
        return Math.min(Math.max(progress, 0), 100);
    };

    const getCurrentGradeIndex = () => {
        const grades = ['green', 'orange', 'bronze', 'silver', 'gold', 'platinum', 'centurion'];
        return grades.indexOf(gradeInfo?.current_grade || 'green');
    };

    const getGradeData = () => {
        return [
            { name: 'グリーン', grade: 'green', icon: <Medal color='#4CAF50' size={32} />, color: 'text-green-400' },
            { name: 'オレンジ', grade: 'orange', icon: <Medal color='#FF9800' size={32} />, color: 'text-orange-400' },
            { name: 'ブロンズ', grade: 'bronze', icon: <Medal color='#CD7F32' size={32} />, color: 'text-amber-600' },
            { name: 'シルバー', grade: 'silver', icon: <Medal color='#C0C0C0' size={32} />, color: 'text-gray-300' },
            { name: 'ゴールド', grade: 'gold', icon: <Medal color='#FFD700' size={32} />, color: 'text-yellow-300' },
            { name: 'プラチナ', grade: 'platinum', icon: <Medal color='#E5E4E2' size={32} />, color: 'text-gray-200' },
            { name: 'センチュリオン', grade: 'centurion', icon: <Medal color='#B8860B' size={32} />, color: 'text-amber-500' },
        ];
    };

    if (showAbout) return <GradeAbout onBack={() => setShowAbout(false)} />;

    if (loading) {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-primary flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (!gradeInfo) {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-primary flex items-center justify-center">
                <div className="text-white text-lg">グレード情報を取得できませんでした</div>
            </div>
        );
    }

    const benefits = [
        { icon: <MessageSquareMore color='orange' size={32} />, label: 'チャット背景', key: 'chat_background' },
        { icon: <FileText color='orange' size={32} />, label: 'つぶやきグレード表示', key: 'tweet_grade_display' },
        { icon: <Gift color='orange' size={32} />, label: 'グレードギフト', key: 'grade_gift' },
        { icon: <Gem color='orange' size={32} />, label: 'バースデーギフト', key: 'birthday_gift' },
        { icon: <Settings color='orange' size={32} />, label: 'プライベート設定拡充', key: 'private_settings_expansion' },
        { icon: <UsersRound color='orange' size={32} />, label: '専任コンシェルジュ', key: 'dedicated_concierge' },
    ];

    const gradeData = getGradeData();
    const currentGradeIndex = getCurrentGradeIndex();

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-primary via-primary to-secondary pb-20">
            {/* Top bar */}
            <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50 flex items-center px-4 py-3 border-b border-secondary bg-primary">
                <button onClick={onBack} className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer transition-colors">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center text-white">ゲストグレード</span>
            </div>
            
            {/* Add top padding to account for fixed header */}
            <div className="pt-16">
            
            {/* Enhanced Badge section */}
            <div className={`bg-gradient-to-b bg-white/10 p-6 relative overflow-hidden`}>
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 text-6xl">⭐</div>
                    <div className="absolute bottom-4 left-4 text-4xl">✨</div>
                </div>
                
                <div className="flex flex-col items-center relative z-10">
                    {/* Enhanced Badge with glow effect */}
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl mb-4 border-4 border-white/30 bg-white/10 backdrop-blur-sm animate-pulse`}>
                        <span className="text-7xl filter drop-shadow-lg">{getGradeIcon(gradeInfo.current_grade)}</span>
                        {gradeInfo.current_grade === 'centurion' && (
                            <span className="absolute -top-2 -right-2 text-2xl animate-bounce">👑</span>
                        )}
                    </div>
                    <div className="text-white font-bold text-2xl mb-2 text-center">{gradeInfo.current_grade_name}</div>
                    <div className="text-white/90 text-lg font-semibold">{gradeInfo.grade_points.toLocaleString()}P</div>
                    
                    {/* Current position indicator */}
                    <div className="mt-4 bg-white/20 rounded-full px-4 py-2">
                        <span className="text-white text-sm font-medium">
                            {currentGradeIndex + 1} / {gradeData.length} グレード
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Enhanced Description */}
            <div className="text-center py-6 px-4">
                <div className="text-white text-sm mb-4 leading-relaxed">
                    {gradeInfo.next_grade ? 
                        `次のグレード「${gradeInfo.next_grade_name}」まであと${gradeInfo.points_to_next_grade.toLocaleString()}Pです。` :
                        '🎉 最高グレードに到達しました！おめでとうございます！'
                    }
                </div>
                
                {/* Progress to next grade */}
                {gradeInfo.next_grade && (
                    <div className="bg-secondary/20 rounded-lg p-4 mb-4">
                        <div className="flex justify-between text-xs text-white mb-2">
                            <span>現在: {gradeInfo.current_grade_name}</span>
                            <span>次: {gradeInfo.next_grade_name}</span>
                        </div>
                        <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
                            <div 
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${getProgressPercentage()}%` }}
                            />
                        </div>
                        <div className="text-center text-white text-xs mt-2">
                            {Math.round(getProgressPercentage())}% 完了
                        </div>
                    </div>
                )}
            </div>
            
            {/* Enhanced Grade Progression */}
            <div className="px-4 py-6">
                <div className="text-center font-bold text-white mb-6 text-lg">グレード進行状況</div>
                <div className="space-y-3">
                    {gradeData.map((grade, index) => {
                        const isCurrent = index === currentGradeIndex;
                        const isCompleted = index < currentGradeIndex;
                        const isFuture = index > currentGradeIndex;
                        
                        return (
                            <div 
                                key={grade.grade}
                                className={`flex items-center p-3 rounded-lg border-2 transition-all duration-300 ${
                                    isCurrent 
                                        ? 'border-green-400 bg-green-400/20 shadow-lg scale-105' 
                                        : isCompleted 
                                        ? 'border-green-400 bg-green-400/20' 
                                        : 'border-gray-600 bg-gray-600/20'
                                }`}
                            >
                                <div className={`text-2xl mr-3 ${grade.color}`}>
                                    {grade.icon}
                                </div>
                                <div className="flex-1">
                                    <div className={`font-bold ${
                                        isCurrent ? 'text-green-400' : isCompleted ? 'text-green-400' : 'text-gray-400'
                                    }`}>
                                        {grade.name}
                                    </div>
                                    {isCurrent && (
                                        <div className="text-xs text-green-300 mt-1">
                                            現在のグレード
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    {isCurrent && (
                                        <div className="text-green-400 animate-pulse">
                                            <Star size={20} />
                                        </div>
                                    )}
                                    {isCompleted && (
                                        <div className="text-green-400">
                                            ✓
                                        </div>
                                    )}
                                    {isFuture && (
                                        <div className="text-gray-500">
                                            ○
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* What is guest grade row */}
            <button 
                className="w-full flex items-center px-4 py-4 border-b border-secondary hover:bg-secondary/20 transition-colors" 
                onClick={() => setShowAbout(true)}
            >
                <span className="flex-1 text-left font-bold text-white">ゲストグレードとは</span>
                <span className="text-white text-lg">
                    <ChevronRight />
                </span>
            </button>
            
            {/* Enhanced Member benefits */}
            <div className="px-4 py-6">
                <div className="text-center font-bold text-white mb-6 text-lg">会員特典一覧</div>
                <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                    {benefits.map((b, i) => {
                        const isActive = gradeInfo.benefits[b.key as keyof typeof gradeInfo.benefits];
                        return (
                            <div key={i} className="flex flex-col items-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                                    isActive 
                                        ? 'bg-orange-400/20 border-2 border-orange-400 shadow-lg' 
                                        : 'bg-gray-600/20 border-2 border-gray-600'
                                }`}>
                                    <span className={`text-2xl ${isActive ? 'text-orange-400' : 'text-gray-500'}`}>
                                        {b.icon}
                                    </span>
                                </div>
                                <span className={`text-xs text-center whitespace-pre-line leading-tight font-medium ${
                                    isActive ? 'text-white' : 'text-gray-500'
                                }`}>
                                    {b.label}
                                </span>
                                {isActive && (
                                    <div className="text-xs text-orange-400 mt-1 font-bold">
                                        利用可能
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            </div>
        </div>
    );
};

export default GradeDetail; 