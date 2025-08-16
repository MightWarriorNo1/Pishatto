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
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
            const tokenResponse = await fetch(`${baseUrl}/csrf-token`, {
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
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await fetch(`${baseUrl}/csrf-token`, {
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

/**
 * Create headers object with CSRF token
 */
export async function createCsrfHeaders(additionalHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
    const csrfToken = await getCsrfToken();
    
    return {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
        ...additionalHeaders
    };
}

/**
 * Validate CSRF token format
 */
export function validateCsrfToken(token: string | null): boolean {
    if (!token) {
        return false;
    }
    
    // Basic validation - CSRF tokens are typically 40+ characters
    if (token.length < 20) {
        return false;
    }
    
    return true;
}

/**
 * Debug CSRF token state
 */
export async function debugCsrfToken(): Promise<void> {
    const token = await getCsrfToken();
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    
    console.log('CSRF Token Debug Info:', {
        token: token ? `${token.substring(0, 10)}...` : 'null',
        tokenLength: token?.length || 0,
        isValid: validateCsrfToken(token),
        metaTagExists: !!metaTag,
        metaTagContent: metaTag?.getAttribute('content') ? `${metaTag.getAttribute('content')?.substring(0, 10)}...` : 'null'
    });
}
