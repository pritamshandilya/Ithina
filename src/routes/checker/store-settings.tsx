import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layouts/main";
import { StoreSettingsPage } from "@/features/checker/store-settings/components/StoreSettingsPage";

export const Route = createFileRoute("/checker/store-settings")({
  component: StoreSettingsRoute,
});

function StoreSettingsRoute() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <StoreSettingsPage />
        </div>
      </div>
    </MainLayout>
  );
}
