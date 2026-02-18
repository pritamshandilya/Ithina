// Components and Layout
import MainLayout from "@/components/layouts/main";
import { MetricCard } from "@/components/maker/shelf-editor/MetricCard";
import { ProductVisual } from "@/components/maker/shelf-editor/ProductVisual";
import { CategoryLegend } from "@/components/maker/shelf-editor/CategoryLegend";
import { StockingRules } from "@/components/maker/shelf-editor/StockingRules";
import { RemovedItemsSidebar } from "@/components/maker/shelf-editor/RemovedItemsSidebar";
import { ProductDataTable } from "@/components/maker/shelf-editor/ProductDataTable";

// UI Shadcn
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Hooks & state
import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "@/hooks/use-toast";

// Utils & Data
import planogramData from "@/lib/constants/planogram.json";
import { cn } from "@/lib/utils";
import { ArrowLeft, Download, Plus, X, MousePointer2 } from "lucide-react";

export const Route = createFileRoute("/maker/shelves/$shelfId/edit")({
    component: EditShelfPage,
});

// TYPES
interface Product {
    sku: string;
    name: string;
    brand: string;
    category: string;
    facings: number;
    width: number;
    height: number;
    depth: number;
    depthCount: number;
    optimalStock: number;
    currentStock: number;
}

interface ShelfLevel {
    shelfNumber: number;
    name: string;
    products: Product[];
    verticalPosition?: number;
    height?: number;
}

// COLORS
const CATEGORY_COLORS: Record<string, string> = {
    "Aperitif Snacks": "bg-pink-600",
    "Chips": "bg-yellow-500",
    "Snacks": "bg-orange-500",
    "Kids Cereal": "bg-orange-500",
    "Coffee": "bg-orange-600",
    "Baby Care": "bg-pink-500",
    "First Aid": "bg-red-500",
    "Grooming": "bg-cyan-500",
};

const getCategoryBgColor = (category: string) => CATEGORY_COLORS[category] || "bg-slate-500";

