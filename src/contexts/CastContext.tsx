/*eslint-disable */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CastProfile, getCastProfileById, checkCastAuth } from '../services/api';

interface CastContextType {
  cast: CastProfile | null;
  loading: boolean;
  setCast: (cast: CastProfile | null) => void;
  castId: number | null;
  setCastId: (castId: number | null) => void;
  refreshCast: () => void;
  updateCast: (updates: Partial<CastProfile>) => void;
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
    console.log('CastContext: setting castId:', newCastId);
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
      console.log('CastContext: updating cast:', updatedCast);
      setCastWrapper(updatedCast);
    }
  };

  const setCastWrapper = (newCast: CastProfile | null) => {
    console.log('CastContext: setting cast:', newCast);
    setCast(newCast);
    // Store cast data in localStorage for fallback
    if (newCast) {
      localStorage.setItem('castData', JSON.stringify(newCast));
    } else {
      localStorage.removeItem('castData');
    }
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
      setCastWrapper(null);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingAuth = async () => {
    try {
      setLoading(true);
      console.log('CastContext: checking existing authentication...');
      const authResult = await checkCastAuth();
      console.log('CastContext: auth result:', authResult);
      if (authResult.authenticated && authResult.cast) {
        console.log('CastContext: cast authenticated, setting cast data:', authResult.cast);
        setCastWrapper(authResult.cast);
        setCastId(authResult.cast.id);
        setLoading(false);
      } else {
        console.log('CastContext: cast not authenticated, checking localStorage fallback...');
        // No existing authentication, check if we have cast data in localStorage
        const storedCastData = localStorage.getItem('castData');
        const storedCastId = localStorage.getItem('castId');
        
        if (storedCastData && storedCastId) {
          try {
            const parsedCastData = JSON.parse(storedCastData);
            const castIdNumber = parseInt(storedCastId, 10);
            
            // Check if the stored cast data is still valid by making a request to get fresh data
            console.log('CastContext: found stored cast data, refreshing...');
            const { cast: freshCastData } = await getCastProfileById(castIdNumber);
            if (freshCastData) {
              console.log('CastContext: stored cast data is still valid, setting cast data:', freshCastData);
              setCastWrapper(freshCastData);
              setCastId(freshCastData.id);
            } else {
              console.log('CastContext: stored cast data is no longer valid, clearing...');
              setCastWrapper(null);
              setCastId(null);
            }
          } catch (error) {
            console.error('Error refreshing stored cast data:', error);
            setCastWrapper(null);
            setCastId(null);
          }
        } else {
          console.log('CastContext: no stored cast data found');
          setCastWrapper(null);
          setCastId(null);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking cast authentication:', error);
      // If auth check fails, try to use stored cast data as fallback
      const storedCastData = localStorage.getItem('castData');
      const storedCastId = localStorage.getItem('castId');
      
      if (storedCastData && storedCastId) {
        try {
          const parsedCastData = JSON.parse(storedCastData);
          const castIdNumber = parseInt(storedCastId, 10);
          console.log('CastContext: using stored cast data as fallback:', parsedCastData);
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
    console.log('CastContext: useEffect triggered, checking existing auth...');
    checkExistingAuth();
  }, []);

  return (
    <CastContext.Provider value={{ cast, loading, setCast: setCastWrapper, castId, setCastId, refreshCast, updateCast }}>
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
