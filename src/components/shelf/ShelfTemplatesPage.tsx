import { ShelfTemplatesContent } from "./ShelfTemplatesContent";
import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/PageHeader";

export function ShelfTemplatesPage() {
  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Shelf Templates"
          description="Create reusable shelf templates for this store."
        />
      }
    >
      <div className="bg-primary min-h-screen px-2 pt-2 pb-4 sm:px-2 sm:pt-3 sm:pb-4 lg:px-2 lg:pt-4 lg:pb-5">
        <div className="mx-auto w-full max-w-screen-2xl space-y-4">
          <ShelfTemplatesContent />
        </div>
      </div>
    </MainLayout>
  );
}
