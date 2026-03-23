import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { ShelfTemplatesContent } from "./ShelfTemplatesContent";

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
      <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto w-full max-w-screen-2xl space-y-4">
          <ShelfTemplatesContent />
        </div>
      </div>
    </MainLayout>
  );
}

