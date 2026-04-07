import { useState } from "react";
import { UserPlus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { OrgUser, UserFormData, UserRole } from "../types";

interface UserFormModalProps {
  editingUser?: OrgUser | null;
  onSave: (data: UserFormData) => void;
  onClose: () => void;
}

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  {
    value: "maker",
    label: "Maker",
    description: "Creates and submits campaigns for approval.",
  },
  {
    value: "checker",
    label: "Checker",
    description: "Reviews and approves or returns submissions.",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Full access: user management, stores, and org settings.",
  },
];

const ROLE_COLOR: Record<UserRole, string> = {
  admin: "border-ithina-rose/40 bg-ithina-rose/10 text-ithina-rose",
  maker: "border-ithina-purple/40 bg-ithina-purple/10 text-ithina-purple",
  checker: "border-ithina-emerald/40 bg-ithina-emerald/10 text-ithina-emerald",
};

const EMPTY_FORM: UserFormData = {
  firstName: "",
  lastName: "",
  email: "",
  role: "maker",
  password: "",
};

export function UserFormModal({ editingUser, onSave, onClose }: UserFormModalProps) {
  const isEditing = Boolean(editingUser);
  const [form, setForm] = useState<UserFormData>(
    editingUser
      ? {
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          email: editingUser.email,
          role: editingUser.role,
          password: "",
        }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  function validate(): boolean {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!isEditing && !form.password.trim()) {
      newErrors.password = "Password is required for new users.";
    } else if (!isEditing && form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onSave(form);
    }
  }

  function setField<K extends keyof UserFormData>(key: K, value: UserFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(8,8,20,0.93)] p-6 backdrop-blur-[6px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[600px] overflow-hidden rounded-[20px] border border-ithina-border bg-ithina-sidebar shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
      >
        <header className="flex items-start justify-between border-b border-ithina-border px-7 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg border border-ithina-purple/30 bg-ithina-purple/10">
              <UserPlus className="size-4 text-ithina-purple" />
            </div>
            <div>
              <h3 id="user-form-title" className="text-base font-bold text-white">
                {isEditing ? "Edit User" : "Invite New User"}
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                {isEditing
                  ? "Update user details and role."
                  : "Create a new account and assign their role."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5 px-7 py-6">

            {/* Name row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  First Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setField("firstName", e.target.value)}
                  placeholder="e.g. Sarah"
                  className={cn(
                    "w-full rounded-lg border bg-ithina-bg px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:outline-none",
                    errors.firstName
                      ? "border-ithina-rose/50 focus:border-ithina-rose"
                      : "border-ithina-border focus:border-ithina-purple",
                  )}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-ithina-rose">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Last Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setField("lastName", e.target.value)}
                  placeholder="e.g. Chen"
                  className={cn(
                    "w-full rounded-lg border bg-ithina-bg px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:outline-none",
                    errors.lastName
                      ? "border-ithina-rose/50 focus:border-ithina-rose"
                      : "border-ithina-border focus:border-ithina-purple",
                  )}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-ithina-rose">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="user@company.com"
                className={cn(
                  "w-full rounded-lg border bg-ithina-bg px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:outline-none",
                  errors.email
                    ? "border-ithina-rose/50 focus:border-ithina-rose"
                    : "border-ithina-border focus:border-ithina-purple",
                )}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-ithina-rose">{errors.email}</p>
              )}
            </div>

            {/* Password (new users only) */}
            {!isEditing && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="Minimum 8 characters"
                  className={cn(
                    "w-full rounded-lg border bg-ithina-bg px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:outline-none",
                    errors.password
                      ? "border-ithina-rose/50 focus:border-ithina-rose"
                      : "border-ithina-border focus:border-ithina-purple",
                  )}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-ithina-rose">{errors.password}</p>
                )}
              </div>
            )}

            {/* Role selector */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-300">
                Role <span className="text-rose-400">*</span>
              </label>
              <div className="space-y-2">
                {ROLE_OPTIONS.map(({ value, label, description }) => {
                  const isSelected = form.role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setField("role", value)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                        isSelected
                          ? cn("border-2", ROLE_COLOR[value])
                          : "border border-ithina-border text-slate-400 hover:border-slate-600 hover:text-white",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 size-3.5 shrink-0 rounded-full border-2 transition-colors",
                          isSelected
                            ? cn("bg-current", ROLE_COLOR[value].split(" ")[0])
                            : "border-slate-600 bg-transparent",
                        )}
                      />
                      <span>
                        <p className="text-sm font-semibold leading-tight">{label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <footer className="flex items-center justify-end gap-3 border-t border-ithina-border px-7 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-ithina-purple px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-colors hover:bg-ithina-purple-hover"
            >
              <UserPlus className="size-4" />
              {isEditing ? "Save Changes" : "Create User"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
