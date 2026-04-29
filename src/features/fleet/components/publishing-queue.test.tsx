import { render, screen } from "@testing-library/react";

import PublishingQueue from "./publishing-queue";

describe("PublishingQueue", () => {
  it("should render an empty state when there are no rows", () => {
    render(<PublishingQueue rows={[]} />);

    expect(screen.getByRole("heading", { name: /publishing queue/i })).toBeInTheDocument();
    expect(screen.getByText(/no campaigns in the publishing queue yet/i)).toBeInTheDocument();
  });

  it("should render publishing, scheduled, and live states", () => {
    render(
      <PublishingQueue
        rows={[
          {
            id: "p1",
            name: "Weekend Sale",
            target: "ESL",
            completedTags: 25,
            totalTags: 100,
            state: "publishing",
            fleetState: "publishing",
          },
          {
            id: "p2",
            name: "Holiday Sale",
            target: "LCD",
            completedTags: 0,
            totalTags: 50,
            state: "publishing",
            fleetState: "scheduled",
          },
          {
            id: "p3",
            name: "Bakery Push",
            target: "ESL",
            completedTags: 50,
            totalTags: 50,
            state: "live",
            fleetState: "publishing",
          },
        ]}
      />,
    );

    expect(screen.getByText("Weekend Sale")).toBeInTheDocument();
    expect(screen.getByText("Publishing")).toBeInTheDocument();
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
    expect(screen.getByText(/live/i)).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
  });
});
