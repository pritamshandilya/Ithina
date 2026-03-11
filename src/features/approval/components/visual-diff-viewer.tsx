import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { DiffTrack } from "@/types/approval";

export default function VisualDiffViewer() {
  const [activeTrack, setActiveTrack] = useState<DiffTrack>("esl");

  return (
    <div className="flex shrink-0 flex-col overflow-hidden rounded-xl border border-ithina-border bg-ithina-bg shadow-inner">
      <div className="flex items-center justify-between border-b border-ithina-border bg-white/[0.02] px-6 py-4">
        <h3 className="font-mono text-xs uppercase tracking-widest text-ithina-muted">Visual Diff Viewer</h3>
        <div className="flex rounded-lg border border-ithina-border bg-black/50 p-1">
          <button
            onClick={() => setActiveTrack("esl")}
            className={cn(
              "rounded border px-4 py-1.5 text-xs font-bold shadow-sm transition-all",
              activeTrack === "esl" ? "border-slate-600 bg-ithina-panel text-white" : "border-transparent text-slate-500 hover:text-white",
            )}
          >
            Track 1: ESL Tag
          </button>
          <button
            onClick={() => setActiveTrack("lcd")}
            className={cn(
              "rounded border px-4 py-1.5 text-xs font-bold shadow-sm transition-all",
              activeTrack === "lcd" ? "border-slate-600 bg-ithina-panel text-white" : "border-transparent text-slate-500 hover:text-white",
            )}
          >
            Track 2: LCD Banner
          </button>
        </div>
      </div>

      {activeTrack === "esl" ? <EslDiff /> : <LcdDiff />}
    </div>
  );
}

function DiffArrow() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 p-3 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
        <ArrowRight className="size-6 text-emerald-400" />
      </div>
      <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400">Update</span>
    </div>
  );
}

function EslDiff() {
  return (
    <div className="flex animate-[fadeIn_0.3s_ease-out] items-center justify-center gap-12 bg-[#E2E8F0]/5 p-8">
      {/* Current */}
      <div className="flex flex-col items-center gap-3 opacity-50 grayscale transition-all duration-500 hover:grayscale-0">
        <span className="rounded-full bg-black/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Current Shelf State
        </span>
        <div className="relative flex h-[195px] w-[260px] justify-center">
          <div
            className="pointer-events-none absolute top-0 flex h-[300px] w-[400px] origin-top scale-[0.65] flex-col border border-slate-400 bg-[#F9F9F9]"
            style={{ imageRendering: "pixelated" }}
          >
            <div className="mt-2 flex flex-1 flex-col justify-between border-b-[8px] border-black px-6 py-5 text-black">
              <h1 className="text-[32px] font-bold leading-tight">Premium Salmon Tray 8pc</h1>
              <div className="text-xl font-bold opacity-80">SUSHI-019A</div>
            </div>
            <div className="relative flex h-[120px] w-full items-center justify-end bg-[#F9F9F9] p-4 text-black">
              <span className="absolute left-6 top-4 text-2xl font-bold">RETAIL</span>
              <span className="mr-1 mt-2 text-4xl font-bold">$</span>
              <span className="text-[80px] font-bold leading-none tracking-tighter">12.99</span>
            </div>
          </div>
        </div>
      </div>

      <DiffArrow />

      {/* Proposed */}
      <div className="flex flex-col items-center gap-3">
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
          AI Proposed State
        </span>
        <div className="relative flex h-[195px] w-[260px] justify-center">
          <div
            className="absolute top-0 flex h-[300px] w-[400px] origin-top scale-[0.65] flex-col border border-slate-400 bg-[#F9F9F9] shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
            style={{ imageRendering: "pixelated" }}
          >
            <div className="flex h-24 w-full items-center justify-center border-b-4 border-black bg-[#FF0000] text-[40px] font-bold tracking-widest text-white">
              TODAY ONLY
            </div>
            <div className="flex h-full items-end justify-between p-5 text-black">
              <div className="flex w-3/5 flex-col pb-2">
                <span className="text-3xl font-bold leading-tight">Premium<br />Salmon Tray</span>
                <span className="mt-3 text-xl font-bold text-gray-600 line-through">WAS $12.99</span>
              </div>
              <span className="text-[80px] font-bold leading-none tracking-tighter">$10.39</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LcdDiff() {
  return (
    <div className="flex animate-[fadeIn_0.3s_ease-out] items-center justify-center gap-12 bg-[#E2E8F0]/5 p-8">
      {/* Current */}
      <div className="flex flex-col items-center gap-3 opacity-50 grayscale transition-all duration-500">
        <span className="rounded-full bg-black/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Current Screen State
        </span>
        <div className="pointer-events-none flex aspect-video w-[320px] items-center justify-center rounded border border-slate-700 bg-slate-900 shadow-lg">
          <span className="font-bold tracking-widest text-slate-500">DEFAULT PROMO</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 p-3 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
          <ArrowRight className="size-6 text-emerald-400" />
        </div>
      </div>

      {/* Proposed */}
      <div className="flex flex-col items-center gap-3">
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
          AI Composited Banner
        </span>
        <div
          className="relative aspect-video w-[320px] overflow-hidden rounded border border-slate-600 bg-cover bg-center shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80')" }}
        >
          <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/90 to-transparent p-5">
            <div className="text-white">
              <div className="mb-1 inline-block rounded-sm border border-red-500 bg-red-600 px-2 py-0.5 text-[8px] font-bold">
                TODAY ONLY
              </div>
              <div className="mb-1 text-[15px] font-bold leading-tight">Premium<br />Salmon Tray</div>
              <div className="mt-1 text-3xl font-black">$10.39</div>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 text-4xl drop-shadow-2xl">🍣</div>
        </div>
      </div>
    </div>
  );
}
