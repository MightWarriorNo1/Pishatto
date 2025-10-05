/*eslint-disable */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GuestProfile, getGuestProfile, getGuestProfileByLineId, GuestInterest, checkGuestAuth, checkLineAuthGuest, lineLogout } from '../services/api';
import { setFavicon } from '../utils/favicon';

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
  logout: () => Promise<void>;
  checkLineAuthentication: () => Promise<boolean>;
  resetLineAuthFlag: () => void;
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
  const [skipLineAuth, setSkipLineAuth] = useState(() => {
    return localStorage.getItem('skipLineAuth') === 'true';
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
    setUser(prev => (prev ? { ...prev, ...updates } : prev));
  };

  // Wrapper function to set user and update favicon
  const setUserWithFavicon = (newUser: GuestProfile | null) => {
    setUser(newUser);
    // Update favicon based on user authentication
    if (newUser) {
      setFavicon('guest');
    } else {
      setFavicon(null); // Reset to default favicon
    }
  };

  const logout = async () => {
    // If user has LINE ID, call server-side LINE logout to clear server session
    if (user?.line_id) {
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
    
    setUserWithFavicon(null);
    setInterests([]);
    setPhone(null);
    // Clear all localStorage data
    localStorage.removeItem('phone');
    localStorage.removeItem('castId');
    localStorage.removeItem('castData');
    
    // Use a more direct approach - force redirect to home page
    // and prevent any route guards from interfering
    window.location.replace('/');
  };


  const resetLineAuthFlag = () => {
    setSkipLineAuth(false);
    localStorage.removeItem('skipLineAuth');
  };

  const refreshUser = async () => {
    if (!phone && !user?.line_id) {
      setUser(null);
      setInterests([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      let guest;
      if (phone) {
        const result = await getGuestProfile(phone);
        guest = result.guest;
      } else if (user?.line_id) {
        const result = await getGuestProfileByLineId(user.line_id);
        guest = result.guest;
      }
      
      if (guest) {
        setUserWithFavicon(guest);
        setInterests(guest.interests || []);
      }
    } catch (error) {
      setUser(null);
      setInterests([]);
    } finally {
      setLoading(false);
    }
  };

  const checkLineAuthentication = async () => {
    try {
      const lineAuthResult = await checkLineAuthGuest();
      if (lineAuthResult.success && lineAuthResult.authenticated && lineAuthResult.user_type === 'guest') {
        setUserWithFavicon(lineAuthResult.user);
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
      
      
      // First check Line authentication (only if not skipping due to logout)
      let lineAuthSuccess = false;
      if (!skipLineAuth) {
        lineAuthSuccess = await checkLineAuthentication();
      } else {
        console.log('Skipping LINE authentication check due to logout flag');
      }
      
      // If Line auth didn't set a user, check regular guest auth
      if (!user && !lineAuthSuccess) { // Only check guest auth if line auth failed or user is null
        const authResult = await checkGuestAuth();
        
        if (authResult.authenticated && authResult.guest) {
          // User is already authenticated, set the user data
          setUserWithFavicon(authResult.guest);
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
    if ((phone || user?.line_id) && !user) {
      refreshUser();
    } else if (!phone && !user?.line_id) {
      setLoading(false);
    }
  }, [phone, user]);

  return (
    <UserContext.Provider value={{ 
      user, 
      interests, 
      loading, 
      setUser: setUserWithFavicon, 
      setInterests, 
      phone, 
      setPhone, 
      refreshUser, 
      updateUser, 
      logout,
      checkLineAuthentication,
      resetLineAuthFlag
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