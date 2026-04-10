/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_URL: string;
  readonly VITE_MERCURE_URL: string;
  readonly VITE_AUTH_SERVER_URL: string;
  readonly VITE_AUTH_REDIRECT_URI: string;
  readonly VITE_DEBUG: string;
  readonly VITE_SKIP_AUTH: string;
  /** "true" = hash URLs (#/path), "false" = browser history (needs nginx SPA fallback). Omit: hash in prod, browser in dev. */
  readonly VITE_USE_HASH_ROUTER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
