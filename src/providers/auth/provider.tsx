import type { PropsWithChildren } from "react";
import { useMemo, useRef, useState } from "react";

import { Auth, type AuthConfig } from "@/lib/auth";
import type { AuthProviderContext, UserInfo } from "./context";
import { AuthContext } from "./context";
import { useInvitation } from './hooks/useInvitation';
import { useRedirecting } from "./hooks/useRedirecting";
import { useTokenRefresh } from "./hooks/useTokenRefresh";
import { useUserInfo } from "./hooks/useUserInfo";

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
    ],
  );

  const authRef = useRef<Auth>(null);

  // useEffect(() => {
  //   return () => {
  //     if (authRef.current) {
  //       console.log("Disposed Auth instance on unmount");
  //       authRef.current.dispose();
  //       authRef.current = null;
  //     }
  //   };
  // }, []);

  const auth: Auth = useMemo(() => {
    if (authRef.current) {
      console.log("Disposing previous Auth instance");
      authRef.current.dispose();
    }

    const newAuth = new Auth({
      ...config,
      onTokenExpiration: () => setIsLoggedIn(false),
    });

    console.log("Created new Auth instance");

    authRef.current = newAuth;

    return newAuth;
  }, [config]);

  // const auth = new Auth({
  //   ...config,
  //   onTokenExpiration: () => setIsLoggedIn(false),
  // });

  const [isLoggedIn, setIsLoggedIn] = useState(auth.isLoggedIn);

  const { startLogin, startRegister, startLogout, manageAccount } =
    useRedirecting(auth);

  const { userInfo, isFetchingUserInfo, error, fetchUserInfo } =
    useUserInfo<UserInfo>(auth, config.shouldAutoFetchUserInfo ?? true);
  
  const { sendInvitation } = useInvitation(auth);

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
