import { useQuery } from "@tanstack/react-query";

import { fetchReadyForAnalysisFixtures } from "@/lib/api/maker/fixtures";
import { useSelectedStoreId } from "@/providers/store";

export function useReadyForAnalysisFixtures() {
  const storeId = useSelectedStoreId();

  return useQuery({
    queryKey: [
      "maker",
      "fixtures",
      "ready-for-analysis",
      storeId ?? "no-store",
    ],
    queryFn: fetchReadyForAnalysisFixtures,
    enabled: !!storeId,
    staleTime: 60 * 1000,
  });
}
