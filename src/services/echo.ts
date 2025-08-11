import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Make Pusher available globally (required by Echo)
(window as any).Pusher = Pusher;

// Resolve envs compatibly with CRA and backend naming
const REVERB_KEY =
  (process.env.REACT_APP_REVERB_KEY as string) ||
  (process.env.REVERB_APP_KEY as string) ||
  (process.env.REVERB_KEY as string) ||
  "local";

const REVERB_HOST =
  (process.env.REACT_APP_REVERB_HOST as string) ||
  (process.env.REVERB_HOST as string) ||
  (process.env.WS_HOST as string) ||
  window.location.hostname ||
  "127.0.0.1";

const REVERB_SCHEME =
  (process.env.REACT_APP_REVERB_SCHEME as string) ||
  (process.env.REVERB_SCHEME as string) ||
  (window.location.protocol === 'https:' ? 'https' : 'http');

const REVERB_PORT = Number(
  (process.env.REACT_APP_REVERB_PORT as string) ||
  (process.env.REVERB_PORT as string) ||
  (process.env.WS_PORT as string) ||
  (REVERB_SCHEME === 'https' ? '443' : '8080')
);

const REVERB_WSS_PORT = Number(
  (process.env.REACT_APP_REVERB_WSS_PORT as string) ||
  (process.env.REVERB_WSS_PORT as string) ||
  '443'
);

const forceTLS = REVERB_SCHEME === 'https';

const echo = new Echo({
  broadcaster: "reverb",
  key: REVERB_KEY,
  wsHost: REVERB_HOST,
  wsPort: REVERB_PORT,
  wssPort: REVERB_WSS_PORT,
  forceTLS,
  encrypted: forceTLS,
  enabledTransports: forceTLS ? ['wss', 'ws'] : ['ws', 'wss'],
});


// Add connection event listeners for debugging
if (echo.connector && 'pusher' in echo.connector) {
  const pusherConnector = echo.connector as any;
  if (pusherConnector.pusher && pusherConnector.pusher.connection) {
    pusherConnector.pusher.connection.bind('connected', () => {
      console.log('✅ Echo: Connected to WebSocket server');
    });

    pusherConnector.pusher.connection.bind('disconnected', () => {
      console.log('❌ Echo: Disconnected from WebSocket server');
    });

    pusherConnector.pusher.connection.bind('error', (error: any) => {
      console.error('❌ Echo: WebSocket connection error:', error);
    });
  }
}

// Test connection function
export const testEchoConnection = () => {
  if (echo.connector && 'pusher' in echo.connector) {
    const pusherConnector = echo.connector as any;
    if (pusherConnector.pusher && pusherConnector.pusher.connection) {
      const state = pusherConnector.pusher.connection.state;
      console.log('🔍 Echo connection state:', state);
      return state === 'connected';
    }
  }
  console.log('🔍 Echo connection state: unknown');
  return false;
};

// Expose Echo for debugging tools that reference window.Echo
(window as any).Echo = echo;

export default echo;
