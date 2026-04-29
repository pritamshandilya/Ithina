import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import InsightCard from "./insight-card";

describe("InsightCard", () => {
  it("should render insight content and severity label", () => {
    render(
      <InsightCard
        data={{
          id: "i1",
          severity: "time-sensitive",
          title: "Promote expiring dairy",
          description: "Milk inventory expires soon.",
          timestamp: "2h ago",
          actionLabel: "Create promo",
        }}
      />,
    );

    expect(screen.getByText("Time Sensitive")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /promote expiring dairy/i })).toBeInTheDocument();
    expect(screen.getByText(/milk inventory expires soon/i)).toBeInTheDocument();
    expect(screen.getByText("2h ago")).toBeInTheDocument();
  });

  it("should call onAction from the action button", async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();

    render(
      <InsightCard
        onAction={onAction}
        data={{
          id: "i1",
          severity: "high-stock",
          title: "High-stock bakery",
          description: "Clear extra bread inventory.",
          actionLabel: "Create promo",
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /create promo/i }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
