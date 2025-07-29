import React from 'react';

interface ToastProps {
  show?: boolean;
  isVisible?: boolean;
  message: string;
  type: 'success' | 'error';
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ show, isVisible, message, type, onClose }) => {
  const visible = show || isVisible;
  if (!visible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const iconColor = type === 'success' ? 'text-green-100' : 'text-red-100';

  return (
    <div className={`fixed top-20  transform -translate-x-1/2 z-50 max-w-md w-full mx-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-0`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 ${iconColor} hover:text-white transition-colors`}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast; 