import { createContext } from "react";

import type { UserInvite } from "@/lib/auth";

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  locale?: string;
  profilePictureUrl?: string;
  externalId?: string;
  organizationId?: string;
  organizationName?: string;
  createdAt?: string;
  updatedAt?: string;
  lastSignInAt?: string;
}

export interface AuthProviderContext {
  isLoggedIn: boolean;
  userInfo: UserInfo | null;
  isFetchingUserInfo: boolean;
  error: Error | null;
  fetchUserInfo: () => Promise<UserInfo | undefined>;
  startLogin: (redirectPath?: string) => void;
  startRegister: (redirectPath?: string) => void;
  startLogout: () => void;
  manageAccount: () => void;
  sendInvitation: (data: UserInvite | UserInvite[]) => Promise<void>;
  listInvitations: () => Promise<UserInvite[]>;
  revokeInvitation: (invitationId: string) => Promise<void>;
  refreshToken: () => Promise<Response | undefined>;
  initAutoRefresh: () => void;
}

export const defaultContext: AuthProviderContext = {
  isLoggedIn: false,
  userInfo: null,
  isFetchingUserInfo: false,
  error: null,
  fetchUserInfo: () => Promise.resolve(undefined),
  startLogin: () => {},
  startRegister: () => {},
  startLogout: () => {},
  manageAccount: () => {},
  sendInvitation: () => Promise.resolve(),
  listInvitations: () => Promise.resolve([]),
  revokeInvitation: () => Promise.resolve(),
  refreshToken: () => Promise.resolve(undefined),
  initAutoRefresh: () => {},
};

export const AuthContext = createContext<AuthProviderContext>(defaultContext);
