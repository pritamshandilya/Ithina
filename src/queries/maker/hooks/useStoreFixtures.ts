import { useQuery } from "@tanstack/react-query";

import { fetchStoreFixtures } from "../api/fixtures";
import { useSelectedStoreId } from "@/providers/store";

export function useStoreFixtures() {
  const storeId = useSelectedStoreId();

  return useQuery({
    queryKey: ["maker", "fixtures", "list", storeId ?? "no-store"],
    queryFn: fetchStoreFixtures,
    enabled: !!storeId,
    staleTime: 60 * 1000,
  });
}

