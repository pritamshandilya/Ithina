/**
 * Export Combined Compliance & Analysis Report to PDF
 *
 * Uses html2canvas-oklch (supports oklch/color-mix) + jspdf.
 * Renders report content in a hidden container, captures, opens preview, and downloads.
 */

import { jsPDF } from "jspdf";

export interface ExportReportPdfOptions {
  /** Callback to render the PDF content into the given container. May return an unmount function. */
  renderContent: (container: HTMLElement) => void | (() => void);
  /** Optional filename for download */
  filename?: string;
}

/**
 * Export the report to PDF, open preview in new tab, and trigger download.
 */
export async function exportReportToPdf({
  renderContent,
  filename = "compliance-report.pdf",
}: ExportReportPdfOptions): Promise<void> {
  const html2canvas = (await import("html2canvas-oklch")).default;

  const container = document.createElement("div");
  container.id = "pdf-export-container";
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 800px;
    min-height: 100px;
    background: white;
    color: #1a1a1a;
    padding: 24px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    z-index: -1;
  `;
  document.body.appendChild(container);

  let unmount: (() => void) | undefined;

  try {
    const result = renderContent(container);
    if (typeof result === "function") unmount = result;

    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((resolve) => setTimeout(resolve, 800));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    // Scale to fit width, split across pages if taller than one page
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= contentHeight) {
      pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let position = margin;
      pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
      heightLeft -= contentHeight;

      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
        heightLeft -= contentHeight;
      }
    }

    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank", "noopener,noreferrer");

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } finally {
    unmount?.();
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}
