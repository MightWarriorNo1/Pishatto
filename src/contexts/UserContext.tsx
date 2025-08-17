/*eslint-disable */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GuestProfile, getGuestProfile, getGuestProfileByLineId, GuestInterest, checkGuestAuth, checkLineAuthGuest } from '../services/api';
import { createSessionTimeout, checkSessionValidity, clearSession } from '../utils/sessionTimeout';
import SessionWarningModal from '../components/ui/SessionWarningModal';

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
  showSessionWarning: boolean;
  remainingSessionTime: number;
  extendSession: () => void;
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
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [remainingSessionTime, setRemainingSessionTime] = useState(15);

  // Session timeout manager
  const sessionTimeout = createSessionTimeout({
    onExpire: () => {
      console.log('Session expired, logging out user');
      logout();
    },
    onWarning: () => {
      console.log('Session warning, showing modal');
      setShowSessionWarning(true);
      setRemainingSessionTime(2); // 2 minutes warning
    }
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
    setShowSessionWarning(false);
    // Clear all localStorage data
    localStorage.removeItem('phone');
    localStorage.removeItem('castId');
    localStorage.removeItem('castData');
    // Clear session timeout
    sessionTimeout.stop();
    clearSession();
  };

  const extendSession = () => {
    sessionTimeout.reset();
    setShowSessionWarning(false);
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
        setUser(guest);
        setInterests(guest.interests || []);
        // Reset session timeout when user data is refreshed
        sessionTimeout.reset();
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
        setUser(lineAuthResult.user);
        setInterests(lineAuthResult.user.interests || []);
        if (lineAuthResult.user.phone) {
          setPhone(lineAuthResult.user.phone);
        }
        // Start session timeout for authenticated user
        sessionTimeout.start();
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
      
      // Check if session is still valid
      if (user && !checkSessionValidity()) {
        console.log('Session expired, logging out user');
        logout();
        setLoading(false);
        return;
      }
      
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
          // Start session timeout for authenticated user
          sessionTimeout.start();
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
    
    // Cleanup session timeout on unmount
    return () => {
      sessionTimeout.destroy();
    };
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
      setUser, 
      setInterests, 
      phone, 
      setPhone, 
      refreshUser, 
      updateUser, 
      logout,
      checkLineAuthentication,
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