export interface AuthConfig {
  serverUrl: string;
  redirectUri: string;
  loginPath?: string;
  registerPath?: string;
  logoutPath?: string;
  tokenRefreshPath?: string;
  userInfoPath?: string;
  accountManagementPath?: string;
  accessTokenExpiryCookieName?: string;
  shouldAutoRefresh?: boolean;
  shouldAutoFetchUserInfo?: boolean;
  onTokenExpiration?: () => void;
}
