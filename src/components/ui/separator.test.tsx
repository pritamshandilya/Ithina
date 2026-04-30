import { render, screen } from "@testing-library/react";

import { Separator } from "./separator";

describe("Separator", () => {
  it("should be decorative by default", () => {
    render(<Separator data-testid="separator" />);

    expect(screen.getByTestId("separator")).toBeInTheDocument();
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("should expose separator semantics when decorative is false", () => {
    render(<Separator decorative={false} orientation="vertical" />);

    expect(screen.getByRole("separator")).toHaveAttribute("data-orientation", "vertical");
  });
});
