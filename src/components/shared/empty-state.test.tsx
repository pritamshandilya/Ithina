import { render, screen } from "@testing-library/react";

import EmptyState from "./empty-state";

describe("EmptyState", () => {
  it("should render the default empty-state messaging", () => {
    render(<EmptyState />);

    expect(screen.getByRole("heading", { name: /no data available/i })).toBeInTheDocument();
    expect(screen.getByText(/data will appear here once available/i)).toBeInTheDocument();
  });

  it("should render custom title and description", () => {
    render(<EmptyState title="No campaigns" description="Create a campaign to get started." />);

    expect(screen.getByRole("heading", { name: /no campaigns/i })).toBeInTheDocument();
    expect(screen.getByText(/create a campaign to get started/i)).toBeInTheDocument();
  });
});
