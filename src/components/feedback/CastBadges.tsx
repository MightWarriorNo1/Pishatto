import React from 'react';

interface Badge {
  id: number;
  name: string;
  icon: string;
  description: string;
  pivot?: {
    created_at: string;
  };
}

interface CastBadgesProps {
  badges: Badge[];
  showCount?: boolean;
  compact?: boolean;
}

const CastBadges: React.FC<CastBadgesProps> = ({
  badges,
  showCount = true,
  compact = false
}) => {
  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <div className={`${compact ? 'mb-2' : 'mb-4'}`}>
      {showCount && (
        <div className="text-sm font-medium text-gray-700 mb-2">
          獲得バッジ ({badges.length})
        </div>
      )}
      <div className={`flex flex-wrap gap-2 ${compact ? '' : 'mb-2'}`}>
        {badges.map(badge => (
          <div
            key={badge.id}
            className={`inline-flex items-center gap-1 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-full px-3 py-1 ${
              compact ? 'text-xs' : 'text-sm'
            }`}
            title={badge.description}
          >
            <span className="text-base">{badge.icon}</span>
            <span className="font-medium text-pink-700">{badge.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CastBadges; 