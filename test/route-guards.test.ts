import assert from "node:assert/strict";
import test from "node:test";

import { requireAuth } from "../src/routes/-guards/requireAuth";
import { requirePermission } from "../src/routes/-guards/requirePermission";
import { requireStoreScope } from "../src/routes/-guards/requireStoreScope";
import type { AuthSessionUser } from "../src/lib/auth/session";
import type { AppRouterContext } from "../src/routes/__root";

function makeUser(overrides: Partial<AuthSessionUser> = {}): AuthSessionUser {
  return {
    id: "u-1",
    email: "user@example.com",
    firstName: "Test",
    lastName: "User",
    role: "maker",
    organization: { id: "org-1", name: "Org 1" },
    isActive: true,
    ...overrides,
  };
}

function makeContext(user: AuthSessionUser | null): AppRouterContext {
  return {
    queryClient: {} as AppRouterContext["queryClient"],
    auth: {
      status: "ready",
      isAuthenticated: !!user,
      user,
      ready: () => Promise.resolve(),
    },
  };
}

test("requireAuth throws redirect for unauthenticated requests", () => {
  const context = makeContext(null);

  assert.throws(
    () => requireAuth(context, { href: "/stores" }),
    (error: unknown) => {
      const redirectError = error as { options?: { to?: string } };
      return redirectError.options?.to === "/login";
    },
  );
});

test("requirePermission throws redirect when permission is missing", () => {
  const context = makeContext(makeUser({ role: "maker" }));

  assert.throws(
    () => requirePermission(context, "users:manage"),
    (error: unknown) => {
      const redirectError = error as { options?: { to?: string } };
      return redirectError.options?.to === "/forbidden";
    },
  );
});

test("requireStoreScope throws redirect when user lacks store access", () => {
  const context = makeContext(makeUser({ storeIds: ["store-1"] }));

  assert.throws(
    () => requireStoreScope(context, "store-2"),
    (error: unknown) => {
      const redirectError = error as { options?: { to?: string } };
      return redirectError.options?.to === "/forbidden";
    },
  );
});
