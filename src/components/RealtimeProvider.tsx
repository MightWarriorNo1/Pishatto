import React, { useEffect } from 'react';
import { useReverbConnection } from '../hooks/useRealtime';

interface RealtimeProviderProps {
  children: React.ReactNode;
}

const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const { isConnected } = useReverbConnection();

  useEffect(() => {
    if (isConnected) {
      console.log('✅ RealtimeProvider: Reverb connection established');
    } else {
      console.log('⏳ RealtimeProvider: Waiting for Reverb connection...');
    }
  }, [isConnected]);

  return (
    <>
      {children}
      {/* Optional: Show connection status in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-3 py-2 rounded-full text-xs font-mono ${
            isConnected 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {isConnected ? '🟢 Reverb' : '🔴 Reverb'}
          </div>
        </div>
      )}
    </>
  );
};

export default RealtimeProvider;
