import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { TmEditFields, TmEditTemplate } from "@/store/slices/templates-slice";

import { TemplateWizardColourStep } from "./template-wizard-colour-step";

const editTemplate: TmEditTemplate = {
  headerBg: "bg-red-600",
  headerText: "SALE",
  hw: "chroma42",
  hwLabel: "ESL Chroma 42",
  id: "tm1",
  name: "Weekend Sale",
  productLine: null,
};

const editFields: TmEditFields = {
  headerBg: "bg-red-600",
  headerHex: "#ff0000",
  headerFontSize: 24,
  headerText: "SALE",
  layout: "price-right",
  lcdBg: "#1e293b",
  nameColor: "#000000",
  nameFontSize: 14,
  price: "$9.99",
  priceColor: "#000000",
  priceFontSize: 48,
  productName: "Product Name",
  showWas: false,
  wasPrice: "",
};

describe("TemplateWizardColourStep", () => {
  it("should render template editing controls and preview", () => {
    render(
      <TemplateWizardColourStep
        allTags={["Clearance", "Bakery"]}
        editFields={editFields}
        editTemplate={editTemplate}
        setEf={jest.fn()}
      />,
    );

    expect(screen.getByDisplayValue("Weekend Sale")).toBeInTheDocument();
    expect(screen.getByDisplayValue("SALE")).toBeInTheDocument();
    expect(screen.getByText("Colour Variations")).toBeInTheDocument();
    expect(screen.getByText("Live Preview")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bakery/i })).toBeInTheDocument();
  });

  it("should update header text and add a variation", async () => {
    const user = userEvent.setup();
    const setEf = jest.fn();

    render(
      <TemplateWizardColourStep
        allTags={["Clearance", "Bakery"]}
        editFields={editFields}
        editTemplate={editTemplate}
        setEf={setEf}
      />,
    );

    await user.clear(screen.getByDisplayValue("SALE"));
    await user.type(screen.getByDisplayValue(""), "DEAL");
    await user.click(screen.getByRole("button", { name: /add variation/i }));

    expect(setEf).toHaveBeenCalledWith("headerText", "");
    expect(setEf).toHaveBeenCalledWith("headerText", "D");
    expect(setEf).toHaveBeenCalledWith("headerBg", expect.any(String));
  });
});
