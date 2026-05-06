import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  Download,
  Info,
  MonitorPlay,
  Package,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

import MainLayout from "@/components/layouts/main";
import { DetailBackButton } from "@/components/shared/DetailBackButton";
import { Button } from "@/components/ui/button";
import {
  ANALYSIS_REPORT_MOCK_DATA,
  type DetailedReport,
} from "@/lib/constants/reportsMockData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checker/reports/view/$reportId/")({
  component: DetailedReportPage,
});

export function DetailedReportPage() {
  const data: DetailedReport = ANALYSIS_REPORT_MOCK_DATA;
  const [activeTab, setActiveTab] = useState("compliance");

  const topStats = [
    {
      label: "Compliance Score",
      value: `${data.complianceScore}%`,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Mismatched",
      value: data.stats.mismatched,
      color: "text-muted-foreground",
      bg: "bg-muted/30",
    },
    {
      label: "Missing",
      value: data.stats.missing,
      color: "text-muted-foreground",
      bg: "bg-muted/30",
    },
    {
      label: "Missing Price",
      value: data.stats.missingPrice,
      color: "text-muted-foreground",
      bg: "bg-muted/30",
    },
    {
      label: "Misplaced",
      value: data.stats.misplaced,
      color: "text-muted-foreground",
      bg: "bg-muted/30",
    },
    {
      label: "Issues",
      value: data.stats.issues,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Total Products",
      value: data.stats.totalProducts,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "On Plan",
      value: data.stats.onPlan,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Available",
      value: data.stats.available,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Run",
      value: data.stats.runs,
      color: "text-muted-foreground",
      bg: "bg-muted/30",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#070b14] px-2 pt-2 pb-4 font-sans text-slate-200 sm:px-2 sm:pt-3 sm:pb-4 lg:px-2 lg:pt-4 lg:pb-5">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-6">
          {/* Header */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <DetailBackButton
                onClick={() => window.history.back()}
                className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              />
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-white">
                  {data.title}
                </h1>
                <div className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">
                  <span>Store Analysis</span>
                  <span className="size-1 rounded-full bg-slate-700" />
                  <span>Analysis Score</span>
                  <span className="size-1 rounded-full bg-slate-700" />
                  <span>{data.date}</span>
                </div>
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              className="bg-accent hover:bg-accent/90 h-11 gap-2 rounded-lg border border-white/10 px-6 font-bold text-white shadow-[0_0_20px_rgba(var(--accent),0.3)]"
            >
              <Download className="size-4" />
              Export PDF
            </Button>
          </div>

          {/* Top Stats Row */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5 lg:grid-cols-10">
            {topStats.map((stat, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border border-white/5 p-4 shadow-2xl backdrop-blur-md transition-all hover:scale-[1.02] hover:border-white/10",
                  stat.bg,
                )}
              >
                <span
                  className={cn(
                    "text-2xl font-black tracking-tighter tabular-nums",
                    stat.color,
                  )}
                >
                  {stat.value}
                </span>
                <span className="mt-2 text-center text-[9px] leading-tight font-black tracking-widest text-slate-500 uppercase opacity-80">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-2 flex gap-10 border-b border-white/5">
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
                  "group relative flex items-center gap-2 pb-5 text-xs font-black tracking-[0.2em] uppercase transition-all",
                  activeTab === tab.id
                    ? "text-accent"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                <tab.icon
                  className={cn(
                    "size-4",
                    activeTab === tab.id
                      ? "text-accent"
                      : "text-slate-600 group-hover:text-slate-400",
                  )}
                />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="bg-accent absolute right-0 bottom-0 left-0 h-1 rounded-t-full shadow-[0_-2px_10px_rgba(var(--accent),0.5)]" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {(activeTab === "compliance" || activeTab === "program") && (
            <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-8 duration-700">
              {/* Store Information Card */}
              <div className="grid grid-cols-1 gap-8">
                <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl">
                  <div className="bg-accent/20 border-accent/20 flex size-12 shrink-0 items-center justify-center rounded-xl border shadow-[0_0_20px_rgba(var(--accent),0.1)]">
                    <MonitorPlay className="text-accent size-6" />
                  </div>
                  <div className="space-y-2 py-0.5">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black tracking-tight text-white uppercase">
                        AI Observations
                      </h3>
                      <span className="bg-accent/20 text-accent border-accent/30 rounded-sm border px-2 py-0.5 text-[9px] font-black tracking-[0.2em]">
                        BETA
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed font-medium text-slate-400 italic opacity-90">
                      {data.aiObservations}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Donut Chart */}
                <div className="group flex flex-col gap-8 rounded-2xl border border-white/5 bg-slate-900/30 p-8 shadow-2xl ring-1 ring-white/5 backdrop-blur-sm transition-all duration-500 hover:bg-slate-900/50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">
                        Compliance Logic
                      </h3>
                      <div className="text-sm font-black tracking-tight text-white uppercase">
                        Planogram vs Shelves
                      </div>
                    </div>
                    <div className="bg-chart-2 size-3 animate-pulse rounded-full shadow-[0_0_15px_rgba(var(--chart-2),0.6)]" />
                  </div>
                  <div className="relative flex items-center justify-center py-10">
                    <svg className="size-72 -rotate-90 transform drop-shadow-[0_0_40px_rgba(var(--chart-2),0.1)]">
                      <circle
                        cx="144"
                        cy="144"
                        r="105"
                        stroke="currentColor"
                        strokeWidth="28"
                        fill="transparent"
                        className="text-slate-800/50"
                      />
                      <circle
                        cx="144"
                        cy="144"
                        r="105"
                        stroke="currentColor"
                        strokeWidth="28"
                        fill="transparent"
                        strokeDasharray="659.7"
                        strokeDashoffset={659.7 - (659.7 * 10) / 100}
                        className="text-chart-2 shadow-2xl transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="144"
                        cy="144"
                        r="105"
                        stroke="currentColor"
                        strokeWidth="28"
                        fill="transparent"
                        strokeDasharray="659.7"
                        strokeDashoffset={659.7 - (659.7 * 90) / 100}
                        style={{
                          transform: "rotate(36deg)",
                          transformOrigin: "144px 144px",
                        }}
                        className="text-yellow-500/80 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-6xl font-black tracking-tighter text-white drop-shadow-2xl">
                        10%
                      </span>
                      <span className="mt-2 text-[11px] font-black tracking-[0.2em] text-slate-500 uppercase">
                        Compliance
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Product Match (Refined from Image 0) */}
                <div className="flex flex-col gap-10 rounded-2xl border border-white/5 bg-[#0a0f18] p-10 shadow-2xl ring-1 ring-white/5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <h3 className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase">
                        Analysis Metrics
                      </h3>
                      <div className="text-xl font-black tracking-tight text-white uppercase">
                        AI Product Match
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-chart-2 h-1.5 w-7 rounded-full" />
                      <div className="h-1.5 w-7 rounded-full bg-yellow-500" />
                    </div>
                  </div>
                  <div className="space-y-16 py-4">
                    <div className="space-y-5">
                      <div className="flex items-end justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-chart-2 size-2.5 rounded-full" />
                          <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                            Total Products
                          </span>
                        </div>
                        <span className="text-3xl font-black text-white tabular-nums">
                          101
                        </span>
                      </div>
                      <div className="h-14 w-full overflow-hidden rounded-2xl border border-white/5 bg-[#0d1421] p-2 shadow-inner">
                        <div
                          className="bg-chart-2 h-full rounded-xl transition-all duration-1000 ease-out"
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div className="flex items-end justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="size-2.5 rounded-full bg-yellow-500" />
                          <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                            AI Matches
                          </span>
                        </div>
                        <span className="text-3xl font-black text-white tabular-nums">
                          101
                        </span>
                      </div>
                      <div className="h-14 w-full overflow-hidden rounded-2xl border border-white/5 bg-[#0d1421] p-2 shadow-inner">
                        <div
                          className="h-full rounded-xl bg-yellow-500 transition-all duration-1000 ease-out"
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* All Issues Breakdown (From Image 1) */}
                <div className="flex flex-col gap-8 rounded-2xl border border-white/5 bg-[#0a0f18] p-10 shadow-2xl ring-1 ring-white/5 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-black tracking-[0.1em] text-white uppercase">
                      All Issues Breakdown
                    </div>
                  </div>
                  <div className="relative space-y-2 py-4">
                    {/* Vertical Grid Lines */}
                    <div className="pointer-events-none absolute inset-0 flex justify-between px-[140px] py-4 opacity-20">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="relative h-full w-[1px] bg-slate-500"
                        >
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600">
                            {n}
                          </span>
                        </div>
                      ))}
                    </div>

                    {data.issueBreakdown.map((issue, idx) => (
                      <div
                        key={idx}
                        className="group relative flex items-center gap-6"
                      >
                        <div className="w-[120px] text-right text-[10px] leading-tight font-black tracking-tight text-slate-500 uppercase">
                          {issue.label}
                        </div>
                        <div className="relative h-16 flex-1 overflow-hidden border border-white/5 bg-[#151b28] transition-colors group-hover:bg-[#1a2130]">
                          <div
                            className={cn(
                              "relative h-full transition-all duration-1000 ease-out",
                              issue.color,
                            )}
                            style={{ width: `${(issue.value / 4) * 100}%` }}
                          >
                            {/* Tooltip Simulation */}
                            <div className="invisible absolute top-1/2 right-0 z-20 min-w-[140px] translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-[#1c2433] p-3 shadow-2xl group-hover:visible">
                              <div className="mb-1 text-[10px] font-black text-white uppercase">
                                {issue.label}
                              </div>
                              <div className="text-destructive text-[10px] font-bold">
                                count : {issue.value}
                              </div>
                            </div>
                          </div>
                          {/* Labels on far right */}
                          <div className="absolute top-1/2 right-4 -translate-y-1/2 text-2xl font-black text-white tabular-nums">
                            {issue.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Products Per Shelf */}
                <div className="flex flex-col gap-10 rounded-2xl border border-white/5 bg-slate-900/30 p-8 shadow-2xl ring-1 ring-white/5 backdrop-blur-sm lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">
                        Distribution Overview
                      </h3>
                      <div className="text-sm font-black tracking-tight text-white uppercase">
                        Products per shelf
                      </div>
                    </div>
                    <div className="bg-chart-1/10 border-chart-1/20 text-chart-1 rounded-lg border p-2">
                      <BarChart3 className="size-5" />
                    </div>
                  </div>
                  <div className="scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent flex h-80 items-end justify-between gap-8 overflow-x-auto px-4">
                    {data.productsPerShelf.map(
                      (shelf: { shelf: string; count: number }, i: number) => {
                        const maxValue = Math.max(
                          ...data.productsPerShelf.map(
                            (s: { count: number }) => s.count,
                          ),
                        );
                        return (
                          <div
                            key={i}
                            className="group flex h-full min-w-[70px] flex-1 flex-col items-center justify-end gap-6"
                          >
                            <div
                              className="bg-chart-1/90 hover:bg-chart-1 relative w-full rounded-xl border border-white/5 shadow-[0_0_30px_rgba(var(--chart-1),0.1)] transition-all duration-700 group-hover:shadow-[0_0_40px_rgba(var(--chart-1),0.3)] hover:scale-x-105"
                              style={{
                                height: `${(shelf.count / (maxValue || 1)) * 100}%`,
                              }}
                            >
                              <div className="animate-in zoom-in-95 fade-in invisible absolute -top-12 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-white/10 bg-slate-800/90 px-3 py-1.5 text-[11px] font-black whitespace-nowrap text-white shadow-2xl backdrop-blur-md group-hover:visible">
                                {shelf.count} Items
                              </div>
                            </div>
                            <span className="text-[11px] font-black tracking-widest text-slate-500 uppercase">
                              {shelf.shelf}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Space Efficiency */}
                <div className="flex flex-col gap-10 rounded-2xl border border-white/5 bg-slate-900/30 p-8 shadow-2xl ring-1 ring-white/5 backdrop-blur-sm lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">
                        Optimization Analytics
                      </h3>
                      <div className="text-sm font-black tracking-tight text-white uppercase">
                        Space Efficiency per shelf
                      </div>
                    </div>
                    <div className="text-chart-2 bg-chart-2/10 border-chart-2/20 flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black tracking-[0.1em] uppercase">
                      <TrendingUp className="size-3.5" /> High Performance
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-x-16 gap-y-6 md:grid-cols-2">
                    {data.spareEfficiency.map(
                      (item: { label: string; value: number }, i: number) => (
                        <div key={i} className="group flex flex-col gap-2.5">
                          <div className="flex justify-between text-[10px] font-black tracking-widest text-slate-500 uppercase transition-colors group-hover:text-slate-300">
                            <span>{item.label}</span>
                            <span className="text-white tabular-nums">
                              {item.value}%
                            </span>
                          </div>
                          <div className="relative h-12 overflow-hidden rounded-xl border border-white/5 bg-slate-800/40 p-1.5 shadow-inner transition-all group-hover:border-white/10 group-hover:bg-slate-800/60">
                            <div
                              className="bg-chart-2/70 group-hover:bg-chart-2 h-full rounded-lg shadow-[0_0_20px_rgba(var(--chart-2),0.2)] transition-all duration-1000 ease-out"
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "compliance" && activeTab !== "program" && (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/5 bg-slate-900/10 p-32 backdrop-blur-sm">
              <div className="mb-6 flex size-20 items-center justify-center rounded-2xl border border-white/5 bg-slate-900/50 text-slate-600">
                <Package className="size-10" />
              </div>
              <h3 className="mb-2 text-lg font-black tracking-tight text-white uppercase">
                Section Under Development
              </h3>
              <p className="text-sm font-bold tracking-widest text-slate-500 uppercase">
                Details for {activeTab} will appear in Phase 2
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
