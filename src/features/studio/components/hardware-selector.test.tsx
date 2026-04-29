import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HardwareSelector from "./hardware-selector";

describe("HardwareSelector", () => {
  const options = [
    { id: "chroma42" as const, label: "Chroma 42", sub: "400×300" },
    { id: "lcd" as const, label: "LCD Banner", sub: "1920×1080" },
  ];

  it("should render the active hardware option", () => {
    render(<HardwareSelector active="chroma42" onSelect={jest.fn()} options={options} />);

    expect(screen.getByRole("button", { name: /select target hardware/i })).toHaveTextContent("Chroma 42");
  });

  it("should open options and call onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(<HardwareSelector active="chroma42" onSelect={onSelect} options={options} />);

    await user.click(screen.getByRole("button", { name: /select target hardware/i }));
    await user.click(screen.getByRole("option", { name: /lcd banner/i }));

    expect(onSelect).toHaveBeenCalledWith("lcd");
    expect(screen.queryByRole("listbox", { name: /hardware options/i })).not.toBeInTheDocument();
  });
});
