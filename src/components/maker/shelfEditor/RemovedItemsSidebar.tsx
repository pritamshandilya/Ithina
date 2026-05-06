import { Info, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

interface RemovedItemsSidebarProps {
  items: Array<{
    sku: string;
    name: string;
    brand?: string;
    facings: number;
    depth: number;
  }>;
  shelves: Array<{
    shelfNumber: number;
    name: string;
  }>;
  onRestore: (removedIdx: number, targetLevelIdx: number) => void;
}

export function RemovedItemsSidebar({
  items,
  shelves,
  onRestore,
}: RemovedItemsSidebarProps) {
  return (
    <div className="flex h-full min-h-0 w-full flex-shrink-0 flex-col space-y-4 lg:w-80">
      <div className="flex h-full min-h-[500px] flex-col rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xs font-black tracking-widest text-white uppercase">
            Removed Items
          </h3>
          <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
            {items.length}
          </span>
        </div>

        <div className="scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent flex-1 space-y-3 overflow-y-auto pr-2">
          {items.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center space-y-3 text-center opacity-30">
              <Trash2 className="size-10 text-slate-600" />
              <p className="px-4 text-[10px] leading-relaxed font-medium text-slate-500">
                No removed items. Hover a product and click X to remove it here.
              </p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={`${item.sku}-${idx}`}
                className="group relative rounded-xl border border-slate-800 bg-slate-900/50 p-3 transition-all hover:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
                    <div className="size-6 rounded-sm bg-pink-500 opacity-60" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-black tracking-tight text-slate-200 uppercase">
                      {item.name}
                    </div>
                    <div className="truncate text-[9px] font-bold tracking-tighter text-slate-500">
                      {item.brand} • x{item.facings}, D{item.depth} ={" "}
                      {item.facings * item.depth}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg hover:bg-emerald-500/20 hover:text-emerald-400"
                      >
                        <Plus className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 border-slate-800 bg-slate-900 text-slate-200">
                      <DropdownMenuLabel className="text-[10px] tracking-widest text-slate-400 uppercase">
                        Restore to...
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-800" />
                      {shelves.map((shelf, shelfIdx) => (
                        <DropdownMenuItem
                          key={shelf.shelfNumber}
                          onClick={() => onRestore(idx, shelfIdx)}
                          className="cursor-pointer text-xs focus:bg-slate-800 focus:text-white"
                        >
                          Shelf {shelf.shelfNumber} - {shelf.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-500/10 bg-slate-900 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-blue-400" />
          <p className="text-[10px] leading-relaxed text-slate-400">
            Click <span className="font-bold text-white">+</span> to restore
            items back to a specific shelf level.
          </p>
        </div>
      </div>
    </div>
  );
}
