/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_AUTH_SERVER_URL: string;
  readonly VITE_AUTH_REDIRECT_URI: string;
  readonly VITE_N8N_URL: string;
  readonly VITE_MERCURE_URL: string;
  readonly VITE_API_MODE?: "mock" | "live";
  readonly VITE_API_MODE_ANALYSIS?: "mock" | "live";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
