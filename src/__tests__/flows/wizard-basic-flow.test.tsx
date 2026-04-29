import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ModeChooser, { type WizardEntryInput, type WizardMode } from "@/features/wizard/components/mode-chooser";
import ScreenSelector from "@/features/wizard/components/screen-selector";
import type { HardwareDeviceId } from "@/types/wizard";

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

jest.mock("@/features/wizard/components/nl-hardware-step", () => ({
  __esModule: true,
  default: ({ onNext }: { onNext: () => void }) => (
    <div>
      <p>NL hardware step</p>
      <button type="button" onClick={onNext}>
        Generate Creative Layouts
      </button>
    </div>
  ),
}));

function WizardHarness() {
  const [selection, setSelection] = useState<{ mode: WizardMode; input: WizardEntryInput } | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<HardwareDeviceId[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (!selection) {
    return <ModeChooser onSelect={(mode, input) => setSelection({ mode, input })} />;
  }

  return (
    <>
      <ScreenSelector
        activeDevice={null}
        designConfigured={false}
        mode={selection.input === "csv" ? "manual" : selection.mode}
        onNext={() => setSubmitted(true)}
        onSetActiveDevice={jest.fn()}
        onSetDesignConfigured={jest.fn()}
        onSetSelectedVariant={jest.fn()}
        onSetShowStudio={jest.fn()}
        onToggleDevice={(id) =>
          setSelectedDevices((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
        }
        onToggleSize={jest.fn()}
        selectedDevices={selectedDevices}
        selectedVariant="B"
        showStudio={false}
        sizeByDevice={{ chroma29: [], chroma42: [], lcd: [] }}
        stepNumber={1}
        totalSteps={2}
      />
      {submitted ? <p role="status">Wizard progressed</p> : null}
    </>
  );
}

describe("wizard basic flow", () => {
  it("should progress through CSV/manual screen selection", async () => {
    const user = userEvent.setup();

    render(<WizardHarness />);

    await user.click(screen.getByRole("button", { name: /csv upload/i }));
    expect(screen.getAllByText("Select Your Screens")).toHaveLength(2);

    await user.click(screen.getByRole("checkbox", { name: /lcd banner/i }));
    await user.click(screen.getByRole("button", { name: /next: upload banners/i }));

    expect(screen.getByRole("status")).toHaveTextContent("Wizard progressed");
  });
});
