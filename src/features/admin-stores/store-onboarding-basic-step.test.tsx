import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { StoreOnboardingBasicStep } from "./store-onboarding-basic-step";

describe("StoreOnboardingBasicStep", () => {
  const props = {
    name: "",
    address: "",
    region: "",
    currency: "USD",
    canContinue: false,
    onNameChange: jest.fn(),
    onAddressChange: jest.fn(),
    onRegionChange: jest.fn(),
    onCurrencyChange: jest.fn(),
    onNext: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render basic store detail fields", () => {
    render(<StoreOnboardingBasicStep {...props} />);

    expect(screen.getByRole("heading", { name: /basic store details/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/store name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/region/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select store currency/i)).toHaveValue("USD");
  });

  it("should disable next until the step can continue", () => {
    render(<StoreOnboardingBasicStep {...props} />);

    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("should emit field changes and next action", async () => {
    const user = userEvent.setup();
    const onNameChange = jest.fn();
    const onNext = jest.fn();

    render(<StoreOnboardingBasicStep {...props} canContinue onNameChange={onNameChange} onNext={onNext} />);

    await user.type(screen.getByLabelText(/store name/i), "Downtown");
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(onNameChange).toHaveBeenCalled();
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
