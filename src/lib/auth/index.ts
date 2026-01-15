import { getCookie, toMilliseconds } from "@/lib/utils";
import type { AuthConfig, UserInvite } from "./config";
import { UrlHelper } from "./url";

export * from "./config";

export class Auth {
  private static instance?: Auth;

  private readonly config: AuthConfig;
  private readonly urlHelper: UrlHelper;

  private tokenExpirationTimeout?: NodeJS.Timeout;
  private refreshTokenTimeout?: NodeJS.Timeout;

  private constructor(config: AuthConfig) {
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

  static getInstance(config?: AuthConfig) {
    if (!Auth.instance) {
      if (!config) {
        throw new Error(
          "Auth not initialized. Call Auth.getInstance(config) first.",
        );
      }

      Auth.instance = new Auth(config);
    }

    // If caller passes a new config after initialization, ignore it.
    return Auth.instance;
  }

  dispose() {
    clearTimeout(this.tokenExpirationTimeout);
    clearTimeout(this.refreshTokenTimeout);
    Auth.instance = undefined;
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

  async sendInvitation(data: UserInvite | UserInvite[], organizationId?: string) {
    const invitePayload = Array.isArray(data) ? data : [data];

    const inviteResponse = await fetch(this.urlHelper.getUserInvitationUrl(organizationId), {
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

  async fetchInvitations(organizationId?: string) {
    const response = await fetch(this.urlHelper.getUserInvitationUrl(organizationId), {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        `Unable to fetch invitations. Request failed with status code ${response?.status}`,
      );
    }

    return await response.json();
  }

  async revokeInvitation(invitationId: string) {
    const response = await fetch(this.urlHelper.getUserInvitationUrl(invitationId), {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        `Unable to revoke invitation. Request failed with status code ${response?.status}`,
      );
    }

    return await response.json();
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
    if (!this.isLoggedIn) {
      return;
    }

    clearTimeout(this.refreshTokenTimeout);

    const secondsBeforeRefresh =
      this.config.autoRefreshSecondsBeforeExpiry ?? 10;
    const millisecondsBeforeRefresh = secondsBeforeRefresh * 1000;
    const refreshTime = this.at_exp - millisecondsBeforeRefresh;
    const timeTillRefresh = Math.max(refreshTime - Date.now(), 0);

    this.refreshTokenTimeout = setTimeout(async () => {
      try {
        await this.refreshToken();
        this.initAutoRefresh();
      } catch (error) {
        this.config.onAutoRefreshFailure?.(error as Error);
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
