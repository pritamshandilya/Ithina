export const ALL_PERMISSIONS = [
  "dashboard:view",
  "stores:read",
  "stores:manage",
  "users:manage",
  "approvals:submit",
  "approvals:review",
  "knowledge-center:view",
  "profile:view",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export type AppRole = "admin" | "maker" | "checker";

export const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  admin: [
    "dashboard:view",
    "stores:read",
    "stores:manage",
    "users:manage",
    "approvals:review",
    "knowledge-center:view",
    "profile:view",
  ],
  maker: [
    "dashboard:view",
    "stores:read",
    "approvals:submit",
    "profile:view",
  ],
  checker: [
    "dashboard:view",
    "stores:read",
    "approvals:review",
    "knowledge-center:view",
    "profile:view",
  ],
};

export function isPermission(value: unknown): value is Permission {
  return (
    typeof value === "string" &&
    (ALL_PERMISSIONS as readonly string[]).includes(value)
  );
}
