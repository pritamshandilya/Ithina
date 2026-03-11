import { cn } from "@/lib/utils";
import type { BrandToneConfig, LcdRule } from "@/types/admin";

interface AiCalibrationTabProps {
  tone: BrandToneConfig;
  lcdRules: LcdRule[];
  onToneChange: (tone: BrandToneConfig) => void;
  onToggleLcd: (key: string) => void;
}

export default function AiCalibrationTab({ tone, lcdRules, onToneChange, onToggleLcd }: AiCalibrationTabProps) {
  return (
    <div className="grid animate-[fadeIn_0.3s_ease-out] grid-cols-1 gap-6 lg:grid-cols-2">
      {/* LLM Tone & Copy Rules */}
      <section className="rounded-xl border border-ithina-border bg-ithina-panel p-6 shadow-lg">
        <h3 className="mb-5 font-mono text-xs uppercase tracking-widest text-ithina-muted">
          LLM Tone & Copy Rules (Agent 1 & 2)
        </h3>
        <div className="space-y-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Brand Tone Shaping</label>
            <textarea
              value={tone.tonePrompt}
              onChange={(e) => onToneChange({ ...tone, tonePrompt: e.target.value })}
              className="h-24 w-full resize-none rounded-lg border border-ithina-border bg-ithina-bg p-3 text-sm leading-relaxed text-white transition-colors focus:border-ithina-purple focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Forbidden Terms (Comma separated)</label>
            <input
              type="text"
              value={tone.forbiddenTerms}
              onChange={(e) => onToneChange({ ...tone, forbiddenTerms: e.target.value })}
              className="w-full rounded-lg border border-rose-400/30 bg-rose-900/10 p-3 font-mono text-sm text-rose-400 transition-colors focus:border-rose-400 focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Agent 6 (OCR) will reject any layouts containing these words.
            </p>
          </div>
        </div>
      </section>

      {/* LCD Background Gen Rules */}
      <section className="rounded-xl border border-ithina-border bg-ithina-panel p-6 shadow-lg">
        <h3 className="mb-5 font-mono text-xs uppercase tracking-widest text-ithina-muted">
          LCD Background Gen Rules (Agent 4)
        </h3>
        <p className="mb-6 text-xs text-slate-400">
          These constraints are injected into the Nano Banana prompt when generating Track 2 digital banners.
        </p>
        <div className="space-y-4">
          {lcdRules.map((rule) => (
            <label
              key={rule.key}
              className={cn("group flex cursor-pointer items-center justify-between", rule.locked && "opacity-50")}
            >
              <div>
                <span className="block text-sm font-medium text-white">{rule.label}</span>
                <span className="font-mono text-[10px] text-slate-500">{rule.key}</span>
              </div>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  disabled={rule.locked}
                  onChange={() => !rule.locked && onToggleLcd(rule.key)}
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    "h-5 w-9 rounded-full after:absolute after:left-[2px] after:top-[2px] after:size-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white",
                    rule.enabled ? "bg-ithina-purple" : "bg-slate-700",
                    rule.locked && "bg-ithina-purple",
                  )}
                />
              </div>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
