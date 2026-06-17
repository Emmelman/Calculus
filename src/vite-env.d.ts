/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the AI helper proxy for builds without the Vite dev proxy
   * (e.g. the Android APK). Empty/undefined → relative `/api` (dev & PWA).
   */
  readonly VITE_HELPER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
