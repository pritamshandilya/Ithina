import { Check, CloudUpload } from "lucide-react";
import { memo, useCallback, useRef } from "react";

import { cn } from "@/lib/utils";
import type { HardwareDeviceId } from "@/types/wizard";
import { useHardwareDevices } from "@/hooks/use-wizard";

interface DisplayMode {
  id: HardwareDeviceId;
  label: string;
  dims: string;
  format: string;
}

const displayModes: DisplayMode[] = [
  { id: "chroma42", label: "ESL — Chroma 42", dims: "400 × 300 px", format: "PNG/BMP" },
  { id: "chroma29", label: "ESL — Chroma 29", dims: "296 × 128 px", format: "PNG/BMP" },
  { id: "lcd", label: "LCD Landscape Banner", dims: "1920 × 1080 px", format: "PNG/JPG" },
];

interface ManualUploadProps {
  stepNumber: number;
  totalSteps: number;
  selectedDevices: HardwareDeviceId[];
  uploadedFiles: Partial<Record<HardwareDeviceId, string>>;
  onFileUploaded: (deviceId: HardwareDeviceId, fileName: string) => void;
  onConfirm: () => void;
  /** When false, bottom primary is omitted (use WizardStepHeader). */
  showFooterConfirm?: boolean;
}

function ManualUpload({
  stepNumber,
  totalSteps,
  selectedDevices,
  uploadedFiles,
  onFileUploaded,
  onConfirm,
  showFooterConfirm = true,
}: ManualUploadProps) {
  const fileInputRefs = useRef<Partial<Record<HardwareDeviceId, HTMLInputElement>>>({});

  const { data: devices = [] } = useHardwareDevices();

  const selectedModes = displayModes.filter((dm) => selectedDevices.includes(dm.id));
  const uploadedCount = Object.keys(uploadedFiles).length;

  const triggerUpload = useCallback((id: HardwareDeviceId) => {
    fileInputRefs.current[id]?.click();
  }, []);

  const onFileChange = useCallback(
    (id: HardwareDeviceId, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileUploaded(id, file.name);
    },
    [onFileUploaded],
  );

  const getDeviceIcon = (id: HardwareDeviceId) => {
    const device = devices.find((d) => d.id === id);
    if (!device) return null;
    if (id === "chroma29") {
      return (
        <svg className="size-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth={1.5} />
          <path d="M9 18h6" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
      );
    }
    if (id === "chroma42") {
      return (
        <svg className="size-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={1.5} />
          <path d="M8 21h8M12 17v4" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
      );
    }
    return (
      <svg className="size-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="4" width="20" height="13" rx="1.5" strokeWidth={1.5} />
        <path d="M7 21h10M12 17v4" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 animate-[fadeIn_0.4s_ease-out]">
      {/* Step context bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-ithina-border bg-white/[0.03] px-8 py-3">
        <div className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-500 bg-ithina-bg">
          <span className="text-[9px] font-bold text-slate-300">{stepNumber}</span>
        </div>
        <div className="flex-1">
          <span className="text-xs font-semibold text-white">Upload Banners</span>
          <span className="ml-2 text-[10px] text-slate-500">Upload a banner for each selected screen and dimension</span>
        </div>
        <span className="rounded-full border border-ithina-border px-2 py-0.5 font-mono text-[9px] text-slate-600">
          Step {stepNumber} of {totalSteps}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          <div className="mb-2 text-center">
            <h3 className="mb-1 text-xl font-bold text-white">Upload Banners</h3>
            <p className="text-sm text-slate-400">Upload a banner for each selected display mode and dimension.</p>
          </div>

          {selectedModes.map((dm) => (
            <div key={dm.id} className="overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel">
              <div className="flex items-center gap-3 border-b border-ithina-border px-5 py-3">
                {getDeviceIcon(dm.id)}
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white">{dm.label}</p>
                  <p className="font-mono text-[10px] text-slate-500">{dm.dims} · {dm.format}</p>
                </div>
                {uploadedFiles[dm.id] && (
                  <span className="flex items-center gap-1 rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 font-mono text-[9px] text-emerald-400">
                    <Check className="size-2.5" strokeWidth={3} />
                    {uploadedFiles[dm.id]}
                  </span>
                )}
              </div>

              <div className="p-4">
                <div
                  onClick={() => triggerUpload(dm.id)}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed p-5 transition-all hover:border-ithina-purple/40 hover:bg-ithina-purple/5",
                    uploadedFiles[dm.id]
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-ithina-border",
                  )}
                >
                  <CloudUpload
                    className={cn("size-8 shrink-0", uploadedFiles[dm.id] ? "text-emerald-400" : "text-slate-600")}
                    strokeWidth={1.5}
                  />
                  <div>
                    <p className={cn("text-xs font-medium", uploadedFiles[dm.id] ? "text-emerald-400" : "text-slate-400")}>
                      {uploadedFiles[dm.id] ? "Uploaded — click to replace" : "Click to upload"}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-600">{dm.dims} · PNG / JPG / SVG</p>
                  </div>
                </div>
                <input
                  ref={(el) => {
                    if (el) fileInputRefs.current[dm.id] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFileChange(dm.id, e)}
                />
              </div>
            </div>
          ))}

          {/* Upload summary */}
          <div className="flex flex-col gap-3 rounded-2xl border border-ithina-border bg-ithina-bg p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Upload Summary</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Screens selected</span>
              <span className="font-medium text-white">{selectedDevices.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Banners uploaded</span>
              <span className={cn("font-medium", uploadedCount === selectedDevices.length ? "text-emerald-400" : "text-amber-400")}>
                {uploadedCount} / {selectedDevices.length}
              </span>
            </div>
          </div>

          {showFooterConfirm && (
            <button
              onClick={onConfirm}
              disabled={uploadedCount === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ithina-purple py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all hover:bg-ithina-purple-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check className="size-4" />
              Confirm & Proceed to Studio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ManualUpload);
