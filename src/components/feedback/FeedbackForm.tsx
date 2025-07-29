import React, { useState } from 'react';
import { Star, ChevronLeft } from 'lucide-react';
import { completeReservation, fetchAllBadges } from '../../services/api';

interface FeedbackFormProps {
  reservationId: number;
  onBack: () => void;
  onSuccess: () => void;
}

interface Badge {
  id: number;
  name: string;
  icon: string;
  description: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ reservationId, onBack, onSuccess }) => {
  const [rating, setRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchBadges = async () => {
      try {
        const badgesData = await fetchAllBadges();
        setBadges(badgesData);
      } catch (err) {
        console.error('Failed to fetch badges:', err);
      }
    };
    fetchBadges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('評価を選択してください');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await completeReservation(reservationId, {
        feedback_text: feedbackText,
        feedback_rating: rating,
        feedback_badge_id: selectedBadgeId || undefined
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'フィードバックの送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-primary pb-24">
      {/* Top bar */}
      <div className="flex items-center px-4 pt-4 pb-2 border-b border-secondary bg-primary">
        <button className="mr-2 text-2xl text-white" onClick={onBack}>
          <ChevronLeft />
        </button>
        <span className="flex-1 text-center text-base font-bold text-white">フィードバック</span>
      </div>

      {/* Main content */}
      <div className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-white font-bold mb-3">評価</label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl ${rating >= star ? 'text-yellow-400' : 'text-gray-400'}`}
                >
                  <Star className="w-8 h-8" fill={rating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <div className="text-center text-white text-sm mt-2">
              {rating === 1 && 'とても悪い'}
              {rating === 2 && '悪い'}
              {rating === 3 && '普通'}
              {rating === 4 && '良い'}
              {rating === 5 && 'とても良い'}
            </div>
          </div>

          {/* Feedback text */}
          <div>
            <label className="block text-white font-bold mb-3">コメント（任意）</label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-secondary rounded-lg bg-primary text-white resize-none focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="ご感想をお聞かせください..."
              maxLength={1000}
            />
            <div className="text-right text-white text-xs mt-1">
              {feedbackText.length}/1000
            </div>
          </div>

          {/* Badge selection */}
          {badges.length > 0 && (
            <div>
              <label className="block text-white font-bold mb-3">バッジを贈る（任意）</label>
              <div className="grid grid-cols-3 gap-2">
                {badges.map((badge) => (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => setSelectedBadgeId(selectedBadgeId === badge.id ? null : badge.id)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      selectedBadgeId === badge.id
                        ? 'border-secondary bg-secondary text-white'
                        : 'border-gray-600 bg-primary text-white hover:border-secondary'
                    }`}
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="text-xs">{badge.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="text-red-400 text-center text-sm">{error}</div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className={`w-full py-3 rounded-lg font-bold text-lg transition ${
              submitting || rating === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-secondary text-white hover:bg-red-700'
            }`}
          >
            {submitting ? '送信中...' : 'フィードバックを送信'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm; 