import { AddShelfFormModal } from "./AddShelfFormModal";
import { AddShelfModeModal } from "./AddShelfModeModal";
import {
  BulkAddShelvesModal,
  type ParsedBulkPayload,
} from "./BulkAddShelvesModal";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";

interface ShelfModalsProps {
  isAddShelfModalOpen: boolean;
  onCloseAddShelfModal: () => void;
  onCreateShelf: (values: {
    name: string;
    code?: string;
    width: number;
    height: number;
    vertical_position: number;
  }) => Promise<void>;
  isCreatingShelf: boolean;
  defaultDimensionUnit: StoreDimensionUnit;
  shelfTemplates: any[];
  shelfTemplatesLoading: boolean;
  pendingTemplateId?: string;
  fixtureOptions: { id: string; label: string }[];
  selectedFixtureId: string;
  onFixtureChange: (value: string) => void;
  disableFixtureSelect: boolean;
  isAddShelfModeModalOpen: boolean;
  onCloseAddShelfModeModal: () => void;
  onContinueAddShelf: (payload: {
    addMode: "manual" | "template";
    templateId?: string;
  }) => void;
  isBulkAddModalOpen: boolean;
  onCloseBulkAddModal: () => void;
  onSubmitBulkShelves: (payload: ParsedBulkPayload) => Promise<number>;
}

export function ShelfModals({
  isAddShelfModalOpen,
  onCloseAddShelfModal,
  onCreateShelf,
  isCreatingShelf,
  defaultDimensionUnit,
  shelfTemplates,
  shelfTemplatesLoading,
  pendingTemplateId,
  fixtureOptions,
  selectedFixtureId,
  onFixtureChange,
  disableFixtureSelect,
  isAddShelfModeModalOpen,
  onCloseAddShelfModeModal,
  onContinueAddShelf,
  isBulkAddModalOpen,
  onCloseBulkAddModal,
  onSubmitBulkShelves,
}: ShelfModalsProps) {
  return (
    <>
      <AddShelfFormModal
        isOpen={isAddShelfModalOpen}
        onClose={onCloseAddShelfModal}
        onSubmit={onCreateShelf}
        isSaving={isCreatingShelf}
        defaultDimensionUnit={defaultDimensionUnit}
        shelfTemplates={shelfTemplates}
        shelfTemplatesLoading={shelfTemplatesLoading}
        initialTemplateId={pendingTemplateId}
        fixtureOptions={fixtureOptions}
        selectedFixtureId={selectedFixtureId}
        onFixtureChange={onFixtureChange}
        disableFixtureSelect={disableFixtureSelect}
      />
      <AddShelfModeModal
        isOpen={isAddShelfModeModalOpen}
        onClose={onCloseAddShelfModeModal}
        shelfTemplates={shelfTemplates}
        shelfTemplatesLoading={shelfTemplatesLoading}
        onContinue={onContinueAddShelf}
      />
      <BulkAddShelvesModal
        isOpen={isBulkAddModalOpen}
        onClose={onCloseBulkAddModal}
        onSubmitBulk={onSubmitBulkShelves}
      />
    </>
  );
}
