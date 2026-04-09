import {
  CreateComplianceRuleSetModal,
  type CreateComplianceRuleSetModalProps,
} from "@/components/common/create-compliance-rule-set-modal";
import {
  StoreFixtureModal,
  type StoreFixtureModalValues,
} from "@/components/common/store-fixture-modal";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import type { StoreFixtureApiModel } from "@/queries/checker/api/fixtures";
import type { CreateComplianceRuleSetInput } from "@/queries/maker/api/compliance-rule-sets";

interface StoreConfigurationModalsProps {
  createRuleSetModalOpen?: boolean;
  onCloseRuleSetModal?: () => void;
  ruleSetModalMode?: "create" | "edit";
  ruleSetInitialValues?: CreateComplianceRuleSetModalProps["initialValues"];
  isRuleSetSubmitting?: boolean;
  onSubmitRuleSet?: (payload: CreateComplianceRuleSetInput) => void | Promise<void>;
  fixtureModalOpen: boolean;
  onCloseFixtureModal: () => void;
  onSaveFixture: (values: StoreFixtureModalValues) => void | Promise<void>;
  isFixtureSaving: boolean;
  editingFixture: StoreFixtureApiModel | null;
  defaultDimensionUnit: StoreDimensionUnit;
}

function getFixtureInitialValues(
  editingFixture: StoreFixtureApiModel | null,
  defaultDimensionUnit: StoreDimensionUnit,
) {
  if (!editingFixture) {
    return { dimensionUnit: defaultDimensionUnit };
  }

  return {
    type: editingFixture.type,
    code: editingFixture.code,
    width:
      editingFixture.dimensions?.width !== undefined &&
      editingFixture.dimensions?.width !== null
        ? String(editingFixture.dimensions.width)
        : "",
    height:
      editingFixture.dimensions?.height !== undefined &&
      editingFixture.dimensions?.height !== null
        ? String(editingFixture.dimensions.height)
        : "",
    depth:
      editingFixture.dimensions?.depth !== undefined &&
      editingFixture.dimensions?.depth !== null
        ? String(editingFixture.dimensions.depth)
        : "",
    dimensionUnit: editingFixture.dimension_unit as StoreDimensionUnit,
    section: editingFixture.physical_location?.section ?? "",
    aisle: editingFixture.physical_location?.aisle ?? "",
    zone: editingFixture.physical_location?.zone ?? "",
  };
}

export function StoreConfigurationModals({
  createRuleSetModalOpen = false,
  onCloseRuleSetModal,
  ruleSetModalMode = "create",
  ruleSetInitialValues,
  isRuleSetSubmitting = false,
  onSubmitRuleSet,
  fixtureModalOpen,
  onCloseFixtureModal,
  onSaveFixture,
  isFixtureSaving,
  editingFixture,
  defaultDimensionUnit,
}: StoreConfigurationModalsProps) {
  return (
    <>
      {onCloseRuleSetModal && onSubmitRuleSet ? (
        <CreateComplianceRuleSetModal
          isOpen={createRuleSetModalOpen}
          onClose={onCloseRuleSetModal}
          isSubmitting={isRuleSetSubmitting}
          mode={ruleSetModalMode}
          initialValues={ruleSetInitialValues}
          onSubmit={onSubmitRuleSet}
        />
      ) : null}
      <StoreFixtureModal
        isOpen={fixtureModalOpen}
        onClose={onCloseFixtureModal}
        onSave={onSaveFixture}
        isSaving={isFixtureSaving}
        mode={editingFixture ? "edit" : "create"}
        initialValues={getFixtureInitialValues(editingFixture, defaultDimensionUnit)}
      />
    </>
  );
}
