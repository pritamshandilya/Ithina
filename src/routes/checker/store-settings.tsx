import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layouts/main";
import { StoreSettingsPage } from "@/features/checker/store-settings/components/StoreSettingsPage";

export const Route = createFileRoute("/checker/store-settings")({
  component: StoreSettingsRoute,
});

function StoreSettingsRoute() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl">
          <StoreSettingsPage />
        </div>
      </div>
    </MainLayout>
  );
}
