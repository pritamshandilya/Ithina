import { LayoutGrid } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function PlanogramMakerEmptyState() {
  return (
    <div className="border-border bg-card/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
      <div className="bg-muted mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
        <LayoutGrid
          className="text-muted-foreground h-7 w-7"
          aria-hidden
        />
      </div>
      <h3 className="text-foreground text-lg font-semibold">
        No Display Units yet
      </h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        Add Display Units to run planogram-based compliance analysis.
      </p>
      <Button asChild variant="success" className="mt-6">
        <Link
          to="/maker/audits/planogram/new"
          search={{ fixtureId: undefined }}
        >
          <Plus className="size-4" aria-hidden />
          Add POG Analysis
        </Link>
      </Button>
    </div>
  );
}
