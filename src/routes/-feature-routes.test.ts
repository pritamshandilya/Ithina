jest.mock("@tanstack/react-router", () => ({
  createFileRoute: (path: string) => (config: object) => ({ path, ...config }),
}));

jest.mock("@/lib/admin-route-guards", () => ({
  assertAdminStoreRoute: jest.fn(),
}));

jest.mock("@/features/wizard", () => ({ __esModule: true, default: function Wizard() {} }));
jest.mock("@/features/approval", () => ({ __esModule: true, default: function Approval() {} }));
jest.mock("@/features/campaigns/campaigns-tabulator", () => ({ __esModule: true, default: function Campaigns() {} }));
jest.mock("@/features/fleet", () => ({ __esModule: true, default: function Fleet() {} }));
jest.mock("@/features/templates", () => ({ __esModule: true, default: function Templates() {} }));
jest.mock("@/features/dashboard", () => ({ __esModule: true, default: function Dashboard() {} }));
jest.mock("@/features/admin-dashboard", () => ({ __esModule: true, default: function AdminDashboard() {} }));
jest.mock("@/features/admin-users", () => ({ __esModule: true, default: function AdminUsers() {} }));
jest.mock("@/features/admin-stores", () => ({ __esModule: true, default: function AdminStores() {} }));
jest.mock("@/features/store-settings", () => ({ __esModule: true, default: function StoreSettings() {} }));

import { Route as AuthDashboardRoute } from "./_authenticated/dashboard";
import { Route as AuthWizardRoute } from "./_authenticated/wizard";
import { Route as CheckerApprovalsRoute } from "./_checker/checker/approvals";
import { Route as MakerCampaignsRoute } from "./_maker/maker/campaigns";
import { Route as MakerFleetRoute } from "./_maker/maker/fleet";
import { Route as MakerTemplatesRoute } from "./_maker/maker/templates";
import { Route as AdminDashboardRoute } from "./_admin/admin/dashboard";
import { Route as AdminUsersRoute } from "./_admin/admin/users";
import { Route as AdminStoresRoute } from "./_admin/admin/stores/index";
import { Route as StoreSettingsRoute } from "./_authenticated/store-settings";

describe("feature route modules", () => {
  it("should register authenticated feature routes with their paths", () => {
    expect(AuthDashboardRoute.path).toBe("/_authenticated/dashboard");
    expect(AuthWizardRoute.path).toBe("/_authenticated/wizard");
    expect(StoreSettingsRoute.path).toBe("/_authenticated/store-settings");
  });

  it("should register maker and checker feature routes with their paths", () => {
    expect(MakerCampaignsRoute.path).toBe("/_maker/maker/campaigns");
    expect(MakerFleetRoute.path).toBe("/_maker/maker/fleet");
    expect(MakerTemplatesRoute.path).toBe("/_maker/maker/templates");
    expect(CheckerApprovalsRoute.path).toBe("/_checker/checker/approvals");
  });

  it("should register admin feature routes with their paths", () => {
    expect(AdminDashboardRoute.path).toBe("/_admin/admin/dashboard");
    expect(AdminUsersRoute.path).toBe("/_admin/admin/users");
    expect(AdminStoresRoute.path).toBe("/_admin/admin/stores/");
  });
});
