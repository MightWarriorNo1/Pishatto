/**
 * iOS-specific LINE login utility
 * Handles LINE app detection and deep linking for iOS Safari
 */

interface LineLoginOptions {
  userType: 'guest' | 'cast';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  castRegistration?: boolean;
  useCastCallback?: boolean;
}

/**
 * Detects if the current device is iOS Safari
 */
export const isIOSSafari = (): boolean => {
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  return isIOS && isSafari;
};

/**
 * Detects if LINE app is installed on iOS
 */
export const detectLineApp = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isIOSSafari()) {
      resolve(false);
      return;
    }

    const lineAppUrl = 'line://';
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.src = lineAppUrl;
    
    let resolved = false;
    
    const cleanup = () => {
      if (iframe.parentNode && document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };
    
    // Timeout after 2 seconds
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(false);
      }
    }, 2000);
    
    // Listen for iframe load events
    iframe.onload = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        cleanup();
        resolve(true);
      }
    };
    
    iframe.onerror = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        cleanup();
        resolve(false);
      }
    };
    
    document.body.appendChild(iframe);
  });
};

/**
 * Attempts to open LINE app for OAuth login
 */
export const openLineApp = (userType: 'guest' | 'cast'): Promise<boolean> => {
  return new Promise((resolve) => {
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const redirectUrl = `${apiBase}/line/redirect?user_type=${userType}`;
    // Delegate to backend redirect which has proper client_id configured
    window.location.href = redirectUrl;
    resolve(true);
  });
};

/**
 * Generate a secure state parameter for OAuth
 */
const generateState = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Store state in sessionStorage for validation
 */
const storeState = (state: string, userType: 'guest' | 'cast'): void => {
  sessionStorage.setItem('line_oauth_state', state);
  sessionStorage.setItem('line_oauth_user_type', userType);
  sessionStorage.setItem('line_oauth_timestamp', Date.now().toString());
};

/**
 * Validate state parameter on callback
 */
export const validateState = (receivedState: string, userType: 'guest' | 'cast'): boolean => {
  const storedState = sessionStorage.getItem('line_oauth_state');
  const storedUserType = sessionStorage.getItem('line_oauth_user_type');
  const storedTimestamp = sessionStorage.getItem('line_oauth_timestamp');
  
  // Check if state exists and matches
  if (!storedState || storedState !== receivedState) {
    console.error('State mismatch - possible CSRF attack');
    return false;
  }
  
  // Check if user type matches
  if (!storedUserType || storedUserType !== userType) {
    console.error('User type mismatch');
    return false;
  }
  
  // Check if state is not too old (5 minutes)
  if (storedTimestamp) {
    const age = Date.now() - parseInt(storedTimestamp);
    if (age > 5 * 60 * 1000) { // 5 minutes
      console.error('State too old');
      return false;
    }
  }
  
  // Clean up stored state
  sessionStorage.removeItem('line_oauth_state');
  sessionStorage.removeItem('line_oauth_user_type');
  sessionStorage.removeItem('line_oauth_timestamp');
  
  return true;
};

/**
 * Retry LINE login with disable_auto_login=true (for when auto-login fails)
 */
export const retryLineLoginWithDisabledAutoLogin = (userType: 'guest' | 'cast'): void => {
  try {
    // Generate secure state parameter
    const state = generateState();
    storeState(state, userType);
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const redirectTo = new URL(`${apiBase}/line/redirect`);
    redirectTo.searchParams.set('user_type', userType);
    redirectTo.searchParams.set('disable_auto_login', 'true');
    // Optional local nonce
    const nonce = generateState();
    sessionStorage.setItem('line_oauth_nonce', nonce);
    window.location.href = redirectTo.toString();
  } catch (error: any) {
    console.error('LINE retry login error:', error);
  }
};

/**
 * Main LINE login handler with iOS-specific logic following LINE's official recommendations
 */
export const handleLineLogin = async (options: LineLoginOptions): Promise<void> => {
  const { userType, onError, castRegistration = false, useCastCallback = false } = options;
  
  try {
    // Generate secure state parameter (for local validation/UI)
    const state = generateState();
    storeState(state, userType);
    
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const redirectTo = new URL(`${apiBase}/line/redirect`);
    redirectTo.searchParams.set('user_type', userType);
    if (castRegistration) {
      redirectTo.searchParams.set('cast_registration', 'true');
    }
    if (useCastCallback) {
      redirectTo.searchParams.set('use_cast_callback', 'true');
    }
    if (isIOSSafari()) {
      redirectTo.searchParams.set('disable_auto_login', 'true');
    }
    // Optional local nonce for UI checks
    const nonce = generateState();
    sessionStorage.setItem('line_oauth_nonce', nonce);
    window.location.href = redirectTo.toString();
  } catch (error: any) {
    console.error('LINE login error:', error);
    const errorMessage = error.message || 'LINE login failed';
    onError?.(errorMessage);
  }
};

