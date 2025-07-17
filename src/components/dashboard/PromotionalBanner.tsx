import React from 'react';

const PromotionalBanner: React.FC = () => {
  return (
    <div className="bg-red-600 text-white text-sm py-2 px-4 mb-4 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <span>初回利用限定定 10%オフ割引</span>
        <span>2025/1まで</span>
      </div>
    </div>
  );
};

export default PromotionalBanner; 