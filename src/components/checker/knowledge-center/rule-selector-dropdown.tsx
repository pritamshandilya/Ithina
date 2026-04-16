import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import type { RuleOption } from "./reference-documents-tab.types";

interface RuleSelectorDropdownProps {
  rules: RuleOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  triggerClassName?: string;
  panelAlign?: "left" | "right";
  inlinePanel?: boolean;
  usePortal?: boolean;
}

export function RuleSelectorDropdown({
  rules,
  selectedIds,
  onChange,
  placeholder = "Select rules to link",
  triggerClassName,
  panelAlign = "left",
  inlinePanel = false,
  usePortal = false,
}: RuleSelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<{
    top: number;
    left: number;
    minWidth: number;
  }>({ top: 0, left: 0, minWidth: 280 });

  const filteredRules = useMemo(() => {
    if (!search.trim()) return rules;
    const query = search.toLowerCase();
    return rules.filter(
      (rule) =>
        rule.ruleId.toLowerCase().includes(query) ||
        rule.ruleName.toLowerCase().includes(query),
    );
  }, [rules, search]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !usePortal || !triggerRef.current) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current?.getBoundingClientRect();
      if (!triggerRect) return;
      const panelWidth = panelRef.current?.offsetWidth ?? Math.max(280, triggerRect.width);
      const nextTop = triggerRect.bottom + 6;
      const nextLeft =
        panelAlign === "right"
          ? Math.max(8, triggerRect.right - panelWidth)
          : Math.max(8, triggerRect.left);

      setPanelStyle({
        top: nextTop,
        left: nextLeft,
        minWidth: Math.max(280, Math.round(triggerRect.width)),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, usePortal, panelAlign]);

  const handleToggle = useCallback(
    (ruleId: string, checked: boolean) => {
      if (checked) onChange([...selectedIds, ruleId]);
      else onChange(selectedIds.filter((id) => id !== ruleId));
    },
    [selectedIds, onChange],
  );

  const handleSelectAll = useCallback(() => {
    const ids = filteredRules.map((rule) => rule.ruleId);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    if (allSelected) onChange(selectedIds.filter((id) => !ids.includes(id)));
    else onChange([...new Set([...selectedIds, ...ids])]);
  }, [filteredRules, selectedIds, onChange]);

  const label =
    selectedIds.length > 0 ? `${selectedIds.length} selected` : placeholder;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={
          triggerClassName ??
          "flex w-full min-w-[200px] items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-left text-sm hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
        }
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={selectedIds.length > 0 ? "text-foreground" : "text-muted-foreground"}
        >
          {label}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && !usePortal && (
        <div
          ref={panelRef}
          className={
            inlinePanel
              ? "mt-1 w-full min-w-0 rounded-md border border-border bg-popover shadow-sm"
              : `absolute top-full z-50 mt-1 min-w-[280px] max-w-[min(90vw,420px)] rounded-md border border-border bg-popover shadow-lg ${panelAlign === "right" ? "right-0" : "left-0"}`
          }
        >
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Search rules..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-8 pl-8 text-sm"
                autoFocus
              />
            </div>
            <div className="mt-2 flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleSelectAll}
              >
                {filteredRules.every((rule) => selectedIds.includes(rule.ruleId))
                  ? "Deselect all"
                  : "Select all"}
              </Button>
              {selectedIds.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onChange([])}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredRules.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                No rules match
              </p>
            ) : (
              filteredRules.map((rule) => (
                <label
                  key={rule.ruleId}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedIds.includes(rule.ruleId)}
                    onCheckedChange={(checked: boolean | "indeterminate") =>
                      handleToggle(rule.ruleId, checked === true)
                    }
                  />
                  <span className="truncate">
                    {rule.ruleName}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}

      {isOpen &&
        usePortal &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-100 max-w-[min(90vw,420px)] rounded-md border border-border bg-popover shadow-lg"
            style={{ top: panelStyle.top, left: panelStyle.left, minWidth: panelStyle.minWidth }}
          >
            <div className="border-b border-border p-2">
              <div className="relative">
                <Search
                  className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder="Search rules..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-8 pl-8 text-sm"
                  autoFocus
                />
              </div>
              <div className="mt-2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleSelectAll}
                >
                  {filteredRules.every((rule) => selectedIds.includes(rule.ruleId))
                    ? "Deselect all"
                    : "Select all"}
                </Button>
                {selectedIds.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onChange([])}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {filteredRules.length === 0 ? (
                <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No rules match
                </p>
              ) : (
                filteredRules.map((rule) => (
                  <label
                    key={rule.ruleId}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedIds.includes(rule.ruleId)}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        handleToggle(rule.ruleId, checked === true)
                      }
                    />
                    <span className="truncate">{rule.ruleName}</span>
                  </label>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
