import type { FleetStat, HardwareAlert, QueueRow } from "@/types/fleet";

export const MOCK_FLEET_STATS: FleetStat[] = [
  { label: "Active Batches", value: "1", trend: "Running", trendVariant: "purple" },
  { label: "Tags In Transit (RF)", value: "740", suffix: "Queued", trend: "Queued", trendVariant: "muted" },
  { label: "Hardware Success Rate", value: "99.2", suffix: "%", trend: "Last 24h", trendVariant: "success" },
  { label: "Hardware Alerts", value: "1", trend: "Requires Action", trendVariant: "danger", isAlert: true },
];

export const MOCK_QUEUE_ROWS: QueueRow[] = [
  { name: "Sushi Clearance - Track 1", target: "1-Bit BMP (Chroma 42)", totalTags: 1240, completedTags: 0, state: "publishing", animated: true },
  { name: "Sushi Clearance - Track 2", target: "1080p PNG (Endcap)", totalTags: 5, completedTags: 5, state: "live" },
];

export const MOCK_HARDWARE_ALERT: HardwareAlert = {
  title: "RF Comms Failure",
  code: "Code: -1002",
  store: "#4281",
  tagCount: 124,
  description: "Failed to receive image payload. Tags may be out of RF range or physically blocked.",
};
