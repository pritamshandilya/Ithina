import type { AuthSessionUser } from "@/lib/auth/session";

export interface RouterAuthSnapshot {
  isAuthenticated: boolean;
  user: AuthSessionUser | null;
}

export interface RouterAuthState extends RouterAuthSnapshot {
  status: "ready";
  ready: () => Promise<void>;
}
