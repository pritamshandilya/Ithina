import { Trash2, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export function RemovedItemsSidebar({ items, shelves, onRestore }: RemovedItemsSidebarProps) {
    return (
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4 flex flex-col h-full min-h-0">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-full min-h-[500px] shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Removed Items</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-slate-400">
                        {items.length}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center space-y-3 opacity-30">
                            <Trash2 className="size-10 text-slate-600" />
                            <p className="text-[10px] font-medium text-slate-500 leading-relaxed px-4">
                                No removed items. Hover a product and click X to remove it here.
                            </p>
                        </div>
                    ) : (
                        items.map((item, idx) => (
                            <div key={`${item.sku}-${idx}`} className="group relative bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-xl p-3 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                                        <div className="size-6 bg-pink-500 rounded-sm opacity-60" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[11px] font-black text-slate-200 truncate uppercase tracking-tight">{item.name}</div>
                                        <div className="text-[9px] text-slate-500 font-bold truncate tracking-tighter">{item.brand} • x{item.facings}, D{item.depth} = {item.facings * item.depth}</div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-7 rounded-lg hover:bg-emerald-500/20 hover:text-emerald-400">
                                                <Plus className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 text-slate-200">
                                            <DropdownMenuLabel className="text-[10px] text-slate-400 uppercase tracking-widest">Restore to...</DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-slate-800" />
                                            {shelves.map((shelf, shelfIdx) => (
                                                <DropdownMenuItem
                                                    key={shelf.shelfNumber}
                                                    onClick={() => onRestore(idx, shelfIdx)}
                                                    className="text-xs focus:bg-slate-800 focus:text-white cursor-pointer"
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

                <div className="mt-6 p-4 bg-slate-900 rounded-xl border border-blue-500/10 flex items-start gap-3">
                    <Info className="size-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed text-slate-400">
                        Click <span className="text-white font-bold">+</span> to restore items back to a specific shelf level.
                    </p>
                </div>
            </div>
        </div>
    );
}
