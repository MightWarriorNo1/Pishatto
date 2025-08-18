/*eslint-disable */
import React, { useState } from 'react';
import {  MapPin, Clock, User, CreditCard, CheckCircle, X } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { createReservation, createChat } from '../../services/api';

interface Cast {
  id: number;
  nickname: string;
  avatar?: string;
  category?: string;
  grade_points?: number;
}

interface OrderConfirmationPageProps {
  onBack: () => void;
  onConfirm: (reservationId: number, chatId: number, confirmedTime?: string, updatedDuration?: string) => void;
  selectedCast: Cast;
  meetingArea: string;
  scheduledTime: string;
  duration: string;
}

// Time selection modal component
function TimeSelectionModal({ isOpen, onClose, onConfirm, currentTime, currentDuration }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (time: string) => void;
  currentTime: string;
  currentDuration: string;
}) {
  const [selectedTime, setSelectedTime] = useState(currentTime);
  const [customHours, setCustomHours] = useState(1);

  const timeOptions = [
    { label: '1時間', value: '1時間後' },
    { label: '2時間', value: '2時間後' },
    { label: '3時間', value: '3時間後' },
    { label: '4時間', value: '4時間後' },
    { label: '5時間', value: '5時間後' },
    { label: 'カスタム', value: 'custom' }
  ];

  const handleConfirm = () => {
    const finalTime = selectedTime === 'custom' ? `${customHours}時間後` : selectedTime;
    onConfirm(finalTime);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-primary to-blue-900 border border-white/20 rounded-3xl p-8 w-96 max-w-[90%] shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-b from-secondary to-red-500 rounded-full flex items-center justify-center">
              <Clock className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">設定時間を変更</h3>
              <p className="text-white/70 text-sm">希望の設定時間を選択してください</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-white mb-4 font-semibold">設定時間</label>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {timeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedTime(option.value)}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  selectedTime === option.value 
                    ? 'bg-gradient-to-r from-secondary to-red-500 text-white border-secondary shadow-lg' 
                    : 'bg-white/10 text-white border-white/20 hover:border-white/40 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{option.label}</span>
                  {selectedTime === option.value && (
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <span className="text-secondary text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {selectedTime === 'custom' && (
            <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
              <label className="block text-white mb-2 font-semibold">カスタム時間</label>
              <div className="flex items-center gap-3">
                <select
                  className="flex-1 border border-white/20 rounded-lg px-4 py-3 bg-white/10 text-primary focus:outline-none focus:border-secondary"
                  value={customHours}
                  onChange={(e) => setCustomHours(Number(e.target.value))}
                >
                  {Array.from({ length: 8 }, (_, i) => i + 1).map(hour => (
                    <option key={hour} value={hour}>{hour}時間</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 border border-white/20 text-white rounded-2xl hover:bg-white/10 transition-all duration-200 font-semibold"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-secondary to-red-500 text-white py-4 rounded-2xl hover:from-red-500 hover:to-red-600 transition-all duration-200 font-semibold shadow-lg"
          >
            確定
          </button>
        </div>
      </div>
    </div>
  );
}

const getAllAvatarUrls = (avatarString: string | null | undefined): string[] => {
    if (!avatarString) {
        return ['/assets/avatar/female.png'];
    }
    
    // Split by comma and get all non-empty avatars
    const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
    
    if (avatars.length === 0) {
        return ['/assets/avatar/female.png'];
    }
    
    return avatars.map(avatar => `${API_BASE_URL}/${avatar}`);
};

const API_BASE_URL=process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  onBack,
  onConfirm,
  selectedCast,
  meetingArea,
  scheduledTime,
  duration
}) => {
  const { user, refreshUser } = useUser();
  const [meetingLocation, setMeetingLocation] = useState('');
  const [reservationName, setReservationName] = useState('');
  const [isAreaConfirmed, setIsAreaConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [confirmedTime, setConfirmedTime] = useState(scheduledTime);
  const [updatedDuration, setUpdatedDuration] = useState(duration);

  const computeHours = (durationLabel: string): number => {
    if (!durationLabel) return 1;
    if (durationLabel.includes('以上')) {
      return 4;
    }
    const parsed = parseInt(durationLabel.replace('時間', ''));
    return Number.isNaN(parsed) ? 1 : parsed;
  };

  const hours = computeHours(updatedDuration);
  const gradePoints = selectedCast.grade_points || 0;

  // Helper to compute scheduled Date from the current confirmedTime value
  const getScheduledDateFromConfirmedTime = (timeLabel: string): Date => {
    const now = new Date();
    return new Date(now.getTime() + 30 * 60 * 1000);
  };

  // Night fee: 4000 points per hour if scheduled start time is between 0:00 and 4:59
  const NIGHT_FEE_PER_HOUR = 4000;
  const isNightHour = (date: Date): boolean => {
    const h = date.getHours();
    return h >= 0 && h < 5;
  };

  const computeTotalPoints = (gp: number, hrs: number, timeLabel: string): number => {
    const base = gp * hrs * 60 / 30; // points per 30min
    const scheduled = getScheduledDateFromConfirmedTime(timeLabel);
    const nightFee = isNightHour(scheduled) ? NIGHT_FEE_PER_HOUR * hrs : 0;
    return base + nightFee;
  };

  const computedPoints = computeTotalPoints(gradePoints, hours, confirmedTime);

  const handleConfirm = async () => {
    if (!isAreaConfirmed) {
      setErrorMessage('合流エリアの確認をお願いします。');
      return;
    }

    if (!user) {
      setErrorMessage('ユーザー情報が見つかりません。');
      return;
    }

    // Check if user has sufficient points
    if (!user.points || user.points < computedPoints) {
      setErrorMessage(`ポイントが不足しています。必要ポイント: ${computedPoints.toLocaleString()}P、現在のポイント: ${(user.points || 0).toLocaleString()}P`);
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Format date as MySQL DATETIME string
      const pad = (n: number) => n.toString().padStart(2, '0');
      const toMysqlDatetime = (date: Date) =>
          `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
      
      // Calculate scheduled time based on confirmed time
      const scheduledDate = getScheduledDateFromConfirmedTime(confirmedTime);
      
      
      // Recompute points including night fee at confirmation time
      const finalComputedPoints = computeTotalPoints(gradePoints, hours, confirmedTime);

      // Create reservation
      const reservationData = {
        guest_id: user.id,
        cast_id: selectedCast.id,
        type: 'pishatto' as const,
        scheduled_at: scheduledDate.toISOString(),
        location: meetingArea,
        meeting_location: meetingLocation,
        reservation_name: reservationName,
        duration: hours,
        points: finalComputedPoints,
        details: `予約名: ${reservationName}, キャスト: ${selectedCast.nickname}, 合流エリア: ${meetingArea}, 設定時間: ${updatedDuration}, 使用ポイント: ${finalComputedPoints}P, 合流時間: ${scheduledDate.toLocaleString()}`,
      };

      const reservation = await createReservation(reservationData);
      const reservationId = reservation.reservation.id;

      // Create chat between user and cast
      const chat = await createChat(selectedCast.id, user.id, reservationId);
      const chatId = chat.id;

      // Deduct points from user
      // await deductPoints(user.id, finalComputedPoints);

      // Create pending point transaction
      // await createPointTransaction({
      //   user_type: 'guest',
      //   user_id: user.id,
      //   amount: -finalComputedPoints,
      //   type: 'pending',
      //   reservation_id: reservationId,
      //   description: `${selectedCast.nickname}さんとの予約 - ${meetingArea}`
      // });

      // Refresh user data to get updated point balance
      await refreshUser();

      onConfirm(reservationId, chatId, confirmedTime, updatedDuration);
    } catch (error) {
      console.error('Order confirmation error:', error);
      setErrorMessage('注文の処理中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setConfirmedTime(newTime);
    
    // Convert the selected time to duration format
    let durationValue: string;
    if (newTime.includes('時間後')) {
      const hours = parseInt(newTime.replace('時間後', ''));
      durationValue = `${hours}時間`;
    } else if (newTime.includes('分後')) {
      const minutes = parseInt(newTime.replace('分後', ''));
      const hours = Math.ceil(minutes / 60);
      durationValue = `${hours}時間`;
    } else {
      // Default to 1 hour if format is not recognized
      durationValue = '1時間';
    }
    
    setUpdatedDuration(durationValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-secondary">
      {/* Fixed Header */}
      <div className="fixed top-0 max-w-md mx-auto w-full z-50 bg-primary px-4 py-3 border-b border-white/10 shadow-lg shadow-primary/30 bg-gradient-to-r from-primary via-blue-900 to-secondary">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="text-white text-xl font-bold hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            aria-label="戻る"
          >
            ✕
          </button>
          <h1 className="text-lg font-bold text-white tracking-wide drop-shadow">注文内容</h1>
          <div></div>
        </div>
        <h2 className="text-2xl font-bold text-white mt-2 pt-4 tracking-tight">注文内容</h2>
      </div>

      {/* Spacer to prevent content from being hidden behind fixed header */}
      <div className="h-24"></div>

      {/* Matched Cast Information */}
      <div className="px-4 py-6">
        <h3 className="text-lg font-bold text-white mb-4">マッチングしたキャスト</h3>
        
        <div className="bg-white/10 rounded-lg border border-white/10 p-4 shadow-md shadow-primary/20 hover:shadow-lg transition-shadow">
          <div className="flex items-start space-x-4">
            {/* Cast Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-primary flex-shrink-0 border-4 border-secondary ring-2 ring-white/40 transition-transform hover:scale-105">
              <img 
                src={getAllAvatarUrls(selectedCast.avatar)[0]} 
                alt={selectedCast.nickname}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Cast Details */}
            <div className="flex-1">
              <div className="flex items-center mb-2 space-x-2">
                <span className="text-lg font-bold text-white drop-shadow">{selectedCast.nickname}さん</span>
                {selectedCast.category && (
                  <span className="bg-secondary/80 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow">{selectedCast.category}</span>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-white flex items-center gap-1"><MapPin size={16} />合流エリア</span>
                  <span className="font-medium text-white">{meetingArea}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white flex items-center gap-1"><Clock size={16} />合流予定時間</span>
                  <span className="font-medium text-white">{30}分後</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white flex items-center gap-1"><User size={16} />設定時間</span>
                  {/* <span className="font-medium text-white">{duration}</span> */}
                  <button 
                    onClick={() => setShowTimeModal(true)}
                    className="font-medium text-white hover:text-secondary transition-colors flex items-center gap-1 group"
                  >
                    <span>{updatedDuration}</span>
                    <Clock size={14} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white flex items-center gap-1"><CreditCard size={16} />合計ポイント</span>
                  <span className="font-bold text-white text-lg">{computedPoints.toLocaleString()}P</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Location Section */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><MapPin size={20} />合流場所</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="店名または位置情報のURLを入力してください"
            value={meetingLocation}
            onChange={(e) => setMeetingLocation(e.target.value)}
            className="w-full px-4 py-3 border border-white/20 rounded-lg text-black placeholder-white/70 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all pr-10 shadow"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none">
            <MapPin size={18} />
          </span>
        </div>
        <p className="text-xs text-white mt-2 leading-relaxed">
          ※鍵付きの個室やレンタルスペース・マンションやホテル等の個室利用、または「合流場所」が「合流エリア」と異なる場合、キャストと合流できず100%有償でのキャンセルとなります。
        </p>
      </div>

      {/* Reservation Name Section */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><User size={20} />予約名</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="予約名を入力してください"
            value={reservationName}
            onChange={(e) => setReservationName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all pr-10 shadow"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none">
            <User size={18} />
          </span>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="px-4 py-4">
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={isAreaConfirmed}
            onChange={(e) => setIsAreaConfirmed(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 accent-secondary transition-all group-hover:scale-110"
          />
          <span className="text-white font-semibold text-base group-hover:underline">
            合流エリアは「{meetingArea}」でお間違いないですか?
          </span>
        </label>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="px-4 py-2 animate-shake">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-red-400 animate-pulse" />
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Final Confirmation Button */}
      <div className="px-4 pb-32">
        <button
          onClick={handleConfirm}
          disabled={isProcessing || !isAreaConfirmed}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg shadow-secondary/20 flex items-center justify-center gap-2
            ${isProcessing || !isAreaConfirmed
              ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
              : 'bg-white/10 text-white hover:bg-secondary/80 hover:scale-[1.02] cursor-pointer'}
          `}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2"><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>処理中...</span>
          ) : (
            <span>注文の最終確認</span>
          )}
        </button>
      </div>

      {/* Time Selection Modal */}
      <TimeSelectionModal
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        onConfirm={handleTimeChange}
        currentTime={confirmedTime}
        currentDuration={updatedDuration}
      />
    </div>
  );
};

export default OrderConfirmationPage; 