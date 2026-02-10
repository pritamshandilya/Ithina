import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-4xl font-bold tracking-tight">
        Planogram Assistant Starter Template
      </h1>
      <p className="text-muted-foreground text-center max-w-md">
        A modern React template with TanStack Router, TanStack Query, and Tailwind CSS.
      </p>
    </div>
  );
}
