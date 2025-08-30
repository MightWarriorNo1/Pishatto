/**
 * Utility functions for managing dynamic favicon switching
 */

export type UserType = 'guest' | 'cast' | null;

/**
 * Changes the favicon based on user type
 * @param userType - The type of user ('guest', 'cast', or null for default)
 */
export function setFavicon(userType: UserType): void {
  // Wait for DOM to be ready
  if (typeof document === 'undefined') {
    return;
  }

  // Ensure document is fully loaded
  if (document.readyState !== 'complete') {
    console.log('Document not fully loaded, deferring favicon update');
    // Defer the favicon update until document is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setFavicon(userType), { once: true });
    } else {
      document.addEventListener('load', () => setFavicon(userType), { once: true });
    }
    return;
  }

  // Try to find existing favicon link
  let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  
  // If no favicon link exists, create one
  if (!faviconLink) {
    // Ensure head element exists
    if (!document.head) {
      console.warn('Document head not found, cannot set favicon');
      return;
    }
    
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    faviconLink.type = 'image/x-icon';
    document.head.appendChild(faviconLink);
  }

  let faviconPath: string;
  
  switch (userType) {
    case 'guest':
      faviconPath = '/favicon-guest.png';
      break;
    case 'cast':
      faviconPath = '/favicon-cast.png';
      break;
    default:
      faviconPath = '/favicon-guest.png';
      break;
  }

  // Only update if the favicon path is different
  const currentHref = faviconLink.href;
  const newHref = window.location.origin + faviconPath;
  
  if (currentHref !== newHref) {
    // Check if the favicon file exists before setting it
    checkFaviconExists(faviconPath).then((exists) => {
      if (exists) {
        faviconLink.href = faviconPath;
        console.log(`Favicon updated to: ${faviconPath} (was: ${currentHref})`);
        
        // Store the favicon type in sessionStorage for persistence
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('currentFaviconType', userType || 'default');
        }
      } else {
        console.warn(`Favicon file not found: ${faviconPath}, using default`);
        // Fall back to default favicon
        faviconLink.href = '/favicon.ico';
      }
    });
  } else {
    console.log(`Favicon already set to: ${faviconPath}`);
  }
}

/**
 * Resets the favicon to the default
 */
export function resetFavicon(): void {
  setFavicon(null);
}

/**
 * Gets the current favicon path
 */
export function getCurrentFavicon(): string {
  if (typeof document === 'undefined') {
    return '';
  }
  
  const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  return faviconLink ? faviconLink.href : '';
}

/**
 * Checks if a favicon file exists
 */
export function checkFaviconExists(faviconPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = faviconPath;
  });
}

/**
 * Sets up favicon persistence across page visibility changes
 * This ensures the favicon remains correct when users switch tabs or return to the page
 */
export function setupFaviconPersistence(): () => void {
  if (typeof document === 'undefined') {
    return () => {}; // Return empty function if document is not available
  }

  // Restore favicon from sessionStorage when page becomes visible
  const handleVisibilityChange = () => {
    if (!document.hidden && typeof sessionStorage !== 'undefined') {
      const storedType = sessionStorage.getItem('currentFaviconType');
      if (storedType && storedType !== 'default') {
        setFavicon(storedType as UserType);
      }
    }
  };

  // Listen for page visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
