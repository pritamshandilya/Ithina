import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RuleModal from "./rule-modal";

describe("RuleModal", () => {
  const form = {
    badge: false,
    category: "",
    colorRestrict: "None",
    disclaimer: "",
    priceDisplay: "FULL",
    special: "",
  };

  it("should render category override fields", () => {
    render(<RuleModal form={form} onChange={jest.fn()} onClose={jest.fn()} onSave={jest.fn()} />);

    expect(screen.getByRole("dialog", { name: /add category override/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /add category override/i })).toBeInTheDocument();
    expect(screen.getByText(/allow promotional badges/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("FULL")).toBeInTheDocument();
  });

  it("should call onChange when category changes", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<RuleModal form={form} onChange={onChange} onClose={jest.fn()} onSave={jest.fn()} />);

    await user.type(screen.getByPlaceholderText(/cannabis/i), "Pharmacy");

    expect(onChange).toHaveBeenCalledWith({ ...form, category: "P" });
  });

  it("should call onSave and onClose from footer actions", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onSave = jest.fn();

    render(<RuleModal form={form} onChange={jest.fn()} onClose={onClose} onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: /save override/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
