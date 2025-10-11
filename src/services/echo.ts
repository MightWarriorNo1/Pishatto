import Echo from "laravel-echo";
import Pusher from "pusher-js";

(window as any).Pusher = Pusher;

// Pusher Configuration
const PUSHER_KEY = process.env.REACT_APP_PUSHER_APP_KEY || 'c04752e43c5fb513777e';
const PUSHER_CLUSTER = process.env.REACT_APP_PUSHER_APP_CLUSTER || 'ap3';

console.log("PUSHER_KEY", PUSHER_KEY);
console.log("PUSHER_CLUSTER", PUSHER_CLUSTER);



const echo = new Echo({
  broadcaster: "pusher",
  key: PUSHER_KEY,
  cluster: PUSHER_CLUSTER,
  forceTLS: true,
  encrypted: true,
  enabledTransports: ['ws', 'wss'],
  disableStats: true,
  authEndpoint: '/broadcasting/auth',
  auth: {
    headers: {
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
    },
  },
});

console.log("Echo configuration:", echo.options);
console.log('Channel subscription status:', echo.channel('chat.13').subscribed);

// Add connection event listeners for debugging
const pusherConnector = echo.connector as any;
if (pusherConnector.pusher?.connection) {
  pusherConnector.pusher.connection.bind('connected', () => {
    console.log('✅ Echo: Connected to Pusher successfully');
    console.log('Pusher connection state:', pusherConnector.pusher.connection.state);
  });

  pusherConnector.pusher.connection.bind('disconnected', () => {
    console.log('❌ Echo: Disconnected from Pusher');
  });

  pusherConnector.pusher.connection.bind('error', (error: any) => {
    console.error('❌ Echo: Connection error:', error);
  });

  pusherConnector.pusher.connection.bind('state_change', (states: any) => {
    console.log('🔄 Echo: Connection state changed:', states);
  });

  pusherConnector.pusher.connection.bind('unavailable', () => {
    console.warn('⚠️ Echo: Pusher unavailable');
  });

  pusherConnector.pusher.connection.bind('failed', () => {
    console.error('❌ Echo: Pusher connection failed');
  });
}


(window as any).Echo = echo;

export default echo;
