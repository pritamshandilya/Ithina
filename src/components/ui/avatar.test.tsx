import { render, screen } from "@testing-library/react";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

describe("Avatar", () => {
  it("should render fallback initials", () => {
    render(
      <Avatar>
        <AvatarFallback>JP</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText("JP")).toBeInTheDocument();
  });

  it("should accept image props without hiding fallback content before image load", () => {
    render(
      <Avatar>
        <AvatarImage alt="Jaya Patel" src="/avatar.png" />
        <AvatarFallback>JP</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText("JP")).toBeInTheDocument();
  });
});
