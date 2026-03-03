import { apiClient, ApiError } from "@/query/api-client";

export type UserRole = "maker" | "checker";

export interface OrganizationInfo {
  id: string;
  name: string;
}

export interface AuthSessionUser {
  id: string;
  email: string;
  role: UserRole;
  organization: OrganizationInfo;
  isActive: boolean;
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
  role: UserRole;
  organization: OrganizationInfo;
  is_active: boolean;
}

const TOKEN_KEY = "auth_token";
const TOKEN_EXPIRY_KEY = "auth_token_expiry";
const USER_KEY = "auth_user";
const LEGACY_LOGIN_FLAG_KEY = "isLoggedIn";

function loadUser(): AuthSessionUser | null {
  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as AuthSessionUser;
  } catch {
    return null;
  }
}

function saveUser(user: AuthSessionUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function saveToken(accessToken: string, expiresInSeconds: number): void {
  sessionStorage.setItem(TOKEN_KEY, accessToken);
  const expiryEpochMs = Date.now() + expiresInSeconds * 1000;
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryEpochMs));
  localStorage.setItem(LEGACY_LOGIN_FLAG_KEY, "true");
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

export class AuthSessionService {
  static async login(email: string, password: string): Promise<AuthSessionUser> {
    const login = await apiClient.post<LoginApiResponse>("/auth/login", {
      email,
      password,
    });

    saveToken(login.access_token, login.expires_in);

    const me = await this.fetchUserInfo();
    return me;
  }

  static getCurrentUser(): AuthSessionUser | null {
    if (!this.isAuthenticated()) return null;
    return loadUser();
  }

  static isAuthenticated(): boolean {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const expiryRaw = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiryRaw) return false;

    const expiry = Number.parseInt(expiryRaw, 10);
    if (Number.isNaN(expiry)) return false;
    return Date.now() < expiry;
  }

  static logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_LOGIN_FLAG_KEY);
  }

  static getDashboardRoute(role: UserRole): "/maker/dashboard" | "/checker/dashboard" {
    if (role === "checker") return "/checker/dashboard";
    return "/maker/dashboard";
  }

  static async fetchUserInfo(): Promise<AuthSessionUser> {
    try {
      const me = await apiClient.get<MeApiResponse>("/auth/me");
      const mapped: AuthSessionUser = {
        id: me.id,
        email: me.email,
        role: me.role,
        organization: me.organization,
        isActive: me.is_active,
      };
      saveUser(mapped);
      return mapped;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        this.logout();
      }
      throw error;
    }
  }
}

