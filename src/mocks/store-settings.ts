import type { StoreProfile, StoreStaffMember } from "@/types/store-settings";

export const MOCK_STORE_PROFILE: StoreProfile = {
  id: "4281",
  name: "Chicago North",
  address: "847 N Michigan Ave, Chicago, IL",
  currency: "USD",
  defaultDimensions: "mm",
};

/** Full org directory; store staff is a subset (POG-style assign / remove). */
export const MOCK_ORG_USERS: StoreStaffMember[] = [
  {
    id: "u1",
    firstName: "Jordan",
    lastName: "Lee",
    email: "jordan.lee@example.com",
    role: "admin",
  },
  {
    id: "u2",
    firstName: "Sam",
    lastName: "Rivera",
    email: "sam.rivera@example.com",
    role: "maker",
  },
  {
    id: "u3",
    firstName: "Alex",
    lastName: "Chen",
    email: "alex.chen@example.com",
    role: "checker",
  },
  {
    id: "u4",
    firstName: "Taylor",
    lastName: "Brooks",
    email: "taylor.brooks@example.com",
    role: "maker",
  },
  {
    id: "u5",
    firstName: "Riley",
    lastName: "Nguyen",
    email: "riley.nguyen@example.com",
    role: "checker",
  },
];

export const MOCK_STORE_STAFF: StoreStaffMember[] = MOCK_ORG_USERS.filter((u) =>
  ["u1", "u2", "u3"].includes(u.id),
);
