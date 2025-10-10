/*eslint-disable */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CastProfile, getCastProfileById, checkCastAuth, checkLineAuthCast, lineLogout } from '../services/api';
import { setFavicon } from '../utils/favicon';

interface CastContextType {
  cast: CastProfile | null;
  loading: boolean;
  setCast: (cast: CastProfile | null) => void;
  castId: number | null;
  setCastId: (castId: number | null) => void;
  refreshCast: () => void;
  updateCast: (updates: Partial<CastProfile>) => void;
  logout: () => Promise<void>;
  checkLineAuthentication: () => Promise<boolean>;
  isSettingCastExternally: boolean;
  resetLineAuthFlag: () => void;
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
  const [skipLineAuth, setSkipLineAuth] = useState(() => {
    return localStorage.getItem('skipLineAuth') === 'true';
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
      // Update favicon for cast user
      setFavicon('cast');
      // Store cast data in localStorage for fallback
      localStorage.setItem('castData', JSON.stringify(newCast));
      // Also store cast ID for consistency
      setCastId(newCast.id);
      console.log('CastContext: Cast data successfully set and stored:', { id: newCast.id, nickname: newCast.nickname });
      
      
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
      // Reset favicon when cast is cleared
      setFavicon(null);
      localStorage.removeItem('castData');
      setCastId(null);
      setIsSettingCastExternally(false);
    }
  };

  const logout = async () => {
    // If cast has LINE ID, call server-side LINE logout to clear server session
    if (cast?.line_id) {
      try {
        await lineLogout();
        // Set flag to skip LINE auth checks after logout
        setSkipLineAuth(true);
        // Store this flag in localStorage to persist across page reloads
        localStorage.setItem('skipLineAuth', 'true');
      } catch (error) {
        console.error('Error calling LINE logout:', error);
        // Continue with logout even if LINE logout fails
        setSkipLineAuth(true);
        localStorage.setItem('skipLineAuth', 'true');
      }
    }
    
    setCast(null);
    setCastId(null);
    // Reset favicon when cast logs out
    setFavicon(null);
    // Clear all localStorage data
    localStorage.removeItem('castId');
    localStorage.removeItem('castData');
    
    // Redirect directly to cast login page
    window.location.replace('/cast/login');
  };


  const resetLineAuthFlag = () => {
    setSkipLineAuth(false);
    localStorage.removeItem('skipLineAuth');
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
    } catch (error) {
      console.error('Error refreshing cast data:', error);
      setCastWrapper(null);
    } finally {
      setLoading(false);
    }
  };

  const checkLineAuthentication = async () => {
    try {
      const lineAuthResult = await checkLineAuthCast();
      
      if (lineAuthResult.success && lineAuthResult.authenticated && lineAuthResult.user_type === 'cast') {
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
      
      
      // If we're currently setting cast data externally, skip the auth check
      if (isSettingCastExternally) {
        setLoading(false);
        return;
      }
      
      // First check Line authentication (only if not skipping due to logout)
      let lineAuthSuccess = false;
      if (!skipLineAuth) {
        lineAuthSuccess = await checkLineAuthentication();
      } else {
        console.log('CastContext: Skipping LINE authentication check due to logout flag');
      }
      
      // If Line auth didn't set a cast, check regular cast auth
      if (!cast && !lineAuthSuccess) {
        const authResult = await checkCastAuth();
        if (authResult.authenticated && authResult.cast) {
          setCastWrapper(authResult.cast);
          setCastId(authResult.cast.id);
        } else {
          // No existing authentication, check if we have cast data in localStorage
          const storedCastData = localStorage.getItem('castData');
          const storedCastId = localStorage.getItem('castId');
          
          if (storedCastData && storedCastId) {
            try {
              const parsedCastData = JSON.parse(storedCastData);
              const castIdNumber = parseInt(storedCastId, 10);
              
              const { cast: freshCastData } = await getCastProfileById(castIdNumber);
              if (freshCastData) {
                setCastWrapper(freshCastData);
                setCastId(freshCastData.id);
              } else {
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
    
  }, []);

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
      resetLineAuthFlag
    }}>
      {children}
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
