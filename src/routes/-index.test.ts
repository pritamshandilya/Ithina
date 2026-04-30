const mockRedirect = jest.fn((args: { to: string }) => ({ redirect: args.to }));
const mockIsAuthenticated = jest.fn();
const mockGetCurrentUser = jest.fn();
const mockGetStoreId = jest.fn();

jest.mock("@tanstack/react-router", () => ({
  createFileRoute: (path: string) => (config: object) => ({ path, ...config }),
  redirect: (args: { to: string }) => mockRedirect(args),
}));

jest.mock("@/lib/auth/promo-auth", () => ({
  PromoAuthService: {
    getCurrentUser: () => mockGetCurrentUser(),
    isAuthenticated: () => mockIsAuthenticated(),
  },
  getDashboardUrlForRole: (role: string) => `/${role}/dashboard`,
}));

jest.mock("@/lib/store-context", () => ({
  StoreContext: {
    getStoreId: () => mockGetStoreId(),
  },
}));

describe("root index route", () => {
  beforeEach(() => {
    jest.resetModules();
    mockRedirect.mockClear();
    mockIsAuthenticated.mockReset();
    mockGetCurrentUser.mockReset();
    mockGetStoreId.mockReset();
  });

  function loadRoute() {
    return require("./index") as { Route: { beforeLoad: () => void } };
  }

  function expectRedirect(action: () => void, to: string) {
    try {
      action();
      throw new Error("Expected redirect");
    } catch (error) {
      expect(error).toEqual({ redirect: to });
    }
  }

  it("should redirect unauthenticated users to login", () => {
    mockIsAuthenticated.mockReturnValue(false);
    const { Route } = loadRoute();

    expectRedirect(() => Route.beforeLoad(), "/login");
  });

  it("should redirect authenticated admins to the admin dashboard", () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockGetCurrentUser.mockReturnValue({ role: "admin" });
    const { Route } = loadRoute();

    expectRedirect(() => Route.beforeLoad(), "/admin/dashboard");
  });

  it("should redirect authenticated makers without a store to store selection", () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockGetCurrentUser.mockReturnValue({ role: "maker" });
    mockGetStoreId.mockReturnValue(null);
    const { Route } = loadRoute();

    expectRedirect(() => Route.beforeLoad(), "/select-store");
  });

  it("should redirect authenticated makers with a store to maker dashboard", () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockGetCurrentUser.mockReturnValue({ role: "maker" });
    mockGetStoreId.mockReturnValue("store-1");
    const { Route } = loadRoute();

    expectRedirect(() => Route.beforeLoad(), "/maker/dashboard");
  });
});
