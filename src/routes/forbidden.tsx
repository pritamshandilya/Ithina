import { Link, createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { requireAuth } from "@/routes/-guards/requireAuth";
import type { BeforeLoadArgs } from "@/routes/__root";

export const Route = createFileRoute("/forbidden")({
  beforeLoad: ({ context, location }: BeforeLoadArgs) => {
    requireAuth(context, location);
  },
  component: ForbiddenPage,
});

function ForbiddenPage() {
  return (
    <div className="bg-primary flex min-h-screen items-center justify-center p-6">
      <div className="border-border bg-card w-full max-w-md rounded-xl border p-6 text-center">
        <h1 className="text-foreground text-xl font-semibold">Access denied</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          You do not have permission to view this page.
        </p>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
