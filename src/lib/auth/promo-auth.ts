import { promoApiClient } from "@/lib/promo-api-client";
import { StoreContext } from "@/lib/store-context";

export interface OrganizationSummary {
  id: string;
  name: string;
}

export interface AuthLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  first_name: string;
  last_name: string;
  role: string;
  organization: OrganizationSummary;
}

export interface AuthCurrentUserResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  organization: OrganizationSummary;
  is_active: boolean;
}

export interface PromoUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organization: OrganizationSummary;
}

interface StoreSummary {
  id: string;
}

const USER_KEY = "promo_auth_user";
const EXPIRY_KEY = "promo_auth_expiry";

const API_PREFIX = "/api/v1";

function saveUser(user: PromoUser, expiresInSeconds?: number) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  if (typeof expiresInSeconds === "number") {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    localStorage.setItem(EXPIRY_KEY, String(expiresAt));
  }
}

function clearAuthStorage() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRY_KEY);
}

function readUser(): PromoUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PromoUser;
  } catch {
    return null;
  }
}

function isExpired(): boolean {
  const expiry = localStorage.getItem(EXPIRY_KEY);
  if (!expiry) return false;
  const ts = Number(expiry);
  if (Number.isNaN(ts)) return false;
  return Date.now() >= ts;
}

function mapCurrentUser(payload: AuthCurrentUserResponse): PromoUser {
  return {
    id: payload.id,
    email: payload.email,
    firstName: payload.first_name,
    lastName: payload.last_name,
    role: payload.role,
    organization: payload.organization,
  };
}

export function getDashboardUrlForRole(role: string): string {
  switch (role) {
    case "admin":
      return "/admin/users";
    case "checker":
      return "/checker/dashboard";
    case "maker":
    default:
      return "/maker/dashboard";
  }
}

export class PromoAuthService {
  private static async ensureActiveStore(): Promise<void> {
    const existing = StoreContext.getStoreId();
    if (existing) return;

    try {
      const { data } = await promoApiClient.get<StoreSummary[]>(`${API_PREFIX}/stores`);
      const firstStore = data[0];
      if (firstStore?.id) {
        StoreContext.setStoreId(firstStore.id);
      }
    } catch {
      // Do not block login/user hydration if store lookup fails.
      // Campaign endpoints will surface a clear backend error.
    }
  }

  static async loginWithForm(
    username: string,
    password: string,
  ): Promise<PromoUser> {
    const form = new URLSearchParams();
    form.set("username", username);
    form.set("password", password);

    const { data: loginData } = await promoApiClient.post<AuthLoginResponse>(
      `${API_PREFIX}/auth/token`,
      form,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const { data: me } = await promoApiClient.get<AuthCurrentUserResponse>(
      `${API_PREFIX}/auth/me`,
    );

    const user = mapCurrentUser(me);
    saveUser(user, loginData.expires_in);
    await this.ensureActiveStore();

    return user;
  }

  static async login(email: string, password: string): Promise<PromoUser> {
    const { data: loginData } = await promoApiClient.post<AuthLoginResponse>(
      `${API_PREFIX}/auth/login`,
      { email, password },
    );

    const { data: me } = await promoApiClient.get<AuthCurrentUserResponse>(
      `${API_PREFIX}/auth/me`,
    );

    const user = mapCurrentUser(me);
    saveUser(user, loginData.expires_in);
    await this.ensureActiveStore();

    return user;
  }

  static async logout(): Promise<void> {
    try {
      await promoApiClient.post(`${API_PREFIX}/auth/logout`);
    } catch (error) {
      // Keep logout resilient, but emit a dev-only debug signal so local
      // network/proxy issues are easier to trace.
      if (import.meta.env.DEV) {
        console.debug("Logout request failed (continuing local logout):", error);
      }
    } finally {
      clearAuthStorage();
      StoreContext.clearStoreId();
    }
  }

  static async fetchUserInfo(): Promise<PromoUser> {
    const { data } = await promoApiClient.get<AuthCurrentUserResponse>(
      `${API_PREFIX}/auth/me`,
    );
    const user = mapCurrentUser(data);
    saveUser(user);
    await this.ensureActiveStore();
    return user;
  }

  static getCurrentUser(): PromoUser | null {
    if (isExpired()) {
      clearAuthStorage();
      return null;
    }
    return readUser();
  }

  static isAuthenticated(): boolean {
    if (isExpired()) {
      clearAuthStorage();
      return false;
    }
    return Boolean(readUser());
  }
}

