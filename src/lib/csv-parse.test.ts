import { parseCsvLine, parseCsvTextToKeyedRows, serializeCsv } from "./csv-parse";

describe("csv-parse", () => {
  it("should parse quoted fields and escaped quotes", () => {
    expect(parseCsvLine('"SKU, One","Apple ""Large""",3.99')).toEqual([
      "SKU, One",
      'Apple "Large"',
      "3.99",
    ]);
  });

  it("should parse text into keyed rows using canonical headers", () => {
    const rows = parseCsvTextToKeyedRows("sku,name,price\n1001,Apples,3.99", ["sku", "name", "price"]);

    expect(rows).toEqual([{ sku: "1001", name: "Apples", price: "3.99" }]);
  });

  it("should throw when file headers do not match canonical header count", () => {
    expect(() => parseCsvTextToKeyedRows("sku,name\n1001,Apples", ["sku", "name", "price"])).toThrow(
      /expected 3/i,
    );
  });

  it("should serialize fields that require quoting", () => {
    expect(serializeCsv(["sku", "name"], [{ sku: "1001", name: 'Apple, "Large"' }])).toBe(
      'sku,name\n1001,"Apple, ""Large"""',
    );
  });
});
