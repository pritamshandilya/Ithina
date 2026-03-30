import { apiClient } from "@/lib/api-client";
import type { AuthUser, LoginResponse } from "@/types/shared-api";

export async function login(payload: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>("/auth/me");
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
