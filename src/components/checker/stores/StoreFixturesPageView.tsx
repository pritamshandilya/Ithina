import { Folder, Plus, Search } from "lucide-react";
import type { ReactNode } from "react";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StoreFixturesPageViewProps {
  canEdit: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenCreateFixture: () => void;
  onOpenAddShelf: () => void;
  onBulkAddShelves: () => void;
  isCreatingFixture: boolean;
  children: ReactNode;
}

export function StoreFixturesPageView({
  canEdit,
  searchQuery,
  onSearchChange,
  onOpenCreateFixture,
  onOpenAddShelf,
  onBulkAddShelves,
  isCreatingFixture,
  children,
}: StoreFixturesPageViewProps) {
  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Display Unit"
          description="View and manage store display units configuration."
        />
      }
    >
      <div className="bg-primary px-2 pt-2 pb-4 sm:px-2 sm:pt-3 sm:pb-4 lg:px-2 lg:pt-4 lg:pb-5">
        <div className="mx-auto w-full max-w-screen-2xl space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="group relative w-full sm:max-w-md">
              <Search className="text-muted-foreground group-focus-within:text-accent absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transition-colors" />
              <Input
                placeholder="Search fixture by type, code, or location..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="border-border bg-card text-foreground placeholder:text-muted-foreground hover:border-accent/50 focus:border-accent h-12 pl-11 transition-all"
              />
            </div>
            {canEdit && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 items-center gap-1.5 px-4"
                  onClick={onBulkAddShelves}
                >
                  <Folder className="size-4" aria-hidden />
                  Bulk Add Shelves
                </Button>
                <Button
                  type="button"
                  variant="success"
                  className="h-10 items-center gap-1.5 px-4"
                  onClick={onOpenCreateFixture}
                  disabled={isCreatingFixture}
                >
                  <Plus className="size-4" aria-hidden />
                  Add fixture
                </Button>
                <Button
                  type="button"
                  variant="success"
                  className="h-10 items-center gap-1.5 px-4"
                  onClick={onOpenAddShelf}
                >
                  <Plus className="size-4" aria-hidden />
                  Add Shelf
                </Button>
              </div>
            )}
          </div>

          {children}
        </div>
      </div>
    </MainLayout>
  );
}
