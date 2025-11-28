/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_SERVER_URL: string;
  readonly VITE_AUTH_REDIRECT_URI: string;
  readonly VITE_N8N_URL: string;
  readonly VITE_MERCURE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
