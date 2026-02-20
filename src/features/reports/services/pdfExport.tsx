/**
 * PDF Export Service
 *
 * Renders ReportPdfView (PDF-safe, hex/rgb/rgba only) in a hidden container,
 * captures with html2canvas, generates PDF via jsPDF with multi-page support.
 * No PDF logic in route files.
 */

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { jsPDF } from "jspdf";
import { ReportPdfView } from "../components/ReportPdfView";
import type { ReportPdfData } from "../types";

const CONTAINER_ID = "pdf-export-container";
const CONTAINER_WIDTH = 800;
const A4_MM = { w: 210, h: 297 };
const MARGIN_MM = 10;
const CONTENT_WIDTH = A4_MM.w - MARGIN_MM * 2;
const CONTENT_HEIGHT = A4_MM.h - MARGIN_MM * 2;

export interface PdfExportOptions {
  data: ReportPdfData;
  filename?: string;
  /** Open PDF in new tab after export */
  openInNewTab?: boolean;
}

/**
 * Export report to PDF.
 * Renders ReportPdfView in a hidden off-screen div, captures with html2canvas,
 * builds PDF with jsPDF (multi-page if needed), cleans up DOM.
 */
export async function exportReportToPdf({
  data,
  filename = "compliance-report.pdf",
  openInNewTab = true,
}: PdfExportOptions): Promise<void> {
  const container = document.createElement("div");
  container.id = CONTAINER_ID;
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: ${CONTAINER_WIDTH}px;
    min-height: 100px;
    background: #ffffff;
    color: #1a1a1a;
    z-index: -1;
  `;
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    root.render(
      <StrictMode>
        <ReportPdfView data={data} />
      </StrictMode>
    );

    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((resolve) => setTimeout(resolve, 600));

    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    const imgWidth = CONTENT_WIDTH;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= CONTENT_HEIGHT) {
      pdf.addImage(imgData, "JPEG", MARGIN_MM, MARGIN_MM, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let position = MARGIN_MM;
      pdf.addImage(imgData, "JPEG", MARGIN_MM, position, imgWidth, imgHeight);
      heightLeft -= CONTENT_HEIGHT;

      while (heightLeft > 0) {
        position = MARGIN_MM - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", MARGIN_MM, position, imgWidth, imgHeight);
        heightLeft -= CONTENT_HEIGHT;
      }
    }

    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);

    if (openInNewTab) {
      window.open(url, "_blank", "noopener,noreferrer");
    }

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } finally {
    root.unmount();
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}
