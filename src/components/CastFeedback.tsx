import React, { useState, useEffect } from 'react';

interface Feedback {
  id: number;
  reservation_id: number;
  cast_id: number;
  guest_id: number;
  comment?: string;
  rating?: number;
  badge_id?: number;
  created_at: string;
  guest?: {
    id: number;
    nickname: string;
    avatar?: string;
  };
  badge?: {
    id: number;
    name: string;
    description: string;
  };
}

interface CastFeedbackProps {
  castId: number;
}

const CastFeedback: React.FC<CastFeedbackProps> = ({ castId }) => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, [castId]);

  const fetchFeedback = async () => {
    try {
      const response = await fetch(`/api/feedback/cast/${castId}`);
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
      } else {
        setError('Failed to load feedback');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('Failed to load feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/feedback/cast/${castId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stats Section */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Feedback Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total_feedback}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.average_rating}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.feedback_with_comments}</div>
              <div className="text-sm text-gray-600">With Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.feedback_with_badges}</div>
              <div className="text-sm text-gray-600">With Badges</div>
            </div>
          </div>
          
          {/* Rating Distribution */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Rating Distribution</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <div className="w-8 text-sm">{rating}★</div>
                  <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${(stats.rating_distribution[rating] / stats.total_feedback) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm text-gray-600">
                    {stats.rating_distribution[rating]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feedback List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recent Feedback</h3>
        
        {feedback.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No feedback available yet.
          </div>
        ) : (
          feedback.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {item.guest?.avatar ? (
                      <img
                        src={item.guest.avatar}
                        alt={item.guest.nickname}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {item.guest?.nickname?.charAt(0) || 'G'}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.guest?.nickname || 'Anonymous Guest'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                </div>
                
                {item.rating && (
                  <div className="flex items-center space-x-2">
                    {renderStars(item.rating)}
                    <span className="text-sm text-gray-600">({item.rating}/5)</span>
                  </div>
                )}
              </div>

              {item.comment && (
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">{item.comment}</p>
                </div>
              )}

              {item.badge && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Awarded badge:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.badge.name}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CastFeedback; 