// PAGE COMPONENT
export default function EditShelfPage() {
    const { planogram } = planogramData;
    const { fixture, stockingRules: rulesData } = planogram;

    const isHighDemand = (sku: string) => rulesData.highDemandProducts.includes(sku);

    const [levels, setLevels] = useState<ShelfLevel[]>(
        fixture.shelves.map((s) => ({
            shelfNumber: s.shelfNumber,
            name: s.name,
            verticalPosition: s.verticalPosition,
            height: s.height,
            products: s.products.map((p) => ({
                ...p,
                width: p.width || 0,
                height: p.height || 0,
                depthCount: (p as any).depthCount || 1,
                optimalStock: p.optimalStock || 0,
                currentStock: p.currentStock || 0,
            })),
        }))
    );

    const [removedItems, setRemovedItems] = useState<Product[]>([]);

    // Metric Calculations
    const totalShelves = levels.length;
    const totalSKUs = levels.reduce((acc, level) => acc + level.products.length, 0);
    const totalFacings = levels.reduce((acc, level) => acc + level.products.reduce((sum, p) => sum + p.facings, 0), 0);
    const totalUnits = levels.reduce((acc, level) => acc + level.products.reduce((sum, p) => sum + p.facings * p.depthCount, 0), 0);
    const categoriesCount = new Set(levels.flatMap(l => l.products.map(p => p.category))).size;
    const highDemandCount = levels.reduce((acc, level) =>
        acc + level.products.filter(p => isHighDemand(p.sku)).length,
        0);

    // HANDLERS
    const handleRemoveProduct = (levelIndex: number, productIndex: number) => {
        const newLevels = [...levels];
        const [removed] = newLevels[levelIndex].products.splice(productIndex, 1);
        setLevels(newLevels);
        setRemovedItems((prev) => [...prev, removed]);
    };

    const handleMoveProduct = (fromLevelIdx: number, prodIdx: number, toLevelIdx: number) => {
        if (fromLevelIdx === toLevelIdx) return;
        const newLevels = [...levels];
        const [moved] = newLevels[fromLevelIdx].products.splice(prodIdx, 1);
        newLevels[toLevelIdx].products.push(moved);
        setLevels(newLevels);
        toast({ title: "Item Moved", description: `${moved.name} moved to shelf ${newLevels[toLevelIdx].shelfNumber}` });
    };

    const handleRestoreProduct = (removedIdx: number, targetLevelIdx: number) => {
        const newRemoved = [...removedItems];
        const [restored] = newRemoved.splice(removedIdx, 1);
        setRemovedItems(newRemoved);
        const newLevels = [...levels];
        newLevels[targetLevelIdx].products.push(restored);
        setLevels(newLevels);
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#0a0f1d] text-slate-100 font-sans p-4 sm:p-6 lg:p-8 selection:bg-accent/30">
                <div className="mx-auto max-w-7xl flex flex-col">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" asChild className="size-8 text-slate-400 hover:text-white hover:bg-slate-800">
                                <Link to="/maker/shelves"><ArrowLeft className="size-4" /></Link>
                            </Button>
                            <h1 className="text-3xl font-black tracking-tighter text-white">
                                r-shelf
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-11">
                            v1.0 • POC Demo Store • active
                        </p>
                    </div>
                    <Button className="bg-[#1e293b] hover:bg-[#334155] text-slate-200 font-bold px-5 text-xs rounded-lg border border-slate-700 shadow-xl">
                        <Download className="mr-2 size-3.5" /> Export JSON
                    </Button>
                </div>

                {/* Top Metrics Bar */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                    <MetricCard label="Shelves" value={totalShelves} />
                    <MetricCard label="SKUs" value={totalSKUs} />
                    <MetricCard label="Front Facings" value={totalFacings} />
                    <MetricCard label="Total Units (w/ depth)" value={totalUnits} color="text-cyan-400" />
                    <MetricCard label="Categories" value={categoriesCount} />
                    <MetricCard label="Removed" value={removedItems.length} color="text-orange-500" />
                </div>

                {/* Main Editor Canvas Container */}
                <div className="flex flex-col lg:flex-row gap-8 items-start flex-1 min-h-0">
                    {/* Left Section: Visualizer */}
                    <div className="flex-1 w-full space-y-4 flex flex-col h-full min-h-0">
                        {/* Sub Header / Info Bar */}
                        <div className="flex-shrink-0 flex items-center justify-between bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-500 uppercase font-black tracking-widest shadow-lg">
                            <div className="flex gap-6 items-center">
                                <span className="flex items-center gap-2">
                                    <div className="size-1.5 rounded-full bg-slate-700" />
                                    Fixture: {fixture.width}*{fixture.height}*{fixture.depth}mm • {fixture.type.replace('_', ' ')}
                                </span>
                                <span className="opacity-40 tracking-tighter normal-case font-medium">Click name to edit • X to remove</span>
                            </div>
                            <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 px-2 py-1 rounded text-yellow-500 text-[9px]">
                                <MousePointer2 className="size-2.5" />
                                {highDemandCount} High Demand SKUs Highlighted
                            </div>
                        </div>

                        {/* Shelf Levels Canvas */}
                        <div className="flex-1 overflow-y-auto space-y-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 min-h-[600px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                            {levels.map((level, lvlIdx) => (
                                <div key={level.shelfNumber} className="group/level relative bg-slate-900/20 rounded-xl border border-slate-800/30 p-2">
                                    {/* Shelf Header Meta */}
                                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2 px-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-slate-300 tracking-widest">SHELF {level.shelfNumber}</span>
                                            <span className="text-slate-600 font-bold uppercase">{level.name}</span>
                                        </div>
                                        <div className="font-bold tracking-tighter">
                                            {level.products.length} Items • {level.products.reduce((acc, p) => acc + p.facings, 0)}/{fixture.width / 120} facings • <span className="text-cyan-400">{level.products.reduce((acc, p) => acc + p.facings * p.depth, 0)} total units</span>
                                        </div>
                                    </div>

                                    {/* Shelf Visualization Area */}
                                    <div className="h-64 bg-slate-900/50 border-b-8 border-slate-800/80 rounded-t-xl relative flex items-end px-8 w-full overflow-hidden shadow-inner group-hover/level:bg-slate-900/70 transition-colors">
                                        <div className="flex items-end justify-between w-full h-full pb-0 relative">
                                            {level.products.length === 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em]">
                                                    Empty Shelf Segment
                                                </div>
                                            )}

                                            {level.products.map((product, pIdx) => {
                                                const facingsArray = Array.from({ length: product.facings || 1 });
                                                const isHigh = isHighDemand(product.sku);

                                                return (
                                                    <div
                                                        key={`${product.sku}-${pIdx}`}
                                                        className="flex flex-1 justify-center relative group/product min-w-0 pt-10 pb-2 px-1 transition-all duration-300 hover:bg-white/5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:ring-1 hover:ring-white/10 rounded-xl"
                                                    >
                                                        {/* High Demand Tag */}
                                                        {isHigh && (
                                                            <div className="absolute top-2 right-11 z-30 bg-yellow-400 text-black text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-widest ring-1 ring-yellow-500/20">
                                                                High Demand
                                                            </div>
                                                        )}

                                                        {/* Action: Remove */}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleRemoveProduct(lvlIdx, pIdx); }}
                                                            className="absolute top-2 right-2 z-30 bg-red-600 hover:bg-red-500 text-white rounded-full p-1.5 shadow-xl opacity-0 group-hover/product:opacity-100 transition-all scale-75 hover:scale-100 active:scale-90"
                                                        >
                                                            <X className="size-3.5" />
                                                        </button>

                                                        {/* Individual Facings Render */}
                                                        <div className="flex items-end justify-center w-full gap-1 h-full max-w-full">
                                                            {facingsArray.map((_, fIdx) => (
                                                                <DropdownMenu key={`${product.sku}-${pIdx}-${fIdx}`}>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <div className="flex-1 max-w-[4rem] h-32 cursor-pointer transition-transform hover:-translate-y-1">
                                                                            <ProductVisual
                                                                                category={product.category}
                                                                                isHighDemand={isHigh}
                                                                            />
                                                                        </div>
                                                                    </DropdownMenuTrigger>

                                                                    <DropdownMenuContent className="w-56 bg-[#0f172a] border-slate-800 text-slate-200 font-sans shadow-2xl">
                                                                        <div className="p-3">
                                                                            <div className="font-black text-[11px] uppercase tracking-tight text-white mb-0.5">{product.name}</div>
                                                                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Facing {fIdx + 1} of {product.facings}</div>
                                                                        </div>
                                                                        <DropdownMenuSeparator className="bg-slate-800" />
                                                                        <DropdownMenuLabel className="text-[9px] text-slate-500 uppercase tracking-widest px-3 py-1.5">Shift Selection to...</DropdownMenuLabel>
                                                                        <div className="grid grid-cols-2 gap-1.5 p-2 pt-0">
                                                                            {levels.map((l, i) => (
                                                                                <DropdownMenuItem
                                                                                    key={l.shelfNumber}
                                                                                    disabled={i === lvlIdx}
                                                                                    onClick={() => handleMoveProduct(lvlIdx, pIdx, i)}
                                                                                    className="text-[10px] font-bold justify-center rounded-md border border-slate-800 focus:bg-slate-800 focus:text-white"
                                                                                >
                                                                                    Shelf {l.shelfNumber}
                                                                                </DropdownMenuItem>
                                                                            ))}
                                                                        </div>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            ))}
                                                        </div>

                                                        {/* Centered Group Label (Overlay) - Always Visible */}
                                                        <div className="absolute bottom-36 z-20 flex flex-col items-center w-[300px] pointer-events-none transition-all duration-300">
                                                            <div className="h-4 w-px bg-white/20 mb-1 opacity-20" />
                                                            <div className="text-[10px] font-black text-center leading-tight drop-shadow-2xl text-white px-2 line-clamp-1 uppercase tracking-tighter">
                                                                {product.name}
                                                            </div>
                                                            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                                                {product.category}
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-1.5 shadow-2xl">
                                                                <div className="flex items-center text-[8px] font-black rounded-sm overflow-hidden border border-white/10">
                                                                    <span className={cn("px-1.5 py-0.5 text-white shadow-sm", getCategoryBgColor(product.category))}>x{product.facings}</span>
                                                                    <span className="px-1.5 py-0.5 text-slate-300 bg-slate-800">D{product.depthCount}</span>
                                                                </div>
                                                                <div className="bg-slate-900/90 text-[8px] font-black px-1.5 py-0.5 rounded-sm text-cyan-400 border border-cyan-500/30">
                                                                    ={product.facings * product.depthCount}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Action: Add Shelf Area */}
                            <button className="w-full h-12 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-slate-400 hover:bg-slate-900/40 hover:border-slate-700 transition-all">
                                <Plus className="mr-3 size-4" /> Add Shelf
                            </button>

                            <CategoryLegend categories={CATEGORY_COLORS} />
                        </div>
                    </div>

                    <RemovedItemsSidebar
                        items={removedItems}
                        shelves={levels}
                        onRestore={handleRestoreProduct}
                    />
                </div>

                <StockingRules rules={rulesData} />
                <ProductDataTable products={levels.reduce((acc: any[], l) => [
                    ...acc,
                    ...l.products.map(p => ({ ...p, shelfNumber: l.shelfNumber }))
                ], [])} />
                </div>
            </div>
        </MainLayout>
    );
}
