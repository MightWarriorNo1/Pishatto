import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Make Pusher available globally (required by Echo)
(window as any).Pusher = Pusher;

const echo = new Echo({
  broadcaster: "reverb",
  key: process.env.REVERB_KEY || "local",
  wsHost: process.env.WS_HOST || "127.0.0.1",
  wsPort: process.env.WS_PORT ? Number(process.env.WS_PORT) : 8080,
  forceTLS: false,
  // disableStats: true,
  encrypted: false,
  cluster: "mt1",
});

export default echo;
