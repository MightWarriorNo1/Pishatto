import Echo from "laravel-echo";
import Pusher from "pusher-js";

(window as any).Pusher = Pusher;

const REVERB_KEY = process.env.REACT_APP_REVERB_KEY || "local";
const REVERB_HOST = process.env.REACT_APP_REVERB_HOST || "127.0.0.1";
const REVERB_SCHEME = process.env.REACT_APP_REVERB_SCHEME || "http";
const REVERB_PORT = Number(process.env.REACT_APP_REVERB_PORT || "8080");

const forceTLS = REVERB_SCHEME === 'https';

const echo = new Echo({
  broadcaster: "pusher",
  key: REVERB_KEY,
  cluster: "mt1",
  host: REVERB_HOST,
  port: REVERB_PORT,
  scheme: REVERB_SCHEME,
  forceTLS: forceTLS,
  encrypted: forceTLS,
  enabledTransports: forceTLS ? ['wss'] : ['ws'],
  // Add WebSocket specific configuration
  wsHost: REVERB_HOST,
  wsPort: REVERB_PORT,
  wsPath: process.env.NODE_ENV === "production" ? "/ws" : "/",
  wssPort: REVERB_PORT,
});

console.log("Echo configuration:", {
  key: REVERB_KEY,
  host: REVERB_HOST,
  port: REVERB_PORT,
  scheme: REVERB_SCHEME,
  forceTLS: forceTLS
});
// Add connection event listeners for debugging
const pusherConnector = echo.connector as any;
if (pusherConnector.pusher?.connection) {
  pusherConnector.pusher.connection.bind('connected', () => {
    console.log('Echo: Connected to Reverb server');
  });

  pusherConnector.pusher.connection.bind('disconnected', () => {
    console.log('Echo: Disconnected from Reverb server');
  });

  pusherConnector.pusher.connection.bind('error', (error: any) => {
    console.error('Echo: Connection error:', error);
  });

  pusherConnector.pusher.connection.bind('state_change', (states: any) => {
    console.log('Echo: Connection state changed:', states);
  });
}


(window as any).Echo = echo;

export default echo;
