import { cn } from "@/lib/utils";
import planogramData from "@/lib/constants/planogram.json";
import { fetchPlanogramById } from "@/features/maker/api/planogram";

interface PlanogramPreviewProps {
  planogramId?: string;
  className?: string;
}

export function PlanogramPreview({ planogramId, className }: PlanogramPreviewProps) {
  if (!planogramId) return null;

  const { planogram } = fetchPlanogramById(planogramId) || planogramData;
  const { fixture, metadata } = planogram;
  console.log("PlanogramPreview data:", { planogram, fixture, metadata });
  return (
    <div className={cn("mt-4 animate-in fade-in slide-in-from-top-2 duration-300", className)}>
      <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 space-y-5 shadow-sm">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          Planogram Preview
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Shelves</h4>
            <p className="text-xl font-bold text-foreground">{fixture.shelves.length}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Products</h4>
            <p className="text-xl font-bold text-foreground">{productcount}</p>
          </div>
          
          <div className="space-y-1 col-span-1">
             <h4 className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Dimensions</h4>
             <div className="flex items-baseline gap-0.5">
               <span className="text-xl font-bold text-foreground">{fixture.width}</span>
               <span className="text-muted-foreground text-sm">x</span>
               <span className="text-xl font-bold text-foreground">{fixture.height}</span>
               <span className="text-xs text-muted-foreground ml-1">{fixture?.depth}</span>
             </div>
          </div>
           <div className="space-y-1 col-span-1">
             <h4 className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Location</h4>
             <p className="text-sm font-semibold text-foreground truncate" title={metadata.location}>{metadata.location}</p>
          </div>
        </div>

        <div className="h-px bg-border/40 w-full" />

        <div className="space-y-3">
          <h4 className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Shelf Breakdown</h4>
          <div className="space-y-2.5">
            {fixture.shelves.map((shelf) => (
              <div key={shelf.shelfNumber} className="flex items-center justify-between text-sm group hover:bg-accent/50 p-1.5 -mx-1.5 rounded-md transition-colors">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-medium text-foreground truncate text-xs">
                       {shelf.name}
                    </span>
                  </div>
                  <span className="text-muted-foreground whitespace-nowrap text-xs font-mono ml-2">
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
