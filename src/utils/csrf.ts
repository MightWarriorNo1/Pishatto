import { CSRF_ENDPOINT } from '../config/api';

/**
 * CSRF Token Utility Functions
 * Provides centralized CSRF token management for the React application
 */

/**
 * Get CSRF token from multiple sources with fallback
 */
export async function getCsrfToken(): Promise<string | null> {
    let csrfToken = null;
    
    // Try meta tag first
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
        csrfToken = metaTag.getAttribute('content');
    }
    
    // Try global function
    if (!csrfToken && (window as any).csrfUtils?.getToken) {
        csrfToken = (window as any).csrfUtils.getToken();
    }
    
    // If still no token, fetch it from the server
    if (!csrfToken) {
        try {
            console.log('Fetching CSRF token from server...');
            const tokenResponse = await fetch(CSRF_ENDPOINT, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json();
                csrfToken = tokenData.token;
                console.log('CSRF token fetched successfully');
            } else {
                console.error('Failed to fetch CSRF token:', tokenResponse.status);
            }
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
        }
    }
    
    return csrfToken;
}

/**
 * Refresh CSRF token from server
 */
export async function refreshCsrfToken(): Promise<string | null> {
    try {
        console.log('Refreshing CSRF token...');
        const response = await fetch(CSRF_ENDPOINT, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const token = data.token;
            
            // Update meta tag if it exists
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag && token) {
                metaTag.setAttribute('content', token);
            }
            
            console.log('CSRF token refreshed successfully');
            return token;
        } else {
            console.error('Failed to refresh CSRF token:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error refreshing CSRF token:', error);
        return null;
    }
}
