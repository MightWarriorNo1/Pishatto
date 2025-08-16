/**
 * Session configuration
 * Centralized configuration for session management
 */

export const SESSION_CONFIG = {
  // Session timeout in minutes
  TIMEOUT_MINUTES: 15,
  
  // Warning time before expiry (in minutes)
  WARNING_MINUTES: 2,
  
  // Activity events that reset the timeout
  ACTIVITY_EVENTS: [
    'mousedown',
    'mousemove', 
    'keypress',
    'scroll',
    'touchstart',
    'click'
  ] as const,
  
  // Local storage keys
  STORAGE_KEYS: {
    SESSION_ACTIVITY: 'session_last_activity',
    PHONE: 'phone',
    CAST_ID: 'castId',
    CAST_DATA: 'castData'
  } as const
};

export const getSessionTimeoutMs = () => SESSION_CONFIG.TIMEOUT_MINUTES * 60 * 1000;
export const getWarningTimeoutMs = () => SESSION_CONFIG.WARNING_MINUTES * 60 * 1000;

