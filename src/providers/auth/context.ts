import { createContext } from "react";

export interface UserInfo {
  email: string;
}

export interface AuthProviderContext {
  isLoggedIn: boolean;
  userInfo: UserInfo | null;
  isFetchingUserInfo: boolean;
  error: Error | null;
  fetchUserInfo: () => Promise<UserInfo | undefined>;
  startLogin: (redirectTo?: string) => void;
  startRegister: (redirectTo?: string) => void;
  startLogout: () => void;
  manageAccount: () => void;
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
  refreshToken: () => Promise.resolve(undefined),
  initAutoRefresh: () => {},
};

export const AuthContext = createContext<AuthProviderContext>(defaultContext);
