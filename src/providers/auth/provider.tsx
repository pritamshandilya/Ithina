import type { PropsWithChildren } from "react";
import { useMemo, useState } from "react";

import type { AuthProviderContext, UserInfo } from "./context";
import { AuthContext } from "./context";
import { useInvitation } from "./hooks/useInvitation";
import { useRedirecting } from "./hooks/useRedirecting";
import { useTokenRefresh } from "./hooks/useTokenRefresh";
import { useUserInfo } from "./hooks/useUserInfo";
import { Auth, type AuthConfig } from "@/lib/auth";

export function AuthProvider(props: PropsWithChildren<AuthConfig>) {
  const config: Omit<AuthConfig, "onTokenExpiration"> = useMemo(
    () => ({
      serverUrl: props.serverUrl,
      redirectUri: props.redirectUri,
      loginPath: props.loginPath,
      registerPath: props.registerPath,
      logoutPath: props.logoutPath,
      tokenRefreshPath: props.tokenRefreshPath,
      userInfoPath: props.userInfoPath,
      manageAccountPath: props.manageAccountPath,
      userInvitationPath: props.userInvitationPath,
      accessTokenExpiryCookieName: props.accessTokenExpiryCookieName,
      shouldAutoRefresh: props.shouldAutoRefresh,
      shouldAutoFetchUserInfo: props.shouldAutoFetchUserInfo,
      autoRefreshSecondsBeforeExpiry: props.autoRefreshSecondsBeforeExpiry,
      onAutoRefreshFailure: props.onAutoRefreshFailure,
    }),
    [
      props.serverUrl,
      props.redirectUri,
      props.loginPath,
      props.registerPath,
      props.logoutPath,
      props.tokenRefreshPath,
      props.userInfoPath,
      props.manageAccountPath,
      props.userInvitationPath,
      props.accessTokenExpiryCookieName,
      props.shouldAutoRefresh,
      props.shouldAutoFetchUserInfo,
      props.autoRefreshSecondsBeforeExpiry,
      props.onAutoRefreshFailure,
    ],
  );

  const auth = Auth.getInstance({
    ...config,
    onTokenExpiration: () => setIsLoggedIn(false),
  });

  const [isLoggedIn, setIsLoggedIn] = useState(auth.isLoggedIn);

  const { startLogin, startRegister, startLogout, manageAccount } =
    useRedirecting(auth);

  const { userInfo, isFetchingUserInfo, error, fetchUserInfo } =
    useUserInfo<UserInfo>(auth, config.shouldAutoFetchUserInfo ?? true);

  const { sendInvitation, listInvitations, revokeInvitation } =
    useInvitation(auth);

  const { refreshToken, initAutoRefresh } = useTokenRefresh(
    auth,
    config.shouldAutoRefresh ?? true,
  );

  const contextValue: AuthProviderContext = useMemo(
    () => ({
      isLoggedIn,
      userInfo,
      isFetchingUserInfo,
      error,
      fetchUserInfo,
      startLogin,
      startRegister,
      startLogout,
      manageAccount,
      sendInvitation,
      listInvitations,
      revokeInvitation,
      refreshToken,
      initAutoRefresh,
    }),
    [
      isLoggedIn,
      userInfo,
      isFetchingUserInfo,
      error,
      fetchUserInfo,
      startLogin,
      startRegister,
      startLogout,
      manageAccount,
      sendInvitation,
      listInvitations,
      revokeInvitation,
      refreshToken,
      initAutoRefresh,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
}
