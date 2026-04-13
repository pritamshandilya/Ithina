/** Role-scoped profile URL (sidebar footer / account menu). */
export function profilePathForRole(role: string): "/maker/profile" | "/checker/profile" | "/admin/profile" {
  switch (role) {
    case "admin":
      return "/admin/profile";
    case "checker":
      return "/checker/profile";
    case "maker":
    default:
      return "/maker/profile";
  }
}
