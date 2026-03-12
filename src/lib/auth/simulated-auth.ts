export type UserRole = "initiator" | "approver" | "storeOps";

export interface SimulatedUser {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  id: string;
}

const SIMULATED_USERS: SimulatedUser[] = [
  {
    id: "initiator-sarah",
    email: "sarah@displaydata.com",
    password: "password123",
    role: "initiator",
    firstName: "Sarah",
    lastName: "Lee",
  },
  {
    id: "approver-marcus",
    email: "marcus@displaydata.com",
    password: "password123",
    role: "approver",
    firstName: "Marcus",
    lastName: "Wright",
  },
  {
    id: "storeops-david",
    email: "david@displaydata.com",
    password: "password123",
    role: "storeOps",
    firstName: "David",
    lastName: "Nguyen",
  },
];

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class SimulatedAuthService {
  private static readonly TOKEN_KEY = "simulated_auth_token";
  private static readonly USER_KEY = "simulated_user";
  private static readonly EXPIRY_KEY = "simulated_token_expiry";

  static async login(email: string, password: string): Promise<SimulatedUser> {
    await delay(500);

    const user = SIMULATED_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.password !== password) {
      throw new Error("Invalid email or password");
    }

    const token = btoa(JSON.stringify({ userId: user.id, email: user.email }));
    const expiryTime = Date.now() + 24 * 60 * 60 * 1000;

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.EXPIRY_KEY, expiryTime.toString());

    document.cookie = `at_exp=${Math.floor(expiryTime / 1000)}; path=/`;

    return user;
  }

  static getCurrentUser(): SimulatedUser | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const expiryStr = localStorage.getItem(this.EXPIRY_KEY);

    if (!token || !expiryStr) return false;

    const expiry = parseInt(expiryStr, 10);
    return Date.now() < expiry;
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);

    document.cookie =
      "at_exp=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }

  static async fetchUserInfo(): Promise<SimulatedUser> {
    await delay(200);

    const user = this.getCurrentUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    return user;
  }
}
