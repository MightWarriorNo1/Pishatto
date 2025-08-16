/*eslint-disable */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CastProfile, getCastProfileById, checkCastAuth, checkLineAuthCast } from '../services/api';
import { createSessionTimeout, checkSessionValidity, clearSession } from '../utils/sessionTimeout';
import SessionWarningModal from '../components/ui/SessionWarningModal';

interface CastContextType {
  cast: CastProfile | null;
  loading: boolean;
  setCast: (cast: CastProfile | null) => void;
  castId: number | null;
  setCastId: (castId: number | null) => void;
  refreshCast: () => void;
  updateCast: (updates: Partial<CastProfile>) => void;
  logout: () => void;
  checkLineAuthentication: () => Promise<boolean>;
  isSettingCastExternally: boolean;
  showSessionWarning: boolean;
  remainingSessionTime: number;
  extendSession: () => void;
}

const CastContext = createContext<CastContextType | undefined>(undefined);

interface CastProviderProps {
  children: ReactNode;
}

export const CastProvider: React.FC<CastProviderProps> = ({ children }) => {
  const [cast, setCast] = useState<CastProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [castId, setCastIdState] = useState<number | null>(() => {
    const storedCastId = localStorage.getItem('castId');
    return storedCastId ? parseInt(storedCastId, 10) : null;
  });
  const [isSettingCastExternally, setIsSettingCastExternally] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [remainingSessionTime, setRemainingSessionTime] = useState(15);

  // Session timeout manager
  const sessionTimeout = createSessionTimeout({
    onExpire: () => {
      console.log('Cast session expired, logging out user');
      logout();
    },
    onWarning: () => {
      console.log('Cast session warning, showing modal');
      setShowSessionWarning(true);
      setRemainingSessionTime(2); // 2 minutes warning
    }
  });

  const setCastId = (newCastId: number | null) => {
    setCastIdState(newCastId);
    if (newCastId) {
      localStorage.setItem('castId', newCastId.toString());
    } else {
      localStorage.removeItem('castId');
    }
  };

  const updateCast = (updates: Partial<CastProfile>) => {
    if (cast) {
      const updatedCast = { ...cast, ...updates };
      setCastWrapper(updatedCast);
    }
  };

  const setCastWrapper = (newCast: CastProfile | null) => {
    console.log('CastContext: Setting cast data:', newCast);
    
    // Mark that we're setting cast data externally
    setIsSettingCastExternally(true);
    
    // Ensure we have valid cast data
    if (newCast && newCast.id) {
      console.log('CastContext: Valid cast data, updating state...');
      setCast(newCast);
      // Store cast data in localStorage for fallback
      localStorage.setItem('castData', JSON.stringify(newCast));
      // Also store cast ID for consistency
      setCastId(newCast.id);
      console.log('CastContext: Cast data successfully set and stored:', { id: newCast.id, nickname: newCast.nickname });
      
      // Start session timeout for authenticated cast
      sessionTimeout.start();
      
      // Verify the data was stored correctly
      setTimeout(() => {
        const storedData = localStorage.getItem('castData');
        const storedId = localStorage.getItem('castId');
        console.log('CastContext: Verification - stored data:', { storedData, storedId, expectedId: newCast.id });
        
        // Clear the external flag after a delay to allow context to stabilize
        setTimeout(() => {
          setIsSettingCastExternally(false);
          console.log('CastContext: External cast setting flag cleared');
        }, 500);
      }, 100);
    } else {
      console.warn('CastContext: Invalid cast data provided:', newCast);
      setCast(null);
      localStorage.removeItem('castData');
      setCastId(null);
      setIsSettingCastExternally(false);
    }
  };

  const logout = () => {
    setCast(null);
    setCastId(null);
    setShowSessionWarning(false);
    // Clear all localStorage data
    localStorage.removeItem('castId');
    localStorage.removeItem('castData');
    // Clear session timeout
    sessionTimeout.stop();
    clearSession();
    // Redirect to role selection page
    window.location.href = '/';
  };

  const extendSession = () => {
    sessionTimeout.reset();
    setShowSessionWarning(false);
  };

  const refreshCast = async () => {
    if (!castId) {
      setCastWrapper(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { cast: castData } = await getCastProfileById(castId);
      setCastWrapper(castData);
      // Reset session timeout when cast data is refreshed
      sessionTimeout.reset();
    } catch (error) {
      console.error('Error refreshing cast data:', error);
      setCastWrapper(null);
    } finally {
      setLoading(false);
    }
  };

  const checkLineAuthentication = async () => {
    try {
      console.log('CastContext: Checking Line authentication...');
      const lineAuthResult = await checkLineAuthCast();
      console.log('CastContext: Line auth result:', lineAuthResult);
      
      if (lineAuthResult.success && lineAuthResult.authenticated && lineAuthResult.user_type === 'cast') {
        console.log('CastContext: Line authentication successful for cast:', lineAuthResult.user);
        setCastWrapper(lineAuthResult.user);
        setCastId(lineAuthResult.user.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking Line authentication:', error);
      return false;
    }
  };

  const checkExistingAuth = async () => {
    try {
      setLoading(true);
      console.log('CastContext: Starting authentication check...', { isSettingCastExternally });
      
      // Check if session is still valid
      if (cast && !checkSessionValidity()) {
        console.log('Cast session expired, logging out user');
        logout();
        setLoading(false);
        return;
      }
      
      // If we're currently setting cast data externally, skip the auth check
      if (isSettingCastExternally) {
        console.log('CastContext: Skipping auth check - cast data being set externally');
        setLoading(false);
        return;
      }
      
      // First check Line authentication
      const lineAuthSuccess = await checkLineAuthentication();
      console.log('CastContext: Line auth check result:', { lineAuthSuccess, currentCast: cast });
      
      // If Line auth didn't set a cast, check regular cast auth
      if (!cast && !lineAuthSuccess) {
        console.log('CastContext: No Line auth and no cast, checking regular cast auth...');
        const authResult = await checkCastAuth();
        if (authResult.authenticated && authResult.cast) {
          console.log('CastContext: Regular cast auth successful:', authResult.cast);
          setCastWrapper(authResult.cast);
          setCastId(authResult.cast.id);
        } else {
          console.log('CastContext: No regular cast auth found');
          // No existing authentication, check if we have cast data in localStorage
          const storedCastData = localStorage.getItem('castData');
          const storedCastId = localStorage.getItem('castId');
          
          if (storedCastData && storedCastId) {
            try {
              const parsedCastData = JSON.parse(storedCastData);
              const castIdNumber = parseInt(storedCastId, 10);
              
              const { cast: freshCastData } = await getCastProfileById(castIdNumber);
              if (freshCastData) {
                console.log('CastContext: Stored cast data is still valid:', freshCastData);
                setCastWrapper(freshCastData);
                setCastId(freshCastData.id);
              } else {
                console.log('CastContext: Stored cast data is no longer valid, clearing...');
                setCastWrapper(null);
                setCastId(null);
              }
            } catch (error) {
              console.error('Error refreshing stored cast data:', error);
              setCastWrapper(null);
              setCastId(null);
            }
          } else {
            setCastWrapper(null);
            setCastId(null);
          }
        }
      } else if (lineAuthSuccess) {
        console.log('CastContext: Line authentication successful, cast already set');
      } else if (cast) {
        console.log('CastContext: Cast already exists in context, skipping auth check');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking cast authentication:', error);
      // If auth check fails, try to use stored cast data as fallback
      const storedCastData = localStorage.getItem('castData');
      const storedCastId = localStorage.getItem('castId');
      
      if (storedCastData && storedCastId) {
        try {
          const parsedCastData = JSON.parse(storedCastData);
          const castIdNumber = parseInt(storedCastId, 10);
          console.log('CastContext: Using stored cast data as fallback:', parsedCastData);
          setCastWrapper(parsedCastData);
          setCastId(castIdNumber);
        } catch (error) {
          console.error('Error parsing stored cast data:', error);
          setCastWrapper(null);
          setCastId(null);
        }
      } else {
        setCastWrapper(null);
        setCastId(null);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    checkExistingAuth();
    
    // Cleanup session timeout on unmount
    return () => {
      sessionTimeout.destroy();
    };
  }, []);

  // Monitor external cast setting flag
  useEffect(() => {
    console.log('CastContext: External cast setting flag changed:', isSettingCastExternally);
  }, [isSettingCastExternally]);

  return (
    <CastContext.Provider value={{ 
      cast, 
      loading, 
      setCast: setCastWrapper, 
      castId, 
      setCastId, 
      refreshCast, 
      updateCast, 
      logout,
      checkLineAuthentication,
      isSettingCastExternally,
      showSessionWarning,
      remainingSessionTime,
      extendSession
    }}>
      {children}
      
      {/* Session Warning Modal */}
      <SessionWarningModal
        isOpen={showSessionWarning}
        remainingMinutes={remainingSessionTime}
        onExtend={extendSession}
        onLogout={logout}
        onClose={() => setShowSessionWarning(false)}
      />
    </CastContext.Provider>
  );
};

export const useCast = () => {
  const context = useContext(CastContext);
  if (context === undefined) {
    throw new Error('useCast must be used within a CastProvider');
  }
  return context;
};
