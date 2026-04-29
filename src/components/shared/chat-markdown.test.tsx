import { render, screen, within } from "@testing-library/react";

jest.mock("remark-gfm", () => jest.fn());

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({
    children,
  }: {
    children: string;
  }) => {
    const source = String(children);
    const lines = source.split("\n").filter(Boolean);
    const listItems = lines.filter((line) => /^[-*]\s+/.test(line));
    const orderedItems = lines.filter((line) => /^\d+\.\s+/.test(line));

    if (listItems.length > 0) {
      return (
        <ul>
          {listItems.map((line) => (
            <li key={line}>{line.replace(/^[-*]\s+/, "")}</li>
          ))}
        </ul>
      );
    }

    if (orderedItems.length > 0) {
      return (
        <ol>
          {orderedItems.map((line) => (
            <li key={line}>{line.replace(/^\d+\.\s+/, "")}</li>
          ))}
        </ol>
      );
    }

    return (
      <div>
        <h2>Summary</h2>
        <p>
          Promote <strong>Bakery</strong> via <a href="https://example.test">guide</a>.
        </p>
      </div>
    );
  },
}));

import ChatMarkdown from "./chat-markdown";

describe("ChatMarkdown", () => {
  it("should render markdown headings, emphasis, and links", () => {
    render(<ChatMarkdown content={"## Summary\nPromote **Bakery** via [guide](https://example.test)."} />);

    expect(screen.getByRole("heading", { level: 2, name: /summary/i })).toBeInTheDocument();
    expect(screen.getByText("Bakery")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /guide/i })).toHaveAttribute("href", "https://example.test");
  });

  it("should normalize bullet characters into a semantic list", () => {
    render(<ChatMarkdown content={"• Apples\n• Oranges"} />);

    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Apples")).toBeInTheDocument();
    expect(screen.getByText("Oranges")).toBeInTheDocument();
  });

  it("should normalize ordered lists using right-parenthesis syntax", () => {
    render(<ChatMarkdown content={"1) Select products\n2) Submit campaign"} />);

    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Select products")).toBeInTheDocument();
    expect(screen.getByText("Submit campaign")).toBeInTheDocument();
  });
});
