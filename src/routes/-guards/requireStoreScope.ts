import { redirect } from "@tanstack/react-router";

import { hasStoreScope } from "@/auth/authorization";
import type { AppRouterContext } from "@/routes/__root";

import { requireAuth } from "./requireAuth";

export function requireStoreScope(context: AppRouterContext, storeId: string) {
  const user = requireAuth(context);

  if (!hasStoreScope(user, storeId)) {
    throw redirect({ to: "/forbidden" });
  }

  return user;
}
