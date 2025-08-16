/**
 * Session timeout utility for managing authentication sessions
 * Session expires after 15 minutes of inactivity
 */

import { SESSION_CONFIG, getSessionTimeoutMs, getWarningTimeoutMs } from '../config/session';

const SESSION_TIMEOUT_MS = getSessionTimeoutMs();
const SESSION_KEY = SESSION_CONFIG.STORAGE_KEYS.SESSION_ACTIVITY;
const WARNING_TIME_MS = getWarningTimeoutMs();

export interface SessionTimeoutConfig {
  onExpire: () => void;
  onWarning?: () => void;
  warningTime?: number;
}

class SessionTimeoutManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private warningId: NodeJS.Timeout | null = null;
  private config: SessionTimeoutConfig;

  constructor(config: SessionTimeoutConfig) {
    this.config = {
      warningTime: WARNING_TIME_MS,
      ...config
    };
    this.setupActivityListeners();
  }

  /**
   * Start the session timeout
   */
  start(): void {
    this.updateLastActivity();
    this.scheduleTimeout();
  }

  /**
   * Stop the session timeout
   */
  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningId) {
      clearTimeout(this.warningId);
      this.warningId = null;
    }
  }

  /**
   * Reset the session timeout (called on user activity)
   */
  reset(): void {
    this.updateLastActivity();
    this.scheduleTimeout();
  }

  /**
   * Check if session is expired
   */
  isExpired(): boolean {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return true;
    
    const now = Date.now();
    return (now - lastActivity) > SESSION_TIMEOUT_MS;
  }

  /**
   * Get remaining session time in milliseconds
   */
  getRemainingTime(): number {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return 0;
    
    const now = Date.now();
    const elapsed = now - lastActivity;
    return Math.max(0, SESSION_TIMEOUT_MS - elapsed);
  }

  /**
   * Get remaining session time in minutes
   */
  getRemainingMinutes(): number {
    return Math.ceil(this.getRemainingTime() / (60 * 1000));
  }

  /**
   * Update last activity timestamp
   */
  private updateLastActivity(): void {
    localStorage.setItem(SESSION_KEY, Date.now().toString());
  }

  /**
   * Get last activity timestamp
   */
  private getLastActivity(): number | null {
    const timestamp = localStorage.getItem(SESSION_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  }

  /**
   * Schedule the timeout and warning
   */
  private scheduleTimeout(): void {
    // Clear existing timeouts
    this.stop();

    const remainingTime = this.getRemainingTime();
    
    if (remainingTime <= 0) {
      // Session already expired
      this.config.onExpire();
      return;
    }

    // Schedule warning
    const warningTime = Math.max(0, remainingTime - (this.config.warningTime || WARNING_TIME_MS));
    if (warningTime > 0) {
      this.warningId = setTimeout(() => {
        if (this.config.onWarning) {
          this.config.onWarning();
        }
      }, warningTime);
    }

    // Schedule expiry
    this.timeoutId = setTimeout(() => {
      this.config.onExpire();
    }, remainingTime);
  }

  /**
   * Setup activity listeners to reset timeout on user interaction
   */
  private setupActivityListeners(): void {
    const resetTimeout = () => {
      this.reset();
    };

    SESSION_CONFIG.ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, resetTimeout, { passive: true });
    });
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    this.stop();
    
    const resetTimeout = () => {
      this.reset();
    };

    SESSION_CONFIG.ACTIVITY_EVENTS.forEach(event => {
      document.removeEventListener(event, resetTimeout);
    });
  }
}

/**
 * Create a new session timeout manager
 */
export const createSessionTimeout = (config: SessionTimeoutConfig): SessionTimeoutManager => {
  return new SessionTimeoutManager(config);
};

/**
 * Check if session exists and is valid
 */
export const checkSessionValidity = (): boolean => {
  const lastActivity = localStorage.getItem(SESSION_KEY);
  if (!lastActivity) return false;
  
  const timestamp = parseInt(lastActivity, 10);
  const now = Date.now();
  return (now - timestamp) <= SESSION_TIMEOUT_MS;
};

/**
 * Clear session data
 */
export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

/**
 * Get session timeout configuration
 */
export const getSessionTimeoutConfig = () => ({
  timeoutMs: SESSION_TIMEOUT_MS,
  warningTimeMs: WARNING_TIME_MS,
  timeoutMinutes: SESSION_CONFIG.TIMEOUT_MINUTES,
  warningMinutes: SESSION_CONFIG.WARNING_MINUTES
});
