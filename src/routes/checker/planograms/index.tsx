import { createFileRoute } from "@tanstack/react-router";

import { PlanogramsLibraryPage } from "@/components/planogram/PlanogramsLibraryPage";

export const Route = createFileRoute("/checker/planograms/")({
  component: PlanogramsLibraryPage,
  meta: {
    layoutMode: "stickyTable",
  },
});
