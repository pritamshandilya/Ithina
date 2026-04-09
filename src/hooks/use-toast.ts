import type * as React from "react";
import { toast as sonnerToast } from "sonner";

type ToastVariant = "default" | "destructive" | "success" | "warning";

export type ToastInput = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
};

function normalizeText(value: React.ReactNode | undefined): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

export function toast(input: ToastInput) {
  const title = normalizeText(input.title) ?? "";
  const description = normalizeText(input.description);

  if (input.variant === "destructive") {
    return sonnerToast.error(title || "Error", { description });
  }
  if (input.variant === "success") {
    return sonnerToast.success(title || "Success", { description });
  }
  if (input.variant === "warning") {
    return sonnerToast.warning(title || "Warning", { description });
  }
  return sonnerToast(title || "Done", { description });
}

export function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) => {
      if (toastId != null) sonnerToast.dismiss(toastId);
      else sonnerToast.dismiss();
    },
  };
}
