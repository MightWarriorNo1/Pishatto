/**
 * API Configuration
 * Centralized configuration for API endpoints and URLs
 */

// API Base URL - Update this value based on your environment
export const API_CONFIG = {
  // Production API URL
  PRODUCTION_URL: 'https://admin.pishatto.com',
  
  // Development API URL (fallback)
  DEVELOPMENT_URL: 'http://localhost:8000',
  
  // Current API URL (can be overridden by environment variable)
  get CURRENT_URL(): string {
    return process.env.REACT_APP_API_URL || this.PRODUCTION_URL;
  },
  
  // Web routes base URL (without /api)
  get WEB_BASE_URL(): string {
    return this.CURRENT_URL.replace('/api', '');
  },
  
  // API routes base URL (with /api)
  get API_BASE_URL(): string {
    const base = this.CURRENT_URL;
    return base.endsWith('/api') ? base : `${base}/api`;
  }
};

// CSRF Token endpoint
export const CSRF_ENDPOINT = `${API_CONFIG.WEB_BASE_URL}/csrf-token`;

// Common API endpoints
export const API_ENDPOINTS = {
  CSRF_TOKEN: CSRF_ENDPOINT,
  LINE_REGISTER: `${API_CONFIG.API_BASE_URL}/line/register`,
  LINE_LOGIN: `${API_CONFIG.API_BASE_URL}/line/login`,
  LINE_CALLBACK: `${API_CONFIG.API_BASE_URL}/line/callback`,
  LINE_REDIRECT: `${API_CONFIG.API_BASE_URL}/line/redirect`,
  LINE_LOGOUT: `${API_CONFIG.API_BASE_URL}/line/logout`,
  LINE_LINK_ACCOUNT: `${API_CONFIG.API_BASE_URL}/line/link-account`,
  GUEST_REGISTER: `${API_CONFIG.API_BASE_URL}/guest/register`,
  GUEST_LOGIN: `${API_CONFIG.API_BASE_URL}/guest/login`,
  CAST_REGISTER: `${API_CONFIG.API_BASE_URL}/cast/register`,
  CAST_LOGIN: `${API_CONFIG.API_BASE_URL}/cast/login`,
  CAST_APPLICATION_SUBMIT: `${API_CONFIG.API_BASE_URL}/cast-applications/submit`,
  CAST_UPLOAD_IMAGES: `${API_CONFIG.API_BASE_URL}/cast/upload-images`,
  CAST_UPLOAD_SINGLE_IMAGE: `${API_CONFIG.API_BASE_URL}/cast/upload-single-image`,
  CAST_GET_IMAGES: `${API_CONFIG.API_BASE_URL}/cast/images`,
  CAST_CLEANUP_IMAGES: `${API_CONFIG.API_BASE_URL}/cast/images`,
  SMS_SEND_CODE: `${API_CONFIG.API_BASE_URL}/sms/send-code`,
  SMS_VERIFY_CODE: `${API_CONFIG.API_BASE_URL}/sms/verify-code`,
  CHATS: `${API_CONFIG.API_BASE_URL}/chats`,
  MESSAGES: `${API_CONFIG.API_BASE_URL}/messages`,
  CASTS: `${API_CONFIG.API_BASE_URL}/casts`,
  GUESTS: `${API_CONFIG.API_BASE_URL}/guests`,
  RESERVATIONS: `${API_CONFIG.API_BASE_URL}/reservations`,
  PAYMENTS: `${API_CONFIG.API_BASE_URL}/payments`,
  NOTIFICATIONS: `${API_CONFIG.API_BASE_URL}/notifications`
};

