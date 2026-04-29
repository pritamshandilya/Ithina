import { render, screen } from "@testing-library/react";

import StatCard from "./stat-card";

describe("StatCard", () => {
  it("should render dashboard stat label, value, and trend", () => {
    render(
      <StatCard
        data={{
          label: "Active Campaigns",
          value: "24",
          trend: { text: "+12% vs last week", variant: "success" },
        }}
      />,
    );

    expect(screen.getByText("Active Campaigns")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("+12% vs last week")).toBeInTheDocument();
  });
});