/**
 * Shows instructions for iOS users when LINE app is not available
 */
const showLineAppInstructions = (userType: 'guest' | 'cast'): void => {
  const userTypeText = userType === 'guest' ? 'ゲスト' : 'キャスト';
  
  const instructions = `
LINEアプリがインストール済みの場合は、以下の手順でログインしてください：

1. 【LINEアプリでログイン】をタップする
2. または、【LINEアプリでログイン】を長押しして【LINEで開く】を選択
3. もう一度ログインをお試しください

LINEアプリがインストールされていない場合は、App StoreからLINEアプリをダウンロードしてください。
  `;
  
  // Create a modal with instructions
  const modal = document.createElement('div');
  modal.id = 'line-login-guide-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 16px;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    padding: 24px;
    border-radius: 16px;
    max-width: 320px;
    width: 100%;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `;
  
  const icon = document.createElement('div');
  icon.style.cssText = `
    width: 64px;
    height: 64px;
    background: #f0f9ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    font-size: 24px;
  `;
  icon.textContent = '💬';
  
  const title = document.createElement('h3');
  title.textContent = 'LINEログイン';
  title.style.cssText = `
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: bold;
    color: #111827;
  `;
  
  const subtitle = document.createElement('p');
  subtitle.textContent = `${userTypeText}としてLINEアカウントでログインします`;
  subtitle.style.cssText = `
    margin: 0 0 24px 0;
    font-size: 14px;
    color: #6b7280;
  `;
  
  const instructionBox = document.createElement('div');
  instructionBox.style.cssText = `
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    text-align: left;
  `;
  
  const instructionTitle = document.createElement('h4');
  instructionTitle.textContent = '📱 自動ログインが失敗した場合の対処法';
  instructionTitle.style.cssText = `
    font-weight: 600;
    color: #1e40af;
    margin: 0 0 8px 0;
    font-size: 14px;
  `;
  
  const instructionList = document.createElement('ol');
  instructionList.style.cssText = `
    font-size: 12px;
    color: #1e40af;
    margin: 0;
    padding-left: 16px;
    line-height: 1.4;
  `;
  
  const steps = [
    '【LINEアプリでログイン】をタップ',
    'または、【LINEアプリでログイン】を長押し',
    '【LINEで開く】を選択',
    'もう一度ログインをお試しください'
  ];
  
  steps.forEach((step, index) => {
    const li = document.createElement('li');
    li.textContent = step;
    instructionList.appendChild(li);
  });
  
  instructionBox.appendChild(instructionTitle);
  instructionBox.appendChild(instructionList);
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 12px;
  `;
  
  const closeButton = document.createElement('button');
  closeButton.textContent = '閉じる';
  closeButton.style.cssText = `
    flex: 1;
    background: #e5e7eb;
    color: #374151;
    border: none;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  `;
  
  const retryButton = document.createElement('button');
  retryButton.textContent = '再試行';
  retryButton.style.cssText = `
    flex: 1;
    background: #10b981;
    color: white;
    border: none;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  `;
  
  closeButton.onclick = () => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  };
  
  retryButton.onclick = () => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
    // Retry with disable_auto_login=true
    retryLineLoginWithDisabledAutoLogin(userType);
  };
  
  buttonContainer.appendChild(closeButton);
  buttonContainer.appendChild(retryButton);
  
  content.appendChild(icon);
  content.appendChild(title);
  content.appendChild(subtitle);
  content.appendChild(instructionBox);
  content.appendChild(buttonContainer);
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // Auto-close after 15 seconds
  setTimeout(() => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  }, 15000);
};

/**
 * Enhanced LINE login button component for iOS
 */
export const createLineLoginButton = (userType: 'guest' | 'cast'): HTMLElement => {
  const button = document.createElement('button');
  button.textContent = 'LINEでログイン';
  button.style.cssText = `
    background: #00B900;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    width: 100%;
    max-width: 280px;
    margin: 8px auto;
    display: block;
    transition: background-color 0.2s;
  `;
  
  button.onmouseover = () => {
    button.style.backgroundColor = '#00A000';
  };
  
  button.onmouseout = () => {
    button.style.backgroundColor = '#00B900';
  };
  
  button.onclick = () => {
    handleLineLogin({ userType, useCastCallback: false });
  };
  
  return button;
};
