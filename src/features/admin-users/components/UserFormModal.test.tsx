import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { OrgUser } from "../types";
import { UserFormModal } from "./UserFormModal";

const editingUser: OrgUser = {
  id: "u1",
  firstName: "Priya",
  lastName: "Shah",
  email: "priya@example.test",
  role: "checker",
  status: "active",
  storeIds: ["s1"],
  createdAt: "2026-01-01",
  lastLoginAt: null,
};

describe("UserFormModal", () => {
  it("should validate required invite fields before saving", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();

    render(<UserFormModal onClose={jest.fn()} onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: /send invitation/i }));

    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/initial password is required/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("should submit invite form data when valid", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();

    render(<UserFormModal onClose={jest.fn()} onSave={onSave} />);

    await user.type(screen.getByLabelText(/first name/i), "Asha");
    await user.type(screen.getByLabelText(/last name/i), "Rao");
    await user.type(screen.getByLabelText(/email address/i), "asha@example.test");
    await user.type(screen.getByLabelText(/initial password/i), "password123");
    await user.selectOptions(screen.getByLabelText(/user role/i), "admin");
    await user.click(screen.getByRole("button", { name: /send invitation/i }));

    expect(onSave).toHaveBeenCalledWith({
      firstName: "Asha",
      lastName: "Rao",
      email: "asha@example.test",
      password: "password123",
      role: "admin",
      status: "active",
    });
  });

  it("should render edit mode with email disabled", () => {
    render(<UserFormModal editingUser={editingUser} onClose={jest.fn()} onSave={jest.fn()} />);

    expect(screen.getByRole("dialog", { name: /edit user/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    expect(screen.getByLabelText(/account status/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });
});
