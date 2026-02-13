import { Link, createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-4xl font-bold tracking-tight">
        Planogram Assistant Wireframe
      </h1>
      <div className="flex items-center gap-3">
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link to="/login">Login</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-border bg-card text-card-foreground hover:bg-accent/40 hover:text-accent-foreground"
        >
          <Link to="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
