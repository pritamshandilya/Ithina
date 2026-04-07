import { createFileRoute } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { requireRole } from "./-guards/requireRole";

export const Route = createFileRoute("/_checker")({
  beforeLoad: () => {
    requireRole(["checker"]);
  },
  component: MainLayout,
});
