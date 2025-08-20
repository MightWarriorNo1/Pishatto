import React from 'react';
import { Play, Square, Clock } from 'lucide-react';

interface SessionTimerProps {
    isActive: boolean;
    elapsedTime: number;
    onMeet?: () => void;
    onDissolve?: () => void;
    isLoading?: boolean;
    className?: string;
}

const SessionTimer: React.FC<SessionTimerProps> = ({
    isActive,
    elapsedTime,
    onMeet,
    onDissolve,
    isLoading = false,
    className = ''
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
        <div className={`bg-secondary rounded-lg p-4 text-white ${className}`}>
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
                    )}
                </div>
            )}
        </div>
    );
};

export default SessionTimer;





