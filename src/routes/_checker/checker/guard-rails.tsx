import { createFileRoute } from "@tanstack/react-router";

import Admin from "@/features/admin";

export const Route = createFileRoute("/_checker/checker/guard-rails")({
  component: Admin,
});
