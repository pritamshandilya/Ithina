
import { useQuery } from "@tanstack/react-query";
import { fetchAudits } from "../api/maker";

export const makerAuditsKeys = {
  all: ["maker", "audits"] as const,
  status: (status: string) => [...makerAuditsKeys.all, status] as const,
};

export function useMakerAudits() {
  return useQuery({
    queryKey: makerAuditsKeys.all,
    queryFn: fetchAudits,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
