import Echo from "laravel-echo";
import Pusher from "pusher-js";

(window as any).Pusher = Pusher;

const REVERB_KEY = process.env.REACT_APP_REVERB_KEY || "local";
const REVERB_HOST = process.env.REACT_APP_REVERB_HOST || "admin.pishatto.jp";
const REVERB_SCHEME = process.env.REACT_APP_REVERB_SCHEME || "https";
const REVERB_PORT = Number(process.env.REACT_APP_REVERB_PORT || "443");

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
  wssPort: REVERB_PORT,
});

console.log("Echo configuration:", {
  key: REVERB_KEY,
  host: REVERB_HOST,
  port: REVERB_PORT,
  scheme: REVERB_SCHEME,
  forceTLS: forceTLS
});

(window as any).Echo = echo;

export default echo;
