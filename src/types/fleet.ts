export interface FleetStat {
  label: string;
  value: string;
  suffix?: string;
  trend: string;
  trendVariant: "purple" | "muted" | "success" | "danger";
  footnote?: string;
  isAlert?: boolean;
}

export interface QueueRow {
  /** Campaign id when row is derived from API data (stable React key). */
  id?: string;
  name: string;
  target: string;
  totalTags: number;
  completedTags: number;
  state: "publishing" | "completed" | "live";
  animated?: boolean;
  /** Derived from API status for row labels when present. */
  fleetState?: "scheduled" | "publishing" | "live";
}

export interface HardwareAlert {
  id?: string;
  title: string;
  code: string;
  store: string;
  tagCount: number;
  description: string;
}
