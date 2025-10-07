import React from 'react';
import { Play, Square, Clock } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Utility function to get the first available avatar from comma-separated string
const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
    if (!avatarString) {
        return '/assets/avatar/female.png';
    }
    
    // Split by comma and get the first non-empty avatar
    const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
    
    if (avatars.length === 0) {
        return '/assets/avatar/female.png';
    }
    
    return `${API_BASE_URL}/${avatars[0]}`;
};

interface SessionTimerProps {
    isActive: boolean;
    elapsedTime: number;
    onMeet?: () => void;
    onDissolve?: () => void;
    isLoading?: boolean;
    className?: string;
    dissolveButtonUsed?: boolean;
    currentUserId?: number;
    sessionSummary?: {
        elapsedTime: number;
        castEarnings: Array<{
            castId: number;
            nickname: string;
            avatar: string;
            points: number;
            category: string;
        }>;
    } | null;
}

const SessionTimer: React.FC<SessionTimerProps> = ({
    isActive,
    elapsedTime,
    onMeet,
    onDissolve,
    isLoading = false,
    className = '',
    dissolveButtonUsed = false,
    currentUserId,
    sessionSummary = null
}) => {
    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-4 border border-blue-400 mb-3 min-h-fit ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Clock size={20} />
                    <span className="font-semibold">セッションタイマー</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                    isActive ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                    {isActive ? 'アクティブ' : '待機中'}
                </div>
            </div>
            
            <div className="text-center mb-4">
                <div className="text-3xl font-mono font-bold">
                    {formatTime(elapsedTime)}
                </div>
                <div className="text-sm text-gray-200 mt-1">
                    {isActive ? '経過時間' : '待機中'}
                </div>
            </div>
            
            {onMeet && onDissolve && (
                <div className="flex gap-3">
                    {!isActive ? (
                        <button
                            onClick={onMeet}
                            disabled={isLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    処理中...
                                </>
                            ) : (
                                <>
                                    <Play size={16} />
                                    合流開始
                                </>
                            )}
                        </button>
                    ) : (
                        !dissolveButtonUsed && onDissolve && (
                            <button
                                onClick={onDissolve}
                                disabled={isLoading}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        処理中...
                                    </>
                                ) : (
                                    <>
                                        <Square size={16} />
                                        セッション終了
                                    </>
                                )}
                            </button>
                        )
                    )}
                </div>
            )}

            {/* Session Summary Display */}
            {dissolveButtonUsed && sessionSummary && (
                <div className="mt-4 p-3 bg-green-800 rounded-lg border border-green-400">
                    <div className="text-center mb-2">
                        <h3 className="text-base font-bold text-white mb-1">セッション完了</h3>
                        <div className="text-xl font-mono font-bold text-green-300">
                            {formatTime(sessionSummary.elapsedTime)}
                        </div>
                        <div className="text-xs text-green-200">総経過時間</div>
                    </div>
                    
                    <div className="space-y-2">
                        <h4 className="text-white font-semibold text-center text-sm">あなたの報酬</h4>
                        {sessionSummary.castEarnings
                            .filter((cast) => currentUserId ? cast.castId === currentUserId : true)
                            .map((cast) => (
                            <div key={cast.castId} className="flex items-center justify-between bg-green-700 rounded-lg p-2">
                                <div className="flex items-center space-x-2">
                                    <img
                                        src={getFirstAvatarUrl(cast.avatar)}
                                        alt={cast.nickname}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div>
                                        <div className="text-white font-medium text-sm">{cast.nickname}</div>
                                        <div className="text-green-200 text-xs">{cast.category}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-yellow-300">
                                        {cast.points.toLocaleString()}P
                                    </div>
                                    <div className="text-green-200 text-xs">獲得</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionTimer;





