import { requireRole } from "./requireRole";

const mockRedirect = jest.fn((args: { to: string }) => ({ redirect: args.to }));
const mockGetCurrentUser = jest.fn();

jest.mock("@tanstack/react-router", () => ({
  redirect: (args: { to: string }) => mockRedirect(args),
}));

jest.mock("@/lib/auth/promo-auth", () => ({
  PromoAuthService: {
    getCurrentUser: () => mockGetCurrentUser(),
  },
  getDashboardUrlForRole: (role: string) => `/${role}/dashboard`,
}));

describe("requireRole", () => {
  beforeEach(() => {
    mockRedirect.mockClear();
    mockGetCurrentUser.mockReset();
  });

  function expectRedirect(action: () => void, to: string) {
    try {
      action();
      throw new Error("Expected redirect");
    } catch (error) {
      expect(error).toEqual({ redirect: to });
    }
  }

  it("should redirect unauthenticated users to login", () => {
    mockGetCurrentUser.mockReturnValue(null);

    expectRedirect(() => requireRole(["admin"]), "/login");
    expect(mockRedirect).toHaveBeenCalledWith({ to: "/login" });
  });

  it("should allow users with an allowed role", () => {
    mockGetCurrentUser.mockReturnValue({ role: "checker" });

    expect(() => requireRole(["checker", "admin"])).not.toThrow();
  });

  it("should redirect users with the wrong role to their dashboard", () => {
    mockGetCurrentUser.mockReturnValue({ role: "maker" });

    expectRedirect(() => requireRole(["admin"]), "/maker/dashboard");
    expect(mockRedirect).toHaveBeenCalledWith({ to: "/maker/dashboard" });
  });
});
