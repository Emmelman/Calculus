import { registerSW } from "virtual:pwa-register";

// Auto-update the service worker; the app keeps working offline after first load.
registerSW({ immediate: true });
