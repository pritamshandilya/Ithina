import { useQuery } from "@tanstack/react-query";

import { listStores } from "@/services/stores";

export const storesKeys = {
  all: ["stores", "list"] as const,
};

export function useStoresList() {
  return useQuery({
    queryKey: storesKeys.all,
    queryFn: listStores,
    staleTime: 20_000,
    gcTime: 5 * 60_000,
  });
}
