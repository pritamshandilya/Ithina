import { render, screen } from "@testing-library/react";

import ValidationPanel from "./validation-panel";

describe("ValidationPanel", () => {
  it("should render validation heading and checks", () => {
    render(
      <ValidationPanel
        checks={[
          { label: "Price OCR", passed: true, value: "Matched" },
          { label: "Margin", passed: false, value: "Below threshold", isException: true },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: /agent 6: ocr validation passed/i })).toBeInTheDocument();
    expect(screen.getByText("Price OCR")).toBeInTheDocument();
    expect(screen.getByText("Matched")).toBeInTheDocument();
    expect(screen.getByText("Margin")).toBeInTheDocument();
    expect(screen.getByText("Below threshold")).toBeInTheDocument();
  });
});
