import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layouts/main";
import { StoresPage } from "@/features/checker/stores/components/StoresPage";

export const Route = createFileRoute("/checker/stores")({
  component: StoresRoute,
});

function StoresRoute() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto w-full max-w-screen-2xl space-y-4">
          <StoresPage />
        </div>
      </div>
    </MainLayout>
  );
}
