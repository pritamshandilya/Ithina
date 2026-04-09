import {
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  to?: string;
  hash?: string;
  icon: LucideIcon | typeof LayoutDashboard;
  items?: { label: string; to: string }[];
};

export function isActiveItem(pathname: string, hash: string, item: NavItem): boolean {
  if (item.to === "/dashboard") {
    return (
      pathname === "/dashboard" ||
      pathname.startsWith("/admin/dashboard") ||
      pathname.startsWith("/maker/dashboard") ||
      pathname.startsWith("/checker/dashboard")
    );
  }
  if (item.to === "/stores") {
    return pathname === "/stores" || pathname.startsWith("/admin/stores");
  }
  if (item.to === "/admin/organization-settings") {
    return pathname.startsWith("/admin/organization-settings");
  }
  if (item.to === "/users") {
    return pathname === "/users" || pathname.startsWith("/admin/users");
  }
  if (item.to === "/approvals") {
    return (
      pathname === "/approvals" ||
      pathname.startsWith("/checker/audit-review") ||
      pathname.startsWith("/checker/review/") ||
      pathname.startsWith("/maker/manual-audits")
    );
  }
  if (item.to === "/knowledge-center") {
    return (
      pathname === "/knowledge-center" ||
      pathname.startsWith("/checker/knowledge-center")
    );
  }
  if (item.to === "/checker/audit-review") {
    return (
      pathname === "/checker/audit-review" ||
      pathname.startsWith("/checker/review/")
    );
  }
  if (item.to === "/checker/shelf" || item.to === "/maker/shelf") {
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  }
  if (
    item.to === "/maker/audits" ||
    item.to === "/maker/audits/planogram" ||
    item.to === "/maker/audits/adhoc"
  ) {
    return pathname.startsWith("/maker/audits");
  }
  if (!item.to) return false;
  const sameBase = pathname === item.to || pathname.startsWith(`${item.to}/`);
  if (!sameBase) return false;
  if (!item.hash) return hash.length === 0;
  return hash === `#${item.hash}`;
}

export function isMyAuditsActive(pathname: string): boolean {
  return pathname.startsWith("/maker/audits");
}
