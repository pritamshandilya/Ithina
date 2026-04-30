import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import WizardStepHeader from "./wizard-step-header";

describe("WizardStepHeader", () => {
  const steps = ["Products", "Screens", "Submit"];

  it("should render AI-assisted mode and step labels", () => {
    render(<WizardStepHeader mode="nl" currentStep={2} steps={steps} onBack={jest.fn()} />);

    expect(screen.getByText("AI Assisted")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Screens")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument();
  });

  it("should render CSV upload mode when NL mode uses CSV input", () => {
    render(<WizardStepHeader mode="nl" inputMode="csv" currentStep={1} steps={steps} onBack={jest.fn()} />);

    expect(screen.getByText("CSV Upload")).toBeInTheDocument();
  });

  it("should call onBack when the back button is clicked", async () => {
    const user = userEvent.setup();
    const onBack = jest.fn();

    render(<WizardStepHeader mode="manual" currentStep={1} steps={steps} onBack={onBack} />);

    await user.click(screen.getByRole("button", { name: /go back/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("should call onStepClick for current and completed steps only", async () => {
    const user = userEvent.setup();
    const onStepClick = jest.fn();

    render(
      <WizardStepHeader
        mode="nl"
        currentStep={2}
        steps={steps}
        onBack={jest.fn()}
        onStepClick={onStepClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: /products/i }));
    await user.click(screen.getByRole("button", { name: /screens/i }));

    expect(onStepClick).toHaveBeenNthCalledWith(1, 1);
    expect(onStepClick).toHaveBeenNthCalledWith(2, 2);
    expect(screen.queryByRole("button", { name: /submit/i })).not.toBeInTheDocument();
  });

  it("should render trailing actions", () => {
    render(
      <WizardStepHeader
        mode="manual"
        currentStep={1}
        steps={steps}
        onBack={jest.fn()}
        trailingSlot={<button type="button">Continue</button>}
      />,
    );

    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });
});
