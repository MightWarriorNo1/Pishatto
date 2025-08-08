import React, { useState } from 'react';
import { CheckCircle, MessageCircle, Calendar, MapPin, User } from 'lucide-react';

interface OrderCompletionPageProps {
  onViewChat: () => void;
  onBackToHome: () => void;
  reservationId: number;
  selectedCast: {
    id: number;
    nickname: string;
    avatar?: string | string[];
  };
  meetingArea: string;
  scheduledTime: string;
  duration: string;
  totalPoints: number;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const OrderCompletionPage: React.FC<OrderCompletionPageProps> = ({
  onViewChat,
  onBackToHome,
  reservationId,
  selectedCast,
  meetingArea,
  scheduledTime,
  duration,
  totalPoints
}) => {
  const [showChatTooltip, setShowChatTooltip] = useState(false);
  const [showHomeTooltip, setShowHomeTooltip] = useState(false);

  // Stepper steps
  const steps = [
    { label: '待ち合わせ', done: true },
    { label: '開始', done: false },
    { label: '終了', done: false },
    { label: 'フィードバック', done: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-secondary flex flex-col">
      {/* Header */}
      <div className="bg-primary px-4 py-3 border-b border-white/10 shadow-md">
        <div className="flex items-center justify-between">
          <div></div>
          <h1 className="text-lg font-bold text-white tracking-wide">注文完了</h1>
          <div></div>
        </div>
      </div>

      {/* Success Message */}
      <div className="px-4 py-8 text-center flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-400 animate-bounce drop-shadow-lg" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">注文が完了しました！</h2>
        <p className="text-white/80 mb-6 text-base">
          予約番号: <span className="font-semibold text-white">{reservationId}</span>
        </p>
      </div>

      {/* Stepper */}
      <div className="flex justify-center mb-4">
        <div className="flex items-center space-x-2">
          {steps.map((step, idx) => (
            <div key={step.label} className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step.done ? 'bg-green-400 border-green-400 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>{idx + 1}</div>
              {idx < steps.length - 1 && <div className="w-8 h-1 bg-gradient-to-r from-green-400 to-gray-300 mx-1 rounded" />}
            </div>
          ))}
        </div>
      </div>

      {/* Reservation Details */}
      <div className="px-4 py-6">
        <div className="bg-white/10 rounded-lg border border-gradient-to-r from-primary to-secondary p-4 shadow-lg relative overflow-hidden" style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}>
          <div className="absolute inset-0 pointer-events-none rounded-lg border-2 border-gradient-to-r from-primary to-secondary opacity-30" />
          <div className="flex items-start space-x-4 relative z-10">
            {/* Cast Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-primary flex-shrink-0 flex items-center justify-center">
              {selectedCast.avatar && ((Array.isArray(selectedCast.avatar) && selectedCast.avatar.length > 0) || typeof selectedCast.avatar === 'string') ? (
                <img
                  src={`${API_BASE_URL}/${Array.isArray(selectedCast.avatar) && selectedCast.avatar.length > 0 ? selectedCast.avatar[0] : (typeof selectedCast.avatar === 'string' ? selectedCast.avatar : '')}`}
                  alt={selectedCast.nickname}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <User className="w-10 h-10 text-white/60" />
              )}
            </div>
            {/* Cast Details */}
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-lg font-bold text-white">{selectedCast.nickname}さん</span>
                <span className="ml-2 text-secondary">🦋</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-white mr-2" />
                  <span className="text-white">{meetingArea}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-white mr-2" />
                  <span className="text-white">{scheduledTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">設定時間</span>
                  <span className="font-medium text-white">{duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">使用ポイント</span>
                  <span className="font-bold text-white">{totalPoints.toLocaleString()}P</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-6 space-y-4">
        <div className="relative">
          <button
            onClick={() => { onViewChat(); setShowChatTooltip(true); setTimeout(() => setShowChatTooltip(false), 1200); }}
            className="w-full bg-white text-primary py-4 rounded-lg font-bold text-lg hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            メッセージを送る
          </button>
          {showChatTooltip && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-primary text-white text-xs rounded px-3 py-1 shadow-lg animate-fade-in z-20">
              チャット画面に移動します
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => { onBackToHome(); setShowHomeTooltip(true); setTimeout(() => setShowHomeTooltip(false), 1200); }}
            className="w-full bg-white/10 text-white py-4 rounded-lg font-bold text-lg hover:bg-white/20 active:scale-95 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            ホームに戻る
          </button>
          {showHomeTooltip && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-secondary text-white text-xs rounded px-3 py-1 shadow-lg animate-fade-in z-20">
              ホームに戻ります
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="px-4 py-24">
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-white font-bold mb-2">ご利用の流れ</h3>
          <div className="space-y-2 text-sm text-white/80">
            <p>1. 合流場所でキャストと待ち合わせ</p>
            <p>2. 合流後、アプリで「開始」ボタンを押下</p>
            <p>3. 終了時、アプリで「終了」ボタンを押下</p>
            <p>4. フィードバックを送信して完了</p>
          </div>
        </div>
      </div>
      <style>{`
        .animate-bounce {
          animation: bounce 1.2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OrderCompletionPage; 