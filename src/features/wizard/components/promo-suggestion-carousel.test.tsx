import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import PromoSuggestionCarousel from "./promo-suggestion-carousel";

const chips = [
  "Show me all active campaigns",
  "Promote snacks next",
  "Check stock levels for all SKUs",
  "Increase discount to 35%",
];

describe("PromoSuggestionCarousel", () => {
  it("should send the full suggestion text when a card is clicked", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();

    render(<PromoSuggestionCarousel chips={chips} onPick={onPick} />);

    await user.click(screen.getByRole("button", { name: "Promote snacks next" }));

    expect(onPick).toHaveBeenCalledWith("Promote snacks next");
  });

  it("should page the fixed track and update arrow states", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();

    render(<PromoSuggestionCarousel chips={chips} onPick={onPick} />);

    const track = screen.getByTestId("promo-suggestion-track");
    const previous = screen.getByRole("button", { name: /previous suggestions/i });
    const next = screen.getByRole("button", { name: /next suggestions/i });

    expect(track).toHaveAttribute("data-page", "0");
    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();

    await user.click(next);

    expect(track).toHaveAttribute("data-page", "1");
    expect(previous).toBeEnabled();
    expect(next).toBeDisabled();
  });

  it("should toggle and close the quick action guide", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();

    render(<PromoSuggestionCarousel chips={chips} onPick={onPick} />);

    const guide = screen.getByTestId("promo-suggestion-help");

    expect(guide).toHaveClass("psc-popup-hidden");

    await user.click(screen.getByRole("button", { name: /how these quick actions work/i }));

    expect(guide).not.toHaveClass("psc-popup-hidden");
    expect(screen.getByText("Quick action cards")).toBeInTheDocument();
    expect(screen.getByText("Adjust discounts, quantities or dates on existing items.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /got it/i }));

    expect(guide).toHaveClass("psc-popup-hidden");
  });
});
