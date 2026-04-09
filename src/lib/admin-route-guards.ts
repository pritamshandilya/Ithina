import { redirect } from "@tanstack/react-router";

import { PromoAuthService } from "@/lib/auth/promo-auth";
import { StoreContext } from "@/lib/store-context";

/**
 * Org-level admin routes: redirect to store hub if a store is already selected.
 */
export function assertAdminOrgRoute(): void {
  if (typeof window === "undefined") return;
  if (PromoAuthService.getCurrentUser()?.role !== "admin") return;
  if (StoreContext.getStoreId()) {
    throw redirect({ to: "/admin/campaigns", replace: true });
  }
}

/**
 * Store-scoped admin routes: require a selected store (use org dashboard otherwise).
 */
export function assertAdminStoreRoute(): void {
  if (typeof window === "undefined") return;
  if (PromoAuthService.getCurrentUser()?.role !== "admin") return;
  if (!StoreContext.getStoreId()) {
    throw redirect({ to: "/admin/dashboard", replace: true });
  }
}
