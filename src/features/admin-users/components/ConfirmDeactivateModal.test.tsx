import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { OrgUser } from "../types";
import { ConfirmDeactivateModal } from "./ConfirmDeactivateModal";

const user: OrgUser = {
  id: "u1",
  firstName: "Priya",
  lastName: "Shah",
  email: "priya@example.test",
  role: "maker",
  status: "active",
  storeIds: ["s1"],
  createdAt: "2026-01-01",
  lastLoginAt: null,
};

describe("ConfirmDeactivateModal", () => {
  it("should render the selected user's full name", () => {
    render(<ConfirmDeactivateModal user={user} onClose={jest.fn()} onConfirm={jest.fn()} />);

    expect(screen.getByRole("dialog", { name: /remove user/i })).toBeInTheDocument();
    expect(screen.getByText("Priya Shah")).toBeInTheDocument();
  });

  it("should call onConfirm when deactivation is confirmed", async () => {
    const userEventApi = userEvent.setup();
    const onConfirm = jest.fn();

    render(<ConfirmDeactivateModal user={user} onClose={jest.fn()} onConfirm={onConfirm} />);

    await userEventApi.click(screen.getByRole("button", { name: /deactivate user/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onClose from the cancel action", async () => {
    const userEventApi = userEvent.setup();
    const onClose = jest.fn();

    render(<ConfirmDeactivateModal user={user} onClose={onClose} onConfirm={jest.fn()} />);

    await userEventApi.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
