
import { useQuery } from "@tanstack/react-query";

import { useSelectedStoreId } from "@/providers/store";
import { fetchAudits } from "../api/maker";

export const makerAuditsKeys = {
  all: ["maker", "audits"] as const,
  byStore: (storeId: string | undefined) =>
    [...makerAuditsKeys.all, storeId ?? "all"] as const,
  status: (storeId: string | undefined, status: string) =>
    [...makerAuditsKeys.byStore(storeId), status] as const,
};

export function useMakerAudits() {
  const storeId = useSelectedStoreId();

  return useQuery({
    queryKey: makerAuditsKeys.byStore(storeId),
    queryFn: () => fetchAudits(storeId),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
