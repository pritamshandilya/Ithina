import { CloudUpload, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { HwPalette } from "@/types/admin";

interface BrandAssetsTabProps {
  palettes: HwPalette[];
}

type LogoKey = "bw" | "red";

export default function BrandAssetsTab({ palettes }: BrandAssetsTabProps) {
  const [uploading, setUploading] = useState<Record<LogoKey, boolean>>({ bw: false, red: false });
  const [uploaded, setUploaded] = useState<Record<LogoKey, boolean>>({ bw: false, red: false });
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const simulateUpload = useCallback((key: LogoKey) => {
    if (uploaded[key]) return;
    setUploading((prev) => ({ ...prev, [key]: true }));
    const id = setTimeout(() => {
      setUploading((prev) => ({ ...prev, [key]: false }));
      setUploaded((prev) => ({ ...prev, [key]: true }));
    }, 1500);
    timersRef.current.push(id);
  }, [uploaded]);

  return (
    <div className="grid animate-[fadeIn_0.3s_ease-out] grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Sacred Assets */}
      <section className="rounded-xl border border-ithina-border bg-ithina-panel p-6 shadow-lg">
        <h3 className="mb-5 font-mono text-xs uppercase tracking-widest text-ithina-muted">
          Sacred Assets (Agent 5 Renderer)
        </h3>
        <div className="space-y-6">
          {/* Font Upload */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-300">Brand Fonts (.TTF / .OTF)</label>
            <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-ithina-border p-5 text-center transition-colors hover:bg-white/[0.02]">
              <CloudUpload className="mb-2 size-6 text-slate-500" />
              <span className="mb-1 text-sm font-medium text-white">Upload Fonts</span>
              <span className="text-[10px] text-slate-500">Current: Inter-Bold.ttf, Roboto-Regular.ttf</span>
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-300">Primary Logos</label>
            <div className="grid grid-cols-2 gap-4">
              <LogoUploadCard
                variant="bw"
                uploading={uploading.bw}
                uploaded={uploaded.bw}
                onClick={() => simulateUpload("bw")}
              />
              <LogoUploadCard
                variant="red"
                uploading={uploading.red}
                uploaded={uploaded.red}
                onClick={() => simulateUpload("red")}
              />
            </div>
          </div>

          {/* Exclusion Zone */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Logo Exclusion Zone (%)</label>
            <input
              type="number"
              defaultValue={10}
              className="w-full rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Prevents Agent 2 from placing text too close to the brand mark.
            </p>
          </div>
        </div>
      </section>

      {/* Hardware Palettes */}
      <section className="rounded-xl border border-ithina-border bg-ithina-panel p-6 shadow-lg">
        <h3 className="mb-5 font-mono text-xs uppercase tracking-widest text-ithina-muted">Hardware Palettes</h3>
        <p className="mb-4 text-xs text-slate-400">
          Select the exact RGB hex codes supported by your displays. Agent 5 will force all pixels to these exact values.
        </p>
        <div className="space-y-3">
          {palettes.map((p) => (
            <div
              key={p.hex}
              className={cn(
                "flex items-center justify-between rounded-lg border bg-ithina-bg p-3",
                p.highlight
                  ? "border-ithina-purple/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                  : "border-ithina-border",
                !p.active && "opacity-40",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn("size-6 rounded border", p.highlight && "shadow-[0_0_8px_rgba(255,0,0,0.5)]")}
                  style={{
                    backgroundColor: p.hex,
                    borderColor: p.hex === "#FFFFFF" ? "#94a3b8" : p.hex === "#000000" ? "#475569" : p.hex,
                  }}
                />
                <span className={cn("text-sm font-medium", p.active ? (p.highlight ? "text-white" : "text-slate-200") : "text-slate-400")}>
                  {p.name}
                </span>
              </div>
              <span className={cn("font-mono text-xs", p.highlight ? "text-white" : "text-slate-500")}>
                {p.active ? p.hex : "Disabled"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function LogoUploadCard({
  variant,
  uploading,
  uploaded,
  onClick,
}: {
  variant: LogoKey;
  uploading: boolean;
  uploaded: boolean;
  onClick: () => void;
}) {
  const isBw = variant === "bw";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex h-24 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border p-4 transition-all",
        isBw
          ? "border-ithina-border bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          : "border-red-900/50 bg-red-600 hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]",
      )}
    >
      {!uploading && !uploaded && (
        <span
          className={cn(
            "flex flex-col items-center gap-1 text-xs font-medium transition-colors",
            isBw ? "text-slate-400 group-hover:text-slate-800" : "text-red-200 group-hover:text-white",
          )}
        >
          <Plus className="size-5" />
          Click to upload {isBw ? "B/W" : "Red"}
        </span>
      )}

      {uploading && (
        <div className="flex w-full flex-col items-center justify-center">
          <div className={cn("h-1 w-16 overflow-hidden rounded-full", isBw ? "bg-slate-200" : "bg-red-800")}>
            <div className={cn("h-full w-full animate-pulse", isBw ? "bg-blue-500" : "bg-white")} />
          </div>
        </div>
      )}

      {uploaded && (
        <>
          <span className={cn("animate-[fadeIn_0.3s_ease-out] text-sm font-bold tracking-tighter", isBw ? "text-black" : "text-white")}>
            STORE LOGO
          </span>
          <span className={cn("absolute left-2 top-1 font-mono text-[8px]", isBw ? "text-slate-400" : "text-white/70")}>
            {isBw ? "B/W Output" : "Red Output"}
          </span>
        </>
      )}
    </div>
  );
}
