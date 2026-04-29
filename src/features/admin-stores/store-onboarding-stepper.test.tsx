import { Store, Settings, Users } from "lucide-react";
import { render, screen } from "@testing-library/react";

import { StoreOnboardingStepper } from "./store-onboarding-stepper";

describe("StoreOnboardingStepper", () => {
  it("should render all onboarding steps", () => {
    render(<StoreOnboardingStepper step={1} icons={{ basic: Store, config: Settings, team: Users }} />);

    expect(screen.getByText("Basic details")).toBeInTheDocument();
    expect(screen.getByText("Store configuration")).toBeInTheDocument();
    expect(screen.getByText("Team members")).toBeInTheDocument();
    expect(screen.getByText("Name and address")).toBeInTheDocument();
    expect(screen.getByText("Defaults & dimensions")).toBeInTheDocument();
    expect(screen.getByText("Assign makers & checkers")).toBeInTheDocument();
  });
});
