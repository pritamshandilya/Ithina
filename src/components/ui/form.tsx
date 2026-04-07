import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    { className, label, error, required, htmlFor, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="form-field"
        className={cn("space-y-2.5", className)}
        {...props}
      >
        {label && (
          <Label
            htmlFor={htmlFor}
            className={error ? "text-destructive" : ""}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        {children}
        {error && (
          <p className="font-mono text-[11px] text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";

export { FormField };
