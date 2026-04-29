import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { HardwareDeviceId } from "@/types/wizard";

import ScreenSelector from "./screen-selector";

jest.mock("@/features/wizard/lib/preview-layout", () => ({
  defaultPromoApiBase: () => "https://test.local",
}));

jest.mock("@/hooks/use-wizard", () => ({
  useHardwareDevices: () => ({
    data: [
      { id: "chroma42", name: "Chroma 42", resolution: "400×300", track: "ESL" },
      { id: "lcd", name: "LCD Banner", resolution: "1920×1080", track: "LCD" },
    ],
  }),
}));

jest.mock("./nl-hardware-step", () => ({
  __esModule: true,
  default: () => <div>NL hardware step</div>,
}));

const baseProps = {
  mode: "manual" as const,
  stepNumber: 1,
  totalSteps: 2,
  selectedDevices: [] as HardwareDeviceId[],
  onToggleDevice: jest.fn(),
  activeDevice: null,
  onSetActiveDevice: jest.fn(),
  designConfigured: false,
  onSetDesignConfigured: jest.fn(),
  showStudio: false,
  onSetShowStudio: jest.fn(),
  selectedVariant: "B" as const,
  onSetSelectedVariant: jest.fn(),
  sizeByDevice: { chroma29: [], chroma42: [], lcd: [] },
  onToggleSize: jest.fn(),
  onNext: jest.fn(),
};

describe("ScreenSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render manual screen selection context and available devices", () => {
    render(<ScreenSelector {...baseProps} />);

    expect(screen.getAllByText("Select Your Screens")).toHaveLength(2);
    expect(screen.getByText("Chroma 42")).toBeInTheDocument();
    expect(screen.getByText("LCD Banner")).toBeInTheDocument();
    expect(screen.getByText("0 screens selected")).toBeInTheDocument();
  });

  it("should disable the next action when no device is selected", () => {
    render(<ScreenSelector {...baseProps} />);

    expect(screen.getByRole("button", { name: /next: upload banners/i })).toBeDisabled();
  });

  it("should call onToggleDevice when a device card is clicked", async () => {
    const user = userEvent.setup();
    const onToggleDevice = jest.fn();

    render(<ScreenSelector {...baseProps} onToggleDevice={onToggleDevice} />);

    await user.click(screen.getByRole("checkbox", { name: /chroma 42/i }));

    expect(onToggleDevice).toHaveBeenCalledWith("chroma42");
  });

  it("should call onNext when a selected device enables the next action", async () => {
    const user = userEvent.setup();
    const onNext = jest.fn();

    render(<ScreenSelector {...baseProps} selectedDevices={["lcd"]} onNext={onNext} />);

    await user.click(screen.getByRole("button", { name: /next: upload banners/i }));

    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
