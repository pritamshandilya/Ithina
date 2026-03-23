import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

import { useStore } from "@/providers/store";
import type { Store } from "@/providers/store/types";
import { useOrgStores } from "@/queries/checker";

export const Route = createFileRoute("/admin/$storeId")({
  component: AdminStoreLayout,
});

function AdminStoreLayout() {
  const { storeId } = Route.useParams();
  const { selectedStore, setSelectedStore } = useStore();
  const { data: stores, isSuccess } = useOrgStores();

  useEffect(() => {
    if (!storeId) return;

    const placeholder: Store = { id: storeId, name: storeId };

    if (!isSuccess || !stores) {
      if (selectedStore?.id !== storeId) {
        setSelectedStore(placeholder);
      }
      return;
    }

    const matched =
      stores.find((s) => s.id === storeId || s.name === storeId) ??
      stores.find(
        (s) =>
          s.id?.toLowerCase() === storeId.toLowerCase() ||
          s.name?.toLowerCase() === storeId.toLowerCase(),
      );

    if (matched) {
      const sameStore =
        selectedStore?.id === matched.id && selectedStore?.name === matched.name;
      if (!sameStore) {
        setSelectedStore(matched);
      }
      return;
    }

    if (selectedStore?.id !== storeId) {
      setSelectedStore(placeholder);
    }
  }, [storeId, stores, isSuccess, selectedStore?.id, setSelectedStore]);

  return <Outlet />;
}
