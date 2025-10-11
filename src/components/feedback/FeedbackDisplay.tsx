import React from 'react';
import { Star } from 'lucide-react';

interface Feedback {
  id: number;
  comment?: string;
  rating?: number;
  badge?: {
    id: number;
    name: string;
    icon: string;
    description: string;
  };
  guest?: {
    id: number;
    nickname: string;
    avatar?: string;
  };
  created_at: string;
}

interface FeedbackDisplayProps {
  feedback: Feedback;
  showGuestInfo?: boolean;
  compact?: boolean;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  feedback,
  showGuestInfo = true,
  compact = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${compact ? 'mb-2' : 'mb-4'}`}>
      {/* Guest Info */}
      {showGuestInfo && feedback.guest && (
        <div className="flex items-center mb-3">
          <img 
            src={feedback.guest.avatar || '/assets/avatar/default.png'} 
            alt={feedback.guest.nickname}
            className="w-8 h-8 rounded-full object-cover mr-3"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-800">{feedback.guest.nickname}</div>
            <div className="text-xs text-gray-500">{formatDate(feedback.created_at)}</div>
          </div>
        </div>
      )}

      {/* Rating */}
      {feedback.rating && (
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                size={16}
                className={`${
                  star <= feedback.rating! 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">{feedback.rating}/5</span>
        </div>
      )}

      {/* Badge */}
      {feedback.badge && (
        <div className="mb-3">
          <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-200 rounded-full px-3 py-1">
            <span className="text-lg">{feedback.badge.icon}</span>
            <span className="text-sm font-medium text-pink-700">{feedback.badge.name}</span>
          </div>
        </div>
      )}

      {/* Comment */}
      {feedback.comment && (
        <div className="text-gray-700 leading-relaxed">
          {feedback.comment}
        </div>
      )}

      {/* Date only if not showing guest info */}
      {!showGuestInfo && (
        <div className="text-xs text-gray-500 mt-2">
          {formatDate(feedback.created_at)}
        </div>
      )}
    </div>
  );
};

export default FeedbackDisplay; 