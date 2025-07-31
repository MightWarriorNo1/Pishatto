import React, { useState, useEffect } from 'react';
import { submitFeedback, fetchAllBadges } from '../../services/api';
import Toast from '../ui/Toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: number;
  castId: number;
  guestId: number;
  onSuccess?: () => void;
}

interface Badge {
  id: number;
  name: string;
  icon: string;
  description: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  reservationId,
  castId,
  guestId,
  onSuccess
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllBadges().then(setBadges);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!feedbackText.trim() && !feedbackRating && !selectedBadgeId) {
      setToast({ message: 'フィードバックの内容を入力してください', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({
        reservation_id: reservationId,
        cast_id: castId,
        guest_id: guestId,
        comment: feedbackText.trim() || undefined,
        rating: feedbackRating || undefined,
        badge_id: selectedBadgeId || undefined,
      });
      
      setToast({ message: 'フィードバックを送信しました。ありがとうございました！', type: 'success' });
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (e: any) {
      setToast({ message: e?.response?.data?.message || 'フィードバック送信に失敗しました', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFeedbackText('');
      setFeedbackRating(null);
      setSelectedBadgeId(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-200 min-w-[420px] max-w-[420px] max-h-[90vh] overflow-y-auto">
          <h2 className="font-bold text-xl mb-6 text-gray-800">フィードバックを送信</h2>
          
          {/* Comment Section */}
          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              コメント (任意)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 resize-none"
              rows={4}
              placeholder="キャストへの感想やフィードバックを入力してください"
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Rating Section */}
          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              評価 (任意)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  className={`w-10 h-10 rounded-full border-2 transition-colors ${
                    feedbackRating === rating 
                      ? 'bg-yellow-400 border-yellow-500 text-white' 
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setFeedbackRating(feedbackRating === rating ? null : rating)}
                  disabled={isSubmitting}
                  type="button"
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          {/* Badge Section */}
          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              バッジを選択 (任意)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {badges.map(badge => (
                <button
                  key={badge.id}
                  className={`p-3 rounded-lg border-2 transition-colors text-left ${
                    selectedBadgeId === badge.id 
                      ? 'bg-pink-100 border-pink-500 text-pink-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedBadgeId(selectedBadgeId === badge.id ? null : badge.id)}
                  disabled={isSubmitting}
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{badge.icon}</span>
                    <span className="text-sm font-medium">{badge.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{badge.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 w-full">
            <button 
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors hover:bg-gray-400"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button 
              className="flex-1 bg-pink-500 text-white px-4 py-3 rounded-lg font-medium transition-colors hover:bg-pink-600 disabled:opacity-50"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '送信中...' : '送信'}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <Toast 
          show 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
};

export default FeedbackModal; 