import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useCast } from '../../contexts/CastContext';
import Spinner from '../ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType?: 'guest' | 'cast';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  userType = 'guest',
  redirectTo 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: userLoading, checkLineAuthentication } = useUser();
  const { cast, loading: castLoading, checkLineAuthentication: checkCastLineAuth } = useCast();
  const [isCheckingLine, setIsCheckingLine] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    const checkLineAuth = async () => {
      let success = false;
      if (userType === 'guest') {
        success = await checkLineAuthentication();
      } else if (userType === 'cast') {
        success = await checkCastLineAuth();
      }
      setIsCheckingLine(false);
      setHasCheckedAuth(true);
      console.log(`ProtectedRoute: Line authentication ${success ? 'succeeded' : 'failed'} for ${userType}`);
    };

    // Check Line authentication if not already authenticated
    if (!userLoading && !castLoading && !isCheckingLine && !hasCheckedAuth) {
      if (userType === 'guest' && !user) {
        console.log('ProtectedRoute: Checking Line authentication for guest...');
        setIsCheckingLine(true);
        checkLineAuth();
      } else if (userType === 'cast' && !cast) {
        console.log('ProtectedRoute: Checking Line authentication for cast...');
        setIsCheckingLine(true);
        checkLineAuth();
      } else {
        setHasCheckedAuth(true);
      }
    }
  }, [user, cast, userLoading, castLoading, userType, checkLineAuthentication, checkCastLineAuth, isCheckingLine, hasCheckedAuth]);

  useEffect(() => {
    // Only redirect after we've completed all authentication checks
    if (!userLoading && !castLoading && !isCheckingLine && hasCheckedAuth) {
      if (userType === 'guest') {
        if (!user) {
          console.log('ProtectedRoute: Guest not authenticated, redirecting to register');
          // Redirect to appropriate login page
          const redirectPath = redirectTo || '/register';
          navigate(redirectPath, { 
            state: { 
              from: location.pathname,
              message: 'Please log in to access this page'
            } 
          });
        }
      } else if (userType === 'cast') {
        if (!cast) {
          console.log('ProtectedRoute: Cast not authenticated, redirecting to cast login');
          // Redirect to cast login page
          const redirectPath = redirectTo || '/cast/login';
          navigate(redirectPath, { 
            state: { 
              from: location.pathname,
              message: 'Please log in to access this page'
            } 
          });
        }
      }
    }
  }, [user, cast, userLoading, castLoading, isCheckingLine, hasCheckedAuth, userType, navigate, location.pathname, redirectTo]);

  // Show loading spinner while checking authentication
  if (userLoading || castLoading || isCheckingLine) {
    return (
      <div className="min-h-screen max-w-md mx-auto flex items-center justify-center bg-gradient-to-b from-primary via-gray-800 to-secondary">
        <div className="text-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  // Don't render anything while we're still checking authentication
  if (!hasCheckedAuth) {
    return null;
  }

  // Check if user is authenticated for the required user type
  if (userType === 'guest' && !user) {
    return null; // Will redirect in useEffect
  }

  if (userType === 'cast' && !cast) {
    return null; // Will redirect in useEffect
  }

  // User is authenticated, render the protected content
  console.log(`ProtectedRoute: Rendering protected content for ${userType}`, { user, cast });
  return <>{children}</>;
};

export default ProtectedRoute;
