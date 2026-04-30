import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "./button";

describe("Button", () => {
  it("should render a native button with accessible text", () => {
    render(<Button>Save changes</Button>);

    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });

  it("should call the click handler when enabled", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Approve</Button>);

    await user.click(screen.getByRole("button", { name: /approve/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should not call the click handler when disabled", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <Button disabled onClick={onClick}>
        Approve
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: /approve/i }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("should render as a child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/campaigns">Campaigns</a>
      </Button>,
    );

    expect(screen.getByRole("link", { name: /campaigns/i })).toHaveAttribute("href", "/campaigns");
  });
});
