import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  text, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-orange-500 ${sizeClasses[size]}`}></div>
      {text && (
        <div className="mt-3 text-center text-sm text-gray-600">
          {text}
        </div>
      )}
    </div>
  );
};

export default Spinner; 