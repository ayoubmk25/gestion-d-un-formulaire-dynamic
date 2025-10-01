import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;                  
        Echo: Echo<any>; // Add a generic type argument
    }
}

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_PUSHER_APP_KEY, // Changed to VITE_PUSHER_APP_KEY
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: 'http://localhost:8000/broadcasting/auth', // Added authEndpoint
    auth: { // Added auth block
        headers: {
            // Configure authentication headers based on your setup (API token or session/cookie)
            // Example for API token: 'Authorization': 'Bearer ' + yourAuthToken,
            // Example for session/cookie: 'X-CSRF-TOKEN': csrfToken,
        },
    },
});

export default window.Echo;
