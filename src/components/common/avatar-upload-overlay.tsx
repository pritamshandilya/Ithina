import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface AvatarUploadOverlayProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function AvatarUploadOverlay({
  onFileSelect,
  isUploading = false,
}: AvatarUploadOverlayProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOverlayClick = () => {
    if (!isUploading && !previewUrl) {
      fileInputRef.current?.click();
    }
  };

  const validateFile = (file: File): string | null => {
 
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Please select a valid image file (JPEG, PNG, GIF, or WebP)";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 5MB";
    }

    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setPreviewUrl(null);
      setSelectedFile(null);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    setError(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
  };

  const handleConfirmUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setSelectedFile(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancelUpload = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Hover Overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer group"
        onClick={handleOverlayClick}
        role="button"
        tabIndex={0}
        aria-label="Upload profile picture"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOverlayClick();
          }
        }}
      >
        {!isUploading && !previewUrl && (
          <Upload className="size-8 text-white" />
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
        aria-label="Select profile picture file"
      />

      {/* Error Message */}
      {error && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-64 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md p-2 text-center">
          {error}
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && !isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Preview Profile Picture
              </h3>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCancelUpload}
                aria-label="Cancel upload"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Preview Image */}
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Profile picture preview"
                className="size-48 rounded-full object-cover border-2 border-border"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleCancelUpload}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUpload}
              >
                <Upload className="size-4" />
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Indicator */}
      {isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2" />
          <span className="text-xs text-white font-medium">Uploading...</span>
        </div>
      )}
    </>
  );
}
