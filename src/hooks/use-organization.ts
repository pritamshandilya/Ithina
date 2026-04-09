import { useQuery } from "@tanstack/react-query";

import { getOrganization } from "@/services/organization";

export const organizationKeys = {
  detail: ["organization", "detail"] as const,
};

export function useOrganization() {
  return useQuery({
    queryKey: organizationKeys.detail,
    queryFn: getOrganization,
    staleTime: 60_000,
  });
}
