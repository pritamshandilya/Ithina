import { useCallback, useMemo, useState } from "react";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import {
  DEFAULT_SUPPORTED_FILE_TYPES,
  formatFileSize,
  getFileExtension,
  getFileTypeTone,
} from "./reference-documents-tab.utils";

type UploadVariant = "default" | "compact" | "minimal";

interface FileUploadProps {
  onFileSelect: (files: File[] | null) => void;
  onUpload: (files: File[]) => Promise<void>;
  uploadedFiles: File[];
  isProcessing: boolean;
  error?: string;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  maxTotalSizeMB?: number;
  multiple?: boolean;
  maxFiles?: number;
  title?: string;
  description?: string;
  variant?: UploadVariant;
  showPreview?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ReferenceDocumentsFileUpload({
  onFileSelect,
  onUpload,
  uploadedFiles,
  isProcessing,
  error = "",
  acceptedFileTypes = DEFAULT_SUPPORTED_FILE_TYPES,
  maxFileSizeMB = 5,
  maxTotalSizeMB = 25,
  multiple = false,
  maxFiles = 10,
  title = "Upload Document",
  description = "Drag and drop or click to browse",
  variant = "default",
  showPreview = true,
  disabled = false,
  className = "",
}: FileUploadProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const inputId = "reference-documents-file-upload";
  const allowedExtensions = useMemo(
    () =>
      acceptedFileTypes
        .toLowerCase()
        .split(",")
        .map((token) => token.trim()),
    [acceptedFileTypes],
  );

  const removeFile = useCallback(
    (fileToRemove: File) => {
      onFileSelect(uploadedFiles.filter((file) => file !== fileToRemove));
    },
    [onFileSelect, uploadedFiles],
  );

  const validateAndSelectFiles = useCallback(
    (files: File[]) => {
      if (disabled || isProcessing) return;

      const existing = new Set(uploadedFiles.map((file) => `${file.name}-${file.size}`));
      const valid: File[] = [];

      if (multiple && uploadedFiles.length >= maxFiles) {
        toast({
          title: "File limit reached",
          description: `You can upload up to ${maxFiles} files.`,
          variant: "destructive",
        });
        return;
      }

      for (const file of files) {
        const key = `${file.name}-${file.size}`;
        const extension = getFileExtension(file.name);

        if (existing.has(key)) {
          toast({
            title: "Duplicate file",
            description: `${file.name} is already selected.`,
            variant: "destructive",
          });
          continue;
        }

        if (!extension || !allowedExtensions.includes(extension)) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not supported.`,
            variant: "destructive",
          });
          continue;
        }

        if (file.size > maxFileSizeMB * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds ${maxFileSizeMB}MB limit.`,
            variant: "destructive",
          });
          continue;
        }

        valid.push(file);
        existing.add(key);
      }

      const nextFiles = multiple ? [...uploadedFiles, ...valid] : valid.slice(0, 1);

      if (maxFiles && nextFiles.length > maxFiles) {
        toast({
          title: "File limit reached",
          description: `Only the first ${maxFiles} files were kept.`,
          variant: "destructive",
        });
        onFileSelect(nextFiles.slice(0, maxFiles));
        return;
      }

      const totalSizeBytes = nextFiles.reduce((sum, file) => sum + file.size, 0);
      if (totalSizeBytes > maxTotalSizeMB * 1024 * 1024) {
        toast({
          title: "Total size exceeded",
          description: `Selected files exceed ${maxTotalSizeMB}MB in total.`,
          variant: "destructive",
        });
      }

