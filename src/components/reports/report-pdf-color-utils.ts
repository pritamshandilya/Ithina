const DEFAULT_BG = "rgba(167, 139, 250, 0.15)";
const DEFAULT_BORDER = "rgba(167, 139, 250, 0.4)";

export function variantBg(v: string): string {
  const map: Record<string, string> = {
    misplaced: "rgba(245, 158, 11, 0.15)",
    missing: "rgba(239, 68, 68, 0.15)",
    extra: "rgba(59, 130, 246, 0.15)",
    depth: "rgba(20, 184, 166, 0.15)",
    analysis: DEFAULT_BG,
  };
  return map[v] ?? DEFAULT_BG;
}

export function variantBorder(v: string): string {
  const map: Record<string, string> = {
    misplaced: "rgba(245, 158, 11, 0.4)",
    missing: "rgba(239, 68, 68, 0.4)",
    extra: "rgba(59, 130, 246, 0.4)",
    depth: "rgba(20, 184, 166, 0.4)",
    analysis: DEFAULT_BORDER,
  };
  return map[v] ?? DEFAULT_BORDER;
}

export function statusBg(s: string): string {
  const map: Record<string, string> = {
    matched: "rgba(16, 185, 130, 0.2)",
    misplaced: "rgba(245, 158, 11, 0.2)",
    missing: "rgba(239, 68, 68, 0.2)",
    extra: "rgba(59, 130, 246, 0.2)",
  };
  return map[s] ?? "#f3f4f6";
}

export function statusBorder(s: string): string {
  const map: Record<string, string> = {
    matched: "rgba(16, 185, 130, 0.4)",
    misplaced: "rgba(245, 158, 11, 0.4)",
    missing: "rgba(239, 68, 68, 0.4)",
    extra: "rgba(59, 130, 246, 0.4)",
  };
  return map[s] ?? "#e5e7eb";
}

export function severityBg(s: string): string {
  const map: Record<string, string> = {
    LOW: "rgba(16, 185, 130, 0.2)",
    MEDIUM: "rgba(245, 158, 11, 0.2)",
    HIGH: "rgba(239, 68, 68, 0.2)",
  };
  return map[s] ?? "#f3f4f6";
}

export function severityColor(s: string): string {
  const map: Record<string, string> = {
    LOW: "#10b982",
    MEDIUM: "#f59e0b",
    HIGH: "#ef4444",
  };
  return map[s] ?? "#1a1a1a";
}

export function severityBorder(s: string): string {
  const map: Record<string, string> = {
    LOW: "rgba(16, 185, 130, 0.4)",
    MEDIUM: "rgba(245, 158, 11, 0.4)",
    HIGH: "rgba(239, 68, 68, 0.4)",
  };
  return map[s] ?? "#e5e7eb";
}
