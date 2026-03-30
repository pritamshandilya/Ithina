import { ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import { NAV_ITEMS_FLAT } from "@/constants/navigation";

/**
 * Shared page header rendered once inside <main> for every authenticated route.
 * Derives breadcrumbs and title automatically from NAV_ITEMS_FLAT + current path.
 *
 * Prototype structure:
 *   Ithina  >  {crumbSection}  >  {crumbParent}
 *   {title}
 */
export default function ContentHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const nav = NAV_ITEMS_FLAT.find((item) => item.path === location.pathname);

  // Fallback when the route isn't in NAV_ITEMS_FLAT (e.g. /login)
  if (!nav) return null;

  return (
    <header className="shrink-0 border-b border-ithina-border/50 px-8 py-5">
      {/* Breadcrumb */}
      <nav className="mb-2 flex items-center gap-1.5" aria-label="breadcrumb">
        {/* Root — always "Ithina" */}
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="font-mono text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-white"
        >
          Ithina
        </button>

        <ChevronRight className="size-3 shrink-0 text-slate-700" />

        {/* Section — navigates to section root if there's a leaf segment */}
        <button
          onClick={() => {
            // Navigate to the first item of the same crumbSection
            const root = NAV_ITEMS_FLAT.find(
              (i) => i.crumbSection === nav.crumbSection,
            );
            if (root) navigate({ to: root.path });
          }}
          className="font-mono text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-white"
        >
          {nav.crumbSection}
        </button>

        <ChevronRight className="size-3 shrink-0 text-slate-700" />

        {/* Leaf — current page, always purple, not clickable */}
        <span className="font-mono text-[10px] uppercase tracking-widest text-ithina-purple">
          {nav.crumbParent}
        </span>
      </nav>

      {/* Page title */}
      <h1 className="text-xl font-bold leading-tight tracking-tight text-white">
        {nav.title}
      </h1>
    </header>
  );
}
