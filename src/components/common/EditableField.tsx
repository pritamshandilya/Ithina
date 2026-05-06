import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export function EditableField({
  label,
  value,
  isEditing,
  onChange,
  error,
  required = false,
  className,
}: EditableFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-foreground text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {isEditing ? (
        <div className="space-y-1">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? `${label}-error` : undefined}
            className={cn(
              "w-full",
              error && "border-destructive focus-visible:ring-destructive/20",
            )}
          />
          {error && (
            <p
              id={`${label}-error`}
              className="text-destructive text-sm"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      ) : (
        <p className="text-foreground flex min-h-9 items-center px-3 py-1.5 text-base">
          {value || (
            <span className="text-muted-foreground italic">Not set</span>
          )}
        </p>
      )}
    </div>
  );
}
