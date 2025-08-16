/**
 * CSRF Token Test Utility
 * Tests the CSRF token endpoint to verify it's working correctly
 */

import { CSRF_ENDPOINT } from '../config/api';

export async function testCsrfEndpoint(): Promise<boolean> {
    try {
        console.log('Testing CSRF endpoint:', CSRF_ENDPOINT);
        
        const response = await fetch(CSRF_ENDPOINT, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        console.log('CSRF endpoint response status:', response.status);
        console.log('CSRF endpoint response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('CSRF token response:', data);
            
            if (data.token && typeof data.token === 'string' && data.token.length > 20) {
                console.log('✅ CSRF endpoint test PASSED');
                return true;
            } else {
                console.error('❌ CSRF endpoint returned invalid token format');
                return false;
            }
        } else {
            console.error('❌ CSRF endpoint test FAILED - HTTP', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            return false;
        }
    } catch (error) {
        console.error('❌ CSRF endpoint test ERROR:', error);
        return false;
    }
}

export async function testCsrfWithRegistration(): Promise<boolean> {
    try {
        console.log('Testing CSRF token with registration endpoint...');
        
        // First get a CSRF token
        const csrfResponse = await fetch(CSRF_ENDPOINT, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!csrfResponse.ok) {
            console.error('Failed to get CSRF token for registration test');
            return false;
        }
        
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.token;
        
        console.log('Got CSRF token, testing with registration endpoint...');
        
        // Test with a minimal registration payload
        const testPayload = new FormData();
        testPayload.append('user_type', 'guest');
        testPayload.append('line_id', 'test_line_id_123');
        testPayload.append('additional_data', JSON.stringify({
            phone: '+1234567890',
            nickname: 'Test User'
        }));
        
        const registrationResponse = await fetch('/api/line/register', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'include',
            body: testPayload
        });
        
        console.log('Registration test response status:', registrationResponse.status);
        
        // We expect either a 422 (validation error) or 200 (success)
        // Both indicate the CSRF token was accepted
        if (registrationResponse.status === 422 || registrationResponse.status === 200) {
            console.log('✅ CSRF token validation test PASSED');
            return true;
        } else if (registrationResponse.status === 419) {
            console.error('❌ CSRF token validation test FAILED - Token rejected');
            return false;
        } else {
            console.log('⚠️ CSRF token validation test - Unexpected status:', registrationResponse.status);
            return true; // Not a CSRF issue
        }
    } catch (error) {
        console.error('❌ CSRF registration test ERROR:', error);
        return false;
    }
}
