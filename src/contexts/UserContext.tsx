/*eslint-disable */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GuestProfile, getGuestProfile, GuestInterest, checkGuestAuth, checkLineAuth } from '../services/api';

interface UserContextType {
  user: GuestProfile | null;
  interests: GuestInterest[];
  loading: boolean;
  setUser: (user: GuestProfile | null) => void;
  setInterests: (interests: GuestInterest[]) => void;
  phone: string | null;
  setPhone: (phone: string | null) => void;
  refreshUser: () => void;
  updateUser: (updates: Partial<GuestProfile>) => void;
  logout: () => void;
  checkLineAuthentication: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<GuestProfile | null>(null);
  const [interests, setInterests] = useState<GuestInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhoneState] = useState<string | null>(() => {
    return localStorage.getItem('phone');
  });

  const setPhone = (newPhone: string | null) => {
    setPhoneState(newPhone);
    if (newPhone) {
      localStorage.setItem('phone', newPhone);
    } else {
      localStorage.removeItem('phone');
    }
  };

  const updateUser = (updates: Partial<GuestProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const logout = () => {
    setUser(null);
    setInterests([]);
    setPhone(null);
    // Clear all localStorage data
    localStorage.removeItem('phone');
    localStorage.removeItem('castId');
    localStorage.removeItem('castData');
  };

  const refreshUser = async () => {
    if (!phone) {
      setUser(null);
      setInterests([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { guest } = await getGuestProfile(phone);
      setUser(guest);
      setInterests(guest.interests || []);
    } catch (error) {
      setUser(null);
      setInterests([]);
    } finally {
      setLoading(false);
    }
  };

  const checkLineAuthentication = async () => {
    try {
      const lineAuthResult = await checkLineAuth();
      if (lineAuthResult.success && lineAuthResult.authenticated && lineAuthResult.user_type === 'guest') {
        setUser(lineAuthResult.user);
        setInterests(lineAuthResult.user.interests || []);
        if (lineAuthResult.user.phone) {
          setPhone(lineAuthResult.user.phone);
        }
        return true; // Indicate success
      }
      return false; // Indicate failure
    } catch (error) {
      console.error('Error checking Line authentication:', error);
      return false; // Indicate failure
    }
  };

  // Check for existing authentication on app load
  const checkExistingAuth = async () => {
    try {
      setLoading(true);
      
      // First check Line authentication
      const lineAuthSuccess = await checkLineAuthentication();
      
      // If Line auth didn't set a user, check regular guest auth
      if (!user && !lineAuthSuccess) { // Only check guest auth if line auth failed or user is null
        const authResult = await checkGuestAuth();
        
        if (authResult.authenticated && authResult.guest) {
          // User is already authenticated, set the user data
          setUser(authResult.guest);
          setInterests(authResult.guest.interests || []);
          setPhone(authResult.guest.phone);
        } else {
          const storedPhone = localStorage.getItem('phone');
          if (storedPhone) {
            setPhone(storedPhone);
            // Don't set loading to false here, let the second useEffect handle it
          } else {
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      // If auth check fails, fall back to phone-based authentication
      const storedPhone = localStorage.getItem('phone');
      if (storedPhone) {
        setPhone(storedPhone);
        // Don't set loading to false here, let the second useEffect handle it
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    checkExistingAuth();
  }, []);

  useEffect(() => {
    if (phone && !user) {
      refreshUser();
    } else if (!phone) {
      setLoading(false);
    }
  }, [phone, user]);

  return (
    <UserContext.Provider value={{ 
      user, 
      interests, 
      loading, 
      setUser, 
      setInterests, 
      phone, 
      setPhone, 
      refreshUser, 
      updateUser, 
      logout,
      checkLineAuthentication
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 