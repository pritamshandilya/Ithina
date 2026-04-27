import { createFileRoute } from "@tanstack/react-router";

import UserProfilePage from "@/features/user-profile";

export const Route = createFileRoute("/_checker/checker/profile")({
  component: UserProfilePage,
});
