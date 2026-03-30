/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_URL: string;
  readonly VITE_MERCURE_URL: string;
  readonly VITE_AUTH_SERVER_URL: string;
  readonly VITE_AUTH_REDIRECT_URI: string;
  readonly VITE_DEBUG: string;
  readonly VITE_SKIP_AUTH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
