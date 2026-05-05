import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

import { toast } from "@/hooks/use-toast";
import { navigateToLogin } from "@/lib/app-navigation";
import { clearPromoAuthLocalState } from "@/lib/auth/promo-auth";

const AUTH_HANDSHAKE_PATTERNS = ["/auth/login", "/auth/token", "/auth/logout"];

interface RetriableConfig extends InternalAxiosRequestConfig {
  __promoAuthRetried?: boolean;
}

export interface AuthInterceptorOptions {
  /**
   * Optional async callback that attempts to refresh the access token.
   * Return `true` if refresh succeeded (request will be retried once).
   * Return `false` or throw to proceed with session-expired logout.
   */
  tryRefresh?: () => Promise<boolean>;
}

let isLoggingOut = false;

function isAuthHandshakeRequest(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_HANDSHAKE_PATTERNS.some((pattern) => url.includes(pattern));
}

function handleSessionExpired(): void {
  if (isLoggingOut) return;
  isLoggingOut = true;

  toast({
    variant: "destructive",
    title: "Session expired",
    description: "Please log in again.",
  });

  clearPromoAuthLocalState();
  navigateToLogin();

  setTimeout(() => {
    isLoggingOut = false;
  }, 2000);
}

/**
 * Attaches a response interceptor to the given Axios client that handles
 * HTTP 401 globally: clears local auth state, shows a toast, and redirects
 * to `/login`. Auth-handshake endpoints (login/token/logout) are excluded
 * so invalid-credentials errors propagate normally.
 *
 * Usage — no per-call 401 handling needed:
 *
 *   // service layer (src/services/campaigns.ts)
 *   export async function listCampaigns() {
 *     const { data } = await promoApiClient.get("/api/v1/campaigns");
 *     return data;
 *   }
 *
 *   // component
 *   const { data } = useQuery({ queryKey: ["campaigns"], queryFn: listCampaigns });
 *   // 401 → automatic toast + redirect; React Query sees a rejected promise.
 */
export function attachAuthResponseInterceptor(
  client: AxiosInstance,
  options?: AuthInterceptorOptions,
): void {
  client.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;

    if (error.response?.status !== 401 || !config) {
      return Promise.reject(error);
    }

    if (isAuthHandshakeRequest(config.url)) {
      return Promise.reject(error);
    }

    if (options?.tryRefresh && !config.__promoAuthRetried) {
      try {
        const refreshed = await options.tryRefresh();
        if (refreshed) {
          config.__promoAuthRetried = true;
          return client.request(config);
        }
      } catch {
        // Refresh failed — fall through to logout.
      }
    }

    handleSessionExpired();
    return Promise.reject(error);
  });
}
