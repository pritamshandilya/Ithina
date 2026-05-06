import { StoreConfigurationModals } from "./StoreConfigurationModals";
import type { StoreFixtureModalValues } from "@/components/common/StoreFixtureModal";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import type { StoreFixtureApiModel } from "@/lib/api/checker/fixtures";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";

interface FixtureModalsProps {
  fixtureModalOpen: boolean;
  onCloseFixtureModal: () => void;
  onSaveFixture: (values: StoreFixtureModalValues) => void | Promise<void>;
  isFixtureSaving: boolean;
  editingFixture: StoreFixtureApiModel | null;
  editingFixturePlanogramId?: string | null;
  defaultDimensionUnit: StoreDimensionUnit;
  planogramOptions: { id: string; name: string }[];
  isDeleteConfirmOpen: boolean;
  onCloseDeleteConfirm: () => void;
  onConfirmDelete: () => void;
  fixtureToDeleteLabel?: string;
  isDeletingFixture: boolean;
  planogramAssociationModalOpen: boolean;
  onClosePlanogramAssociationModal: () => void;
  pendingPlanogramId: string;
  onChangePendingPlanogramId: (value: string) => void;
  onSavePlanogramAssociation: () => void;
}

export function FixtureModals({
  fixtureModalOpen,
  onCloseFixtureModal,
  onSaveFixture,
  isFixtureSaving,
  editingFixture,
  editingFixturePlanogramId,
  defaultDimensionUnit,
  planogramOptions,
  isDeleteConfirmOpen,
  onCloseDeleteConfirm,
  onConfirmDelete,
  fixtureToDeleteLabel,
  isDeletingFixture,
  planogramAssociationModalOpen,
  onClosePlanogramAssociationModal,
  pendingPlanogramId,
  onChangePendingPlanogramId,
  onSavePlanogramAssociation,
}: FixtureModalsProps) {
  return (
    <>
      <StoreConfigurationModals
        fixtureModalOpen={fixtureModalOpen}
        onCloseFixtureModal={onCloseFixtureModal}
        onSaveFixture={onSaveFixture}
        isFixtureSaving={isFixtureSaving}
        editingFixture={editingFixture}
        editingFixturePlanogramId={editingFixturePlanogramId}
        defaultDimensionUnit={defaultDimensionUnit}
        planogramOptions={planogramOptions}
      />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={onCloseDeleteConfirm}
        onConfirm={onConfirmDelete}
        title="Delete fixture?"
        description={`This will permanently delete "${fixtureToDeleteLabel ?? "this fixture"}".`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isDeletingFixture}
      />

      <Modal
        isOpen={planogramAssociationModalOpen}
        onClose={onClosePlanogramAssociationModal}
        className="max-w-lg"
        showCloseButton
      >
        <div className="border-border bg-card rounded-xl border p-6 shadow-2xl">
          <h3 className="text-foreground text-lg font-semibold">
            Associate Planogram
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Select a planogram to assign to this fixture.
          </p>
          <div className="mt-4 space-y-2">
            <Label htmlFor="fixture-planogram-association">Planogram</Label>
            <Select
              id="fixture-planogram-association"
              value={pendingPlanogramId}
              onChange={(e) => onChangePendingPlanogramId(e.target.value)}
            >
              <option value="">None</option>
              {planogramOptions.map((planogram) => (
                <option key={planogram.id} value={planogram.id}>
                  {planogram.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClosePlanogramAssociationModal}
            >
              Cancel
            </Button>
            <Button variant="success" onClick={onSavePlanogramAssociation}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
