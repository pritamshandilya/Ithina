import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HardwareTriage from "./hardware-triage";

describe("HardwareTriage", () => {
  it("should render all-clear state when no alert is active", () => {
    render(<HardwareTriage alert={null} hasAlert={false} isResolving={false} onResolve={jest.fn()} />);

    expect(screen.getByRole("heading", { name: /hardware triage/i })).toBeInTheDocument();
    expect(screen.getByText("All Clear")).toBeInTheDocument();
    expect(screen.getByText(/all systems operational/i)).toBeInTheDocument();
  });

  it("should render alert details and allow retry", async () => {
    const user = userEvent.setup();
    const onResolve = jest.fn();

    render(
      <HardwareTriage
        hasAlert
        isResolving={false}
        onResolve={onResolve}
        alert={{
          code: "RF-503",
          description: "RF gateway timeout detected.",
          store: "4281",
          tagCount: 42,
          title: "Gateway timeout",
        }}
      />,
    );

    expect(screen.getByText("1 Active")).toBeInTheDocument();
    expect(screen.getByText("Gateway timeout")).toBeInTheDocument();
    expect(screen.getByText("RF-503")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry hardware api ping/i }));

    expect(onResolve).toHaveBeenCalledTimes(1);
  });

  it("should disable retry while resolving", () => {
    render(
      <HardwareTriage
        hasAlert
        isResolving
        onResolve={jest.fn()}
        alert={{
          code: "RF-503",
          description: "RF gateway timeout detected.",
          store: "4281",
          tagCount: 42,
          title: "Gateway timeout",
        }}
      />,
    );

    expect(screen.getByRole("button", { name: /retry hardware api ping/i })).toBeDisabled();
    expect(screen.getByText(/pinging api/i)).toBeInTheDocument();
  });
});
