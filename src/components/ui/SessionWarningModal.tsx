import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, LogOut } from 'lucide-react';
import { SESSION_CONFIG } from '../../config/session';

interface SessionWarningModalProps {
  isOpen: boolean;
  remainingMinutes: number;
  onExtend: () => void;
  onLogout: () => Promise<void>;
  onClose: () => void;
}

const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  isOpen,
  remainingMinutes,
  onExtend,
  onLogout,
  onClose
}) => {
  const [countdown, setCountdown] = useState(remainingMinutes);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout().catch(error => {
            console.error('Error during auto logout:', error);
          }); // Auto logout when countdown reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isOpen, onLogout]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">セッションタイムアウト</h3>
            <p className="text-sm text-gray-600">セッションがまもなく終了します</p>
          </div>
        </div>

        {/* Warning Message */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm text-gray-600">
              残り時間: <span className="font-semibold text-yellow-600">{countdown}分</span>
            </span>
          </div>
          <p className="text-gray-700 text-center">
            セキュリティのため、{SESSION_CONFIG.TIMEOUT_MINUTES}分間操作がないとセッションが終了します。
            <br />
            セッションを継続するか、ログアウトしてください。
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: `${(countdown / SESSION_CONFIG.TIMEOUT_MINUTES) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onExtend}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            セッション継続
          </button>
          <button
            onClick={() => onLogout().catch(error => {
              console.error('Error during manual logout:', error);
            })}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            ログアウト
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default SessionWarningModal;
