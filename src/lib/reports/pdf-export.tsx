/**
 * PDF Export Service
 *
 * Uses @react-pdf/renderer for direct PDF generation.
 * No DOM/canvas – immune to oklch/oklab CSS parsing errors.
 */

import { pdf } from "@react-pdf/renderer";
import { ReportPdfDocument } from "@/components/reports/ReportPdfDocument";
import type { ReportPdfData } from "@/types/reports";

export interface PdfExportOptions {
  data: ReportPdfData;
  filename?: string;
  /** Open PDF in new tab after export */
  openInNewTab?: boolean;
}

/** Convert blob URL to data URL so @react-pdf/renderer can embed the image */
async function blobUrlToDataUrl(url: string): Promise<string | null> {
  if (!url.startsWith("blob:")) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Export report to PDF using @react-pdf/renderer.
 * Renders ReportPdfDocument directly to PDF – no html2canvas, no DOM parsing.
 */
export async function exportReportToPdf({
  data,
  filename = "compliance-report.pdf",
  openInNewTab = true,
}: PdfExportOptions): Promise<void> {
  const exportData = { ...data };
  if (data.imageUrl && data.imageUrl.startsWith("blob:")) {
    exportData.imageUrl = await blobUrlToDataUrl(data.imageUrl);
  }

  const blob = await pdf(<ReportPdfDocument data={exportData} />).toBlob();
  const url = URL.createObjectURL(blob);

  if (openInNewTab) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
