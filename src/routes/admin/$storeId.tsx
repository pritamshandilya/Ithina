import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useStore } from "@/providers/store";
import { useOrgStores } from "@/queries/checker";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/$storeId")({
  component: AdminStoreLayout,
});

function AdminStoreLayout() {
  const { storeId } = Route.useParams();
  const { setSelectedStore, selectedStore } = useStore();
  const { data: stores } = useOrgStores();

  useEffect(() => {
    if (stores && storeId) {
      // Find store by name or ID
      const store = stores.find(s => s.name === storeId || s.id === storeId);
      if (store && selectedStore?.id !== store.id) {
        setSelectedStore(store);
      }
    }
  }, [stores, storeId, setSelectedStore, selectedStore]);

  return <Outlet />;
}
