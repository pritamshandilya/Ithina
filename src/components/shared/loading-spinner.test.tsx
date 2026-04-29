import { render, screen } from "@testing-library/react";

import LoadingSpinner from "./loading-spinner";

describe("LoadingSpinner", () => {
  it("should render a status region with the default label", () => {
    render(<LoadingSpinner />);

    expect(screen.getByRole("status", { name: /loading/i })).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render a custom loading label", () => {
    render(<LoadingSpinner label="Loading approvals" />);

    expect(screen.getByRole("status", { name: /loading approvals/i })).toBeInTheDocument();
    expect(screen.getByText("Loading approvals")).toBeInTheDocument();
  });
});
