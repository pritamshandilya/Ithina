import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import WizardZeroState from "./zero-state";

describe("WizardZeroState", () => {
  it("should render the campaign intent entry messaging", () => {
    render(<WizardZeroState onSwitchToCsv={jest.fn()} />);

    expect(screen.getByRole("heading", { name: /campaign intent engine/i })).toBeInTheDocument();
    expect(screen.getByText(/describe your promotion in plain language/i)).toBeInTheDocument();
  });

  it("should call onSwitchToCsv when the CSV option is clicked", async () => {
    const user = userEvent.setup();
    const onSwitchToCsv = jest.fn();

    render(<WizardZeroState onSwitchToCsv={onSwitchToCsv} />);

    await user.click(screen.getByRole("button", { name: /upload a sku csv/i }));

    expect(onSwitchToCsv).toHaveBeenCalledTimes(1);
  });
});
