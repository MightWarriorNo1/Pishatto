import React from 'react';
import { CheckCircle, ExternalLink, AlertCircle, Info } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  timestamp,
  onClose,
  showCloseButton = true
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  // Function to render message with clickable URLs
  const renderMessage = (msg: string) => {
    // Split message by newlines and process each line
    const lines = msg.split('\n');
    
    return lines.map((line, index) => {
      // Check if line contains a URL
      if (line.includes('URL：')) {
        const parts = line.split('URL：');
        const url = parts[1]?.trim();
        
        if (url) {
          return (
            <div key={index} className="mb-2">
              <span className="text-gray-700">{parts[0]}</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
              >
                {url}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          );
        }
      }
      
      // Regular line without URL
      return (
        <div key={index} className="mb-2 text-gray-700">
          {line}
        </div>
      );
    });
  };

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${getBgColor()} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${getTextColor()} mb-2`}>
                {title}
              </h3>
              
              <div className="text-sm leading-relaxed">
                {renderMessage(message)}
              </div>
              
              {timestamp && (
                <div className="text-xs text-gray-500 mt-3">
                  {timestamp}
                </div>
              )}
            </div>
            
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Close notification"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
