import { apiClient } from "@/queries/shared";

export async function fetchDimensionUnits(): Promise<string[]> {
  return apiClient.get<string[]>("/dimensions/units");
}

