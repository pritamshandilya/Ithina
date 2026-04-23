import { cn } from "@/lib/utils";
import planogramData from "@/lib/constants/planogram.json";
import { usePlanogramById } from "@/queries/maker";
import type { PlanogramPayload, PlanogramShelfDef } from "@/types/planogram";
import {
  getShelfDisplayLabel,
  sortPlanogramShelves,
} from "@/lib/planogram/planogram-schema";

interface PlanogramPreviewProps {
  planogramId?: string;
  className?: string;
}

export function PlanogramPreview({ planogramId, className }: PlanogramPreviewProps) {
  const { data } = usePlanogramById(planogramId ?? null);
  const payload = data ?? (planogramData as PlanogramPayload);
  const shelves = sortPlanogramShelves(payload.shelves);

  if (!planogramId) return null;
  return (
    <div className={cn("mt-4 animate-in fade-in slide-in-from-top-2 duration-300", className)}>
      <div className="space-y-5 rounded-xl border border-border/50 bg-card/40 p-4 shadow-sm backdrop-blur-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          Planogram Preview
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Shelves</h4>
            <p className="text-xl font-bold text-foreground">{shelves.length}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Products</h4>
            <p className="text-xl font-bold text-foreground">
              {shelves.reduce((sum, shelf) => sum + shelf.products.length, 0)}
            </p>
          </div>

          <div className="col-span-1 space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dimensions</h4>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold text-foreground">{payload.fixture.width}</span>
              <span className="text-sm text-muted-foreground">x</span>
              <span className="text-xl font-bold text-foreground">{payload.fixture.height}</span>
              <span className="ml-1 text-xs text-muted-foreground">{payload.fixture.depth}</span>
            </div>
          </div>
          <div className="col-span-1 space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</h4>
            <p className="truncate text-sm font-semibold text-foreground" title={payload.description ?? ""}>
              {payload.description ?? "—"}
            </p>
          </div>
        </div>

        <div className="h-px w-full bg-border/40" />

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Shelf Breakdown</h4>
          <div className="space-y-2.5">
            {shelves.map((shelf: PlanogramShelfDef) => (
              <div key={shelf.id} className="group -mx-1.5 flex items-center justify-between rounded-md p-1.5 text-sm transition-colors hover:bg-accent/50">
                <div className="min-w-0 pr-2">
                  <span className="truncate text-xs font-medium text-foreground">
                    {getShelfDisplayLabel(shelves, shelf.id)} · {shelf.id}
                  </span>
                </div>
                <span className="ml-2 whitespace-nowrap text-xs font-mono text-muted-foreground">
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
