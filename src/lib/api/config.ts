export interface HttpConfig {
  baseUrl: string;
  tokenStorageKey: string;
}

const defaultConfig: HttpConfig = {
  baseUrl: "",
  tokenStorageKey: "auth_token",
};

let httpConfig: HttpConfig = defaultConfig;

export function initializeHttpConfig(): void {
  httpConfig = {
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? defaultConfig.baseUrl,
    tokenStorageKey:
      import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY ?? defaultConfig.tokenStorageKey,
  };
}

export function getHttpConfig(): HttpConfig {
  return httpConfig;
}
