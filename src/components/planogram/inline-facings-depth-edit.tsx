/**
 * InlineFacingsDepthEdit – click to edit facings and depth, blur/Enter to save, Escape to cancel
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface InlineFacingsDepthEditProps {
  facings: number;
  depthCount: number;
  onSave: (updates: { facings: number; depthCount: number }) => void;
  className?: string;
}

export function InlineFacingsDepthEdit({
  facings,
  depthCount,
  onSave,
  className,
}: InlineFacingsDepthEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editFacings, setEditFacings] = useState(String(facings));
  const [editDepth, setEditDepth] = useState(String(depthCount));
  const facingsRef = useRef<HTMLInputElement>(null);

  const startEditing = useCallback(() => {
    setEditFacings(String(facings));
    setEditDepth(String(depthCount));
    setIsEditing(true);
  }, [facings, depthCount]);

  useEffect(() => {
    if (isEditing) {
      facingsRef.current?.focus();
      facingsRef.current?.select();
    }
  }, [isEditing]);

  const commit = useCallback(() => {
    const f = Math.max(1, parseInt(editFacings, 10) || 1);
    const d = Math.max(1, parseInt(editDepth, 10) || 1);
    if (f !== facings || d !== depthCount) {
      onSave({ facings: f, depthCount: d });
    }
    setIsEditing(false);
  }, [editFacings, editDepth, facings, depthCount, onSave]);

  const cancel = useCallback(() => {
    setEditFacings(String(facings));
    setEditDepth(String(depthCount));
    setIsEditing(false);
  }, [facings, depthCount]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    },
    [commit, cancel]
  );

  const totalUnits = facings * depthCount;

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <span className="text-[10px] font-mono text-muted-foreground">×</span>
        <input
          ref={facingsRef}
          type="number"
          min={1}
          value={editFacings}
          onChange={(e) => setEditFacings(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          className="w-8 rounded border border-input bg-background px-1 py-0.5 text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Facings"
        />
        <span className="text-[10px] font-mono text-muted-foreground">D</span>
        <input
          type="number"
          min={1}
          value={editDepth}
          onChange={(e) => setEditDepth(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          className="w-8 rounded border border-input bg-background px-1 py-0.5 text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Depth"
        />
        <span className="text-[10px] font-mono text-muted-foreground">
          ={parseInt(editFacings, 10) * parseInt(editDepth, 10) || totalUnits}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      onDoubleClick={startEditing}
      className={cn(
        "mt-0.5 cursor-text rounded px-1 py-0.5 text-left text-[10px] font-mono leading-tight text-muted-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        className
      )}
      aria-label={`Edit facings and depth: ×${facings} D${depthCount} =${totalUnits}`}
    >
      ×{facings} D{depthCount} ={totalUnits}
    </button>
  );
}
