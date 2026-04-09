import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
}

export function RuleSelectorDropdown({
  rules,
  selectedIds,
  onChange,
  placeholder = "Select rules to link",
  triggerClassName,
}: RuleSelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

      {isOpen && (
        <div
          ref={panelRef}
          className="absolute left-0 top-full z-50 mt-1 min-w-[280px] rounded-md border border-border bg-popover shadow-lg"
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
                    {rule.ruleId} - {rule.ruleName}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
