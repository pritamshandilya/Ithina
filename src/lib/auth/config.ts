export interface AuthConfig {
  serverUrl: string;
  loginPath?: string;
  registerPath?: string;
  logoutPath?: string;
  tokenRefreshPath?: string;
  userInfoPath?: string;
  accountManagementPath?: string;
  accessTokenExpiryCookieName?: string;
  shouldAutoRefresh?: boolean;
  shouldAutoFetchUserInfo?: boolean;
  shouldTimeoutSession?: boolean;
  shouldInvalidateSession?: boolean;
  onTokenExpiration?: () => void;
}
