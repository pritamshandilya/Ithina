import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TemplateWizardManualStep } from "./template-wizard-manual-step";

describe("TemplateWizardManualStep", () => {
  const value = {
    fileName: "",
    hw: "chroma42" as const,
    name: "",
  };

  it("should render template name, hardware choices, and upload prompt", () => {
    render(<TemplateWizardManualStep value={value} onChange={jest.fn()} />);

    expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /esl chroma 42/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /lcd banner/i })).toBeInTheDocument();
    expect(screen.getByText(/upload your design file/i)).toBeInTheDocument();
  });

  it("should emit template name and hardware changes", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<TemplateWizardManualStep value={value} onChange={onChange} />);

    await user.type(screen.getByLabelText(/template name/i), "Weekend Flash");
    await user.click(screen.getByRole("button", { name: /lcd banner/i }));

    expect(onChange).toHaveBeenCalledWith({ ...value, name: "W" });
    expect(onChange).toHaveBeenCalledWith({ ...value, hw: "lcd" });
  });

  it("should emit selected file name", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<TemplateWizardManualStep value={value} onChange={onChange} />);

    await user.upload(screen.getByLabelText(/upload your design file/i), new File(["data"], "banner.png", { type: "image/png" }));

    expect(onChange).toHaveBeenCalledWith({ ...value, fileName: "banner.png" });
  });
});
