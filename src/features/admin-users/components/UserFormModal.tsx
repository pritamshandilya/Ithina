import { Check, Mail, Pencil, UserPlus, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import type { OrgUser, UserFormData, UserRole, UserStatus } from "../types";

interface UserFormModalProps {
  editingUser?: OrgUser | null;
  onSave: (data: UserFormData) => void | Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

const ROLE_SELECT_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "maker", label: "Maker (Sales Associate)" },
  { value: "checker", label: "Checker (Reviewer)" },
  { value: "admin", label: "Admin (Organization admin)" },
];

const EMPTY_FORM: UserFormData = {
  firstName: "",
  lastName: "",
  email: "",
  role: "maker",
  password: "",
  status: "active",
};

export function UserFormModal({
  editingUser,
  onSave,
  onClose,
  isSubmitting = false,
}: UserFormModalProps) {
  const isEditing = Boolean(editingUser);
  const [form, setForm] = useState<UserFormData>(
    editingUser
      ? {
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          email: editingUser.email,
          role: editingUser.role,
          password: "",
          status: editingUser.status,
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
      newErrors.password = "Initial password is required.";
    } else if (!isEditing && form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    } else if (isEditing && form.password.trim() && form.password.length < 8) {
      newErrors.password = "New password must be at least 8 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSave(form);
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
        className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-ithina-border bg-ithina-sidebar shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
      >
        <header className="flex items-start justify-between border-b border-ithina-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border border-ithina-purple/30 bg-ithina-purple/10">
              {isEditing ? (
                <Pencil className="size-[18px] text-ithina-purple" aria-hidden />
              ) : (
                <UserPlus className="size-[18px] text-ithina-purple" aria-hidden />
              )}
            </div>
            <h3 id="user-form-title" className="text-base font-bold text-white">
              {isEditing ? "Edit User" : "Invite New User"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5 px-6 py-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="form-group">
                <label htmlFor="invite-first-name" className="form-label">
                  First name <span className="text-ithina-rose">*</span>
                </label>
                <input
                  id="invite-first-name"
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setField("firstName", e.target.value)}
                  className={cn("form-input", errors.firstName && "is-error")}
                  placeholder="First name"
                  autoComplete="given-name"
                />
                {errors.firstName && (
                  <p className="text-xs text-ithina-rose">{errors.firstName}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="invite-last-name" className="form-label">
                  Last name <span className="text-ithina-rose">*</span>
                </label>
                <input
                  id="invite-last-name"
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setField("lastName", e.target.value)}
                  className={cn("form-input", errors.lastName && "is-error")}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
                {errors.lastName && (
                  <p className="text-xs text-ithina-rose">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="invite-email" className="form-label">
                Email address <span className="text-ithina-rose">*</span>
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
                  aria-hidden
                />
                <input
                  id="invite-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className={cn("form-input pl-10", errors.email && "is-error")}
                  placeholder="user@company.com"
                  autoComplete="email"
                  disabled={isEditing}
                />
              </div>
              {errors.email && <p className="text-xs text-ithina-rose">{errors.email}</p>}
            </div>

            {!isEditing && (
              <div className="form-group">
                <label htmlFor="invite-password" className="form-label">
                  Initial password <span className="text-ithina-rose">*</span>
                </label>
                <input
                  id="invite-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  className={cn("form-input", errors.password && "is-error")}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="text-xs text-ithina-rose">{errors.password}</p>
                )}
                <p className="text-[11px] text-slate-500">
                  Required by the API to create the account. The user can change it after first
                  login.
                </p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="invite-role" className="form-label">
                Role <span className="text-ithina-rose">*</span>
              </label>
              <select
                id="invite-role"
                value={form.role}
                onChange={(e) => setField("role", e.target.value as UserRole)}
                className="form-input cursor-pointer"
                aria-label="User role"
              >
                {ROLE_SELECT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {isEditing && (
              <>
                <div className="form-group">
                  <label htmlFor="edit-status" className="form-label">
                    Status <span className="text-ithina-rose">*</span>
                  </label>
                  <select
                    id="edit-status"
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value as UserStatus)}
                    className="form-input cursor-pointer"
                    aria-label="Account status"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-password" className="form-label">
                    New password <span className="text-slate-500">(optional)</span>
                  </label>
                  <input
                    id="edit-password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    className={cn("form-input", errors.password && "is-error")}
                    placeholder="Leave blank to keep current password"
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <p className="text-xs text-ithina-rose">{errors.password}</p>
                  )}
                </div>
              </>
            )}
          </div>

          <footer className="flex items-center justify-end gap-3 border-t border-ithina-border px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEditing ? (
                "Save changes"
              ) : (
                <>
                  <Check className="size-4" aria-hidden />
                  Send invitation
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
