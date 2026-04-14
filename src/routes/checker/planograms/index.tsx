import { createFileRoute } from "@tanstack/react-router";

import { PlanogramsLibraryPage } from "@/features/planogram-library/planograms-library-page";

export const Route = createFileRoute("/checker/planograms/")({
  component: PlanogramsLibraryPage,
  meta: {
    layoutMode: "stickyTable",
  },
});
