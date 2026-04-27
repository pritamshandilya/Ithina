import { useQuery } from "@tanstack/react-query";

import { listStoreUsers } from "@/services/stores";
import { getUser } from "@/services/users";

export function useProfileAccountMetadata(opts: {
  userId: string | undefined;
  role: string;
  storeId: string | null;
}) {
  const { userId, role, storeId } = opts;

  const adminDetail = useQuery({
    queryKey: ["profile", "admin-detail", userId],
    enabled: role === "admin" && Boolean(userId),
    queryFn: () => getUser(userId!),
  });

  const storeSelf = useQuery({
    queryKey: ["profile", "store-self", storeId, userId],
    enabled: role !== "admin" && Boolean(storeId) && Boolean(userId),
    queryFn: async () => {
      const users = await listStoreUsers(storeId!);
      return users.find((u) => u.id === userId) ?? null;
    },
  });

  const createdAtIso = adminDetail.data?.created_at ?? null;
  const lastLoginIso =
    adminDetail.data?.last_login_at ?? storeSelf.data?.last_login_at ?? null;

  return {
    createdAtIso,
    lastLoginIso,
    isLoading: adminDetail.isLoading || storeSelf.isLoading,
  };
}
