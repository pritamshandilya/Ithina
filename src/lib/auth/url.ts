import type { AuthConfig } from "./config";

type UrlHelperConfig = Pick<
  AuthConfig,
  | "serverUrl"
  | "loginPath"
  | "registerPath"
  | "logoutPath"
  | "tokenRefreshPath"
  | "userInfoPath"
  | "accountManagementPath"
>;

export class UrlHelper {
  serverUrl: string;
  loginPath: string;
  registerPath: string;
  logoutPath: string;
  tokenRefreshPath: string;
  userInfoPath: string;
  accountManagementPath: string;

  constructor(config: UrlHelperConfig) {
    this.serverUrl = config.serverUrl;
    this.loginPath = config.loginPath ?? "/sign-in";
    this.registerPath = config.registerPath ?? "/sign-up";
    this.logoutPath = config.logoutPath ?? "/app/logout/";
    this.tokenRefreshPath = config.tokenRefreshPath ?? "/app/refresh/";
    this.userInfoPath = config.userInfoPath ?? "/app/userinfo/";
    this.accountManagementPath = config.accountManagementPath ?? "account";
  }

  getLoginUrl(redirect?: string): URL {
    return this.generateUrl(this.loginPath, { redirect });
  }

  getRegisterUrl(redirect?: string): URL {
    return this.generateUrl(this.registerPath, { redirect });
  }

  getLogoutUrl(): URL {
    return this.generateUrl(this.logoutPath);
  }

  getTokenRefreshUrl(): URL {
    return this.generateUrl(this.tokenRefreshPath);
  }

  getUserInfoUrl(): URL {
    return this.generateUrl(this.userInfoPath);
  }

  getAccountManagementUrl(): URL {
    return this.generateUrl(this.accountManagementPath);
  }

  private generateUrl(path: string, params?: Record<string, unknown>): URL {
    const url = new URL(path, this.serverUrl);

    if (params) {
      url.search = this.generateUrlSearchParams(params).toString();
    }

    return url;
  }

  private generateUrlSearchParams(params: Record<string, unknown>) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      searchParams.append(key, value as string);
    });

    return searchParams;
  }
}
