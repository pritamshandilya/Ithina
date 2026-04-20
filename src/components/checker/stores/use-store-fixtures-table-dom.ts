import type { Dispatch, RefObject, SetStateAction } from "react";
import { useEffect } from "react";

import type { ToastInput } from "@/hooks/use-toast";
import type { StoreFixtureApiModel } from "@/queries/checker/api/fixtures";
import type { PlanogramShelfRow, Shelf } from "@/types/maker";

interface UseStoreFixturesTableDomParams {
  tableWrapperRef: RefObject<HTMLDivElement | null>;
  rowIdToFixtureId: Map<string, string>;
  setFixtureComplianceOverrides: Dispatch<SetStateAction<Record<string, string>>>;
  setFixtureCategorizeOverrides: Dispatch<SetStateAction<Record<string, string>>>;
  fixtureById: Map<string, StoreFixtureApiModel>;
  shelvesByFixtureId: Map<string, Shelf[]>;
  effectivePlanogramByFixtureId: Map<string, string | null>;
  defaultRuleSetName: string;
  fixtureComplianceOverrides: Record<string, string>;
  fixtureCategorizeOverrides: Record<string, string>;
  setActionsMenu: Dispatch<
    SetStateAction<{
      row: PlanogramShelfRow;
      triggerEl: HTMLElement;
      mode: "fixture" | "shelf";
      anchorPoint?: { x: number; y: number };
    } | null>
  >;
  openFixtureDetail: (targetShelfId: string) => void;
  toast: (options: ToastInput) => void;
  actionsMenu: {
    row: PlanogramShelfRow;
    triggerEl: HTMLElement;
    mode: "fixture" | "shelf";
    anchorPoint?: { x: number; y: number };
  } | null;
  actionsMenuRef: RefObject<HTMLDivElement | null>;
}

export function useStoreFixturesTableDom({
  tableWrapperRef,
  rowIdToFixtureId,
  setFixtureComplianceOverrides,
  setFixtureCategorizeOverrides,
  fixtureById,
  shelvesByFixtureId,
  effectivePlanogramByFixtureId,
  defaultRuleSetName,
  fixtureComplianceOverrides,
  fixtureCategorizeOverrides,
  setActionsMenu,
  openFixtureDetail,
  toast,
  actionsMenu,
  actionsMenuRef,
}: UseStoreFixturesTableDomParams) {
  useEffect(() => {
    const el = tableWrapperRef.current;
    if (!el) return;
    const handleChange = (e: Event) => {
      const select = (e.target as HTMLElement).closest?.("[data-planogram-dropdown]");
      if (!select || !(select instanceof HTMLSelectElement)) return;
      const rowId = select.getAttribute("data-shelf-id");
      const field = select.getAttribute("data-field");
      const value = select.value;
      if (!rowId || !field) return;
      const fixtureId = rowIdToFixtureId.get(rowId) ?? rowId;
      if (field === "compliance") {
        setFixtureComplianceOverrides((prev) => ({ ...prev, [fixtureId]: value }));
      }
      if (field === "categorize") {
        setFixtureCategorizeOverrides((prev) => ({ ...prev, [fixtureId]: value }));
      }
    };
    el.addEventListener("change", handleChange);
    return () => el.removeEventListener("change", handleChange);
  }, [rowIdToFixtureId, setFixtureCategorizeOverrides, setFixtureComplianceOverrides, tableWrapperRef]);

  useEffect(() => {
    const el = tableWrapperRef.current;
    if (!el) return;
    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const trigger = target.closest(
        "[data-action='fixture-group-menu']",
      ) as HTMLElement | null;
      if (!trigger) return;
      event.preventDefault();
      event.stopPropagation();
      const fixtureId = trigger.getAttribute("data-fixture-id");
      if (!fixtureId) return;
      const fixture = fixtureById.get(fixtureId);
      if (!fixture) return;
      const firstShelf = (shelvesByFixtureId.get(fixtureId) ?? [])[0];
      const row: PlanogramShelfRow = {
        ...(firstShelf ?? {
          id: `fixture-${fixture.id}`,
          shelfName: fixture.type,
          status: "never-audited",
        }),
        fixtureId,
        planogramId: effectivePlanogramByFixtureId.get(fixtureId) ?? undefined,
        complianceRuleSet: fixtureComplianceOverrides[fixtureId] ?? defaultRuleSetName,
        categorizeBy: fixtureCategorizeOverrides[fixtureId] ?? "By Category",
      };
      const rect = trigger.getBoundingClientRect();
      setActionsMenu({
        row,
        triggerEl: trigger,
        mode: "fixture",
        anchorPoint: { x: rect.left, y: rect.top },
      });
    };
    el.addEventListener("click", handleClick, true);
    return () => el.removeEventListener("click", handleClick, true);
  }, [
    defaultRuleSetName,
    effectivePlanogramByFixtureId,
    fixtureById,
    fixtureCategorizeOverrides,
    fixtureComplianceOverrides,
    setActionsMenu,
    shelvesByFixtureId,
    tableWrapperRef,
  ]);

  useEffect(() => {
    const el = tableWrapperRef.current;
    if (!el) return;
    const handleFixtureHeaderClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const trigger = target.closest("[data-action='fixture-group-open']") as HTMLElement | null;
      if (!trigger) return;
      event.preventDefault();
      event.stopPropagation();
      const fixtureId = trigger.getAttribute("data-fixture-id");
      if (!fixtureId) return;
      const firstShelf = (shelvesByFixtureId.get(fixtureId) ?? [])[0];
      if (!firstShelf?.id) {
        toast({
          title: "No shelf found",
          description: "This fixture does not have shelves to open yet.",
          variant: "warning",
        });
        return;
      }
      openFixtureDetail(firstShelf.id);
    };
    el.addEventListener("click", handleFixtureHeaderClick, true);
    return () => el.removeEventListener("click", handleFixtureHeaderClick, true);
  }, [openFixtureDetail, shelvesByFixtureId, tableWrapperRef, toast]);

  useEffect(() => {
    if (!actionsMenu) return;
    const onPointerDown = (event: Event) => {
      const target = event.target as Node | null;
      const menuEl =
        actionsMenuRef.current ?? document.querySelector("[data-planogram-actions-menu]");
      if (menuEl?.contains(target)) return;
      const triggerBtn = (target as HTMLElement | null)?.closest?.(
        "[data-action=\"open-menu\"], [data-action=\"fixture-group-menu\"]",
      );
      if (triggerBtn && triggerBtn === actionsMenu.triggerEl) return;
      setActionsMenu(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [actionsMenu, actionsMenuRef, setActionsMenu]);
}
