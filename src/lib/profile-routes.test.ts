import { profilePathForRole } from "./profile-routes";

describe("profilePathForRole", () => {
  it("should return admin profile path for admins", () => {
    expect(profilePathForRole("admin")).toBe("/admin/profile");
  });

  it("should return checker profile path for checkers", () => {
    expect(profilePathForRole("checker")).toBe("/checker/profile");
  });

  it("should default to maker profile path", () => {
    expect(profilePathForRole("maker")).toBe("/maker/profile");
    expect(profilePathForRole("unknown")).toBe("/maker/profile");
  });
});
