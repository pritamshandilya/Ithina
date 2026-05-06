import planogramData from "@/lib/constants/planogram.json";
import {
  getShelfDisplayLabel,
  sortPlanogramShelves,
} from "@/lib/planogram/planogramSchema";
import { cn } from "@/lib/utils";
import { usePlanogramById } from "@/queries/maker";
import type { PlanogramPayload, PlanogramShelfDef } from "@/types/planogram";

interface PlanogramPreviewProps {
  planogramId?: string;
  className?: string;
}

export function PlanogramPreview({
  planogramId,
  className,
}: PlanogramPreviewProps) {
  const { data } = usePlanogramById(planogramId ?? null);
  const payload = data ?? (planogramData as PlanogramPayload);
  const shelves = sortPlanogramShelves(payload.shelves);

  if (!planogramId) return null;
  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-top-2 mt-4 duration-300",
        className,
      )}
    >
      <div className="border-border/50 bg-card/40 space-y-5 rounded-xl border p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
          Planogram Preview
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Shelves
            </h4>
            <p className="text-foreground text-xl font-bold">
              {shelves.length}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Products
            </h4>
            <p className="text-foreground text-xl font-bold">
              {shelves.reduce((sum, shelf) => sum + shelf.products.length, 0)}
            </p>
          </div>

          <div className="col-span-1 space-y-1">
            <h4 className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Dimensions
            </h4>
            <div className="flex items-baseline gap-0.5">
              <span className="text-foreground text-xl font-bold">
                {payload.fixture.width}
              </span>
              <span className="text-muted-foreground text-sm">x</span>
              <span className="text-foreground text-xl font-bold">
                {payload.fixture.height}
              </span>
              <span className="text-muted-foreground ml-1 text-xs">
                {payload.fixture.depth}
              </span>
            </div>
          </div>
          <div className="col-span-1 space-y-1">
            <h4 className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Description
            </h4>
            <p
              className="text-foreground truncate text-sm font-semibold"
              title={payload.description ?? ""}
            >
              {payload.description ?? "—"}
            </p>
          </div>
        </div>

        <div className="bg-border/40 h-px w-full" />

        <div className="space-y-3">
          <h4 className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
            Shelf Breakdown
          </h4>
          <div className="space-y-2.5">
            {shelves.map((shelf: PlanogramShelfDef) => (
              <div
                key={shelf.id}
                className="group hover:bg-accent/50 -mx-1.5 flex items-center justify-between rounded-md p-1.5 text-sm transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <span className="text-foreground truncate text-xs font-medium">
                    {getShelfDisplayLabel(shelves, shelf.id)} · {shelf.id}
                  </span>
                </div>
                <span className="text-muted-foreground ml-2 font-mono text-xs whitespace-nowrap">
                  {shelf.products.length} products
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
