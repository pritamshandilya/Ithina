import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import type { BeforeLoadArgs } from "@/routes/__root";
import { requireAuth } from "@/routes/-guards/requireAuth";

export const Route = createFileRoute("/forbidden")({
  beforeLoad: ({ context, location }: BeforeLoadArgs) => {
    requireAuth(context, location);
  },
  component: ForbiddenPage,
});

function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
        <h1 className="text-xl font-semibold text-foreground">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have permission to view this page.
        </p>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
