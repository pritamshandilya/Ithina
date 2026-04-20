import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Height of the moving scan block (trail + line) in px — used for top animation end state */
const SCAN_BLOCK_PX = 40;

export interface AiScanningOverlayProps {
  /** When true, dims the card, shows a moving cyan scan line, and pulses the border glow */
  isScanning: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a layout variant card while AI refinement is in progress.
 * Dimmed backdrop, animated cyan scan line with trail, and pulsing purple/blue border.
 * Sweep runs down then back up (`animation-direction: alternate`).
 */
export function AiScanningOverlay({ isScanning, children, className }: AiScanningOverlayProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {children}
      {isScanning ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-[18] rounded-[inherit] bg-black/45 backdrop-blur-[2px]"
            aria-hidden
          />
          <motion.div
            className="pointer-events-none absolute inset-0 z-[19] rounded-[inherit]"
            initial={false}
            animate={{
              boxShadow: [
                "inset 0 0 0 2px rgba(168, 85, 247, 0.4), 0 0 14px rgba(99, 102, 241, 0.3)",
                "inset 0 0 0 2px rgba(168, 85, 247, 0.75), 0 0 26px rgba(59, 130, 246, 0.55)",
                "inset 0 0 0 2px rgba(168, 85, 247, 0.4), 0 0 14px rgba(99, 102, 241, 0.3)",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[20] overflow-hidden rounded-[inherit]"
            aria-hidden
          >
            <div
              className="absolute left-0 right-0 flex flex-col"
              style={{
                height: SCAN_BLOCK_PX,
                animation: "ai-scanning-sweep-y 2.25s linear infinite alternate",
              }}
            >
              <div className="min-h-0 flex-1 bg-gradient-to-b from-transparent via-cyan-400/35 to-cyan-400/15" />
              <div
                className="h-[2px] w-full shrink-0 rounded-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
                style={{
                  boxShadow:
                    "0 0 12px 4px rgba(34, 211, 238, 0.9), 0 0 28px 10px rgba(56, 189, 248, 0.45)",
                }}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
