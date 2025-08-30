import { useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useCast } from '../contexts/CastContext';
import { setFavicon, setupFaviconPersistence } from '../utils/favicon';

// Function to restore favicon from sessionStorage
const restoreFaviconFromStorage = () => {
  if (typeof sessionStorage !== 'undefined') {
    const storedType = sessionStorage.getItem('currentFaviconType');
    if (storedType && storedType !== 'default') {
      setFavicon(storedType as 'guest' | 'cast');
    }
  }
};

/**
 * Custom hook to manage favicon based on user authentication state
 * This hook automatically updates the favicon when users log in/out
 */
export function useFavicon() {
  const { user, loading: userLoading } = useUser();
  const { cast, loading: castLoading } = useCast();

  useEffect(() => {
    // Ensure DOM is ready before proceeding
    if (typeof document === 'undefined') {
      return;
    }

    const initializeFavicon = () => {
      // Restore favicon from sessionStorage on initial load
      restoreFaviconFromStorage();
      
      // Set up favicon persistence across page visibility changes
      return setupFaviconPersistence();
    };

    let cleanup: () => void;

    // If DOM is already loaded, initialize immediately
    if (document.readyState === 'loading') {
      // Wait for DOM to be fully loaded
      const handleDOMContentLoaded = () => {
        cleanup = initializeFavicon();
      };
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
      
      return () => {
        document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
        cleanup();
      };
    } else {
      // DOM is already loaded, initialize immediately
      cleanup = initializeFavicon();
      
      return () => {
        cleanup();
      };
    }
  }, []);

  useEffect(() => {
    // Wait for both contexts to finish loading and ensure DOM is ready
    if (userLoading || castLoading || typeof document === 'undefined') {
      return;
    }

    // Ensure DOM is fully loaded and head element exists
    if (document.readyState !== 'complete' || !document.querySelector('head')) {
      return;
    }

    // Determine which user type is authenticated
    if (cast) {
      setFavicon('cast');
    } else if (user) {
      setFavicon('guest');
    } else {
      // No user authenticated, use default favicon
      setFavicon(null);
    }
  }, [user, cast, userLoading, castLoading]);
}
