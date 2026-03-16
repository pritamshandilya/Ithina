import type { Permission } from "@/auth/permissions";
import { isPermission } from "@/auth/permissions";
import type { RouterAuthSnapshot } from "@/auth/state";
import { ApiError, apiClient } from "@/queries/shared";
import store from "@/store";

export type UserRole = "admin" | "maker" | "checker";

export interface OrganizationInfo {
  id: string;
  name: string;
}

export interface AuthSessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization: OrganizationInfo;
  isActive: boolean;
  lastLoginAt?: string;
  permissions?: Permission[];
  storeIds?: string[];
}

interface LoginApiResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  role: UserRole;
  organization: OrganizationInfo;
}

interface MeApiResponse {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role: UserRole;
  organization: OrganizationInfo;
  is_active: boolean;
  permissions?: Permission[];
  store_ids?: string[];
}

function parsePermissions(value: unknown): Permission[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const permissions = value.filter(isPermission);
  return permissions.length ? permissions : undefined;
}

function parseStoreIds(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const storeIds = value.filter(
    (storeId): storeId is string => typeof storeId === "string" && !!storeId,
  );
  return storeIds.length ? storeIds : undefined;
}

export function getInitialsFromEmail(email: string): {
  firstName: string;
  lastName: string;
} {
  const localPart = email.split("@")[0] || "";
  const parts = localPart
    .split(/[._-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      firstName: parts[0][0].toUpperCase() + parts[0].slice(1),
      lastName: parts[1][0].toUpperCase() + parts[1].slice(1),
    };
  }

  if (parts.length === 1 && parts[0].length > 0) {
    return {
      firstName: parts[0][0].toUpperCase() + parts[0].slice(1),
      lastName: "User",
    };
  }

  return { firstName: "User", lastName: "Account" };
}

function normalizeName(name?: string | null): string | undefined {
  const trimmed = name?.trim();
  return trimmed ? trimmed : undefined;
}

function getAuthFromStore() {
  return store.getState().auth;
}

const EMPTY_SNAPSHOT: RouterAuthSnapshot = {
  isAuthenticated: false,
  user: null,
};

export class AuthSessionService {
  private static cachedSnapshot: RouterAuthSnapshot = EMPTY_SNAPSHOT;
  private static cachedAuthKey: string = "";

  private static computeSnapshot(): RouterAuthSnapshot {
    const { token, tokenExpiry, user } = getAuthFromStore();
    const validToken =
      !!token &&
      !!tokenExpiry &&
      !Number.isNaN(Number(tokenExpiry)) &&
      Date.now() < Number(tokenExpiry);
    const authenticated = validToken && !!user;
    return {
      isAuthenticated: authenticated,
      user: authenticated ? (user as AuthSessionUser) : null,
    };
  }

  /** Stable key for current auth state so we can return cached snapshot when unchanged */
  private static getAuthKey(): string {
    const { token, tokenExpiry, user } = getAuthFromStore();
    const u = user as AuthSessionUser | null;
    return `${token ?? ""}|${tokenExpiry ?? ""}|${u?.id ?? ""}`;
  }

  static subscribe(listener: () => void): () => void {
    return store.subscribe(listener);
  }

  static getSnapshot(): RouterAuthSnapshot {
    const key = this.getAuthKey();
    if (key === this.cachedAuthKey) {
      return this.cachedSnapshot;
    }
    this.cachedAuthKey = key;
    this.cachedSnapshot = this.computeSnapshot();
    return this.cachedSnapshot;
  }

  static async login(
    email: string,
    password: string,
  ): Promise<AuthSessionUser> {
    const login = await apiClient.post<LoginApiResponse>("/auth/login", {
      email,
      password,
    });

    const tokenExpiry = Date.now() + login.expires_in * 1000;
    store.dispatch({
      type: "auth/setSession",
      payload: { token: login.access_token, tokenExpiry, user: null },
    });

    const me = await this.fetchUserInfo();
    return me;
  }

  static async token(
    username: string,
    password: string,
  ): Promise<AuthSessionUser> {
    const body = new URLSearchParams();
    body.append("username", username);
    body.append("password", password);

    const login = await apiClient.post<LoginApiResponse>("/auth/token", body);

    const tokenExpiry = Date.now() + login.expires_in * 1000;
    store.dispatch({
      type: "auth/setSession",
      payload: { token: login.access_token, tokenExpiry, user: null },
    });

    const me = await this.fetchUserInfo();
    return me;
  }

  static getCurrentUser(): AuthSessionUser | null {
    if (!this.isAuthenticated()) return null;
    return getAuthFromStore().user as AuthSessionUser | null;
  }

  static isAuthenticated(): boolean {
    const { token, tokenExpiry } = getAuthFromStore();
    if (!token || tokenExpiry == null) return false;
    const expiry = Number(tokenExpiry);
    if (Number.isNaN(expiry)) return false;
    return Date.now() < expiry;
  }

  static logout(): void {
    store.dispatch({ type: "auth/clearSession" });
    store.dispatch({ type: "store/setCurrentStore", payload: null });
  }

  static getDashboardRoute(
    role: UserRole,
  ): "/admin/dashboard" | "/maker/dashboard" | "/checker/dashboard" {
    if (role === "admin") return "/admin/dashboard";
    if (role === "checker") return "/checker/dashboard";
    return "/maker/dashboard";
  }

  static async fetchUserInfo(): Promise<AuthSessionUser> {
    try {
      const me = await apiClient.get<MeApiResponse>("/auth/me");
      const fallbackNames = getInitialsFromEmail(me.email);
      const mapped: AuthSessionUser = {
        id: me.id,
        email: me.email,
        firstName: normalizeName(me.first_name) ?? fallbackNames.firstName,
        lastName: normalizeName(me.last_name) ?? fallbackNames.lastName,
        role: me.role,
        organization: me.organization || {
          id: "default-org",
          name: "My Organization",
        },
        isActive: me.is_active,
        permissions: parsePermissions(me.permissions),
        storeIds: parseStoreIds(me.store_ids),
      };
      store.dispatch({ type: "auth/setSession", payload: { user: mapped } });
      return mapped;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        this.logout();
      }
      throw error;
    }
  }
}
