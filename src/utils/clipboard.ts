/**
 * Utility functions for clipboard operations with fallbacks
 */

export interface ShareOptions {
  title?: string;
  text?: string;
  url: string;
}

/**
 * Detects the current environment
 */
export const getEnvironment = (): 'development' | 'production' => {
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  return 'development';
};

/**
 * Checks if the current context is secure (HTTPS or localhost)
 */
export const isSecureContext = (): boolean => {
  return window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
};

/**
 * Attempts to share content using the Web Share API first, then falls back to clipboard
 */
export const shareContent = async (options: ShareOptions): Promise<boolean> => {
  const { title, text, url } = options;
  const environment = getEnvironment();
  const isSecure = isSecureContext();

  console.log('Share attempt:', { environment, isSecure, hasWebShare: !!navigator.share, hasClipboard: !!navigator.clipboard });

  // Try Web Share API first (works well on mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: title || 'Shared Content',
        text: text || 'Check this out!',
        url: url,
      });
      console.log('Web Share API successful');
      return true;
    } catch (error) {
      console.log('Web Share API failed, falling back to clipboard:', error);
    }
  }

  // Fallback to clipboard
  return await copyToClipboard(url);
};

/**
 * Copies text to clipboard with multiple fallbacks
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  const environment = getEnvironment();
  const isSecure = isSecureContext();

  console.log('Clipboard attempt:', { environment, isSecure, hasClipboard: !!navigator.clipboard });

  try {
    // Modern clipboard API (requires HTTPS in production)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      console.log('Modern clipboard API successful');
      return true;
    }

    // Fallback for older browsers or non-secure contexts
    console.log('Using clipboard fallback');
    return copyToClipboardFallback(text);
  } catch (error) {
    console.error('Clipboard API failed, using fallback:', error);
    return copyToClipboardFallback(text);
  }
};

/**
 * Fallback clipboard method using document.execCommand
 */
const copyToClipboardFallback = (text: string): boolean => {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    textArea.style.zIndex = '-1';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    console.log('execCommand result:', successful);
    return successful;
  } catch (error) {
    console.error('execCommand failed:', error);
    return false;
  }
};

/**
 * Checks if the current environment supports clipboard operations
 */
export const isClipboardSupported = (): boolean => {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
};

/**
 * Checks if the current environment supports Web Share API
 */
export const isWebShareSupported = (): boolean => {
  return !!navigator.share;
}; 