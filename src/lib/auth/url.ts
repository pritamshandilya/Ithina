import type { AuthConfig } from "./config";

type UrlHelperConfig = Pick<
  AuthConfig,
  | "serverUrl"
  | "redirectUri"
  | "loginPath"
  | "registerPath"
  | "logoutPath"
  | "tokenRefreshPath"
  | "userInfoPath"
  | "manageAccountPath"
  | "userInvitationPath"
>;

export class UrlHelper {
  serverUrl: string;
  redirectUri: string;
  loginPath: string;
  registerPath: string;
  logoutPath: string;
  tokenRefreshPath: string;
  userInfoPath: string;
  manageAccountPath: string;
  userInvitationPath: string;

  constructor(config: UrlHelperConfig) {
    this.serverUrl = config.serverUrl;
    this.redirectUri = config.redirectUri;
    this.loginPath = config.loginPath ?? "/sign-in";
    this.registerPath = config.registerPath ?? "/sign-up";
    this.logoutPath = config.logoutPath ?? "/api/sign-out";
    this.tokenRefreshPath = config.tokenRefreshPath ?? "/api/refresh-token";
    this.userInfoPath = config.userInfoPath ?? "/api/user-info";
    this.manageAccountPath = config.manageAccountPath ?? "/manage-account";
    this.userInvitationPath = config.userInvitationPath ?? "/api/invitations";
  }

  getLoginUrl(redirectPath?: string): URL {
    const redirectUrl = this.getRedirectUrl(redirectPath);
    return this.generateUrl(this.loginPath, { redirect_url: redirectUrl });
  }

  getRegisterUrl(redirectPath?: string): URL {
    const redirectUrl = this.getRedirectUrl(redirectPath);
    return this.generateUrl(this.registerPath, { redirect_url: redirectUrl });
  }

  getLogoutUrl(): URL {
    const redirectUrl = this.getRedirectUrl();
    return this.generateUrl(this.logoutPath, { redirect_url: redirectUrl });
  }

  getTokenRefreshUrl(): URL {
    return this.generateUrl(this.tokenRefreshPath);
  }

  getUserInfoUrl(): URL {
    return this.generateUrl(this.userInfoPath);
  }

  getManageAccountUrl(): URL {
    return this.generateUrl(this.manageAccountPath);
  }

  getUserInvitationUrl(organizationId?: string): URL {
    return this.generateUrl(this.userInvitationPath, organizationId ? { organizationId } : undefined);
  }

  private getRedirectUrl(path?: string): string {
    return new URL(path ?? "", this.redirectUri).toString();
  }

  private generateUrl(path: string, params?: Record<string, unknown>): URL {
    const url = new URL(path, this.serverUrl);

    if (params) {
      url.search = this.generateUrlSearchParams(params).toString();
    }

    return url;
  }

  private generateUrlSearchParams(params: Record<string, unknown>) {
    const urlSearchParams = new URLSearchParams();

    const appendParams = (key: string, value: unknown) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item === undefined || item === null) continue;

          if (typeof item === "object") {
            appendParams(key, item);
          } else {
            urlSearchParams.append(key, String(item));
          }
        }
      } else if (typeof value === "object") {
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
          appendParams(k, v);
        }
      } else {
        urlSearchParams.append(key, value as string);
      }
    };

    for (const [key, value] of Object.entries(params)) {
      appendParams(key, value);
    }

    return urlSearchParams;
  }
}
