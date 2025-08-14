/*eslint-disable */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CastProfile, getCastProfileById, checkCastAuth, checkLineAuth } from '../services/api';

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
    setCast(newCast);
    // Store cast data in localStorage for fallback
    if (newCast) {
      localStorage.setItem('castData', JSON.stringify(newCast));
      // Also store cast ID for consistency
      setCastId(newCast.id);
    } else {
      localStorage.removeItem('castData');
      setCastId(null);
    }
  };

  const logout = () => {
    setCast(null);
    setCastId(null);
    // Clear all localStorage data
    localStorage.removeItem('castId');
    localStorage.removeItem('castData');
    // Redirect to role selection page
    window.location.href = '/';
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
      console.log('CastContext: Checking Line authentication...');
      const lineAuthResult = await checkLineAuth();
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
      console.log('CastContext: Starting authentication check...');
      
      // First check Line authentication
      const lineAuthSuccess = await checkLineAuthentication();
      
      // If Line auth didn't set a cast, check regular cast auth
      if (!cast && !lineAuthSuccess) {
        console.log('CastContext: No Line auth, checking regular cast auth...');
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
      checkLineAuthentication
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