      onFileSelect(nextFiles.length ? nextFiles : null);
    },
    [
      allowedExtensions,
      disabled,
      isProcessing,
      uploadedFiles,
      multiple,
      maxFiles,
      maxFileSizeMB,
      maxTotalSizeMB,
      onFileSelect,
      toast,
    ],
  );

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    validateAndSelectFiles(multiple ? list : [list[0]]);
    event.target.value = "";
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || isProcessing) return;
    const files = Array.from(event.dataTransfer.files);
    if (!files.length) return;
    validateAndSelectFiles(multiple ? files : [files[0]]);
  };

  const uploadSelected = async () => {
    if (!uploadedFiles.length || isProcessing || disabled) return;
    await onUpload(uploadedFiles);
  };

  const preview = showPreview && uploadedFiles.length > 0 && (
    <div className="mt-3 space-y-2">
      {uploadedFiles.map((file) => (
        <div
          key={`${file.name}-${file.size}`}
          className={`flex items-center justify-between rounded-md border px-3 py-2 ${getFileTypeTone(file.name)}`}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeFile(file)}
            disabled={isProcessing}
            className="h-7 w-7 p-0"
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      {multiple && (
        <p className="text-xs text-muted-foreground text-right">
          Total: {formatFileSize(uploadedFiles.reduce((sum, file) => sum + file.size, 0))} /{" "}
          {maxTotalSizeMB}MB
        </p>
      )}
    </div>
  );

  if (variant === "minimal") {
    return (
      <div className={className}>
        <input
          id={inputId}
          type="file"
          accept={acceptedFileTypes}
          onChange={onInputChange}
          className="hidden"
          multiple={multiple}
          disabled={disabled || isProcessing}
        />
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80"
        >
          <Upload className="size-3.5" />
          <span>{title}</span>
        </label>
        {preview}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={className}>
        <div
          className={`rounded-md border border-dashed p-3 ${
            isDragging ? "border-accent bg-accent/10" : "border-border bg-muted/30"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled && !isProcessing) setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={onDrop}
        >
          <input
            id={inputId}
            type="file"
            accept={acceptedFileTypes}
            onChange={onInputChange}
            className="hidden"
            multiple={multiple}
            disabled={disabled || isProcessing}
          />
          <label
            htmlFor={inputId}
            className="flex cursor-pointer items-center justify-center gap-2 text-xs font-medium text-muted-foreground"
          >
            <Upload className="size-4" />
            <span>{title}</span>
          </label>
        </div>
        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={uploadSelected}
            disabled={!uploadedFiles.length || isProcessing || disabled}
          >
            {isProcessing ? "Uploading..." : "Upload"}
          </Button>
        </div>
        {preview}
        {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          error
            ? "border-destructive/40 bg-destructive/10"
            : isDragging
              ? "border-accent bg-accent/10"
              : "border-border bg-card"
        } min-h-[400px] flex flex-col items-center justify-center`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !isProcessing) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={onDrop}
      >
        <Upload
          className={`mx-auto mb-2 size-6 ${
            isProcessing || disabled ? "text-muted-foreground/60" : "text-muted-foreground"
          }`}
        />
        <p className="text-sm font-medium text-foreground">{error ? "Upload Error" : title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{error || description}</p>
        <input
          id={inputId}
          type="file"
          accept={acceptedFileTypes}
          onChange={onInputChange}
          className="hidden"
          multiple={multiple}
          disabled={disabled || isProcessing}
        />
        {!error && (
          <label
            htmlFor={inputId}
            className="mt-4 inline-flex cursor-pointer items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            <Upload className="size-3.5" />
            <span>{multiple ? "Browse Files" : "Browse File"}</span>
          </label>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground">
          {acceptedFileTypes.replace(/\./g, " ").toUpperCase()} • Max {maxFileSizeMB}MB
          {multiple && maxFiles ? ` • Up to ${maxFiles} files` : ""}
        </p>
      </div>
      <div className="mt-2 flex justify-end">
        <Button
          type="button"
          onClick={uploadSelected}
          disabled={!uploadedFiles.length || isProcessing || disabled}
        >
          {isProcessing ? "Uploading..." : "Upload Selected"}
        </Button>
      </div>
      {preview}
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
