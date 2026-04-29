import { render, screen } from "@testing-library/react";

import PageHeader from "./page-header";

describe("PageHeader", () => {
  it("should render breadcrumbs, title, actions, and connection status", () => {
    render(
      <PageHeader
        breadcrumbs={[{ label: "Admin" }, { label: "Campaigns", isActive: true }]}
        title="Campaign Library"
        actions={<button type="button">Create Campaign</button>}
      />,
    );

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Campaigns")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /campaign library/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create campaign/i })).toBeInTheDocument();
    expect(screen.getByText(/roos connected/i)).toBeInTheDocument();
  });
});
