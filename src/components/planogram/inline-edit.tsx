/**
 * InlineEdit – click to edit, blur/Enter to save, Escape to cancel
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => void;
  placeholder?: string;
  className?: string;
  /** Use textarea for multiline */
  multiline?: boolean;
  /** Optional aria-label */
  "aria-label"?: string;
}

export function InlineEdit({
  value,
  onSave,
  placeholder = "Edit…",
  className,
  multiline = false,
  "aria-label": ariaLabel,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const startEditing = useCallback(() => {
    setEditValue(value);
    setIsEditing(true);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commit = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed !== value) {
      onSave(trimmed);
    }
    setIsEditing(false);
  }, [editValue, value, onSave]);

  const cancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !multiline) {
        e.preventDefault();
        commit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    },
    [commit, cancel, multiline]
  );

  const handleBlur = useCallback(() => {
    commit();
  }, [commit]);

  if (isEditing) {
    const inputProps = {
      ref: inputRef as React.RefObject<HTMLInputElement & HTMLTextAreaElement>,
      value: editValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setEditValue(e.target.value),
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      placeholder,
      "aria-label": ariaLabel,
      className: cn(
        "w-full min-w-0 rounded border border-input bg-background px-1.5 py-0.5 text-inherit text-xs focus:text-white focus:outline-none focus:ring-2 focus:ring-ring",
        className
      ),
    };

    if (multiline) {
      return (
        <textarea
          {...inputProps}
          rows={2}
          className={cn(inputProps.className, "resize-none")}
        />
      );
    }

    return <input type="text" {...inputProps} />;
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      onDoubleClick={startEditing}
      className={cn(
        "w-full min-w-0 cursor-text text-white rounded px-1 py-0.5 text-left hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        !value && "italic text-muted-foreground",
        className
      )}
      aria-label={ariaLabel ?? (value ? `Edit: ${value}` : "Click to edit")}
    >
      {value || placeholder}
    </button>
  );
}
