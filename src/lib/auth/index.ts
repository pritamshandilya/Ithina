import type { AuthConfig } from "./config";
import { UrlHelper } from "./url";
import { getCookie, toMilliseconds } from "@/lib/utils";

export * from "./config";

export class Auth {
  private readonly config: AuthConfig;
  private readonly urlHelper: UrlHelper;

  private tokenExpirationTimeout?: NodeJS.Timeout;
  private refreshTokenTimeout?: NodeJS.Timeout;
  private isDisposed = false;

  constructor(config: AuthConfig) {
    this.config = config;

    this.urlHelper = new UrlHelper({
      serverUrl: config.serverUrl,
      loginPath: config.loginPath,
      registerPath: config.registerPath,
      logoutPath: config.logoutPath,
      tokenRefreshPath: config.tokenRefreshPath,
      userInfoPath: config.userInfoPath,
    });

    this.scheduleTokenExpiration();
  }

  dispose() {
    clearTimeout(this.tokenExpirationTimeout);
    clearTimeout(this.refreshTokenTimeout);
    this.isDisposed = true;
  }

  startLogin(redirect?: string) {
    window.location.assign(this.urlHelper.getLoginUrl(redirect));
  }

  startRegister(redirect?: string) {
    window.location.assign(this.urlHelper.getRegisterUrl(redirect));
  }

  startLogout() {
    window.location.assign(this.urlHelper.getLogoutUrl());
  }

  manageAccount() {
    window.location.assign(this.urlHelper.getAccountManagementUrl());
  }

  async fetchUserInfo<T>(): Promise<T> {
    const userInfoResponse = await fetch(this.urlHelper.getUserInfoUrl(), {
      credentials: "include",
    });

    if (!userInfoResponse.ok) {
      throw new Error(
        `Unable to fetch userInfo. Request failed with status code ${userInfoResponse?.status}`,
      );
    }

    const userInfo: T = await userInfoResponse.json();

    return userInfo;
  }

  async refreshToken(): Promise<Response> {
    const response = await fetch(this.urlHelper.getTokenRefreshUrl(), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "text/plain",
      },
    });

    if (!(response.status >= 200 && response.status < 300)) {
      const errorDetails = {
        status: response.status,
        details: (await response?.text()) || "Failed to refresh access token",
      };

      throw new Error(JSON.stringify(errorDetails));
    }

    this.scheduleTokenExpiration();

    return response;
  }

  initAutoRefresh(): NodeJS.Timeout | undefined {
    if (!this.isLoggedIn || this.isDisposed) {
      return;
    }

    const secondsBeforeRefresh = 30;
    const millisecondsBeforeRefresh = secondsBeforeRefresh * 1000;
    const now = new Date().getTime();
    const refreshTime = this.at_exp - millisecondsBeforeRefresh;
    const timeTillRefresh = Math.max(refreshTime - now, 0);

    this.refreshTokenTimeout = setTimeout(async () => {
      try {
        await this.refreshToken();
        this.initAutoRefresh();
      } catch (error) {
        console.error("Failed to refresh token:", error);
      }
    }, timeTillRefresh);

    return this.refreshTokenTimeout;
  }

  get isLoggedIn() {
    return this.at_exp > new Date().getTime();
  }

  private get at_exp(): number {
    return toMilliseconds(getCookie("at_exp"));
  }

  private scheduleTokenExpiration(): void {
    clearTimeout(this.tokenExpirationTimeout);

    const now = new Date().getTime();
    const millisecondsTillExpiration = this.at_exp - now;

    if (millisecondsTillExpiration > 0) {
      this.tokenExpirationTimeout = setTimeout(
        this.config.onTokenExpiration,
        millisecondsTillExpiration,
      );
    }
  }
}
