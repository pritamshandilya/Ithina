import { redirect } from "@tanstack/react-router";

import { requireAuth } from "./requireAuth";
import { hasStoreScope } from "@/lib/auth/authorization";
import type { AppRouterContext } from "@/routes/__root";

export function requireStoreScope(context: AppRouterContext, storeId: string) {
  const user = requireAuth(context);

  if (!hasStoreScope(user, storeId)) {
    throw redirect({ to: "/forbidden" });
  }

  return user;
}
