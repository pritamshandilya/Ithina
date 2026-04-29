import { render, screen } from "@testing-library/react";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("should render a placeholder element with forwarded attributes", () => {
    render(<Skeleton aria-label="Loading campaigns" />);

    expect(screen.getByLabelText(/loading campaigns/i)).toBeInTheDocument();
  });
});
