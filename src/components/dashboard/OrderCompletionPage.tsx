import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, MessageCircle, Calendar, MapPin, User, X } from 'lucide-react';

interface OrderCompletionPageProps {
  onViewChat: () => void;
  onBackToHome: () => void;
  reservationId: number;
  selectedCast: {
    id: number;
    nickname: string;
    avatar?: string | string[];
    grade_points?: number;
  };
  meetingArea: string;
  scheduledTime: string;
  duration: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Add Reservation Completion Modal Component
function ReservationCompletionModal({ isOpen, onClose, onNavigateToMessage }: {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMessage: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-primary to-blue-900 border border-white/20 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-red-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">予約完了</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-400 animate-bounce" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <h4 className="text-white font-bold text-lg mb-3">予約完了しました</h4>
            <p className="text-white/80 text-base leading-relaxed">
              メッセージ画面に移動してマッチングまで少々お待ちください。
            </p>
          </div>

          {/* Action Buttons */}
          {/* <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-200 font-semibold"
            >
              閉じる
            </button>
            <button
              onClick={() => {
                onNavigateToMessage();
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-secondary to-red-500 text-white py-3 rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-200 font-semibold shadow-lg"
            >
              メッセージ画面へ
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}

const OrderCompletionPage: React.FC<OrderCompletionPageProps> = ({
  onViewChat,
  onBackToHome,
  reservationId,
  selectedCast,
  meetingArea,
  scheduledTime,
  duration
}) => {
  const navigate = useNavigate();
  const [showChatTooltip, setShowChatTooltip] = useState(false);
  const [showHomeTooltip, setShowHomeTooltip] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);

  const handleNavigateToMessage = () => {
    // Navigate to message screen and close modal
    navigate('/messages');
    setShowReservationModal(false);
  };

  // Show reservation completion modal when component mounts
  useEffect(() => {
    setShowReservationModal(true);
  }, []);

  const computeHours = (durationLabel: string): number => {
    if (!durationLabel) return 1;
    if (durationLabel.includes('以上')) return 4;
    const parsed = parseInt(durationLabel.replace('時間', ''));
    return Number.isNaN(parsed) ? 1 : parsed;
  };

  const hours = computeHours(duration);
  const gradePoints = selectedCast.grade_points || 0;
  const computedPoints = (gradePoints * hours * 60) / 30;

  // Night-time fee handling (12AM-6AM)
  const extractHourFromTimeString = (timeString: string): number | null => {
    if (!timeString) return null;
    const date = new Date(timeString);
    if (!Number.isNaN(date.getTime())) {
      return date.getHours();
    }
    // Try 24h format HH:mm
    const match24h = timeString.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/);
    if (match24h) {
      return parseInt(match24h[1], 10);
    }
    // Try 12h with AM/PM
    const match12h = timeString.match(/\b(1[0-2]|0?\d)\s*(AM|PM)\b/i);
    if (match12h) {
      let hour = parseInt(match12h[1], 10) % 12;
      const isPm = /PM/i.test(match12h[2]);
      if (isPm) hour += 12;
      return hour;
    }
    // Try Japanese format with 午前/午後 and 時
    const jpMeridiem = timeString.match(/(午前|午後)\s*(\d{1,2})\s*時/);
    if (jpMeridiem) {
      let hour = parseInt(jpMeridiem[2], 10) % 12;
      const isGogo = jpMeridiem[1] === '午後';
      if (isGogo) hour += 12;
      return hour;
    }
    // Try Japanese format without meridiem: e.g., 2時, 14時
    const jpHourOnly = timeString.match(/\b(\d{1,2})\s*時/);
    if (jpHourOnly) {
      const hour = parseInt(jpHourOnly[1], 10);
      if (hour >= 0 && hour <= 23) return hour;
    }
    return null;
  };

  const isNightTime = (() => {
    const hour = extractHourFromTimeString(scheduledTime);
    if (hour === null) return false;
    return hour >= 0 && hour < 6;
  })();

  const NIGHT_FEE_PER_HOUR = 4000; // P per hour
  const nightFee = isNightTime ? NIGHT_FEE_PER_HOUR * hours : 0;
  const totalPoints = computedPoints + nightFee;

  // Stepper steps
  const steps = [
    { label: '待ち合わせ', done: true },
    { label: '開始', done: false },
    { label: '終了', done: false },
    { label: 'フィードバック', done: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-secondary flex flex-col pt-16">
      {/* Header */}
      <div className="fixed top-0 max-w-md mx-auto w-full z-50 bg-primary px-4 py-3 border-b border-white/10 shadow-md">
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

             {/* Reservation Completion Modal */}
       <ReservationCompletionModal
         isOpen={showReservationModal}
         onClose={() => setShowReservationModal(false)}
         onNavigateToMessage={handleNavigateToMessage}
       />
    </div>
  );
};

export default OrderCompletionPage; 