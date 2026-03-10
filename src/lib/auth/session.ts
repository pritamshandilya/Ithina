import type { Permission } from "@/auth/permissions";
import { isPermission } from "@/auth/permissions";
import type { RouterAuthSnapshot } from "@/auth/state";
import { ApiError, apiClient } from "@/queries/shared";
import { getHttpConfig } from "@/lib/api/config";

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

const TOKEN_EXPIRY_KEY = "auth_token_expiry";
const USER_KEY = "auth_user";

function getTokenStorageKey(): string {
  return getHttpConfig().tokenStorageKey;
}

function isUserRole(role: unknown): role is UserRole {
  return role === "admin" || role === "maker" || role === "checker";
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

function loadUser(): AuthSessionUser | null {
  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) return null;

  try {
    const parsed = JSON.parse(rawUser) as Partial<AuthSessionUser> & {
      organization?: Partial<OrganizationInfo>;
      store_ids?: unknown;
      permissions?: unknown;
    };

    if (!parsed || typeof parsed !== "object") return null;

    const id = typeof parsed.id === "string" ? parsed.id : "";
    const email = typeof parsed.email === "string" ? parsed.email : "";
    const role = isUserRole(parsed.role) ? parsed.role : null;
    const organizationId =
      typeof parsed.organization?.id === "string"
        ? parsed.organization.id
        : "default-org";
    const organizationName =
      typeof parsed.organization?.name === "string"
        ? parsed.organization.name
        : "My Organization";
    const isActive =
      typeof parsed.isActive === "boolean" ? parsed.isActive : false;
    const lastLoginAt =
      typeof parsed.lastLoginAt === "string" ? parsed.lastLoginAt : undefined;
    const permissions = parsePermissions(parsed.permissions);
    const storeIds =
      parseStoreIds(parsed.storeIds) ?? parseStoreIds(parsed.store_ids);

    if (!id || !email || !role) {
      return null;
    }

    const fallbackNames = getInitialsFromEmail(email);

    return {
      id,
      email,
      role,
      organization: {
        id: organizationId,
        name: organizationName,
      },
      isActive,
      lastLoginAt,
      firstName: normalizeName(parsed.firstName) ?? fallbackNames.firstName,
      lastName: normalizeName(parsed.lastName) ?? fallbackNames.lastName,
      permissions,
      storeIds,
    };
  } catch {
    return null;
  }
}

function saveUser(user: AuthSessionUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function saveToken(accessToken: string, expiresInSeconds: number): void {
  sessionStorage.setItem(getTokenStorageKey(), accessToken);
  const expiryEpochMs = Date.now() + expiresInSeconds * 1000;
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryEpochMs));
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

function hasSameSnapshot(
  left: RouterAuthSnapshot,
  right: RouterAuthSnapshot,
): boolean {
  return (
    left.isAuthenticated === right.isAuthenticated &&
    left.user?.id === right.user?.id &&
    left.user?.role === right.user?.role &&
    left.user?.permissions?.join("|") === right.user?.permissions?.join("|")
  );
}

export class AuthSessionService {
  private static listeners = new Set<() => void>();
  private static snapshot: RouterAuthSnapshot | null = null;

  private static computeSnapshot(): RouterAuthSnapshot {
    if (!this.isAuthenticated()) {
      return {
        isAuthenticated: false,
        user: null,
      };
    }

    const user = loadUser();
    return {
      isAuthenticated: !!user,
      user,
    };
  }

  private static emitAuthChanged(): void {
    this.snapshot = this.computeSnapshot();
    this.listeners.forEach((listener) => listener());
  }

  static subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  static getSnapshot(): RouterAuthSnapshot {
    const next = this.computeSnapshot();
    if (!this.snapshot || !hasSameSnapshot(this.snapshot, next)) {
      this.snapshot = next;
    }
    return this.snapshot;
  }

  static async login(
    email: string,
    password: string,
  ): Promise<AuthSessionUser> {
    const login = await apiClient.post<LoginApiResponse>("/auth/login", {
      email,
      password,
    });

    saveToken(login.access_token, login.expires_in);

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

    saveToken(login.access_token, login.expires_in);

    const me = await this.fetchUserInfo();
    return me;
  }

  static getCurrentUser(): AuthSessionUser | null {
    if (!this.isAuthenticated()) return null;
    return loadUser();
  }

  static isAuthenticated(): boolean {
    const token = sessionStorage.getItem(getTokenStorageKey());
    const expiryRaw = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiryRaw) return false;

    const expiry = Number.parseInt(expiryRaw, 10);
    if (Number.isNaN(expiry)) return false;
    return Date.now() < expiry;
  }

  static logout(): void {
    sessionStorage.removeItem(getTokenStorageKey());
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("selected_store");
    this.emitAuthChanged();
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
      saveUser(mapped);
      this.emitAuthChanged();
      return mapped;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        this.logout();
      }
      throw error;
    }
  }
}
