import { render, screen } from "@testing-library/react";

import FleetStats from "./fleet-stats";

describe("FleetStats", () => {
  const stats = [
    { label: "Active Batches", value: "0", trend: "Idle", trendVariant: "purple" as const },
    { label: "Tags In Transit (RF)", value: "0", trend: "Queued", trendVariant: "muted" as const },
    { label: "Hardware Success Rate", value: "0", suffix: "%", trend: "Last 24h", trendVariant: "success" as const },
    { label: "Hardware Alerts", value: "0", trend: "All Clear", trendVariant: "danger" as const, isAlert: true },
  ];

  it("should render dynamic fleet metrics", () => {
    render(
      <FleetStats
        stats={stats}
        batchStartedAt="10:00 AM"
        alertCount={2}
        hasAlert
        tagsInTransit={1234}
        successRate={98}
      />,
    );

    expect(screen.getByText("Active Batches")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("98")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Requires Action")).toBeInTheDocument();
    expect(screen.getByText(/initiated: 10:00 am/i)).toBeInTheDocument();
  });

  it("should show all-clear status when there are no alerts", () => {
    render(
      <FleetStats
        stats={stats}
        batchStartedAt="10:00 AM"
        alertCount={0}
        hasAlert={false}
        tagsInTransit={0}
        successRate={100}
      />,
    );

    expect(screen.getByText("All Clear")).toBeInTheDocument();
  });
});
