export type UserRole = "admin" | "maker" | "checker";

export type UserStatus = "active" | "inactive";

export interface OrgUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  storeIds: string[];
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string;
  /** Account status; shown when editing, always active for new invites. */
  status: UserStatus;
}
