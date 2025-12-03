import { getCookie, toMilliseconds } from "@/lib/utils";
import type { AuthConfig, UserInvite } from "./config";
import { UrlHelper } from "./url";

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
      redirectUri: config.redirectUri,
      loginPath: config.loginPath,
      registerPath: config.registerPath,
      logoutPath: config.logoutPath,
      tokenRefreshPath: config.tokenRefreshPath,
      userInfoPath: config.userInfoPath,
      manageAccountPath: config.manageAccountPath,
      userInvitationPath: config.userInvitationPath,
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
    window.location.assign(this.urlHelper.getManageAccountUrl());
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

  async sendInvitation(data: UserInvite | UserInvite[]) {
    const invitePayload = Array.isArray(data) ? data : [data];

    const inviteResponse = await fetch(this.urlHelper.getUserInvitationUrl(), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invitePayload),
    });

    if (!inviteResponse.ok) {
      throw new Error(
        `Unable to invite user(s). Request failed with status code ${inviteResponse?.status}`,
      );
    }

    return await inviteResponse.json();
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

    // Reschedule token expiration callback after successful refresh
    this.scheduleTokenExpiration();

    return response;
  }

  initAutoRefresh(): NodeJS.Timeout | undefined {
    if (!this.isLoggedIn || this.isDisposed) {
      console.log(
        "Not scheduling token refresh: either logged out or disposed",
        { isLoggedIn: this.isLoggedIn, isDisposed: this.isDisposed },
      );
      return;
    }

    const secondsBeforeRefresh = 27 * 60;
    const millisecondsBeforeRefresh = secondsBeforeRefresh * 1000;
    const now = Date.now();
    const refreshTime = this.at_exp - millisecondsBeforeRefresh;
    const timeTillRefresh = Math.max(refreshTime - now, 0);
    console.log(`Scheduling token refresh in ${timeTillRefresh} ms`);

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
    return this.at_exp > Date.now();
  }

  private get at_exp(): number {
    return toMilliseconds(getCookie("at_exp"));
  }

  private scheduleTokenExpiration(): void {
    clearTimeout(this.tokenExpirationTimeout);

    const millisecondsTillExpiration = this.at_exp - Date.now();

    if (millisecondsTillExpiration > 0 && this.config.onTokenExpiration) {
      this.tokenExpirationTimeout = setTimeout(
        this.config.onTokenExpiration,
        millisecondsTillExpiration,
      );
    }
  }
}
