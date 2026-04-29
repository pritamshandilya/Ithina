import { render, screen } from "@testing-library/react";

import PayloadManifest from "./payload-manifest";

jest.mock("@/components/ui/data-table", () => ({
  DataTable: ({
    data,
    emptyMessage,
  }: {
    data: Array<{ sku: string; name: string; marginStatus: string }>;
    emptyMessage: string;
  }) => (
    <div>
      {data.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        data.map((row) => (
          <div key={row.sku}>
            <span>{row.sku}</span>
            <span>{row.name}</span>
            <span>{row.marginStatus}</span>
          </div>
        ))
      )}
    </div>
  ),
}));

describe("PayloadManifest", () => {
  it("should render the manifest heading and rows", () => {
    render(
      <PayloadManifest
        rows={[
          {
            sku: "SKU-1",
            name: "Apple Juice",
            oldPrice: 4.99,
            newPrice: 3.99,
            marginStatus: "pass",
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: /api payload manifest/i })).toBeInTheDocument();
    expect(screen.getByText("SKU-1")).toBeInTheDocument();
    expect(screen.getByText("Apple Juice")).toBeInTheDocument();
  });

  it("should render the empty message when there are no rows", () => {
    render(<PayloadManifest rows={[]} />);

    expect(screen.getByText("No payload items")).toBeInTheDocument();
  });
});
