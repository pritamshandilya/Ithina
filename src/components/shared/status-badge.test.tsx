import { render, screen } from "@testing-library/react";

import StatusBadge from "./status-badge";

describe("StatusBadge", () => {
  it("should render the provided label", () => {
    render(<StatusBadge label="Approved" />);

    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("should render success badge text when an icon is requested", () => {
    render(<StatusBadge label="All Pass" variant="success" showIcon />);

    expect(screen.getByText("All Pass")).toBeInTheDocument();
  });

  it.each(["warning", "danger", "info", "neutral"] as const)(
    "should render %s variant text",
    (variant) => {
      render(<StatusBadge label={variant} variant={variant} />);

      expect(screen.getByText(variant)).toBeInTheDocument();
    },
  );
});
