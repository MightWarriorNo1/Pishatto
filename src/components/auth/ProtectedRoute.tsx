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

  useEffect(() => {
    const checkLineAuth = async () => {
      if (userType === 'guest') {
        await checkLineAuthentication();
      } else if (userType === 'cast') {
        await checkCastLineAuth();
      }
      setIsCheckingLine(false);
    };

    // Check Line authentication if not already authenticated
    if (!userLoading && !castLoading && !isCheckingLine) {
      if (userType === 'guest' && !user) {
        setIsCheckingLine(true);
        checkLineAuth();
      } else if (userType === 'cast' && !cast) {
        setIsCheckingLine(true);
        checkLineAuth();
      }
    }
  }, [user, cast, userLoading, castLoading, userType, checkLineAuthentication, checkCastLineAuth, isCheckingLine]);

  useEffect(() => {
    if (!userLoading && !castLoading && !isCheckingLine) {
      if (userType === 'guest') {
        if (!user) {
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
  }, [user, cast, userLoading, castLoading, isCheckingLine, userType, navigate, location.pathname, redirectTo]);

  // Show loading spinner while checking authentication
  if (userLoading || castLoading || isCheckingLine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary via-gray-800 to-secondary">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-white text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated for the required user type
  if (userType === 'guest' && !user) {
    return null; // Will redirect in useEffect
  }

  if (userType === 'cast' && !cast) {
    return null; // Will redirect in useEffect
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
