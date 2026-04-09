/**
 * Store Selector Dropdown Component
 * 
 * Allows checker to select which store to view/manage.
 * Shows store name with pending audit count badge.
 * 
 * Features:
 * - Dropdown with store list
 * - Pending audit count per store
 * - Keyboard navigation
 * - Accessible with ARIA
 */

import { useState } from "react";
import { Check, ChevronDown, Store as StoreIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Store } from "@/types/checker";

export interface StoreSelectorDropdownProps {
  /**
   * List of stores available to this checker
   */
  stores: Store[];
  
  /**
   * Currently selected store ID
   */
  selectedStoreId: string;
  
  /**
   * Callback when store selection changes
   */
  onStoreChange: (storeId: string) => void;
  
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * StoreSelectorDropdown Component
 * 
 * Dropdown menu for selecting which store to manage.
 * Shows pending audit count as badge for each store.
 */
export function StoreSelectorDropdown({
  stores,
  selectedStoreId,
  onStoreChange,
  className,
}: StoreSelectorDropdownProps) {
  const [open, setOpen] = useState(false);
  
  const selectedStore = stores.find((store) => store.id === selectedStoreId);
  
  const handleStoreSelect = (storeId: string) => {
    onStoreChange(storeId);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "min-w-[200px] justify-between gap-2",
            className
          )}
          aria-label="Select store"
        >
          <div className="flex items-center gap-2 min-w-0">
            <StoreIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="truncate">
              {selectedStore?.name || "Select Store"}
            </span>
          </div>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuLabel>Select Store</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {stores.map((store) => {
          const isSelected = store.id === selectedStoreId;
          const hasPendingAudits = store.pendingAuditCount && store.pendingAuditCount > 0;
          
          return (
            <DropdownMenuItem
              key={store.id}
              onClick={() => handleStoreSelect(store.id)}
              className="flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {isSelected && (
                  <Check className="size-4 shrink-0 text-accent" aria-hidden="true" />
                )}
                {!isSelected && <div className="size-4 shrink-0" />}
                
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{store.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {store.address}
                  </p>
                </div>
              </div>
              
              {hasPendingAudits && (
                <span
                  className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold shrink-0 bg-accent text-white"
                  aria-label={`${store.pendingAuditCount} pending audits`}
                >
                  {store.pendingAuditCount}
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
