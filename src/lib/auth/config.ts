export interface AuthConfig {
  serverUrl: string;
  redirectUri: string;
  loginPath?: string;
  registerPath?: string;
  logoutPath?: string;
  tokenRefreshPath?: string;
  userInfoPath?: string;
  manageAccountPath?: string;
  userInvitationPath?: string;
  accessTokenExpiryCookieName?: string;
  shouldAutoRefresh?: boolean;
  shouldAutoFetchUserInfo?: boolean;
  autoRefreshSecondsBeforeExpiry?: number;
  onTokenExpiration?: () => void;
  onAutoRefreshFailure?: (error: Error) => void;
}

export interface UserInvite {
  email: string;
  role?: string;
}
