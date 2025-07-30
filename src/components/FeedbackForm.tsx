import React, { useState } from 'react';

interface FeedbackFormProps {
  reservationId: number;
  castId: number;
  guestId: number;
  onSubmit: (feedback: FeedbackData) => void;
  onCancel: () => void;
}

interface FeedbackData {
  reservation_id: number;
  cast_id: number;
  guest_id: number;
  comment?: string;
  rating?: number;
  badge_id?: number;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  image_url?: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  reservationId,
  castId,
  guestId,
  onSubmit,
  onCancel
}) => {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [selectedBadge, setSelectedBadge] = useState<number | undefined>(undefined);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock badges - in real implementation, fetch from API
  const mockBadges: Badge[] = [
    { id: 1, name: 'Excellent Service', description: 'For outstanding service' },
    { id: 2, name: 'Great Communication', description: 'For excellent communication skills' },
    { id: 3, name: 'Professional', description: 'For professional behavior' },
    { id: 4, name: 'Friendly', description: 'For being very friendly and approachable' },
    { id: 5, name: 'Punctual', description: 'For being on time and reliable' },
  ];

  React.useEffect(() => {
    setBadges(mockBadges);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      alert('Please provide a rating');
      return;
    }

    setIsLoading(true);

    const feedbackData: FeedbackData = {
      reservation_id: reservationId,
      cast_id: castId,
      guest_id: guestId,
      comment: comment.trim() || undefined,
      rating,
      badge_id: selectedBadge,
    };

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        const result = await response.json();
        onSubmit(feedbackData);
        alert('Feedback submitted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to submit feedback'}`);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Rate Your Experience
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                  rating && rating >= star
                    ? 'bg-yellow-400 border-yellow-400 text-white'
                    : 'bg-white border-gray-300 text-gray-400 hover:border-yellow-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {rating && (
              <span>
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </span>
            )}
          </div>
        </div>

        {/* Comment Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Share your experience with this cast member..."
            maxLength={1000}
          />
          <div className="text-xs text-gray-500 mt-1">
            {comment.length}/1000 characters
          </div>
        </div>

        {/* Badge Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Give a Badge (Optional)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {badges.map((badge) => (
              <button
                key={badge.id}
                type="button"
                onClick={() => setSelectedBadge(selectedBadge === badge.id ? undefined : badge.id)}
                className={`p-3 text-left rounded-lg border-2 transition-colors ${
                  selectedBadge === badge.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">{badge.name}</div>
                <div className="text-xs text-gray-600">{badge.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!rating || isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm; 