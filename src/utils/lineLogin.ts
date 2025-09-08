/**
 * iOS-specific LINE login utility
 * Handles LINE app detection and deep linking for iOS Safari
 */

interface LineLoginOptions {
  userType: 'guest' | 'cast';
  onSuccess?: () => void;
  onError?: (error: string) => void;
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
      if (iframe.parentNode) {
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
    const redirectUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/line/redirect?user_type=${userType}`;
    const lineAppUrl = `line://oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_LINE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUrl)}&state=${userType}`;
    
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    }, 1000);
    
    try {
      // Try to open LINE app
      const newWindow = window.open(lineAppUrl, '_self');
      
      // If window.open returns null, it means the app opened
      if (newWindow === null) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(true);
        }
      } else {
        // If we get a window object, the app didn't open
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(false);
        }
      }
    } catch (error) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(false);
      }
    }
  });
};

/**
 * Main LINE login handler with iOS-specific logic
 */
export const handleLineLogin = async (options: LineLoginOptions): Promise<void> => {
  const { userType, onError } = options;
  
  try {
    const redirectUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/line/redirect?user_type=${userType}`;
    
    if (isIOSSafari()) {
      // For iOS Safari, try to detect and open LINE app
      console.log('iOS Safari detected, attempting LINE app detection...');
      
      // First, try to detect if LINE app is installed
      const isLineInstalled = await detectLineApp();
      console.log('LINE app detection result:', isLineInstalled);
      
      if (isLineInstalled) {
        // Try to open LINE app
        const appOpened = await openLineApp(userType);
        console.log('LINE app open attempt result:', appOpened);
        
        if (appOpened) {
          console.log('LINE app opened successfully');
          return;
        }
      }
      
      // If LINE app detection/opening failed, show user instructions
      console.log('LINE app not available, showing fallback instructions');
      showLineAppInstructions(userType);
    } else {
      // For non-iOS or non-Safari browsers, use standard redirect
      console.log('Non-iOS browser detected, using standard redirect');
      window.location.href = redirectUrl;
    }
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
  instructionTitle.textContent = '📱 LINEアプリがインストール済みの場合';
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
  
  const webLoginButton = document.createElement('button');
  webLoginButton.textContent = 'Webでログイン';
  webLoginButton.style.cssText = `
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
  
  webLoginButton.onclick = () => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
    // Fallback to web login
    const redirectUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/line/redirect?user_type=${userType}`;
    window.location.href = redirectUrl;
  };
  
  buttonContainer.appendChild(closeButton);
  buttonContainer.appendChild(webLoginButton);
  
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
    handleLineLogin({ userType });
  };
  
  return button;
};
