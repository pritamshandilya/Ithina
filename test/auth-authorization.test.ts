import assert from "node:assert/strict";
import test from "node:test";

import {
  effectivePermissions,
  hasAnyPermission,
  hasPermission,
  hasStoreScope,
} from "../src/auth/authorization";
import type { AuthSessionUser } from "../src/lib/auth/session";

function makeUser(overrides: Partial<AuthSessionUser> = {}): AuthSessionUser {
  return {
    id: "u-1",
    email: "maker@example.com",
    firstName: "Maker",
    lastName: "User",
    role: "maker",
    organization: { id: "org-1", name: "Org 1" },
    isActive: true,
    ...overrides,
  };
}

test("effectivePermissions falls back to role permissions when explicit permissions are missing", () => {
  const user = makeUser({ role: "checker", permissions: undefined });
  const permissions = effectivePermissions(user);

  assert.equal(permissions.has("approvals:review"), true);
  assert.equal(permissions.has("stores:manage"), false);
});

test("explicit permissions override role fallback", () => {
  const user = makeUser({
    role: "maker",
    permissions: ["users:manage"],
  });

  assert.equal(hasPermission(user, "users:manage"), true);
  assert.equal(hasPermission(user, "approvals:submit"), false);
});

test("hasAnyPermission returns true when at least one permission matches", () => {
  const user = makeUser({ role: "checker" });
  const result = hasAnyPermission(user, ["users:manage", "approvals:review"]);
  assert.equal(result, true);
});

test("hasStoreScope enforces store-level visibility when storeIds are present", () => {
  const user = makeUser({ storeIds: ["store-a", "store-b"] });
  assert.equal(hasStoreScope(user, "store-a"), true);
  assert.equal(hasStoreScope(user, "store-c"), false);
});
