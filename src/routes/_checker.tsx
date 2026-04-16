import { createFileRoute, redirect } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { StoreContext } from "@/lib/store-context";
import { requireRole } from "./-guards/requireRole";

export const Route = createFileRoute("/_checker")({
  beforeLoad: () => {
    requireRole(["checker"]);
    if (!StoreContext.getStoreId()) {
      throw redirect({ to: "/select-store" });
    }
  },
  component: MainLayout,
});
