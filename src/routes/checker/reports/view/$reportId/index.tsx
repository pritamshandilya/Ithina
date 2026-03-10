import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layouts/main";
import { ANALYSIS_REPORT_MOCK_DATA, type DetailedReport } from "@/lib/constants/reports-mock-data";
import {
    Download,
    ArrowLeft,
    Info,
    AlertTriangle,
    BarChart3,
    Package,
    MonitorPlay,
    TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/checker/reports/view/$reportId/")({
    component: DetailedReportPage,
});

export function DetailedReportPage() {
    const data: DetailedReport = ANALYSIS_REPORT_MOCK_DATA;
    const [activeTab, setActiveTab] = useState("compliance");

    const topStats = [
        { label: "Compliance Score", value: `${data.complianceScore}%`, color: "text-destructive", bg: "bg-destructive/10" },
        { label: "Mismatched", value: data.stats.mismatched, color: "text-muted-foreground", bg: "bg-muted/30" },
        { label: "Missing", value: data.stats.missing, color: "text-muted-foreground", bg: "bg-muted/30" },
        { label: "Missing Price", value: data.stats.missingPrice, color: "text-muted-foreground", bg: "bg-muted/30" },
        { label: "Misplaced", value: data.stats.misplaced, color: "text-muted-foreground", bg: "bg-muted/30" },
        { label: "Issues", value: data.stats.issues, color: "text-destructive", bg: "bg-destructive/10" },
        { label: "Total Products", value: data.stats.totalProducts, color: "text-accent", bg: "bg-accent/10" },
        { label: "On Plan", value: data.stats.onPlan, color: "text-accent", bg: "bg-accent/10" },
        { label: "Available", value: data.stats.available, color: "text-accent", bg: "bg-accent/10" },
        { label: "Run", value: data.stats.runs, color: "text-muted-foreground", bg: "bg-muted/30" },
    ];

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#070b14] text-slate-200 font-sans pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
                <div className="mx-auto max-w-screen-2xl flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.history.back()}
                            className="bg-white/5 h-10 w-10 text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 transition-all rounded-xl"
                        >
                            <ArrowLeft className="size-5" />
                        </Button>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black tracking-tight text-white">{data.title}</h1>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
                                <span>Store Analysis</span>
                                <span className="size-1 rounded-full bg-slate-700" />
                                <span>Analysis Score</span>
                                <span className="size-1 rounded-full bg-slate-700" />
                                <span>{data.date}</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="default" size="sm" className="gap-2 bg-accent hover:bg-accent/90 text-white font-bold rounded-lg px-6 h-11 border border-white/10 shadow-[0_0_20px_rgba(var(--accent),0.3)]">
                        <Download className="size-4" />
                        Export PDF
                    </Button>
                </div>

                {/* Top Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
                    {topStats.map((stat, i) => (
                        <div key={i} className={cn("flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 backdrop-blur-md shadow-2xl transition-all hover:scale-[1.02] hover:border-white/10", stat.bg)}>
                            <span className={cn("text-2xl font-black tracking-tighter tabular-nums", stat.color)}>{stat.value}</span>
                            <span className="text-[9px] uppercase font-black text-slate-500 mt-2 text-center leading-tight tracking-widest opacity-80">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 gap-10 mt-2">
                    {[
                        { id: "compliance", label: "Compliance Stats", icon: BarChart3 },
                        { id: "program", label: "Program Analysis", icon: Info },
                        { id: "items", label: "All Items", icon: Package },
                        { id: "issues", label: "All Issues", icon: AlertTriangle },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 pb-5 text-xs font-black uppercase tracking-[0.2em] transition-all relative group",
                                activeTab === tab.id ? "text-accent" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <tab.icon className={cn("size-4", activeTab === tab.id ? "text-accent" : "text-slate-600 group-hover:text-slate-400")} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full shadow-[0_-2px_10px_rgba(var(--accent),0.5)]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {(activeTab === "compliance" || activeTab === "program") && (
                    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Store Information Card */}
                        <div className="grid grid-cols-1 gap-8">
                            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 flex items-start gap-4 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
                                <div className="size-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 border border-accent/20 shadow-[0_0_20px_rgba(var(--accent),0.1)]">
                                    <MonitorPlay className="size-6 text-accent" />
                                </div>
                                <div className="space-y-2 py-0.5">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight">AI Observations</h3>
                                        <span className="text-[9px] font-black bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded-sm tracking-[0.2em]">BETA</span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-slate-400 font-medium italic opacity-90">
                                        {data.aiObservations}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Donut Chart */}
                            <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-8 flex flex-col gap-8 backdrop-blur-sm shadow-2xl hover:bg-slate-900/50 transition-all duration-500 group ring-1 ring-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Compliance Logic</h3>
                                        <div className="text-sm font-black text-white uppercase tracking-tight">Planogram vs Shelves</div>
                                    </div>
                                    <div className="size-3 rounded-full bg-chart-2 shadow-[0_0_15px_rgba(var(--chart-2),0.6)] animate-pulse" />
                                </div>
                                <div className="flex items-center justify-center py-10 relative">
                                    <svg className="size-72 transform -rotate-90 drop-shadow-[0_0_40px_rgba(var(--chart-2),0.1)]">
                                        <circle cx="144" cy="144" r="105" stroke="currentColor" strokeWidth="28" fill="transparent" className="text-slate-800/50" />
                                        <circle
                                            cx="144" cy="144" r="105" stroke="currentColor" strokeWidth="28" fill="transparent"
                                            strokeDasharray="659.7" strokeDashoffset={659.7 - (659.7 * 10) / 100}
                                            className="text-chart-2 transition-all duration-1000 ease-out shadow-2xl"
                                            strokeLinecap="round"
                                        />
                                        <circle
                                            cx="144" cy="144" r="105" stroke="currentColor" strokeWidth="28" fill="transparent"
                                            strokeDasharray="659.7" strokeDashoffset={659.7 - (659.7 * 90) / 100}
                                            style={{ transform: "rotate(36deg)", transformOrigin: "144px 144px" }}
                                            className="text-yellow-500/80 transition-all duration-1000 ease-out"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-6xl font-black text-white tracking-tighter drop-shadow-2xl">10%</span>
                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Compliance</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Product Match (Refined from Image 0) */}
                            <div className="rounded-2xl border border-white/5 bg-[#0a0f18] p-10 flex flex-col gap-10 shadow-2xl ring-1 ring-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1.5">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Analysis Metrics</h3>
                                        <div className="text-xl font-black text-white uppercase tracking-tight">AI Product Match</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-1.5 w-7 rounded-full bg-chart-2" />
                                        <div className="h-1.5 w-7 rounded-full bg-yellow-500" />
                                    </div>
                                </div>
                                <div className="space-y-16 py-4">
                                    <div className="space-y-5">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-2.5">
                                                <div className="size-2.5 rounded-full bg-chart-2" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total Products</span>
                                            </div>
                                            <span className="text-3xl font-black text-white tabular-nums">101</span>
                                        </div>
                                        <div className="h-14 w-full bg-[#0d1421] rounded-2xl overflow-hidden border border-white/5 shadow-inner p-2">
                                            <div className="h-full bg-chart-2 rounded-xl transition-all duration-1000 ease-out" style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                    <div className="space-y-5">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-2.5">
                                                <div className="size-2.5 rounded-full bg-yellow-500" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">AI Matches</span>
                                            </div>
                                            <span className="text-3xl font-black text-white tabular-nums">101</span>
                                        </div>
                                        <div className="h-14 w-full bg-[#0d1421] rounded-2xl overflow-hidden border border-white/5 shadow-inner p-2">
                                            <div className="h-full bg-yellow-500 rounded-xl transition-all duration-1000 ease-out" style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* All Issues Breakdown (From Image 1) */}
                            <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0a0f18] p-10 flex flex-col gap-8 shadow-2xl ring-1 ring-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-black text-white uppercase tracking-[0.1em]">All Issues Breakdown</div>
                                </div>
                                <div className="space-y-2 py-4 relative">
                                    {/* Vertical Grid Lines */}
                                    <div className="absolute inset-0 flex justify-between px-[140px] pointer-events-none opacity-20 py-4">
                                        {[0, 1, 2, 3, 4].map((n) => (
                                            <div key={n} className="h-full w-[1px] bg-slate-500 relative">
                                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600">{n}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {data.issueBreakdown.map((issue, idx) => (
                                        <div key={idx} className="flex items-center gap-6 relative group">
                                            <div className="w-[120px] text-right text-[10px] font-black uppercase tracking-tight text-slate-500 leading-tight">
                                                {issue.label}
                                            </div>
                                            <div className="flex-1 h-16 bg-[#151b28] border border-white/5 relative overflow-hidden group-hover:bg-[#1a2130] transition-colors">
                                                <div
                                                    className={cn("h-full transition-all duration-1000 ease-out relative", issue.color)}
                                                    style={{ width: `${(issue.value / 4) * 100}%` }}
                                                >
                                                    {/* Tooltip Simulation */}
                                                    <div className="invisible group-hover:visible absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-[#1c2433] border border-white/10 p-3 rounded-lg shadow-2xl z-20 min-w-[140px]">
                                                        <div className="text-[10px] font-black text-white uppercase mb-1">{issue.label}</div>
                                                        <div className="text-[10px] font-bold text-destructive">count : {issue.value}</div>
                                                    </div>
                                                </div>
                                                {/* Labels on far right */}
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-black text-white tabular-nums">
                                                    {issue.value}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Products Per Shelf */}
                            <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-slate-900/30 p-8 flex flex-col gap-10 backdrop-blur-sm shadow-2xl ring-1 ring-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Distribution Overview</h3>
                                        <div className="text-sm font-black text-white uppercase tracking-tight">Products per shelf</div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-chart-1/10 border border-chart-1/20 text-chart-1">
                                        <BarChart3 className="size-5" />
                                    </div>
                                </div>
                                <div className="flex items-end justify-between gap-8 h-80 px-4 overflow-x-auto scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                                    {data.productsPerShelf.map((shelf: { shelf: string; count: number }, i: number) => {
                                        const maxValue = Math.max(...data.productsPerShelf.map((s: { count: number }) => s.count));
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-6 h-full justify-end group min-w-[70px]">
                                                <div
                                                    className="w-full bg-chart-1/90 rounded-xl transition-all duration-700 hover:scale-x-105 hover:bg-chart-1 relative shadow-[0_0_30px_rgba(var(--chart-1),0.1)] group-hover:shadow-[0_0_40px_rgba(var(--chart-1),0.3)] border border-white/5"
                                                    style={{ height: `${(shelf.count / (maxValue || 1)) * 100}%` }}
                                                >
                                                    <div className="invisible group-hover:visible animate-in zoom-in-95 fade-in absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-md text-white text-[11px] font-black px-3 py-1.5 rounded-lg border border-white/10 shadow-2xl z-20 whitespace-nowrap">
                                                        {shelf.count} Items
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{shelf.shelf}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Space Efficiency */}
                            <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-slate-900/30 p-8 flex flex-col gap-10 backdrop-blur-sm shadow-2xl ring-1 ring-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Optimization Analytics</h3>
                                        <div className="text-sm font-black text-white uppercase tracking-tight">Space Efficiency per shelf</div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-chart-2 bg-chart-2/10 border border-chart-2/20 px-3 py-1.5 rounded-full uppercase tracking-[0.1em]">
                                        <TrendingUp className="size-3.5" /> High Performance
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
                                    {data.spareEfficiency.map((item: { label: string; value: number }, i: number) => (
                                        <div key={i} className="flex flex-col gap-2.5 group">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">
                                                <span>{item.label}</span>
                                                <span className="text-white tabular-nums">{item.value}%</span>
                                            </div>
                                            <div className="h-12 bg-slate-800/40 rounded-xl overflow-hidden border border-white/5 relative p-1.5 shadow-inner transition-all group-hover:border-white/10 group-hover:bg-slate-800/60">
                                                <div
                                                    className="h-full bg-chart-2/70 rounded-lg shadow-[0_0_20px_rgba(var(--chart-2),0.2)] transition-all duration-1000 ease-out group-hover:bg-chart-2"
                                                    style={{ width: `${item.value}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab !== "compliance" && activeTab !== "program" && (
                    <div className="flex flex-col items-center justify-center p-32 border-2 border-dashed border-white/5 rounded-3xl bg-slate-900/10 backdrop-blur-sm">
                        <div className="size-20 rounded-2xl bg-slate-900/50 flex items-center justify-center border border-white/5 mb-6 text-slate-600">
                            <Package className="size-10" />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Section Under Development</h3>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Details for {activeTab} will appear in Phase 2</p>
                    </div>
                )}
                </div>
            </div>
        </MainLayout>
    );
}
