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
  name: string;
  target: string;
  totalTags: number;
  completedTags: number;
  state: "publishing" | "completed" | "live";
  animated?: boolean;
}

export interface HardwareAlert {
  title: string;
  code: string;
  store: string;
  tagCount: number;
  description: string;
}
