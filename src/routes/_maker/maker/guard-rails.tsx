import { createFileRoute } from "@tanstack/react-router";

import Admin from "@/features/admin";

export const Route = createFileRoute("/_maker/maker/guard-rails")({
  component: Admin,
});
