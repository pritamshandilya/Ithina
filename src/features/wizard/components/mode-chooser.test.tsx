import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("lucide-react", () => ({
  CloudUpload: () => (
    <svg aria-hidden data-testid="icon-cloud-upload">
      <title>CloudUpload icon</title>
    </svg>
  ),
  MessageCircle: () => (
    <svg aria-hidden data-testid="icon-message-circle">
      <title>MessageCircle icon</title>
    </svg>
  ),
}));

import ModeChooser from "./mode-chooser";

describe("ModeChooser", () => {
  describe("when mounted with a spy handler", () => {
    let onSelect: jest.Mock;

    beforeEach(() => {
      onSelect = jest.fn();
      render(<ModeChooser onSelect={onSelect} />);
    });

    describe("rendering", () => {
      it('should render the "New Campaign" heading', () => {
        expect(screen.getByRole("heading", { level: 2, name: "New Campaign" })).toBeInTheDocument();
      });

      it("should render the descriptive subtitle text", () => {
        expect(
          screen.getByText(/How do you want to stage product data for this campaign\?/i),
        ).toBeInTheDocument();
      });

      it('should render the "NL / AI Assisted" button', () => {
        expect(screen.getByRole("button", { name: /NL \/ AI Assisted/i })).toBeInTheDocument();
      });

      it('should render the "CSV Upload" button', () => {
        expect(screen.getByRole("button", { name: /CSV Upload/i })).toBeInTheDocument();
      });

      it("should render all four feature badges", () => {
        expect(screen.getByText("Auto SKU Staging")).toBeInTheDocument();
        expect(screen.getByText("AI Layouts")).toBeInTheDocument();
        expect(screen.getByText("CSV Import")).toBeInTheDocument();
        expect(screen.getByText("Manual Upload")).toBeInTheDocument();
      });

      it("should render exactly two buttons", () => {
        expect(screen.getAllByRole("button")).toHaveLength(2);
      });
    });

    describe("user interactions", () => {
      it('should call onSelect with ("nl", "ai") when NL/AI Assisted button is clicked', async () => {
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /NL \/ AI Assisted/i }));

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith("nl", "ai");
      });

      it('should call onSelect with ("nl", "csv") when CSV Upload button is clicked', async () => {
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /CSV Upload/i }));

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith("nl", "csv");
      });

      it("should not call onSelect on initial render", () => {
        expect(onSelect).not.toHaveBeenCalled();
      });

      it("should call onSelect exactly once per click (no double-fire)", async () => {
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /CSV Upload/i }));

        expect(onSelect).toHaveBeenCalledTimes(1);
      });

      it("should handle multiple sequential clicks with correct cumulative call count", async () => {
        const user = userEvent.setup();
        const nlButton = screen.getByRole("button", { name: /NL \/ AI Assisted/i });

        await user.click(nlButton);
        await user.click(nlButton);

        expect(onSelect).toHaveBeenCalledTimes(2);
        expect(onSelect).toHaveBeenNthCalledWith(1, "nl", "ai");
        expect(onSelect).toHaveBeenNthCalledWith(2, "nl", "ai");
      });
    });

    describe("accessibility", () => {
      it("should render buttons with accessible text content", () => {
        expect(screen.getByRole("button", { name: /NL \/ AI Assisted/i })).toBeVisible();
        expect(screen.getByRole("button", { name: /CSV Upload/i })).toBeVisible();
      });

      it("should render the heading at the correct semantic level", () => {
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("New Campaign");
      });
    });
  });

  describe("edge cases", () => {
    it("should not throw when onSelect is a no-op", async () => {
      const noop = jest.fn();
      const user = userEvent.setup();

      render(<ModeChooser onSelect={noop} />);

      await expect(user.click(screen.getByRole("button", { name: /CSV Upload/i }))).resolves.not.toThrow();
      expect(noop).toHaveBeenCalled();
    });

    it("should render consistently across re-renders with the same prop", () => {
      const handler = jest.fn();
      const { rerender } = render(<ModeChooser onSelect={handler} />);

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("New Campaign");

      rerender(<ModeChooser onSelect={handler} />);

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("New Campaign");
    });
  });
});
