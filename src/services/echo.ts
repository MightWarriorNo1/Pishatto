import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Make Pusher available globally (required by Echo)
(window as any).Pusher = Pusher;

const echo = new Echo({
  broadcaster: "reverb",
  key: "local", // Should match your .env and backend config
  wsHost: "127.0.0.1",
  wsPort: 8080,
  forceTLS: false,
  disableStats: true,
  encrypted: false,
  cluster: "mt1",
  authEndpoint: "http://localhost:8000/broadcasting/auth",
  withCredentials: true,
});

export default echo;
