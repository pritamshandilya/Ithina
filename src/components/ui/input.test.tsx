import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Input } from "./input";

describe("Input", () => {
  it("should render an accessible text input", () => {
    render(<Input aria-label="Campaign name" />);

    expect(screen.getByRole("textbox", { name: /campaign name/i })).toBeInTheDocument();
  });

  it("should allow users to type into the field", async () => {
    const user = userEvent.setup();

    render(<Input aria-label="Campaign name" />);

    await user.type(screen.getByRole("textbox", { name: /campaign name/i }), "Weekend Sale");

    expect(screen.getByRole("textbox", { name: /campaign name/i })).toHaveValue("Weekend Sale");
  });

  it("should respect disabled state", () => {
    render(<Input aria-label="Store ID" disabled />);

    expect(screen.getByLabelText(/store id/i)).toBeDisabled();
  });

  it("should render number inputs with spinbutton semantics", () => {
    render(<Input aria-label="SKU count" type="number" />);

    expect(screen.getByRole("spinbutton", { name: /sku count/i })).toBeInTheDocument();
  });
});
